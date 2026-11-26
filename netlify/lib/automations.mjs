// Envois programmés : séquences de suivi, campagnes et rappels de rendez-vous.
// Chaque envoi est d'abord réservé dans le stockage : deux passages simultanés ne peuvent pas l'envoyer deux fois.
import { fullContent } from "./content.mjs";
import { contacts, leads } from "./crm.mjs";
import { HttpError, cleanLine, cleanText, newId, siteUrl } from "./http.mjs";
import { mailReady, personalize, sendMail, variablesFor } from "./mail.mjs";
import { meetingEmail, meetings } from "./meetings.mjs";
import { settings } from "./settings.mjs";
import { SKIP, mutate, read, write } from "./store.mjs";

const HOUR = 3600_000;
const DAY = 24 * HOUR;
export const TRIGGERS = ["lead", "subscriber", "quote", "meeting", "manual"];

const step = (n, unit, frSubject, frBody, enSubject, enBody) => ({ id: newId(), delay: { n, unit }, subject: { fr: frSubject, en: enSubject }, body: { fr: frBody, en: enBody } });

// Séquences de départ, toutes éteintes : rien ne part tant que l'administrateur ne les a pas relues et allumées.
const starters = () => [
   {
      id: newId(),
      name: "Nouvelle demande de devis",
      trigger: "lead",
      active: false,
      stopOnReply: true,
      steps: [
         step(0, "hours", "Nous avons bien reçu votre demande", "Bonjour {prenom},\n\nNous avons bien reçu votre demande et nous la lisons avec attention. Nous revenons vers vous avec une proposition claire.\n\nPour aller plus vite, vous pouvez aussi nous écrire sur WhatsApp : {lien_whatsapp}", "We have received your request", "Hello {prenom},\n\nWe have received your request and are reading it carefully. We will come back to you with a clear proposal.\n\nTo go faster, you can also message us on WhatsApp: {lien_whatsapp}"),
         step(3, "days", "Votre projet de site : des questions ?", "Bonjour {prenom},\n\nAvez-vous pu lire notre réponse ? Si un point n'est pas clair (contenu, prix, délai), répondez simplement à cet email : nous vous expliquons.", "Your website project: any questions?", "Hello {prenom},\n\nHave you been able to read our reply? If anything is unclear (content, price, timeline), just reply to this email and we will explain."),
         step(6, "days", "Souhaitez-vous avancer sur votre projet ?", "Bonjour {prenom},\n\nNous gardons votre demande de côté. Si votre projet est toujours d'actualité, répondez à cet email et nous reprenons là où nous en étions. Sinon, dites-le-nous : nous ne vous relancerons plus.", "Would you like to move forward?", "Hello {prenom},\n\nWe are keeping your request on file. If your project is still relevant, reply to this email and we will pick up where we left off. If not, let us know and we will not follow up again."),
      ],
   },
   {
      id: newId(),
      name: "Relance après l'envoi d'un devis",
      trigger: "quote",
      active: false,
      stopOnReply: true,
      steps: [
         step(3, "days", "Votre devis {numero_devis}", "Bonjour {prenom},\n\nAvez-vous pu consulter le devis {numero_devis} ? Nous pouvons l'ajuster ou vous expliquer chaque ligne : répondez simplement à cet email.", "Your quote {numero_devis}", "Hello {prenom},\n\nHave you been able to look at quote {numero_devis}? We can adjust it or explain each line: just reply to this email."),
         step(7, "days", "Votre devis {numero_devis} : où en êtes-vous ?", "Bonjour {prenom},\n\nSouhaitez-vous donner suite au devis {numero_devis} ? Un mot de votre part suffit, quelle que soit votre décision.", "Your quote {numero_devis}: where do you stand?", "Hello {prenom},\n\nWould you like to go ahead with quote {numero_devis}? A short reply is enough, whatever your decision."),
      ],
   },
   {
      id: newId(),
      name: "Après un rendez-vous",
      trigger: "meeting",
      active: false,
      stopOnReply: true,
      steps: [step(1, "days", "Suite à notre rendez-vous", "Bonjour {prenom},\n\nMerci pour le temps accordé lors de notre rendez-vous. Si une question vous est venue depuis, répondez à cet email : nous préparons la suite avec vous.", "Following up on our meeting", "Hello {prenom},\n\nThank you for your time during our meeting. If any question has come up since, reply to this email and we will prepare the next step with you.")],
   },
   {
      id: newId(),
      name: "Bienvenue aux abonnés",
      trigger: "subscriber",
      active: false,
      stopOnReply: false,
      steps: [step(0, "hours", "Bienvenue chez GEK INNOVATECH", "Bonjour,\n\nVotre inscription est bien enregistrée. Vous recevrez nos conseils pour votre site web et votre présence en ligne.\n\nUne question sur un projet ? Répondez à cet email, ou découvrez nos offres : {lien_site}/plans", "Welcome to GEK INNOVATECH", "Hello,\n\nYour subscription is confirmed. You will receive our advice on websites and online presence.\n\nA question about a project? Reply to this email, or see our plans: {lien_site}/plans")],
   },
];

