// API du site (formulaires, rendez-vous) et du tableau de bord. Les routes /api/admin/… demandent une session.
import { authStatus, endSession, login, requireAdmin } from "../lib/auth.mjs";
import * as ai from "../lib/ai.mjs";
import { audience, campaigns, enroll, enrollments, removeCampaign, removeSequence, runQueue, runSequences, saveCampaign, saveSequence, sequences, startCampaign, stopEnrollments } from "../lib/automations.mjs";
import { fullContent, listHistory, resetSection, restoreVersion, saveSection, savedContent } from "../lib/content.mjs";
import { COUNTED, LEAD_STATUSES, addEvent, changeLead, contacts, count, counters, createLead, leads, removeContact, removeLead, unsubscribe, updateContact, upsertContact } from "../lib/crm.mjs";
import { documents, issueDocument, markDocument, removeDocument, saveDocument } from "../lib/documents.mjs";
import { HttpError, cleanEmail, cleanLine, cleanText, clientIp, escapeHtml, isLocal, json, limit, newId, readJson, sameOrigin, siteUrl } from "../lib/http.mjs";
import { inboxReady, syncInbox } from "../lib/inbox.mjs";
import { mailAddress, mailLog, mailReady, sendMail, sentToday } from "../lib/mail.mjs";
import { book, cancelByToken, createMeeting, ics, meetingEmail, meetings, publicSlots, removeMeeting, updateMeeting, when } from "../lib/meetings.mjs";
import { saveSettings, settings } from "../lib/settings.mjs";
import { SKIP, keys, mutate, putFile, read, remove, removeFile } from "../lib/store.mjs";

const MINUTE = 60_000;

// Suite d'une action (email, séquence) sans faire attendre le visiteur.
const later = (context, job) => {
   const run = job().catch((error) => console.error("Suite d'action :", error.message));
   if (context?.waitUntil) context.waitUntil(run);
   else return run;
   return undefined;
};

// Un robot remplit tous les champs, y compris celui que personne ne voit, et répond en moins de deux secondes.
const isRobot = (body) => Boolean(body.website) || (body.elapsed !== undefined && Number(body.elapsed) < 1500);

const notifyOwner = async (subject, body, replyTo) => {
   const { notify } = await settings();
   const to = notify.email || mailAddress();
   if (!to || !mailReady()) return;
   await sendMail({ to, subject, body, kind: "notice", replyTo, sign: false });
};

// ---------------------------------------------------------------- Site public

const submitLead = async (req, context) => {
   const body = await readJson(req, 30_000);
   if (isRobot(body)) return json({ ok: true });
   await limit("demande", clientIp(req, context), 5, 10 * MINUTE);
   const { name, email, phone, company, plan, lang, message, page: from } = body;
   const { lead, contact } = await createLead({ name, email, phone, company, plan, lang, message, page: from, marketing: body.marketing === true }, "site");
   await count("lead");
   const { notify } = await settings();
   const willNotify = notify.newLead && mailReady();
   const enrolled = [...(await enroll("lead", contact, { leadId: lead.id })), ...(body.marketing === true ? await enroll("subscriber", contact) : [])].map((item) => item.id);
   await later(context, async () => {
      if (willNotify) {
         await notifyOwner(
            `Nouvelle demande : ${lead.name}`,
            `**${lead.name}** a envoyé une demande (${lead.plan}).\n\n${lead.events[0].text}\n\nEmail : ${lead.email || "non donné"}\nTéléphone : ${lead.phone || "non donné"}\n\nRépondre depuis le tableau de bord : ${siteUrl(req)}/admin/demandes/${lead.id}`,
            lead.email,
         );
      }
      if (enrolled.length) await runSequences({ until: Date.now() + 20_000, only: enrolled, req });
   });
   // « notified » : le site n'a plus besoin de prévenir GEK par son propre envoi d'email.
   return json({ ok: true, notified: willNotify });
};

const subscribe = async (req, context) => {
   const body = await readJson(req, 4000);
   if (isRobot(body)) return json({ ok: true });
   await limit("abonnement", clientIp(req, context), 5, 10 * MINUTE);
   if (!cleanEmail(body.email)) throw new HttpError(400, "Adresse email invalide.");
   const contact = await upsertContact({ email: body.email, name: body.name, lang: body.lang, marketing: true }, "lettre");
   await count("subscribe");
   const enrolled = (await enroll("subscriber", contact)).map((item) => item.id);
   await later(context, async () => {
      if (enrolled.length) await runSequences({ until: Date.now() + 20_000, only: enrolled, req });
   });
   return json({ ok: true });
};

