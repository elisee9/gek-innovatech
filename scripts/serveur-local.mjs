// Serveur local : le site compilé (dist) et ses fonctions, comme en ligne, avec les données dans .donnees/ (jamais publiées).
// Aucun email ne part : ils sont écrits dans .donnees/envois. Lancer « npm run build » avant, puis « npm run local ».
import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { Readable } from "node:stream";
import process from "node:process";

const DIST = resolve("dist");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpeg": "image/jpeg", ".jpg": "image/jpeg", ".png": "image/png", ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff", ".xml": "application/xml", ".txt": "text/plain", ".json": "application/json" };

if (existsSync(".env")) process.loadEnvFile(".env");
process.env.GEK_DATA_DIR ||= resolve(".donnees");
// En local, un envoi réel est impossible : les identifiants Gmail ne sont pas lus.
delete process.env.GMAIL_APP_PASSWORD;

let shown = "défini à l'avance";
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
   process.env.ADMIN_EMAIL ||= "admin@exemple.com";
   if (!process.env.ADMIN_PASSWORD) {
      process.env.ADMIN_PASSWORD = randomBytes(12).toString("base64url");
      shown = process.env.ADMIN_PASSWORD;
   }
}

const [site, api, media, chat, cron] = await Promise.all(["site", "api", "media", "chat", "cron"].map((name) => import(`../netlify/functions/${name}.mjs`)));

const redirects = readFileSync(join(DIST, "_redirects"), "utf8")
   .split(/\r?\n/)
   .map((line) => line.trim())
   .filter((line) => line && !line.startsWith("#"))
   .map((line) => line.split(/\s+/));

const route = (path) => {
   if (path.startsWith("/api/")) return api.default;
   if (path.startsWith("/media/")) return media.default;
   if (path === "/.netlify/functions/chat") return chat.default;
   if (path === "/__passage") return async () => (await cron.run(), new Response("ok"));
   if (site.config.path.includes(path)) return site.default;
   return null;
};

const staticFile = (path) => {
   const file = join(DIST, decodeURIComponent(path));
   if (file.startsWith(DIST) && existsSync(file) && statSync(file).isFile()) return [file, 200];
   for (const [from, to, status] of redirects) {
      if (from === path || (from.endsWith("/*") && path.startsWith(from.slice(0, -1)))) return [join(DIST, to), Number(status)];
   }
   return [join(DIST, "404.html"), 404];
};

const server = createServer(async (req, res) => {
   const url = new URL(req.url, `http://${req.headers.host}`);
   const handler = route(url.pathname);
   try {
      if (!handler) {
         const [file, status] = staticFile(url.pathname);
         res.writeHead(status, { "content-type": TYPES[extname(file)] || "application/octet-stream", "cache-control": "no-store" });
         res.end(readFileSync(file));
         return;
      }
      const hasBody = !["GET", "HEAD"].includes(req.method);
      const request = new Request(url, { method: req.method, headers: req.headers, ...(hasBody ? { body: Readable.toWeb(req), duplex: "half" } : {}) });
      const response = await handler(request, { ip: req.socket.remoteAddress });
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
   } catch (error) {
      console.error(error);
      res.writeHead(500).end("Erreur");
   }
});

// Port libre à partir de 4330 : un port déjà pris est laissé tranquille.
const listen = (port) => {
   server.once("error", (error) => (error.code === "EADDRINUSE" ? listen(port + 1) : console.error(error)));
   server.listen(port, () => {
      process.env.GEK_SITE_URL = `http://localhost:${port}`;
      console.log(`Site : http://localhost:${port}\nTableau de bord : http://localhost:${port}/admin\nCompte local : ${process.env.ADMIN_EMAIL} / ${shown}`);
   });
};
listen(Number(process.env.PORT) || 4330);