export const sequences = async () => {
   const saved = await read("sequences");
   if (saved) return saved;
   const first = starters();
   await write("sequences", first);
   return first;
};
export const enrollments = () => read("inscriptions", []);

const cleanStep = (item) => ({
   id: cleanLine(item.id, 40) || newId(),
   delay: { n: Math.max(0, Math.min(365, Math.round(Number(item.delay?.n) || 0))), unit: item.delay?.unit === "hours" ? "hours" : "days" },
   subject: { fr: cleanLine(item.subject?.fr, 200), en: cleanLine(item.subject?.en, 200) },
   body: { fr: cleanText(item.body?.fr, 6000), en: cleanText(item.body?.en, 6000) },
});

export const saveSequence = async (input) => {
   await sequences();
   const sequence = {
      id: cleanLine(input.id, 40) || newId(),
      name: cleanLine(input.name, 80) || "Séquence sans nom",
      trigger: TRIGGERS.includes(input.trigger) ? input.trigger : "manual",
      active: Boolean(input.active),
      stopOnReply: input.stopOnReply !== false,
      steps: (Array.isArray(input.steps) ? input.steps : []).slice(0, 10).map(cleanStep),
   };
   if (sequence.active) {
      if (!sequence.steps.length) throw new HttpError(400, "Ajoutez au moins un email avant d'allumer la séquence.");
      const empty = sequence.steps.findIndex((item) => !item.subject.fr || !item.body.fr);
      if (empty >= 0) throw new HttpError(400, `L'email ${empty + 1} n'a pas d'objet ou de texte en français.`);
   }
   await mutate("sequences", [], (list) => {
      const index = list.findIndex((item) => item.id === sequence.id);
      if (index >= 0) list[index] = sequence;
      else list.push(sequence);
   });
   return sequence;
};

export const removeSequence = async (id) => {
   await mutate("sequences", [], (list) => {
      const index = list.findIndex((item) => item.id === id);
      if (index >= 0) list.splice(index, 1);
   });
   await stopEnrollments((item) => item.sequenceId === id, "séquence supprimée");
};

const delayMs = ({ n, unit }) => n * (unit === "hours" ? HOUR : DAY);

// Inscrit une personne dans les séquences allumées de ce déclencheur (ou dans une séquence précise).
export const enroll = async (trigger, contact, data = {}, sequenceId = null) => {
   if (!contact?.email || contact.noFollowUp) return [];
   if (trigger === "subscriber" && !contact.marketing?.ok) return [];
   const targets = (await sequences()).filter((item) => (sequenceId ? item.id === sequenceId : item.active && item.trigger === trigger) && item.steps.length);
   if (!targets.length) return [];
   const added = [];
   await mutate("inscriptions", [], (list) => {
      added.length = 0;
      for (const sequence of targets) {
         if (list.some((item) => item.sequenceId === sequence.id && item.contactId === contact.id && item.status === "active")) continue;
         const entry = { id: newId(), sequenceId: sequence.id, contactId: contact.id, name: contact.name, email: contact.email, leadId: data.leadId || "", documentId: data.documentId || "", documentNumber: data.documentNumber || "", step: 0, nextAt: Date.now() + delayMs(sequence.steps[0].delay), status: "active", startedAt: new Date().toISOString(), history: [] };
         list.unshift(entry);
         added.push(entry);
      }
      list.splice(2000);
      return added.length ? undefined : SKIP;
   });
   return added;
};