const submitBooking = async (req, context) => {
   const body = await readJson(req, 8000);
   if (isRobot(body)) return json({ ok: true });
   await limit("rendez-vous", clientIp(req, context), 4, 30 * MINUTE);
   const { name, email, phone, lang, start, mode, topic } = body;
   const meeting = await book({ name, email, phone, lang, start, mode, topic });
   await count("booking");
   const { notify } = await settings();
   await later(context, async () => {
      if (!mailReady()) return;
      await sendMail(meetingEmail(meeting, "confirm", req));
      if (notify.newMeeting) {
         await notifyOwner(
            `Rendez-vous : ${meeting.name}, ${when(meeting, "fr")}`,
            `**${meeting.name}** a pris rendez-vous.\n\n${when(meeting, "fr")}\nEmail : ${meeting.email}\nTéléphone : ${meeting.phone || "non donné"}\n\n${meeting.topic || "Aucun sujet précisé."}\n\nVoir : ${siteUrl(req)}/admin/rendez-vous`,
            meeting.email,
         );
      }
   });
   return json({ ok: true, start: meeting.start, emailed: mailReady() });
};

const page = (title, text, form = "") =>
   new Response(
      `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)} | GEK INNOVATECH</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f4f6fa;color:#1d467b;font:17px/1.6 Barlow,"Segoe UI",Arial,sans-serif}main{max-width:30rem;margin:24px;padding:36px;background:#fff;border:1px solid #dde4ee;border-radius:24px}h1{margin:0 0 12px;font-size:26px;line-height:1.2}p{margin:0 0 20px;color:#456189}a,button{font:inherit;font-weight:500}button,.b{display:inline-block;padding:12px 24px;border:0;border-radius:999px;background:#1d467b;color:#fff;text-decoration:none;cursor:pointer}</style></head>
<body><main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(text)}</p>${form || '<a class="b" href="/">GEK INNOVATECH</a>'}</main></body></html>`,
      { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "referrer-policy": "no-referrer" } },
   );

const token = (req) => cleanLine(new URL(req.url).searchParams.get("t"), 60);
// Un lien d'email peut être ouvert par un logiciel de sécurité : l'action attend un vrai clic.
const confirmForm = (label) => `<form method="post"><button>${escapeHtml(label)}</button></form>`;

const unsubscribePage = async (req) => {
   if (req.method === "GET") return page("Ne plus recevoir nos emails", "Confirmez pour ne plus recevoir d'emails d'information ni de relance. / Confirm to stop receiving our emails.", confirmForm("Confirmer / Confirm"));
   const contact = await unsubscribe(token(req));
   if (contact) await stopEnrollments((item) => item.contactId === contact.id, "désinscription");
   return page("C'est fait", "Vous ne recevrez plus d'emails d'information ni de relance. / You will no longer receive these emails.");
};

const cancelPage = async (req) => {
   if (req.method === "GET") return page("Annuler le rendez-vous", "Confirmez l'annulation. / Please confirm the cancellation.", confirmForm("Annuler / Cancel"));
   const meeting = await cancelByToken(token(req));
   if (!meeting) return page("Rendez-vous introuvable", "Ce rendez-vous est déjà annulé ou passé. / This meeting is already cancelled or past.");
   await notifyOwner(`Rendez-vous annulé : ${meeting.name}`, `${meeting.name} a annulé le rendez-vous du ${when(meeting, "fr")}.`, meeting.email).catch(() => {});
   return page("Rendez-vous annulé", "Merci de nous avoir prévenus. / Thank you for letting us know.");
};

