// Devis et factures : numérotation par année, montants recalculés ici (jamais repris tels quels du navigateur).
import { HttpError, cleanEmail, cleanLang, cleanLine, cleanPhone, cleanText, newId } from "./http.mjs";
import { mutate, read } from "./store.mjs";

export const documents = () => read("documents", []);

const PREFIX = { quote: "DEV", invoice: "FAC" };
const STATUSES = { quote: ["draft", "sent", "accepted", "refused"], invoice: ["draft", "sent", "paid"] };
const DATE = /^\d{4}-\d{2}-\d{2}$/;

// Le franc CFA n'a pas de centimes.
export const round = (amount, currency) => (currency === "XOF" ? Math.round(amount) : Math.round(amount * 100) / 100);

export const totals = ({ items, discount, taxRate, currency }) => {
   const gross = items.reduce((sum, item) => sum + round(item.qty * item.price, currency), 0);
   const off = Math.min(gross, round(discount || 0, currency));
   const net = round(gross - off, currency);
   const tax = round((net * (taxRate || 0)) / 100, currency);
   return { gross: round(gross, currency), discount: off, net, tax, total: round(net + tax, currency) };
};

const clean = (input) => {
   const type = input.type === "invoice" ? "invoice" : "quote";
   const currency = input.currency === "EUR" ? "EUR" : "XOF";
   const items = (Array.isArray(input.items) ? input.items : [])
      .slice(0, 40)
      .map((item) => ({
         label: cleanLine(item.label, 160),
         detail: cleanText(item.detail, 600),
         qty: Math.max(0, Math.min(100_000, Number(item.qty) || 0)),
         price: Math.max(0, Math.min(1_000_000_000, round(Number(item.price) || 0, currency))),
      }))
      .filter((item) => item.label);
   const document = {
      type,
      currency,
      items,
      lang: cleanLang(input.lang),
      date: DATE.test(input.date) ? input.date : new Date().toISOString().slice(0, 10),
      due: DATE.test(input.due) ? input.due : "",
      client: {
         name: cleanLine(input.client?.name, 100),
         company: cleanLine(input.client?.company, 100),
         email: cleanEmail(input.client?.email),
         phone: cleanPhone(input.client?.phone),
         address: cleanText(input.client?.address, 300),
         ifu: cleanLine(input.client?.ifu, 40),
      },
      leadId: cleanLine(input.leadId, 40),
      contactId: cleanLine(input.contactId, 40),
      subject: cleanLine(input.subject, 160),
      discount: Math.max(0, Number(input.discount) || 0),
      taxRate: Math.max(0, Math.min(100, Number(input.taxRate) || 0)),
      paid: Math.max(0, Number(input.paid) || 0),
      notes: cleanText(input.notes, 1500),
      terms: cleanText(input.terms, 1500),
      status: STATUSES[type].includes(input.status) ? input.status : "draft",
   };
   document.totals = totals(document);
   return document;
};

// Un devis est numéroté dès sa création ; une facture seulement à son émission, pour une suite sans trou.
const nextNumber = (type, date) =>
   mutate("numeros", {}, (data) => {
      const key = `${PREFIX[type]}-${date.slice(0, 4)}`;
      data[key] = (data[key] || 0) + 1;
      return `${key}-${String(data[key]).padStart(3, "0")}`;
   });

export const saveDocument = async (input) => {
   const next = clean(input);
   if (!next.client.name && !next.client.company) throw new HttpError(400, "Indiquez le client.");
   if (!next.items.length) throw new HttpError(400, "Ajoutez au moins une ligne.");
   const existing = input.id ? (await documents()).find((item) => item.id === input.id) : null;
   if (input.id && !existing) throw new HttpError(404, "Document introuvable.");
   const at = new Date().toISOString();
   const numbered = existing?.number || next.type === "quote" || next.status !== "draft";
   const number = existing?.number || (numbered ? await nextNumber(next.type, next.date) : "");
   return mutate("documents", [], (list) => {
      if (existing) {
         const found = list.find((item) => item.id === input.id);
         // Une facture envoyée ne se modifie plus : seul son suivi (statut, acompte) change.
         const locked = found.type === "invoice" && found.status !== "draft";
         const patch = locked ? { status: next.status === "draft" ? found.status : next.status, paid: next.paid } : { ...next, type: found.type };
         Object.assign(found, patch, { number: found.number || number, updatedAt: at });
         return structuredClone(found);
      }
      const document = { id: newId(), number, ...next, fromId: cleanLine(input.fromId, 40), createdAt: at, updatedAt: at };
      list.unshift(document);
      return structuredClone(document);
   });
};

export const markDocument = (id, patch) =>
   mutate("documents", [], (list) => {
      const document = list.find((item) => item.id === id);
      if (!document) throw new HttpError(404, "Document introuvable.");
      if (patch.status && STATUSES[document.type].includes(patch.status)) document.status = patch.status;
      if (patch.sentAt) document.sentAt = patch.sentAt;
      if (patch.paid !== undefined) document.paid = Math.max(0, Number(patch.paid) || 0);
      document.updatedAt = new Date().toISOString();
      return structuredClone(document);
   });

// Émet le document : lui donne son numéro s'il n'en a pas encore.
export const issueDocument = async (id) => {
   const found = (await documents()).find((item) => item.id === id);
   if (!found) throw new HttpError(404, "Document introuvable.");
   if (found.number) return found;
   const number = await nextNumber(found.type, found.date);
   return mutate("documents", [], (list) => {
      const document = list.find((item) => item.id === id);
      document.number ||= number;
      return structuredClone(document);
   });
};

// Seul un brouillon se supprime : un document envoyé reste dans la numérotation.
export const removeDocument = (id) =>
   mutate("documents", [], (list) => {
      const index = list.findIndex((item) => item.id === id);
      if (index < 0) return;
      if (list[index].status !== "draft") throw new HttpError(409, "Un document envoyé ne se supprime pas : changez son statut.");
      list.splice(index, 1);
   });