export const stopEnrollments = (match, reason) =>
   mutate("inscriptions", [], (list) => {
      const stopped = list.filter((item) => item.status === "active" && match(item));
      for (const item of stopped) Object.assign(item, { status: "stopped", reason, endedAt: new Date().toISOString() });
      return stopped.length ? stopped.length : SKIP;
   });

export const stopUrl = (contact, req) => `${siteUrl(req)}/api/desinscription?t=${contact.token}`;

// Raison de ne pas envoyer l'étape : arrêt définitif (stop) ou attente (wait).
const obstacle = (entry, sequence, contact, lead, document) => {
   if (!sequence) return { stop: "séquence supprimée" };
   if (!contact) return { stop: "contact supprimé" };
   if (contact.noFollowUp) return { stop: "désinscription" };
   if (!contact.email) return { stop: "sans adresse email" };
   if (["subscriber", "manual"].includes(sequence.trigger) && !contact.marketing?.ok) return { stop: "sans accord pour recevoir des emails" };
   if (lead && ["won", "lost"].includes(lead.status)) return { stop: "demande close" };
   if (document && !["sent"].includes(document.status)) return { stop: "devis traité" };
   if (sequence.stopOnReply && lead?.events.some((event) => event.type === "reply" && event.at > entry.startedAt)) return { stop: "le client a répondu" };
   if (!sequence.active) return { wait: true };
   // Une relance « avez-vous lu notre réponse ? » attend que cette réponse existe.
   if (sequence.trigger === "lead" && entry.step > 0 && !lead?.events.some((event) => ["email", "whatsapp"].includes(event.type) && !event.auto)) return { wait: true };
   return null;
};

// Envoie les étapes arrivées à échéance. « only » limite aux inscriptions données (envoi immédiat après un formulaire).
export const runSequences = async ({ until, only = null, req = null }) => {
   if (!mailReady()) return 0;
   let sent = 0;
   const due = (await enrollments()).filter((item) => item.status === "active" && item.nextAt <= Date.now() && (!only || only.includes(item.id)));
   if (!due.length) return 0;
   const [allSequences, allContacts, allLeads, allDocuments] = await Promise.all([sequences(), contacts(), leads(), read("documents", [])]);
   const site = siteUrl(req);
   const { whatsappNumber } = (await fullContent()).contact;

   for (const entry of due) {
      if (Date.now() > until) break;
      const sequence = allSequences.find((item) => item.id === entry.sequenceId);
      const contact = allContacts.find((item) => item.id === entry.contactId);
      const lead = allLeads.find((item) => item.id === entry.leadId);
      const document = allDocuments.find((item) => item.id === entry.documentId);
      const block = obstacle(entry, sequence, contact, lead, document);
      // Réservation de l'étape : si un autre passage l'a déjà prise, on n'y touche pas.
      const claimed = await mutate("inscriptions", [], (list) => {
         const item = list.find((one) => one.id === entry.id);
         if (!item || item.status !== "active" || item.step !== entry.step || item.nextAt > Date.now()) return SKIP;
         if (block?.stop) Object.assign(item, { status: "stopped", reason: block.stop, endedAt: new Date().toISOString() });
         else if (block?.wait) item.nextAt = Date.now() + 12 * HOUR;
         else item.nextAt = Date.now() + HOUR;
         return !block;
      });
      if (!claimed) continue;

      const current = sequence.steps[entry.step];
      const lang = contact.lang === "en" && current.subject.en && current.body.en ? "en" : "fr";
      const values = variablesFor(contact, { lien_site: site, lien_rdv: `${site}/rendez-vous`, lien_whatsapp: `https://wa.me/${whatsappNumber}`, numero_devis: entry.documentNumber });
      const subject = personalize(current.subject[lang], values);
      const body = personalize(current.body[lang], values);
      let error = null;
      try {
         await sendMail({ to: contact.email, toName: contact.name, subject, body, lang, kind: "auto", stopUrl: stopUrl(contact, req) });
         sent += 1;
      } catch (failure) {
         error = failure.message;
      }
      await mutate("inscriptions", [], (list) => {
         const item = list.find((one) => one.id === entry.id);
         if (!item) return SKIP;
         if (error) {
            item.errors = (item.errors || 0) + 1;
            item.nextAt = Date.now() + 6 * HOUR;
            if (item.errors >= 5) Object.assign(item, { status: "stopped", reason: error, endedAt: new Date().toISOString() });
            return undefined;
         }
         item.history.push({ step: item.step, at: new Date().toISOString(), subject });
         item.step += 1;
         const next = sequence.steps[item.step];
         if (next) item.nextAt = Date.now() + Math.max(HOUR, delayMs(next.delay));
         else Object.assign(item, { status: "done", endedAt: new Date().toISOString() });
         return undefined;
      });
      if (!error && lead) {
         await mutate("demandes", [], (list) => {
            const item = list.find((one) => one.id === lead.id);
            if (!item) return SKIP;
            item.events.push({ id: newId(), at: new Date().toISOString(), type: "email", auto: true, sequence: sequence.name, subject, text: body });
            return undefined;
         });
      }
   }
   return sent;
};

