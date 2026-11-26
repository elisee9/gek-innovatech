// Réglages privés du tableau de bord. Les informations légales restent vides tant qu'elles ne sont pas fournies.
import { cleanEmail, cleanLine, cleanText } from "./http.mjs";
import { mutate, read } from "./store.mjs";

export const DEFAULT_SETTINGS = {
   // Imprimé sur les devis et factures.
   company: { name: "GEK INNOVATECH", address: "", city: "", country: "Bénin", ifu: "", rccm: "", bank: "", mobileMoney: "", paymentTerms: "", quoteValidity: 30, currency: "XOF", taxRate: 0, taxNote: "" },
   mail: { fromName: "GEK INNOVATECH", signature: "L'équipe GEK INNOVATECH", dailyLimit: 200 },
   notify: { newLead: true, newMeeting: true, digest: false, email: "" },
   ai: { autoDraft: true, instructions: "", chatExtra: "" },
   // Horaires proposés à titre de départ : le rendez-vous en ligne reste fermé tant qu'il n'est pas activé (Réglages).
   booking: {
      days: { 1: [["09:00", "12:00"], ["14:00", "18:00"]], 2: [["09:00", "12:00"], ["14:00", "18:00"]], 3: [["09:00", "12:00"], ["14:00", "18:00"]], 4: [["09:00", "12:00"], ["14:00", "18:00"]], 5: [["09:00", "12:00"], ["14:00", "18:00"]], 6: [], 0: [] },
      duration: 30,
      buffer: 15,
      notice: 12,
      horizon: 21,
      modes: ["whatsapp", "phone"],
      videoLink: "",
      blocked: [],
      reminders: true,
   },
};

const merge = (base, saved) =>
   Object.fromEntries(Object.entries(base).map(([key, value]) => [key, { ...value, ...(saved?.[key] || {}) }]));

export const settings = async () => merge(DEFAULT_SETTINGS, await read("reglages"));

const number = (value, min, max, fallback) => {
   const n = Math.round(Number(value));
   return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
};
const HOUR = /^([01]\d|2[0-3]):[0-5]\d$/;

const CLEAN = {
   company: (v) => ({
      name: cleanLine(v.name, 80) || "GEK INNOVATECH",
      address: cleanLine(v.address, 160),
      city: cleanLine(v.city, 80),
      country: cleanLine(v.country, 60),
      ifu: cleanLine(v.ifu, 40),
      rccm: cleanLine(v.rccm, 60),
      bank: cleanText(v.bank, 400),
      mobileMoney: cleanText(v.mobileMoney, 300),
      paymentTerms: cleanText(v.paymentTerms, 600),
      quoteValidity: number(v.quoteValidity, 1, 365, 30),
      currency: v.currency === "EUR" ? "EUR" : "XOF",
      taxRate: Math.max(0, Math.min(100, Number(v.taxRate) || 0)),
      taxNote: cleanLine(v.taxNote, 160),
   }),
   mail: (v) => ({
      fromName: cleanLine(v.fromName, 60) || "GEK INNOVATECH",
      signature: cleanText(v.signature, 500),
      dailyLimit: number(v.dailyLimit, 1, 400, 200),
   }),
   notify: (v) => ({ newLead: Boolean(v.newLead), newMeeting: Boolean(v.newMeeting), digest: Boolean(v.digest), email: cleanEmail(v.email) }),
   ai: (v) => ({ autoDraft: Boolean(v.autoDraft), instructions: cleanText(v.instructions, 1500), chatExtra: cleanText(v.chatExtra, 2000) }),
   booking: (v) => ({
      days: Object.fromEntries(
         [0, 1, 2, 3, 4, 5, 6].map((day) => [
            day,
            (Array.isArray(v.days?.[day]) ? v.days[day] : [])
               .filter((range) => Array.isArray(range) && HOUR.test(range[0]) && HOUR.test(range[1]) && range[0] < range[1])
               .map(([from, to]) => [from, to])
               .slice(0, 4),
         ]),
      ),
      duration: number(v.duration, 10, 240, 30),
      buffer: number(v.buffer, 0, 120, 15),
      notice: number(v.notice, 0, 168, 12),
      horizon: number(v.horizon, 1, 90, 21),
      modes: ["whatsapp", "phone", "video"].filter((mode) => v.modes?.includes(mode)),
      videoLink: /^https:\/\//.test(v.videoLink || "") ? cleanLine(v.videoLink, 300) : "",
      blocked: (Array.isArray(v.blocked) ? v.blocked : []).filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day)).slice(0, 200),
      reminders: Boolean(v.reminders),
   }),
};

export const saveSettings = async (section, value) => {
   if (!CLEAN[section]) return null;
   const cleaned = CLEAN[section]({ ...DEFAULT_SETTINGS[section], ...value });
   await mutate("reglages", {}, (data) => {
      data[section] = cleaned;
   });
   return cleaned;
};
