export const ZONE = "Africa/Porto-Novo";

export const date = (value, options = { day: "numeric", month: "short", year: "numeric" }) =>
   value ? new Intl.DateTimeFormat("fr-FR", { timeZone: ZONE, ...options }).format(new Date(value)) : "";

export const time = (value) => date(value, { hour: "2-digit", minute: "2-digit" });
export const dateTime = (value) => date(value, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
// Jour au format AAAA-MM-JJ, à l'heure du Bénin.
export const dayKey = (value = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: ZONE }).format(new Date(value));
export const addDays = (key, n) => new Date(Date.parse(`${key}T12:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

export const ago = (value) => {
   const minutes = Math.max(0, Math.round((Date.now() - Date.parse(value)) / 60_000));
   if (minutes < 1) return "à l'instant";
   if (minutes < 60) return `il y a ${minutes} min`;
   const hours = Math.round(minutes / 60);
   if (hours < 24) return `il y a ${hours} h`;
   const days = Math.round(hours / 24);
   return days < 30 ? `il y a ${days} j` : date(value, { day: "numeric", month: "short", year: "numeric" });
};

export const money = (amount, currency = "XOF") =>
   `${new Intl.NumberFormat("fr-FR", { minimumFractionDigits: currency === "EUR" && amount % 1 ? 2 : 0, maximumFractionDigits: currency === "EUR" ? 2 : 0 }).format(amount || 0)} ${currency === "EUR" ? "€" : "FCFA"}`;

// Parité fixe entre l'euro et le franc CFA (BCEAO).
export const XOF_PER_EUR = 655.957;
export const toCurrency = (eur, currency) => (currency === "XOF" ? Math.round(eur * XOF_PER_EUR) : eur);

// Espace insécable : le nombre reste sur la même ligne que son mot.
export const plural = (n, one, many = `${one}s`) => `${n}\u00a0${n > 1 ? many : one}`;
export const initials = (name) =>
   String(name || "?")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");

export const plain = (value) =>
   String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
export const matches = (query, ...fields) => {
   const words = plain(query).split(/\s+/).filter(Boolean);
   const text = plain(fields.join(" "));
   return words.every((word) => text.includes(word));
};

export const whatsappUrl = (phone, text) => `https://wa.me/${String(phone || "").replace(/\D/g, "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
export const gmailUrl = (to, subject, body) =>
   `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject || "")}&body=${encodeURIComponent(body || "")}`;

const stamp = (value) => new Date(value).toISOString().replace(/[-:]|\.\d{3}/g, "");
export const googleCalendarUrl = (meeting) => {
   const end = new Date(Date.parse(meeting.start) + meeting.duration * 60_000);
   const params = new URLSearchParams({
      action: "TEMPLATE",
      text: meeting.title || `Rendez-vous avec ${meeting.name}`,
      dates: `${stamp(meeting.start)}/${stamp(end)}`,
      details: [meeting.topic, meeting.phone, meeting.email].filter(Boolean).join("\n"),
      location: meeting.mode === "video" ? meeting.link || "" : meeting.mode === "inperson" ? meeting.place || "" : "",
   });
   return `https://calendar.google.com/calendar/render?${params}`;
};

// Demande qui attend une réponse : même règle pour le menu, l'accueil et la liste.
export const needsReply = (lead) => !lead.archived && !["won", "lost"].includes(lead.status) && (lead.unread || lead.status === "new");

export const LEAD_STATUS = {
   new: { label: "Nouvelle", tone: "signal" },
   talking: { label: "En discussion", tone: "info" },
   quoted: { label: "Devis envoyé", tone: "warn" },
   won: { label: "Gagnée", tone: "ok" },
   lost: { label: "Perdue", tone: "mute" },
};
export const PLAN_LABEL = { starter: "Plan Starter", pro: "Plan Pro", premium: "Plan Premium", wordpress: "Site WordPress", mobile: "Application mobile", unsure: "Ne sait pas encore" };
export const SOURCE_LABEL = { site: "Formulaire du site", lettre: "Lettre d'information", "rendez-vous": "Rendez-vous", chat: "Chat du site", admin: "Ajout manuel", import: "Import", devis: "Devis" };
export const MODE_LABEL = { whatsapp: "Appel WhatsApp", phone: "Téléphone", video: "Visio", inperson: "Sur place" };
export const MEETING_STATUS = {
   confirmed: { label: "Confirmé", tone: "info" },
   done: { label: "Fait", tone: "ok" },
   noshow: { label: "Absent", tone: "warn" },
   cancelled: { label: "Annulé", tone: "mute" },
};
export const DOC_STATUS = {
   draft: { label: "Brouillon", tone: "mute" },
   sent: { label: "Envoyé", tone: "info" },
   accepted: { label: "Accepté", tone: "ok" },
   refused: { label: "Refusé", tone: "mute" },
   paid: { label: "Payée", tone: "ok" },
   late: { label: "En retard", tone: "signal" },
   expired: { label: "Expiré", tone: "warn" },
};
// Un devis passé de date ou une facture échue se voit sans rien changer à la main.
export const docState = (doc) => {
   if (doc.status === "sent" && doc.due && doc.due < dayKey()) return doc.type === "quote" ? "expired" : "late";
   return doc.status;
};
export const TRIGGER_LABEL = {
   lead: "Nouvelle demande de devis",
   quote: "Devis envoyé",
   meeting: "Rendez-vous terminé",
   subscriber: "Inscription à la lettre",
   manual: "Ajout à la main",
};