export const campaigns = () => read("campagnes", []);
const queue = () => read("file-envois", []);

export const saveCampaign = (input) =>
   mutate("campagnes", [], (list) => {
      const found = list.find((item) => item.id === input.id);
      if (found && found.status !== "draft") throw new HttpError(409, "Cette campagne est déjà partie.");
      const campaign = found || { id: newId(), status: "draft", createdAt: new Date().toISOString(), sent: 0, failed: 0, total: 0 };
      campaign.name = cleanLine(input.name, 80) || "Campagne sans nom";
      campaign.subject = { fr: cleanLine(input.subject?.fr, 200), en: cleanLine(input.subject?.en, 200) };
      campaign.body = { fr: cleanText(input.body?.fr, 12_000), en: cleanText(input.body?.en, 12_000) };
      campaign.tag = cleanLine(input.tag, 30);
      campaign.updatedAt = new Date().toISOString();
      if (!found) list.unshift(campaign);
      return structuredClone(campaign);
   });

export const removeCampaign = (id) =>
   mutate("campagnes", [], (list) => {
      const index = list.findIndex((item) => item.id === id && item.status !== "sending");
      if (index >= 0) list.splice(index, 1);
   });

// Seules les personnes qui ont accepté de recevoir des emails, et ne se sont pas désinscrites.
export const audience = async (tag = "") => (await contacts()).filter((contact) => contact.email && contact.marketing?.ok && !contact.noFollowUp && (!tag || contact.tags.includes(tag)));

export const startCampaign = async (id) => {
   if (!mailReady()) throw new HttpError(503, "L'envoi d'emails n'est pas encore connecté (Réglages > Emails).");
   const campaign = (await campaigns()).find((item) => item.id === id);
   if (!campaign) throw new HttpError(404, "Campagne introuvable.");
   if (!campaign.subject.fr || !campaign.body.fr) throw new HttpError(400, "Écrivez l'objet et le texte en français avant d'envoyer.");
   const people = await audience(campaign.tag);
   if (!people.length) throw new HttpError(400, "Aucun contact n'a accepté de recevoir vos emails.");
   const started = await mutate("campagnes", [], (list) => {
      const item = list.find((one) => one.id === id);
      if (!item || item.status !== "draft") return SKIP;
      Object.assign(item, { status: "sending", total: people.length, sent: 0, failed: 0, startedAt: new Date().toISOString() });
      return structuredClone(item);
   });
   if (!started) throw new HttpError(409, "Cette campagne est déjà partie.");
   await mutate("file-envois", [], (list) => {
      for (const contact of people) list.push({ id: newId(), campaignId: id, contactId: contact.id, status: "queued" });
   });
   return started;
};

