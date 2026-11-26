// Stockage du tableau de bord : Netlify Blobs en ligne, un dossier de fichiers en local (GEK_DATA_DIR, jamais publié).
// Chaque ensemble (demandes, contacts…) est un document JSON ; une écriture ne passe que si personne n'a écrit entre-temps.
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import process from "node:process";
import { getStore } from "@netlify/blobs";

const hash = (data) => createHash("sha1").update(data).digest("hex");
const wait = (ms) => new Promise((done) => setTimeout(done, ms));

const files = (root) => {
   const pathOf = (key) => join(root, `${key}.json`);
   const locks = new Map();
   // Les écritures d'un même document passent l'une après l'autre, comme en ligne.
   const queue = (key, job) => {
      const next = (locks.get(key) || Promise.resolve()).then(job, job);
      locks.set(key, next.catch(() => {}));
      return next;
   };
   const load = async (key) => {
      try {
         const raw = await readFile(pathOf(key), "utf8");
         return { data: JSON.parse(raw), etag: hash(raw) };
      } catch (error) {
         if (error.code === "ENOENT") return null;
         throw error;
      }
   };
   return {
      get: load,
      set: (key, data, { etag, isNew } = {}) =>
         queue(key, async () => {
            const current = await load(key);
            if ((isNew && current) || (etag && current?.etag !== etag)) return false;
            const path = pathOf(key);
            await mkdir(dirname(path), { recursive: true });
            await writeFile(`${path}.tmp`, JSON.stringify(data));
            await rename(`${path}.tmp`, path);
            return true;
         }),
      remove: (key) => rm(pathOf(key), { force: true }),
      keys: async (prefix) => {
         const found = await readdir(root, { recursive: true }).catch(() => []);
         return found
            .map((name) => relative(root, join(root, name)).replaceAll("\\", "/"))
            .filter((name) => name.endsWith(".json") && name.startsWith(prefix))
            .map((name) => name.slice(0, -5))
            .sort();
      },
      putFile: async (key, buffer, meta) => {
         await mkdir(join(root, "media"), { recursive: true });
         await writeFile(join(root, "media", key), buffer);
         await writeFile(join(root, "media", `${key}.json`), JSON.stringify(meta));
      },
      getFile: async (key) => {
         try {
            return {
               data: await readFile(join(root, "media", key)),
               meta: JSON.parse(await readFile(join(root, "media", `${key}.json`), "utf8")),
            };
         } catch {
            return null;
         }
      },
      removeFile: async (key) => {
         await rm(join(root, "media", key), { force: true });
         await rm(join(root, "media", `${key}.json`), { force: true });
      },
   };
};

const blobs = () => {
   // « strong » : une lecture qui suit un enregistrement voit toujours cet enregistrement.
   const data = () => getStore({ name: "gek-donnees", consistency: "strong" });
   const media = () => getStore({ name: "gek-media", consistency: "strong" });
   return {
      get: async (key) => {
         const found = await data().getWithMetadata(key, { type: "json" });
         return found ? { data: found.data, etag: found.etag } : null;
      },
      set: async (key, value, { etag, isNew } = {}) => {
         const condition = etag ? { onlyIfMatch: etag } : isNew ? { onlyIfNew: true } : {};
         const result = await data().setJSON(key, value, condition);
         return result.modified !== false;
      },
      remove: (key) => data().delete(key),
      keys: async (prefix) => (await data().list({ prefix })).blobs.map((blob) => blob.key).sort(),
      putFile: (key, buffer, meta) => media().set(key, buffer, { metadata: meta }),
      getFile: async (key) => {
         const found = await media().getWithMetadata(key, { type: "arrayBuffer" });
         return found ? { data: Buffer.from(found.data), meta: found.metadata } : null;
      },
      removeFile: (key) => media().delete(key),
      // Verrou d'un document, pour le cas où le stockage ne donne pas d'étiquette de version (service local de Netlify).
      lock: async (key) => {
         const name = `verrous/${key}`;
         const until = Date.now() + 12_000;
         while (Date.now() < until) {
            const taken = await data().setJSON(name, { at: Date.now() }, { onlyIfNew: true });
            if (taken.modified !== false) return () => data().delete(name).catch(() => {});
            const held = await data().get(name, { type: "json" }).catch(() => null);
            // Un verrou laissé par une fonction interrompue se libère au bout de 20 secondes.
            if (!held || Date.now() - held.at > 20_000) await data().delete(name).catch(() => {});
            else await wait(60 + Math.random() * 140);
         }
         throw new Error(`Enregistrement impossible (${key}) : le document reste occupé.`);
      },
   };
};

let driver = null;
const store = () => {
   driver ??= process.env.GEK_DATA_DIR ? files(process.env.GEK_DATA_DIR) : blobs();
   return driver;
};

export const read = async (key, fallback = null) => (await store().get(key))?.data ?? fallback;

export const write = (key, data) => store().set(key, data);

const locked = async (key, fallback, change) => {
   const release = await store().lock(key);
   try {
      const found = await store().get(key);
      const data = found ? found.data : structuredClone(fallback);
      const result = await change(data);
      if (result === SKIP) return undefined;
      await store().set(key, data);
      return result;
   } finally {
      await release();
   }
};

// Modifie un document sans jamais écraser une écriture faite au même moment : en cas de conflit, on relit et on recommence.
// change(donnees) modifie les données sur place et peut renvoyer un résultat.
export const mutate = async (key, fallback, change) => {
   for (let attempt = 0; attempt < 8; attempt += 1) {
      const found = await store().get(key);
      // Sans étiquette de version, une écriture conditionnelle est impossible : le document est verrouillé le temps de la modification.
      if (found && !found.etag && store().lock) return locked(key, fallback, change);
      const data = found ? found.data : structuredClone(fallback);
      const result = await change(data);
      if (result === SKIP) return undefined;
      const saved = await store().set(key, data, found ? { etag: found.etag } : { isNew: true });
      if (saved) return result;
      await wait(40 + Math.random() * 120 * (attempt + 1));
   }
   throw new Error(`Enregistrement impossible (${key}) : trop d'écritures simultanées.`);
};

// Renvoyé par « change » quand il n'y a rien à écrire.
export const SKIP = Symbol("rien à écrire");

export const remove = (key) => store().remove(key);
export const keys = (prefix) => store().keys(prefix);
export const putFile = (key, buffer, meta) => store().putFile(key, buffer, meta);
export const getFile = (key) => store().getFile(key);
export const removeFile = (key) => store().removeFile(key);