const PUBLIC = {
   "POST /api/demande": submitLead,
   "POST /api/abonnement": subscribe,
   "GET /api/creneaux": async () => json(await publicSlots()),
   "POST /api/rendez-vous": submitBooking,
   "GET /api/rendez-vous/annuler": cancelPage,
   "POST /api/rendez-vous/annuler": cancelPage,
   "GET /api/desinscription": unsubscribePage,
   "POST /api/desinscription": unsubscribePage,
   "POST /api/evenement": async (req, context) => {
      const { type } = await readJson(req, 500);
      if (!COUNTED.includes(type) || ["lead", "subscribe", "booking"].includes(type)) throw new HttpError(400, "Événement inconnu.");
      await limit("evenement", clientIp(req, context), 30, 10 * MINUTE);
      await count(type);
      return json({ ok: true });
   },
   "POST /api/admin/connexion": async (req, context) => {
      if (!sameOrigin(req)) throw new HttpError(403, "Origine refusée.");
      return json({ ok: true }, 200, { "set-cookie": await login(req, context, await readJson(req, 2000)) });
   },
   "POST /api/admin/deconnexion": async () => json({ ok: true }, 200, { "set-cookie": endSession() }),
   "GET /api/admin/etat": async (req) => {
      const status = authStatus();
      const connected = await requireAdmin(req).then(() => true, () => false);
      // L'adresse du compte n'est donnée qu'une fois connecté.
      return json({ configured: status.ready, reason: status.ready ? undefined : status.reason, connected, email: connected ? status.email : undefined });
   },
};

// ------------------------------------------------------------- Tableau de bord

const chats = async () => {
   const found = (await keys("chats/")).reverse().slice(0, 80);
   return (await Promise.all(found.map(async (key) => ({ key, ...(await read(key)) })))).filter((chat) => chat.messages);
};

const services = async () => ({
   mail: { ready: mailReady(), address: mailAddress(), sentToday: await sentToday(), test: isLocal() },
   inbox: { ready: inboxReady(), ...(await read("releve", {})) },
   ai: { ready: ai.aiReady() },
   local: isLocal(),
});

const everything = async (req) => {
   const [content, leadList, contactList, meetingList, documentList, sequenceList, enrollmentList, campaignList, mails, config, stats, media, status] = await Promise.all([
      savedContent(), leads(), contacts(), meetings(), documents(), sequences(), enrollments(), campaigns(), mailLog(), settings(), counters(), read("medias", []), services(),
   ]);
   return json({ content, leads: leadList, contacts: contactList.map(({ token: _token, ...contact }) => contact), meetings: meetingList, documents: documentList, sequences: sequenceList, enrollments: enrollmentList.slice(0, 400), campaigns: campaignList, mails: mails.slice(0, 80), settings: config, counters: stats, media, services: status, email: authStatus().email, site: siteUrl(req) });
};

const findLead = async (id) => {
   const lead = (await leads()).find((item) => item.id === id);
   if (!lead) throw new HttpError(404, "Demande introuvable.");
   return lead;
};

const replyToLead = async (id, body) => {
   const lead = await findLead(id);
   const subject = cleanLine(body.subject, 200);
   const text = cleanText(body.text, 12_000);
   if (!subject || !text) throw new HttpError(400, "Écrivez l'objet et le message.");
   const previous = [...lead.events].reverse().find((event) => event.messageId);
   const messageId = await sendMail({ to: lead.email, toName: lead.name, subject, body: text, lang: lead.lang, kind: "reply", inReplyTo: previous?.messageId });
   return addEvent(id, "email", { subject, text, messageId }, (item) => {
      item.unread = false;
      if (item.status === "new") item.status = "talking";
      delete item.draft;
   });
};

// Message ouvert dans WhatsApp ou dans Gmail : le tableau de bord en garde la trace, l'envoi se fait là-bas.
const logWhatsapp = (id, body) =>
   addEvent(id, body.channel === "email" ? "email" : "whatsapp", { text: cleanText(body.text, 6000), subject: cleanLine(body.subject, 200) }, (item) => {
      item.unread = false;
      if (item.status === "new") item.status = "talking";
      delete item.draft;
   });

// Réponse du client reçue ailleurs (WhatsApp, téléphone) : elle arrête aussi les relances prévues.
const logReply = async (id, body) => {
   const lead = await addEvent(id, "reply", { channel: cleanLine(body.channel, 20) || "whatsapp", text: cleanText(body.text, 6000) });
   const stopping = (await sequences()).filter((sequence) => sequence.stopOnReply).map((sequence) => sequence.id);
   await stopEnrollments((item) => (item.leadId === id || (lead.email && item.email === lead.email)) && stopping.includes(item.sequenceId), "le client a répondu");
   return lead;
};