export const runQueue = async ({ until, req = null }) => {
   if (!mailReady()) return { sent: 0, left: 0 };
   let sent = 0;
   let stopped = false;
   const [allCampaigns, allContacts] = await Promise.all([campaigns(), contacts()]);
   while (Date.now() < until && !stopped) {
      // Réserve un petit lot ; un envoi resté « en cours » plus de 10 minutes est considéré comme perdu, jamais renvoyé.
      const batch = await mutate("file-envois", [], (list) => {
         const taken = list.filter((item) => item.status === "queued").slice(0, 5);
         if (!taken.length) return SKIP;
         for (const item of taken) Object.assign(item, { status: "sending", at: Date.now() });
         return structuredClone(taken);
      });
      if (!batch) break;
      const results = [];
      for (const item of batch) {
         const campaign = allCampaigns.find((one) => one.id === item.campaignId);
         const contact = allContacts.find((one) => one.id === item.contactId);
         if (!campaign || !contact?.email || contact.noFollowUp || !contact.marketing?.ok) {
            results.push({ ...item, outcome: "skipped" });
            continue;
         }
         const lang = contact.lang === "en" && campaign.subject.en && campaign.body.en ? "en" : "fr";
         const site = siteUrl(req);
         const values = variablesFor(contact, { lien_site: site, lien_rdv: `${site}/rendez-vous` });
         try {
            await sendMail({ to: contact.email, toName: contact.name, subject: personalize(campaign.subject[lang], values), body: personalize(campaign.body[lang], values), lang, kind: "campaign", stopUrl: stopUrl(contact, req) });
            sent += 1;
            results.push({ ...item, outcome: "sent" });
         } catch (error) {
            // Limite du jour : le reste du lot repart demain. Toute autre erreur est comptée comme un échec.
            if (error.status === 429) {
               stopped = true;
               results.push({ ...item, outcome: "later" });
            } else results.push({ ...item, outcome: "failed" });
         }
      }
      await mutate("file-envois", [], (list) => {
         for (const result of results) {
            const index = list.findIndex((item) => item.id === result.id);
            if (index < 0) continue;
            if (result.outcome === "later") Object.assign(list[index], { status: "queued" });
            else list.splice(index, 1);
         }
      });
      await mutate("campagnes", [], (list) => {
         for (const result of results) {
            const campaign = list.find((item) => item.id === result.campaignId);
            if (!campaign) continue;
            if (result.outcome === "sent") campaign.sent += 1;
            if (result.outcome === "failed" || result.outcome === "skipped") campaign.failed += 1;
         }
      });
   }
   // Campagnes terminées : plus rien en attente dans la file.
   const left = (await queue()).filter((item) => item.status === "queued" || Date.now() - item.at < 10 * 60_000);
   await mutate("campagnes", [], (list) => {
      const over = list.filter((item) => item.status === "sending" && !left.some((one) => one.campaignId === item.id));
      for (const item of over) Object.assign(item, { status: "sent", endedAt: new Date().toISOString() });
      return over.length ? undefined : SKIP;
   });
   return { sent, left: left.length, paused: stopped };
};

// Rappels : la veille (24 h avant) et peu avant (2 h avant).
export const runReminders = async ({ until, req = null }) => {
   const { booking } = await settings();
   if (!booking.reminders || !mailReady()) return 0;
   let sent = 0;
   for (const meeting of await meetings()) {
      if (Date.now() > until) break;
      if (meeting.status !== "confirmed" || !meeting.email) continue;
      const left = Date.parse(meeting.start) - Date.now();
      const kind = left > 0 && left <= 2 * HOUR ? "2h" : left > 2 * HOUR && left <= 24 * HOUR ? "24h" : null;
      if (!kind || meeting.reminded.includes(kind)) continue;
      // Rendez-vous pris à la dernière minute : la confirmation vient de partir, le rappel de la veille serait de trop.
      const tooSoon = Date.now() - Date.parse(meeting.createdAt) < 3 * HOUR && kind === "24h";
      const claimed = await mutate("rendez-vous", [], (list) => {
         const item = list.find((one) => one.id === meeting.id);
         if (!item || item.reminded.includes(kind)) return SKIP;
         item.reminded.push(kind);
         return !tooSoon;
      });
      if (!claimed) continue;
      try {
         await sendMail(meetingEmail(meeting, "reminder", req));
         sent += 1;
      } catch (error) {
         console.error("Rappel de rendez-vous :", error.message);
      }
   }
   return sent;
};
