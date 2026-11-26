// Réponses des clients : relève la boîte Gmail (IMAP) et range dans leur demande les emails venant de personnes déjà connues.
// Les autres emails ne sont ni lus ni gardés, et aucun message n'est marqué comme lu dans Gmail.
import process from "node:process";
import { sequences, stopEnrollments } from "./automations.mjs";
import { leads } from "./crm.mjs";
import { HttpError, cleanEmail, cleanText, isLocal, newId } from "./http.mjs";
import { SKIP, mutate, read } from "./store.mjs";

const MAX_MESSAGES = 60;
const FIRST_SYNC_DAYS = 3;

export const inboxReady = () => !isLocal() && Boolean(cleanEmail(process.env.GMAIL_USER) && process.env.GMAIL_APP_PASSWORD);

// Retire le message cité en dessous de la réponse.
const QUOTE = [/^\s*(Le|On)\s.+(a écrit|wrote)\s*:\s*$/im, /^-{2,}\s*(Message d'origine|Original Message|Message transféré)/im, /^\s*De\s*:.+\n\s*(Envoyé|Date)\s*:/im, /^\s*From\s*:.+\n\s*(Sent|Date)\s*:/im, /^_{10,}$/m];
export const ownText = (text) => {
   const body = String(text || "").replace(/\r\n/g, "\n").replace(/\n([^\n]*)\n(a écrit|wrote)\s*:/g, "\n$1 $2 :");
   const cut = QUOTE.map((re) => body.search(re)).filter((index) => index > 0);
   const own = cut.length ? body.slice(0, Math.min(...cut)) : body;
   return own
      .split("\n")
      .filter((line) => !/^\s*>/.test(line))
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
};

// Range une réponse dans la demande la plus récente de cette personne. Renvoie null si elle est inconnue ou déjà rangée.
export const fileReply = async ({ from, subject, text, messageId, date }) => {
   const email = cleanEmail(from);
   const lead = (await leads()).find((item) => item.email === email);
   if (!lead) return null;
   const added = await mutate("demandes", [], (list) => {
      const item = list.find((one) => one.id === lead.id);
      if (!item || item.events.some((event) => event.messageId && event.messageId === messageId)) return SKIP;
      item.events.push({ id: newId(), at: date || new Date().toISOString(), type: "reply", channel: "email", subject: cleanText(subject, 200), text: cleanText(ownText(text), 6000), messageId });
      item.unread = true;
      item.updatedAt = new Date().toISOString();
      if (item.status === "lost") item.status = "talking";
      return structuredClone(item);
   });
   if (!added) return null;
   // Une personne qui répond ne reçoit plus les relances des séquences concernées.
   const stopping = (await sequences()).filter((sequence) => sequence.stopOnReply).map((sequence) => sequence.id);
   await stopEnrollments((item) => item.email === email && stopping.includes(item.sequenceId), "le client a répondu");
   return added;
};

export const syncInbox = async ({ until = Date.now() + 25_000 } = {}) => {
   if (!inboxReady()) throw new HttpError(503, "La relève des réponses n'est pas connectée (Réglages > Emails).");
   const known = new Set((await leads()).map((lead) => lead.email).filter(Boolean));
   if (!known.size) return { found: 0 };
   const [{ ImapFlow }, { simpleParser }] = await Promise.all([import("imapflow"), import("mailparser")]);
   const state = await read("releve", {});
   const client = new ImapFlow({
      host: "imap.gmail.com",
      port: 993,
      secure: true,
      auth: { user: cleanEmail(process.env.GMAIL_USER), pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, "") },
      logger: false,
      connectionTimeout: 10_000,
      socketTimeout: 20_000,
   });
   let found = 0;
   try {
      await client.connect();
   } catch (error) {
      console.error("Relève Gmail :", error.message);
      throw new HttpError(502, "Gmail refuse la connexion : vérifiez le mot de passe d'application dans Netlify.");
   }
   try {
      const lock = await client.getMailboxLock("INBOX", { readOnly: true });
      try {
         const validity = String(client.mailbox.uidValidity);
         const resume = state.validity === validity && state.lastUid ? state.lastUid : 0;
         const search = resume ? { uid: `${resume + 1}:*` } : { since: new Date(Date.now() - FIRST_SYNC_DAYS * 24 * 3600_000) };
         const uids = ((await client.search(search, { uid: true })) || []).filter((uid) => uid > resume).sort((a, b) => a - b).slice(0, MAX_MESSAGES);
         let lastUid = resume;
         if (uids.length) {
            const wanted = [];
            for await (const message of client.fetch(uids, { uid: true, envelope: true }, { uid: true })) {
               const from = cleanEmail(message.envelope?.from?.[0]?.address);
               if (known.has(from)) wanted.push({ uid: message.uid, from });
            }
            const pending = new Set(wanted.map((item) => item.uid));
            for (const { uid, from } of wanted) {
               if (Date.now() > until) break;
               const { source, envelope } = await client.fetchOne(uid, { source: true, envelope: true }, { uid: true });
               const parsed = await simpleParser(source, { skipImageLinks: true });
               if (await fileReply({ from, subject: envelope.subject, text: parsed.text, messageId: envelope.messageId, date: envelope.date?.toISOString() })) found += 1;
               pending.delete(uid);
            }
            // La prochaine relève repart du premier message non traité.
            lastUid = pending.size ? Math.min(...pending) - 1 : uids[uids.length - 1];
         }
         await mutate("releve", {}, (data) => {
            Object.assign(data, { validity, lastUid: Math.max(lastUid, resume), at: new Date().toISOString() });
         });
      } finally {
         lock.release();
      }
   } finally {
      await client.logout().catch(() => {});
   }
   return { found };
};