const patchLead = (id, body) =>
   changeLead(id, (lead) => {
      if (body.status && LEAD_STATUSES.includes(body.status) && body.status !== lead.status) {
         lead.events.push({ id: newId(), at: new Date().toISOString(), type: "status", from: lead.status, to: body.status });
         lead.status = body.status;
      }
      if (body.unread !== undefined) lead.unread = Boolean(body.unread);
      if (body.archived !== undefined) lead.archived = Boolean(body.archived);
      for (const [field, clean] of Object.entries({ name: cleanLine, company: cleanLine, phone: cleanLine, plan: cleanLine })) {
         if (body[field] !== undefined) lead[field] = clean(body[field], 100);
      }
      if (body.email !== undefined) lead.email = cleanEmail(body.email);
      if (body.lang !== undefined) lead.lang = body.lang === "en" ? "en" : "fr";
   });

const sendDocument = async (id, body) => {
   const document = (await documents()).find((item) => item.id === id);
   if (!document) throw new HttpError(404, "Document introuvable.");
   const pdf = Buffer.from(String(body.pdf || ""), "base64");
   if (pdf.subarray(0, 5).toString() !== "%PDF-") throw new HttpError(400, "Le PDF n'a pas pu être lu.");
   const to = cleanEmail(body.to) || document.client.email;
   const subject = cleanLine(body.subject, 200);
   const text = cleanText(body.text, 8000);
   const messageId = await sendMail({ to, toName: document.client.name, subject, body: text, lang: document.lang, kind: "reply", attachments: [{ filename: `${document.number}.pdf`, content: pdf, contentType: "application/pdf" }] });
   const sent = await markDocument(id, { status: document.status === "draft" ? "sent" : document.status, sentAt: new Date().toISOString() });
   if (document.leadId) {
      await addEvent(document.leadId, "document", { documentId: id, number: document.number, kind: document.type, subject, text, messageId }, (lead) => {
         if (document.type === "quote" && ["new", "talking"].includes(lead.status)) lead.status = "quoted";
      }).catch(() => {});
   }
   if (document.type === "quote") {
      const contact = await upsertContact({ ...document.client, email: to, lang: document.lang }, "devis");
      await enroll("quote", contact, { leadId: document.leadId, documentId: id, documentNumber: document.number });
   }
   return sent;
};

const AI = {
   reply: async (body) => ai.draftReply(await findLead(body.leadId), body),
   analyze: async (body) => {
      const analysis = await ai.analyzeLead(await findLead(body.leadId));
      return changeLead(body.leadId, (lead) => {
         lead.analysis = { ...analysis, at: new Date().toISOString() };
      });
   },
   extract: (body) => ai.extractLead(cleanText(body.text, 8000)),
   service: (body) => ai.proposeService(cleanText(body.idea, 800)),
   translate: (body) => ai.translate(body.texts || {}, body.to === "fr" ? "fr" : "en"),
   rewrite: async (body) => ({ text: await ai.rewrite(cleanText(body.text, 4000), cleanText(body.instruction, 500), body.lang === "en" ? "en" : "fr") }),
   sequence: (body) => ai.proposeSequence({ goal: cleanText(body.goal, 600), steps: Number(body.steps) || 3, trigger: cleanLine(body.trigger, 60) }),
   campaign: (body) => ai.proposeCampaign(cleanText(body.brief, 1200)),
   proofread: async (body) => ({ issues: await ai.proofread(body.texts || {}) }),
   quote: async (body) => ai.proposeQuote(await findLead(body.leadId), body.currency === "EUR" ? "EUR" : "XOF"),
   briefing: async (body) => ({ text: await ai.briefing(body.facts || {}) }),
};

// Vérifie que les liens publics du site répondent.
const checkLinks = async () => {
   const content = await fullContent();
   const urls = new Set();
   for (const project of content.projects) if (!project.hidden && /^https:\/\//.test(project.link)) urls.add(project.link);
   for (const plan of content.plans) if (/^https:\/\//.test(plan.example || "")) urls.add(plan.example);
   for (const url of Object.values(content.social)) if (url) urls.add(url);
   return Promise.all(
      [...urls].slice(0, 25).map(async (url) => {
         try {
            const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(12_000), headers: { "user-agent": "Mozilla/5.0 (verification des liens)" } });
            await response.body?.cancel();
            // 401, 403 et 429 : le site répond, il refuse seulement les visites automatiques.
            return { url, ok: response.ok || [401, 403, 429, 999].includes(response.status), status: response.status };
         } catch (error) {
            return { url, ok: false, status: 0, error: error.name === "TimeoutError" ? "ne répond pas" : "inaccessible" };
         }
      }),
   );
};

