// Envoi des emails depuis l'adresse Gmail de GEK (GMAIL_USER et GMAIL_APP_PASSWORD, posés dans Netlify).
// En local, rien ne part : chaque email est écrit dans le dossier de test.
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";
import nodemailer from "nodemailer";
import { HttpError, cleanEmail, escapeHtml, isLocal, newId } from "./http.mjs";
import { settings } from "./settings.mjs";
import { mutate, read } from "./store.mjs";

const KEPT = 300;

export const mailReady = () => isLocal() || Boolean(cleanEmail(process.env.GMAIL_USER) && process.env.GMAIL_APP_PASSWORD);
export const mailAddress = () => cleanEmail(process.env.GMAIL_USER) || (isLocal() ? "test@exemple.com" : "");

const today = () => new Date().toISOString().slice(0, 10);

// Texte simple vers HTML : paragraphes, **gras**, listes à tirets et liens.
const inline = (text) =>
   escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g, '<a href="$1" style="color:#1d467b;text-decoration:underline">$1</a>');

const blocks = (body) =>
   body
      .replace(/\r\n/g, "\n")
      .split(/\n{2,}/)
      .map((part) => {
         const lines = part.split("\n").filter((line) => line.trim());
         if (lines.length && lines.every((line) => /^\s*[-•]\s+/.test(line))) {
            return `<ul style="margin:0 0 16px;padding-left:20px">${lines.map((line) => `<li style="margin:0 0 6px">${inline(line.replace(/^\s*[-•]\s+/, ""))}</li>`).join("")}</ul>`;
         }
         return lines.length ? `<p style="margin:0 0 16px">${lines.map(inline).join("<br>")}</p>` : "";
      })
      .join("");

const FOOTER = {
   fr: { why: "Vous recevez cet email car vous avez écrit à GEK INNOVATECH ou accepté de recevoir ses emails.", stop: "Ne plus recevoir ces emails" },
   en: { why: "You are receiving this email because you contacted GEK INNOVATECH or agreed to receive its emails.", stop: "Stop receiving these emails" },
};

// Sobre et lisible sur téléphone : un bandeau de marque en texte (les images sont souvent bloquées), puis le message.
const layout = ({ body, signature, lang, stopUrl }) => {
   const footer = FOOTER[lang] || FOOTER.fr;
   return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;background:#f4f6fa;padding:24px 12px;font-family:'Segoe UI',Arial,Helvetica,sans-serif;color:#1d467b">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #dde4ee;border-radius:16px">
<tr><td style="padding:22px 28px;border-bottom:1px solid #e6ebf3;font-size:17px;font-weight:600;letter-spacing:.02em;color:#1d467b">GEK <span style="color:#cc2219">&#9679;</span> INNOVATECH</td></tr>
<tr><td style="padding:28px;font-size:16px;line-height:1.6;color:#1d467b">${blocks(body)}${signature ? `<p style="margin:24px 0 0;color:#456189">${signature.split("\n").map(inline).join("<br>")}</p>` : ""}</td></tr>
</table>
${stopUrl ? `<p style="max-width:600px;margin:16px auto 0;font-size:13px;line-height:1.5;color:#526c92">${footer.why}<br><a href="${escapeHtml(stopUrl)}" style="color:#526c92">${footer.stop}</a></p>` : ""}
</td></tr></table></body></html>`;
};

const plain = ({ body, signature, lang, stopUrl }) =>
   [body.replace(/\*\*(.+?)\*\*/g, "$1"), signature, stopUrl ? `${(FOOTER[lang] || FOOTER.fr).stop} : ${stopUrl}` : ""].filter(Boolean).join("\n\n");

let transport = null;
const gmail = () => {
   transport ??= nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: cleanEmail(process.env.GMAIL_USER), pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, "") },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
   });
   return transport;
};

const deliver = async (message) => {
   if (!isLocal()) return gmail().sendMail(message);
   const dir = join(process.env.GEK_DATA_DIR, "envois");
   await mkdir(dir, { recursive: true });
   const { attachments = [], ...rest } = message;
   await writeFile(
      join(dir, `${Date.now()}-${newId()}.json`),
      JSON.stringify({ ...rest, attachments: attachments.map(({ filename, content }) => ({ filename, size: content.length })) }, null, 2),
   );
   return {};
};

export const sentToday = async () => (await read(`envois/${today()}`, { count: 0 })).count;

const log = (entry) =>
   mutate("courrier", [], (list) => {
      list.unshift({ id: newId(), at: new Date().toISOString(), ...entry });
      list.splice(KEPT);
   });

// kind : reply (écrit par l'administrateur), auto (relance, rappel), campaign, notice (avis interne).
// Gmail limite le nombre d'envois par jour : les envois automatiques s'arrêtent avant, pour garder de la place aux réponses.
export const sendMail = async ({ to, toName, subject, body, lang = "fr", kind = "reply", stopUrl, attachments, inReplyTo, replyTo, sign = true }) => {
   if (!mailReady()) throw new HttpError(503, "L'envoi d'emails n'est pas encore connecté (Réglages > Emails).");
   const email = cleanEmail(to);
   if (!email) throw new HttpError(400, "Adresse email du destinataire invalide.");
   const { mail } = await settings();
   const reserved = await mutate(`envois/${today()}`, { count: 0 }, (data) => {
      if (data.count >= (kind === "reply" ? Math.max(mail.dailyLimit + 50, mail.dailyLimit) : mail.dailyLimit)) return false;
      data.count += 1;
      return true;
   });
   if (!reserved) throw new HttpError(429, "Limite d'envois du jour atteinte : les envois reprennent demain.");

   const content = { body: String(body || ""), signature: sign ? mail.signature : "", lang, stopUrl };
   const messageId = `<${newId()}.${Date.now()}@gek-innovatech>`;
   try {
      await deliver({
         from: { name: mail.fromName, address: mailAddress() },
         to: toName ? { name: toName, address: email } : email,
         subject: String(subject || "").replace(/\s+/g, " ").trim(),
         text: plain(content),
         html: layout(content),
         messageId,
         ...(replyTo ? { replyTo } : {}),
         ...(inReplyTo ? { inReplyTo, references: inReplyTo } : {}),
         ...(attachments?.length ? { attachments } : {}),
         ...(stopUrl ? { headers: { "List-Unsubscribe": `<${stopUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } } : {}),
      });
      await log({ to: email, subject, kind, ok: true });
      return messageId;
   } catch (error) {
      console.error("Envoi email :", error);
      const reason = /Invalid login|EAUTH|535/.test(`${error.code} ${error.message}`)
         ? "Gmail refuse la connexion : vérifiez le mot de passe d'application dans Netlify."
         : "L'envoi a échoué. Réessayez dans un instant.";
      await log({ to: email, subject, kind, ok: false, error: reason });
      throw new HttpError(502, reason);
   }
};

export const mailLog = () => read("courrier", []);

// {prenom}, {nom}, {entreprise}… : variables remplies pour chaque destinataire.
// Une information inconnue disparaît avec l'espace qui la précède : « Bonjour {prenom}, » devient « Bonjour, ».
export const personalize = (text, values) =>
   String(text || "").replace(/( ?)\{(\w+)\}/g, (match, space, key) => (values[key] === undefined ? match : values[key] ? space + values[key] : ""));

export const variablesFor = (contact, extra = {}) => {
   const name = (contact.name || "").trim();
   return { prenom: name.split(/\s+/)[0] || "", nom: name, entreprise: contact.company || "", email: contact.email || "", ...extra };
};
