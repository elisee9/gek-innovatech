// Outils communs aux fonctions : réponses, erreurs lisibles, contrôle de l'origine et des abus.
import { createHash, randomBytes } from "node:crypto";
import process from "node:process";
import { mutate } from "./store.mjs";

export class HttpError extends Error {
   constructor(status, message) {
      super(message);
      this.status = status;
   }
}

export const json = (data, status = 200, headers = {}) =>
   new Response(JSON.stringify(data), {
      status,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
   });

export const readJson = async (req, maxBytes = 200_000) => {
   const raw = await req.text();
   if (raw.length > maxBytes) throw new HttpError(413, "Envoi trop volumineux.");
   try {
      return JSON.parse(raw || "{}");
   } catch {
      throw new HttpError(400, "Données illisibles.");
   }
};

export const newId = () => randomBytes(9).toString("base64url");
export const newToken = () => randomBytes(18).toString("base64url");

export const clientIp = (req, context) =>
   context?.ip || req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "inconnue";

// L'adresse IP n'est jamais gardée telle quelle : une empreinte suffit à compter les envois.
export const fingerprint = (value) => createHash("sha256").update(`gek:${value}`).digest("base64url").slice(0, 22);

// Une page d'un autre site ne peut pas déclencher d'action : l'origine doit être celle du site.
export const sameOrigin = (req) => {
   const origin = req.headers.get("origin");
   if (!origin) return true;
   try {
      const { host } = new URL(origin);
      return host === (req.headers.get("x-forwarded-host") || req.headers.get("host") || new URL(req.url).host);
   } catch {
      return false;
   }
};

// Au plus « max » appels par fenêtre de temps et par visiteur ; au-delà, refus.
export const limit = async (name, who, max, windowMs) => {
   const id = fingerprint(who);
   const now = Date.now();
   const allowed = await mutate(`limites/${name}`, {}, (data) => {
      for (const key of Object.keys(data)) {
         data[key] = data[key].filter((at) => now - at < windowMs);
         if (!data[key].length) delete data[key];
      }
      const hits = data[id] || [];
      if (hits.length >= max) return false;
      data[id] = [...hits, now];
      return true;
   });
   if (!allowed) throw new HttpError(429, "Trop de tentatives. Réessayez dans quelques minutes.");
};

export const isLocal = () => Boolean(process.env.GEK_DATA_DIR);

export const siteUrl = (req) => {
   if (process.env.GEK_SITE_URL) return process.env.GEK_SITE_URL;
   if (process.env.URL) return process.env.URL;
   return req ? new URL(req.url).origin : "https://gek-innovatech.netlify.app";
};

const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;
export const cleanEmail = (value) => {
   const email = String(value || "").trim().toLowerCase();
   return email.length <= 160 && EMAIL_RE.test(email) ? email : "";
};
export const cleanText = (value, max = 500) => String(value ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, max);
export const cleanLine = (value, max = 160) => cleanText(value, max).replace(/\s+/g, " ");
export const cleanPhone = (value) => cleanLine(value, 40).replace(/[^\d+().\s-]/g, "");
export const cleanLang = (value) => (value === "en" ? "en" : "fr");

export const escapeHtml = (value) =>
   String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
