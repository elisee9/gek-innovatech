// Contacts et demandes : une fiche par personne, quel que soit le chemin (formulaire, lettre d'information, rendez-vous, chat, saisie).
import { HttpError, cleanEmail, cleanLang, cleanLine, cleanPhone, cleanText, newId, newToken } from "./http.mjs";
import { mutate, read } from "./store.mjs";

const now = () => new Date().toISOString();
const digits = (phone) => String(phone || "").replace(/\D/g, "");

export const LEAD_STATUSES = ["new", "talking", "quoted", "won", "lost"];
export const contacts = () => read("contacts", []);
export const leads = () => read("demandes", []);

const samePerson = (contact, { email, phone }) =>
   (email && contact.email === email) || (!email && phone && digits(phone).length >= 8 && digits(contact.phone) === digits(phone));

// Ajoute ou complète une fiche.
// marketing: true = la personne a coché la case ; l'absence de case ne retire pas un accord déjà donné.
export const upsertContact = (input, source) => {
   const email = cleanEmail(input.email);
   const phone = cleanPhone(input.phone);
   if (!email && !phone) return Promise.resolve(null);
   return mutate("contacts", [], (list) => {
      const at = now();
      let contact = list.find((item) => samePerson(item, { email, phone }));
      if (!contact) {
         contact = { id: newId(), token: newToken(), name: "", email, phone: "", company: "", lang: cleanLang(input.lang), sources: [], tags: [], marketing: null, notes: "", createdAt: at };
         list.unshift(contact);
      }
      // Ce que la fiche contient déjà prime : un envoi public ne peut pas renommer un contact existant.
      contact.name = contact.name || cleanLine(input.name, 100);
      contact.email = contact.email || email;
      contact.phone = contact.phone || phone;
      contact.company = contact.company || cleanLine(input.company, 100);
      if (source && !contact.sources.includes(source)) contact.sources.push(source);
      // L'accord pour recevoir des emails d'information est daté, avec son origine : c'est la preuve du consentement.
      if (input.marketing === true) {
         contact.marketing = { ok: true, at, source };
         contact.noFollowUp = false;
      }
      contact.lastAt = at;
      return structuredClone(contact);
   });
};

export const updateContact = (id, patch) =>
   mutate("contacts", [], (list) => {
      const contact = list.find((item) => item.id === id);
      if (!contact) throw new HttpError(404, "Contact introuvable.");
      if (patch.name !== undefined) contact.name = cleanLine(patch.name, 100);
      if (patch.email !== undefined) {
         const email = cleanEmail(patch.email);
         if (patch.email && !email) throw new HttpError(400, "Adresse email invalide.");
         if (email && list.some((item) => item.id !== id && item.email === email)) throw new HttpError(409, "Un autre contact a déjà cette adresse.");
         contact.email = email;
      }
      if (patch.phone !== undefined) contact.phone = cleanPhone(patch.phone);
      if (patch.company !== undefined) contact.company = cleanLine(patch.company, 100);
      if (patch.lang !== undefined) contact.lang = cleanLang(patch.lang);
      if (patch.notes !== undefined) contact.notes = cleanText(patch.notes, 2000);
      if (Array.isArray(patch.tags)) contact.tags = [...new Set(patch.tags.map((tag) => cleanLine(tag, 30)).filter(Boolean))].slice(0, 12);
      if (patch.marketing === false) contact.marketing = { ok: false, at: now(), source: "admin" };
      return structuredClone(contact);
   });

export const removeContact = (id) =>
   mutate("contacts", [], (list) => {
      const index = list.findIndex((item) => item.id === id);
      if (index >= 0) list.splice(index, 1);
   });

// Désinscription par le lien de bas d'email : plus aucun email d'information ni de relance.
export const unsubscribe = (token) =>
   mutate("contacts", [], (list) => {
      const contact = list.find((item) => item.token === token);
      if (!contact) return null;
      contact.marketing = { ok: false, at: now(), source: "lien de désinscription" };
      contact.noFollowUp = true;
      return structuredClone(contact);
   });

const event = (type, data = {}) => ({ id: newId(), at: now(), type, ...data });

export const createLead = async (input, source) => {
   const name = cleanLine(input.name, 100);
   const message = cleanText(input.message, 6000);
   const email = cleanEmail(input.email);
   const phone = cleanPhone(input.phone);
   if (!name || !message || (!email && !phone)) throw new HttpError(400, "Il faut un nom, un message et un moyen de contact.");
   const contact = await upsertContact({ ...input, name, email, phone }, source);
   const lead = {
      id: newId(),
      contactId: contact.id,
      name,
      email,
      phone,
      company: cleanLine(input.company, 100) || contact.company,
      plan: cleanLine(input.plan, 20) || "unsure",
      lang: cleanLang(input.lang),
      source,
      page: cleanLine(input.page, 120),
      status: "new",
      unread: true,
      createdAt: now(),
      updatedAt: now(),
      events: [event("message", { text: message, channel: source === "site" ? "site" : cleanLine(input.channel, 20) || "manual" })],
   };
   await mutate("demandes", [], (list) => {
      list.unshift(lead);
   });
   return { lead, contact };
};

export const changeLead = (id, change) =>
   mutate("demandes", [], (list) => {
      const lead = list.find((item) => item.id === id);
      if (!lead) throw new HttpError(404, "Demande introuvable.");
      const result = change(lead);
      lead.updatedAt = now();
      return result === undefined ? structuredClone(lead) : result;
   });

export const addEvent = (id, type, data, extra) =>
   changeLead(id, (lead) => {
      lead.events.push(event(type, data));
      extra?.(lead);
   });

export const removeLead = (id) =>
   mutate("demandes", [], (list) => {
      const index = list.findIndex((item) => item.id === id);
      if (index >= 0) list.splice(index, 1);
   });

// Compteurs journaliers anonymes (visites, clics WhatsApp, chat) : aucun identifiant de visiteur n'est gardé.
export const COUNTED = ["visit", "whatsapp", "chat", "call", "booking", "subscribe", "lead"];
export const count = (type) => {
   if (!COUNTED.includes(type)) return Promise.resolve();
   const today = now().slice(0, 10);
   return mutate(`compteurs/${today.slice(0, 7)}`, {}, (data) => {
      data[today] ??= {};
      data[today][type] = (data[today][type] || 0) + 1;
   });
};

export const counters = async (months = 4) => {
   const out = {};
   const date = new Date();
   for (let i = 0; i < months; i += 1) {
      Object.assign(out, await read(`compteurs/${new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - i, 1)).toISOString().slice(0, 7)}`, {}));
   }
   return out;
};