const IMAGE_TYPES = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };
// Les premiers octets disent le vrai format : un fichier déguisé en image est refusé.
const looksLike = (buffer, type) =>
   type === "image/webp" ? buffer.subarray(8, 12).toString() === "WEBP" : type === "image/png" ? buffer.subarray(1, 4).toString() === "PNG" : buffer[0] === 0xff && buffer[1] === 0xd8;

const uploadMedia = async (req) => {
   const type = req.headers.get("content-type") || "";
   if (!IMAGE_TYPES[type]) throw new HttpError(415, "Image WebP, JPEG ou PNG uniquement.");
   const buffer = Buffer.from(await req.arrayBuffer());
   if (!buffer.length || buffer.length > 4_000_000) throw new HttpError(413, "Image trop lourde (4 Mo au maximum).");
   if (!looksLike(buffer, type)) throw new HttpError(415, "Ce fichier n'est pas une image valide.");
   const params = new URL(req.url).searchParams;
   const key = `${newId()}.${IMAGE_TYPES[type]}`;
   const entry = { key, url: `/media/${key}`, name: cleanLine(params.get("name"), 80), width: Math.round(Number(params.get("w")) || 0), height: Math.round(Number(params.get("h")) || 0), size: buffer.length, at: new Date().toISOString() };
   await putFile(key, buffer, { type });
   await mutate("medias", [], (list) => {
      list.unshift(entry);
   });
   return entry;
};

const importContacts = async (rows) => {
   let added = 0;
   for (const row of (Array.isArray(rows) ? rows : []).slice(0, 500)) {
      // Un import ne vaut pas accord : la personne devra cocher elle-même la case pour recevoir des emails.
      if (await upsertContact({ ...row, marketing: undefined }, "import")) added += 1;
   }
   return { added };
};

