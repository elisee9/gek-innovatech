// Connexion au tableau de bord : un seul compte, défini dans Netlify (ADMIN_EMAIL, ADMIN_PASSWORD).
// Le mot de passe n'est jamais enregistré ni renvoyé ; la session tient dans un cookie signé, invisible pour les scripts.
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import process from "node:process";
import { HttpError, cleanEmail, clientIp, fingerprint, isLocal, sameOrigin } from "./http.mjs";
import { mutate, read } from "./store.mjs";

const COOKIE = "gek_admin";
const DAY = 24 * 3600 * 1000;
const MIN_PASSWORD = 12;
const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;

const digest = (value) => createHash("sha256").update(String(value)).digest();
const same = (a, b) => timingSafeEqual(digest(a), digest(b));

export const authStatus = () => {
   const email = cleanEmail(process.env.ADMIN_EMAIL);
   const password = process.env.ADMIN_PASSWORD || "";
   if (!email || !password) return { ready: false, reason: "missing" };
   if (password.length < MIN_PASSWORD) return { ready: false, reason: "short" };
   return { ready: true, email };
};

// Clé de signature tirée au hasard à la première connexion. Changer le mot de passe ferme toutes les sessions ouvertes.
const signingKey = async () => {
   const saved = await read("systeme/cle");
   const key = saved?.key || (await mutate("systeme/cle", {}, (data) => {
      data.key ||= randomBytes(32).toString("base64url");
      return data.key;
   }));
   return createHmac("sha256", key).update(process.env.ADMIN_PASSWORD || "").digest();
};

const sign = async (payload) => createHmac("sha256", await signingKey()).update(payload).digest("base64url");

const cookie = (value, maxAge) =>
   [`${COOKIE}=${value}`, "Path=/api", "HttpOnly", "SameSite=Strict", `Max-Age=${maxAge}`, isLocal() ? "" : "Secure"].filter(Boolean).join("; ");

export const endSession = () => cookie("", 0);

export const login = async (req, context, { email, password, remember }) => {
   const status = authStatus();
   if (!status.ready) throw new HttpError(503, "Le compte administrateur n'est pas encore configuré dans Netlify.");

   const who = fingerprint(clientIp(req, context));
   const now = Date.now();
   const locked = (await read("systeme/connexions", {}))[who];
   if (locked && locked.count >= MAX_FAILURES && now - locked.at < LOCK_MS) {
      throw new HttpError(429, "Trop d'essais. Réessayez dans 15 minutes.");
   }

   // Les deux comparaisons sont toujours faites : la durée de la réponse ne dit pas laquelle a échoué.
   const emailOk = same(cleanEmail(email), status.email);
   const passwordOk = same(password || "", process.env.ADMIN_PASSWORD);
   if (!emailOk || !passwordOk) {
      await mutate("systeme/connexions", {}, (data) => {
         for (const key of Object.keys(data)) if (now - data[key].at > LOCK_MS) delete data[key];
         data[who] = { count: (data[who]?.count || 0) + 1, at: now };
      });
      throw new HttpError(401, "Email ou mot de passe incorrect.");
   }
   if (locked) {
      await mutate("systeme/connexions", {}, (data) => {
         delete data[who];
      });
   }
   const days = remember ? 30 : 1;
   const payload = Buffer.from(JSON.stringify({ exp: now + days * DAY })).toString("base64url");
   return cookie(`${payload}.${await sign(payload)}`, days * 24 * 3600);
};

const validSession = async (req) => {
   const raw = (req.headers.get("cookie") || "").split(/;\s*/).find((part) => part.startsWith(`${COOKIE}=`));
   if (!raw || !authStatus().ready) return false;
   const [payload, signature] = raw.slice(COOKIE.length + 1).split(".");
   if (!payload || !signature || !same(signature, await sign(payload))) return false;
   try {
      return JSON.parse(Buffer.from(payload, "base64url").toString()).exp > Date.now();
   } catch {
      return false;
   }
};

export const requireAdmin = async (req) => {
   if (!(await validSession(req))) throw new HttpError(401, "Session expirée : reconnectez-vous.");
   if (req.method !== "GET" && !sameOrigin(req)) throw new HttpError(403, "Origine refusée.");
};