// [méthode, chemin (« :id » = un identifiant), action]
const ADMIN = [
   ["GET", "tout", (req) => everything(req)],
   ["GET", "services", () => services()],

   ["PUT", "contenu/:id", async (req, id) => saveSection(id, (await readJson(req, 400_000)).value)],
   ["DELETE", "contenu/:id", async (req, id) => ({ live: await resetSection(id) })],
   ["GET", "historique", () => listHistory()],
   ["POST", "historique", async (req) => ({ live: await restoreVersion((await readJson(req)).key) })],

   ["POST", "demandes", async (req) => (await createLead(await readJson(req, 30_000), "admin")).lead],
   ["PATCH", "demandes/:id", async (req, id) => patchLead(id, await readJson(req))],
   ["DELETE", "demandes/:id", async (req, id) => (await removeLead(id), { ok: true })],
   ["POST", "demandes/:id/email", async (req, id) => replyToLead(id, await readJson(req))],
   ["POST", "demandes/:id/whatsapp", async (req, id) => logWhatsapp(id, await readJson(req))],
   ["POST", "demandes/:id/reponse", async (req, id) => logReply(id, await readJson(req))],
   ["POST", "demandes/:id/note", async (req, id) => addEvent(id, "note", { text: cleanText((await readJson(req)).text, 4000) })],
   ["POST", "demandes/:id/brouillon", async (req, id) => {
      const body = await readJson(req);
      return changeLead(id, (lead) => {
         lead.draft = body.text ? { subject: cleanLine(body.subject, 200), text: cleanText(body.text, 12_000), channel: body.channel === "whatsapp" ? "whatsapp" : "email" } : undefined;
      });
   }],

   ["POST", "contacts", async (req) => upsertContact(await readJson(req), "admin")],
   ["PATCH", "contacts/:id", async (req, id) => {
      const body = await readJson(req);
      const contact = await updateContact(id, body);
      if (body.marketing === false) await stopEnrollments((item) => item.contactId === id, "désinscription");
      return contact;
   }],
   ["DELETE", "contacts/:id", async (req, id) => {
      await stopEnrollments((item) => item.contactId === id, "contact supprimé");
      await removeContact(id);
      return { ok: true };
   }],
   ["POST", "contacts-import", async (req) => importContacts((await readJson(req, 300_000)).rows)],

   ["POST", "rendez-vous", async (req) => {
      const body = await readJson(req);
      const meeting = await createMeeting(body);
      if (meeting.leadId) await addEvent(meeting.leadId, "meeting", { meetingId: meeting.id, start: meeting.start, mode: meeting.mode }).catch(() => {});
      let emailed = false;
      if (body.invite && meeting.email && mailReady()) {
         await sendMail(meetingEmail(meeting, "confirm", req));
         emailed = true;
      }
      return { meeting, emailed };
   }],
   ["PATCH", "rendez-vous/:id", async (req, id) => {
      const body = await readJson(req);
      const before = (await meetings()).find((item) => item.id === id);
      const meeting = await updateMeeting(id, body);
      if (body.notifyClient && meeting.email && mailReady()) {
         if (body.status === "cancelled" && before?.status !== "cancelled") await sendMail(meetingEmail(meeting, "cancelled", req));
         else if (before && (before.start !== meeting.start || before.mode !== meeting.mode || before.link !== meeting.link || before.place !== meeting.place)) await sendMail(meetingEmail(meeting, "moved", req));
      }
      if (body.status === "done" && before?.status !== "done") {
         const contact = (await contacts()).find((item) => item.id === meeting.contactId);
         if (contact) await enroll("meeting", contact, { leadId: meeting.leadId });
      }
      return { meeting };
   }],
   ["DELETE", "rendez-vous/:id", async (req, id) => (await removeMeeting(id), { ok: true })],
   ["GET", "rendez-vous/:id/ics", async (req, id) => {
      const meeting = (await meetings()).find((item) => item.id === id);
      if (!meeting) throw new HttpError(404, "Rendez-vous introuvable.");
      return new Response(ics(meeting), { headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": 'attachment; filename="rendez-vous.ics"', "cache-control": "no-store" } });
   }],

   ["POST", "documents", async (req) => saveDocument(await readJson(req))],
   ["PATCH", "documents/:id", async (req, id) => {
      const body = await readJson(req);
      const document = await markDocument(id, body);
      if (document.leadId && body.status === "accepted") await changeLead(document.leadId, (lead) => {
         if (lead.status !== "won") lead.events.push({ id: newId(), at: new Date().toISOString(), type: "status", from: lead.status, to: "won" });
         lead.status = "won";
      }).catch(() => {});
      return document;
   }],
   ["DELETE", "documents/:id", async (req, id) => (await removeDocument(id), { ok: true })],
   ["POST", "documents/:id/emettre", (req, id) => issueDocument(id)],
   ["POST", "documents/:id/envoyer", async (req, id) => sendDocument(id, await readJson(req, 5_500_000))],

   ["POST", "sequences", async (req) => saveSequence(await readJson(req))],
   ["DELETE", "sequences/:id", async (req, id) => (await removeSequence(id), { ok: true })],
   ["POST", "sequences/:id/inscrire", async (req, id) => {
      const body = await readJson(req);
      const contact = (await contacts()).find((item) => item.id === body.contactId);
      if (!contact) throw new HttpError(404, "Contact introuvable.");
      const added = await enroll("manual", contact, { leadId: cleanLine(body.leadId, 40) }, id);
      if (!added.length) throw new HttpError(409, contact.noFollowUp ? "Cette personne a demandé à ne plus recevoir d'emails." : "Cette personne suit déjà cette séquence, ou n'a pas d'adresse email.");
      return added[0];
   }],
   ["POST", "inscriptions/:id/arreter", async (req, id) => {
      await stopEnrollments((item) => item.id === id, "arrêtée à la main");
      return enrollments();
   }],

   ["POST", "campagnes", async (req) => saveCampaign(await readJson(req))],
   ["DELETE", "campagnes/:id", async (req, id) => (await removeCampaign(id), { ok: true })],
   ["GET", "campagnes/destinataires", async (req) => ({ count: (await audience(new URL(req.url).searchParams.get("tag") || "")).length })],
   ["POST", "campagnes/:id/test", async (req, id) => {
      const campaign = (await campaigns()).find((item) => item.id === id);
      if (!campaign) throw new HttpError(404, "Campagne introuvable.");
      const to = authStatus().email;
      await sendMail({ to, subject: `[Test] ${campaign.subject.fr}`, body: campaign.body.fr, lang: "fr", kind: "notice", stopUrl: `${siteUrl(req)}/api/desinscription` });
      return { to };
   }],
   ["POST", "campagnes/:id/envoyer", async (req, id) => {
      const campaign = await startCampaign(id);
      await runQueue({ until: Date.now() + 15_000, req });
      return (await campaigns()).find((item) => item.id === campaign.id);
   }],
   ["POST", "envois", async (req) => ({ ...(await runQueue({ until: Date.now() + 20_000, req })), campaigns: await campaigns() })],

   ["POST", "ia", async (req) => {
      const body = await readJson(req, 300_000);
      if (!AI[body.task]) throw new HttpError(404, "Tâche inconnue.");
      return AI[body.task](body);
   }],

   ["PUT", "reglages/:id", async (req, id) => {
      const saved = await saveSettings(id, (await readJson(req)).value || {});
      if (!saved) throw new HttpError(404, "Réglage inconnu.");
      return saved;
   }],
   ["POST", "email-test", async () => {
      const to = authStatus().email;
      await sendMail({ to, subject: "Test du tableau de bord GEK INNOVATECH", body: "Bonjour,\n\nSi vous lisez ce message, l'envoi d'emails depuis le tableau de bord fonctionne.", kind: "notice" });
      return { to };
   }],
   ["POST", "releve", async () => ({ ...(await syncInbox()), leads: await leads() })],
   ["GET", "conversations", () => chats()],
   ["DELETE", "conversations/:id", async (req, id) => {
      await remove(`chats/${id}`);
      return { ok: true };
   }],
   ["GET", "liens", () => checkLinks()],

   ["POST", "medias", (req) => uploadMedia(req)],
   ["DELETE", "medias/:id", async (req, id) => {
      const used = JSON.stringify((await fullContent()).projects).includes(`/media/${id}`);
      if (used) throw new HttpError(409, "Cette image est utilisée par une réalisation.");
      await removeFile(id);
      await mutate("medias", [], (list) => {
         const index = list.findIndex((item) => item.key === id);
         if (index < 0) return SKIP;
         list.splice(index, 1);
         return undefined;
      });
      return { ok: true };
   }],

   ["GET", "export", async () => {
      const names = ["contenu", "demandes", "contacts", "rendez-vous", "documents", "sequences", "inscriptions", "campagnes", "reglages", "medias"];
      const data = Object.fromEntries(await Promise.all(names.map(async (name) => [name, await read(name)])));
      return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), ...data }, null, 2), {
         headers: { "content-type": "application/json; charset=utf-8", "content-disposition": `attachment; filename="gek-sauvegarde-${new Date().toISOString().slice(0, 10)}.json"`, "cache-control": "no-store" },
      });
   }],
];

const match = (method, path) => {
   const parts = path.split("/");
   // Un chemin écrit en entier passe avant un chemin avec identifiant (« campagnes/destinataires »).
   const candidates = ADMIN.filter(([m]) => m === method).map(([, pattern, action]) => ({ pattern: pattern.split("/"), action }));
   const fits = candidates.filter(({ pattern }) => pattern.length === parts.length && pattern.every((piece, i) => piece === ":id" || piece === parts[i]));
   const found = fits.sort((a, b) => a.pattern.filter((piece) => piece === ":id").length - b.pattern.filter((piece) => piece === ":id").length)[0];
   if (!found) return null;
   const index = found.pattern.indexOf(":id");
   return { action: found.action, id: index >= 0 ? decodeURIComponent(parts[index]) : undefined };
};

export default async (req, context) => {
   const { pathname } = new URL(req.url);
   const path = pathname.replace(/\/+$/, "");
   try {
      const open = PUBLIC[`${req.method} ${path}`];
      if (open) return await open(req, context);
      if (!path.startsWith("/api/admin/")) throw new HttpError(404, "Adresse inconnue.");
      await requireAdmin(req);
      const route = match(req.method, path.slice("/api/admin/".length));
      if (!route) throw new HttpError(404, "Adresse inconnue.");
      const result = await route.action(req, route.id, context);
      return result instanceof Response ? result : json(result ?? { ok: true });
   } catch (error) {
      if (error instanceof HttpError) return json({ error: error.message }, error.status);
      console.error(`${req.method} ${path} :`, error);
      return json({ error: "Une erreur est survenue. Réessayez dans un instant." }, 500);
   }
};

export const config = { path: "/api/*" };
