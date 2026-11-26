import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Copy, Download, Eye, Plus, Send, Trash2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { api } from "../lib/api";
import { addDays, date, dayKey, docState, DOC_STATUS, money, toCurrency, whatsappUrl, XOF_PER_EUR } from "../lib/format";
import { LeaveGuard, useAdmin } from "../lib/store";
import { AiButton, Badge, Button, Confirm, Dialog, IconButton, Input, MiniSelect, MoveButtons, moveItem, Note, PageHead, Panel, Select, Textarea } from "../ui";
import Missing from "./Missing";

const round = (amount, currency) => (currency === "XOF" ? Math.round(amount) : Math.round(amount * 100) / 100);
const number = (value) => {
   const n = Number(String(value).replace(/\s/g, "").replace(",", "."));
   return Number.isFinite(n) ? n : 0;
};
// Même calcul que le serveur, qui garde le dernier mot.
const compute = ({ items, discount, taxRate, currency }) => {
   const gross = items.reduce((sum, item) => sum + round(number(item.qty) * number(item.price), currency), 0);
   const off = Math.min(gross, round(number(discount), currency));
   const net = round(gross - off, currency);
   const tax = round((net * number(taxRate)) / 100, currency);
   return { gross: round(gross, currency), discount: off, net, tax, total: round(net + tax, currency) };
};
const line = (values = {}) => ({ key: Math.random().toString(36).slice(2), label: "", detail: "", qty: 1, price: "", ...values });
const numeric = (doc) => ({ ...doc, discount: number(doc.discount), taxRate: number(doc.taxRate), paid: number(doc.paid), items: doc.items.filter((item) => item.label.trim()).map(({ label, detail, qty, price }) => ({ label, detail, qty: number(qty), price: number(price) })) });

const defaultsFor = ({ type, settings, lead, quote }) => {
   const today = dayKey();
   if (quote) {
      const { client, currency, lang, subject, items, discount, taxRate, notes, terms, leadId, contactId } = quote;
      return { type: "invoice", currency, lang, date: today, due: addDays(today, 15), client: { ...client }, subject, items: items.map((item) => line(item)), discount, taxRate, notes, terms, leadId, contactId, fromId: quote.id, paid: 0, status: "draft" };
   }
   return {
      type,
      currency: settings.company.currency,
      lang: lead?.lang || "fr",
      date: today,
      due: addDays(today, type === "quote" ? settings.company.quoteValidity : 15),
      client: { name: lead?.name || "", company: lead?.company || "", email: lead?.email || "", phone: lead?.phone || "", address: "", ifu: "" },
      subject: "",
      items: [line()],
      discount: 0,
      taxRate: settings.company.taxRate,
      notes: "",
      terms: settings.company.paymentTerms,
      leadId: lead?.id || "",
      contactId: lead?.contactId || "",
      paid: 0,
      status: "draft",
   };
};

const SendDialog = ({ open, onClose, doc, onSend }) => {
   const [values, setValues] = useState({ to: "", subject: "", text: "" });
   const [busy, setBusy] = useState(false);
   useEffect(() => {
      if (!open) return;
      const en = doc.lang === "en";
      const first = doc.client.name.split(/\s+/)[0] || "";
      const name = doc.type === "quote" ? (en ? "quote" : "devis") : en ? "invoice" : "facture";
      const total = money(doc.totals.total, doc.currency);
      setValues({
         to: doc.client.email,
         subject: en ? `Your ${name} ${doc.number}` : `Votre ${name} ${doc.number}`,
         text: en
            ? `Hello ${first},\n\nPlease find attached your ${name} ${doc.number}, for a total of ${total}.\n\nIf you have any question, just reply to this email.`
            : `Bonjour ${first},\n\nVeuillez trouver ci-joint votre ${name} ${doc.number}, d'un montant total de ${total}.\n\nPour toute question, répondez simplement à cet email.`,
      });
   }, [open, doc]);
   return (
      <Dialog
         open={open}
         onClose={onClose}
         title={`Envoyer ${doc.type === "quote" ? "le devis" : "la facture"} par email`}
         footer={
            <>
               <Button onClick={onClose}>Annuler</Button>
               <Button
                  variant="primary"
                  icon={Send}
                  busy={busy}
                  disabled={!values.to.trim() || !values.subject.trim()}
                  onClick={async () => {
                     setBusy(true);
                     if (await onSend(values)) onClose();
                     setBusy(false);
                  }}
               >
                  Envoyer avec le PDF
               </Button>
            </>
         }
      >
         <div className="space-y-4">
            <Input label="Destinataire" type="email" value={values.to} onChange={(e) => setValues({ ...values, to: e.target.value })} />
            <Input label="Objet" value={values.subject} onChange={(e) => setValues({ ...values, subject: e.target.value })} />
            <Textarea label="Message" rows={6} value={values.text} onChange={(e) => setValues({ ...values, text: e.target.value })} />
         </div>
      </Dialog>
   );
};

const Editor = ({ source, isNew }) => {
   const { settings, content, services, leads, documents, run, put, drop, refresh, toast } = useAdmin();
   const navigate = useNavigate();
   const [doc, setDoc] = useState(source);
   const [busy, setBusy] = useState(false);
   const [sending, setSending] = useState(false);
   const [confirm, setConfirm] = useState(false);
   const [preview, setPreview] = useState("");
   const [pdfError, setPdfError] = useState(false);
   const base = useRef(JSON.stringify(source));
   const dirty = JSON.stringify(doc) !== base.current;
   const locked = doc.type === "invoice" && doc.status !== "draft" && !isNew;
   const lead = leads.find((item) => item.id === doc.leadId);
   const { company } = settings;
   const contact = content.contact;

   const set = (field, value) => setDoc((prev) => ({ ...prev, [field]: value }));
   const setClient = (field) => (e) => setDoc((prev) => ({ ...prev, client: { ...prev.client, [field]: e.target.value } }));
   const setItem = (index, field, value) => setDoc((prev) => ({ ...prev, items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)) }));
   const totals = useMemo(() => compute(doc), [doc]);

   // Aperçu : refait peu après la dernière frappe.
   useEffect(() => {
      let url = "";
      let cancelled = false;
      const timer = window.setTimeout(async () => {
         try {
            const { buildPdf } = await import("../lib/pdf");
            const ready = numeric(doc);
            const bytes = await buildPdf({ ...ready, totals: compute(ready) }, company, contact);
            if (cancelled) return;
            url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
            setPreview(url);
            setPdfError(false);
         } catch (error) {
            console.error(error);
            if (!cancelled) setPdfError(true);
         }
      }, 500);
      return () => {
         cancelled = true;
         window.clearTimeout(timer);
         if (url) window.setTimeout(() => URL.revokeObjectURL(url), 5000);
      };
   }, [doc, company, contact]);

   const adopt = (saved) => {
      const next = { ...saved, items: saved.items.map((item) => line(item)) };
      base.current = JSON.stringify(next);
      setDoc(next);
      put("documents", saved);
   };

   const save = async (success = "Document enregistré.") => {
      setBusy(true);
      const saved = await run(() => api.post("documents", numeric(doc)), success);
      setBusy(false);
      if (!saved) return null;
      adopt(saved);
      if (isNew) window.setTimeout(() => navigate(`/admin/documents/${saved.id}`, { replace: true }), 0);
      return saved;
   };

   // Un document envoyé ou téléchargé porte toujours son numéro et son dernier état enregistré.
   const issued = async () => {
      const saved = dirty || isNew ? await save("") : doc;
      if (!saved) return null;
      const ready = saved.number ? saved : await run(() => api.post(`documents/${saved.id}/emettre`));
      if (ready && ready !== saved) adopt(ready);
      return ready;
   };
   const bytesOf = async (ready) => {
      const { buildPdf } = await import("../lib/pdf");
      return buildPdf(ready, company, contact);
   };

   const download = async () => {
      const ready = await issued();
      if (!ready) return;
      const { saveFile } = await import("../lib/pdf");
      saveFile(await bytesOf(ready), `${ready.number}.pdf`);
   };
   const openSend = async () => {
      if (await issued()) setSending(true);
   };
   const send = async (values) => {
      const { toBase64 } = await import("../lib/pdf");
      const sent = await run(async () => api.post(`documents/${doc.id}/envoyer`, { ...values, pdf: toBase64(await bytesOf(numeric(doc))) }), "Envoyé par email.");
      if (!sent) return false;
      adopt(sent);
      refresh(true);
      return true;
   };
   const whatsapp = async () => {
      const ready = await issued();
      if (!ready) return;
      const { saveFile } = await import("../lib/pdf");
      saveFile(await bytesOf(ready), `${ready.number}.pdf`);
      const name = ready.type === "quote" ? "votre devis" : "votre facture";
      window.open(whatsappUrl(ready.client.phone, `Bonjour, voici ${name} ${ready.number}, d'un montant de ${money(ready.totals.total, ready.currency)}.`), "_blank", "noopener");
      toast("PDF téléchargé : joignez-le dans la conversation WhatsApp.");
   };
   const mark = async (status) => {
      const saved = await run(() => api.patch(`documents/${doc.id}`, { status }), "Statut mis à jour.");
      if (!saved) return;
      adopt(saved);
      refresh(true);
   };

   const propose = () =>
      run(async () => {
         const result = await api.ai("quote", { leadId: doc.leadId, currency: doc.currency });
         setDoc((prev) => ({
            ...prev,
            items: result.items.map((item) => line({ label: item.label, detail: item.detail, qty: item.qty || 1, price: round(toCurrency(item.priceEur || 0, prev.currency), prev.currency) || "" })),
            notes: prev.notes || result.notes || "",
         }));
      }, "Lignes proposées : vérifiez chaque prix.");

   const changeCurrency = (currency) =>
      setDoc((prev) => {
         if (prev.currency === currency) return prev;
         const convert = (value) => (value === "" ? "" : round(currency === "XOF" ? number(value) * XOF_PER_EUR : number(value) / XOF_PER_EUR, currency));
         return { ...prev, currency, discount: convert(prev.discount), paid: convert(prev.paid), items: prev.items.map((item) => ({ ...item, price: convert(item.price) })) };
      });

   const addOffer = (key) => {
      const plan = content.plans.find((item) => item.key === key);
      if (!plan) return;
      const lang = doc.lang;
      setDoc((prev) => {
         const added = line({ label: plan.title[lang] || plan.title.fr, detail: (plan.features[lang]?.length ? plan.features[lang] : plan.features.fr).map((feature) => `• ${feature}`).join("\n"), qty: 1, price: round(toCurrency(plan.amount, prev.currency), prev.currency) });
         const kept = prev.items.filter((item) => item.label.trim() || number(item.price));
         return { ...prev, items: [...kept, added] };
      });
   };

   const state = DOC_STATUS[docState(doc)];
   const missing = [!company.ifu && "IFU", !company.rccm && "RCCM", !company.address && "adresse"].filter(Boolean);
   const word = doc.type === "quote" ? "devis" : "facture";
   const ready = doc.items.some((item) => item.label.trim()) && (doc.client.name.trim() || doc.client.company.trim());
   const linked = documents.find((item) => item.fromId === doc.id);

   return (
      <>
         <LeaveGuard when={dirty && !busy} />
         <PageHead title={isNew ? (doc.type === "quote" ? "Nouveau devis" : "Nouvelle facture") : doc.number || `Brouillon de ${word}`} back={{ to: "/admin/documents", label: "Devis et factures" }}>
            {!isNew && <Badge tone={state.tone}>{state.label}</Badge>}
         </PageHead>

         <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="min-w-0 space-y-6">
               {locked && <Note>Cette facture est émise : son contenu ne change plus. Pour la corriger, créez une nouvelle facture.</Note>}
               <fieldset disabled={locked} className="min-w-0 space-y-6">
                  <Panel title="Client">
                     <div className="grid gap-4 sm:grid-cols-2">
                        <Input label="Nom" value={doc.client.name} onChange={setClient("name")} />
                        <Input label="Entreprise" value={doc.client.company} onChange={setClient("company")} />
                        <Input label="Email" type="email" inputMode="email" value={doc.client.email} onChange={setClient("email")} />
                        <Input label="Téléphone / WhatsApp" type="tel" inputMode="tel" value={doc.client.phone} onChange={setClient("phone")} />
                        <Textarea label="Adresse" rows={2} value={doc.client.address} onChange={setClient("address")} />
                        <Input label="IFU du client" value={doc.client.ifu} onChange={setClient("ifu")} hint="Facultatif" />
                     </div>
                  </Panel>

                  <Panel title="Document">
                     <div className="grid gap-4 sm:grid-cols-2">
                        <Input label="Date" type="date" value={doc.date} onChange={(e) => set("date", e.target.value)} />
                        <Input label={doc.type === "quote" ? "Valable jusqu'au" : "À payer avant le"} type="date" value={doc.due} onChange={(e) => set("due", e.target.value)} />
                        <Select label="Devise" value={doc.currency} onChange={(e) => changeCurrency(e.target.value)} options={[["XOF", "FCFA"], ["EUR", "Euro"]]} hint="Conversion à la parité fixe" />
                        <Select label="Langue" value={doc.lang} onChange={(e) => set("lang", e.target.value)} options={[["fr", "Français"], ["en", "Anglais"]]} />
                        <Input label="Objet" className="sm:col-span-2" value={doc.subject} onChange={(e) => set("subject", e.target.value)} placeholder="Par exemple : création du site de l'entreprise" />
                     </div>
                  </Panel>

                  <Panel
                     title="Lignes"
                     actions={
                        <>
                           {lead && (
                              <AiButton onRun={propose} disabled={!services.ai.ready}>
                                 Proposer d&apos;après la demande
                              </AiButton>
                           )}
                           <MiniSelect label="Ajouter une offre" value="" onChange={(e) => addOffer(e.target.value)} options={[["", "Ajouter une offre"], ...content.plans.map((plan) => [plan.key, `${plan.title.fr}, ${money(toCurrency(plan.amount, doc.currency), doc.currency)}`])]} />
                        </>
                     }
                  >
                     <ul className="space-y-5">
                        {doc.items.map((item, index) => (
                           <li key={item.key} className="border-t border-line pt-5 first:border-t-0 first:pt-0">
                              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_84px_140px]">
                                 <Input label="Désignation" value={item.label} onChange={(e) => setItem(index, "label", e.target.value)} />
                                 <Input label="Quantité" inputMode="decimal" value={item.qty} onChange={(e) => setItem(index, "qty", e.target.value)} inputClass="tabular text-right" />
                                 <Input label={`Prix (${doc.currency === "EUR" ? "€" : "FCFA"})`} inputMode="decimal" value={item.price} onChange={(e) => setItem(index, "price", e.target.value)} inputClass="tabular text-right" />
                              </div>
                              <Textarea label="Détail" className="mt-3" rows={2} value={item.detail} onChange={(e) => setItem(index, "detail", e.target.value)} />
                              <div className="mt-2 flex items-center justify-between gap-3">
                                 <span className="tabular text-[14px] text-muted">{money(round(number(item.qty) * number(item.price), doc.currency), doc.currency)}</span>
                                 <span className="flex">
                                    <MoveButtons index={index} count={doc.items.length} onMove={(offset) => set("items", moveItem(doc.items, index, offset))} />
                                    <IconButton label="Retirer la ligne" icon={Trash2} disabled={doc.items.length === 1} onClick={() => set("items", doc.items.filter((_, i) => i !== index))} />
                                 </span>
                              </div>
                           </li>
                        ))}
                     </ul>
                     <Button size="sm" icon={Plus} className="mt-5" onClick={() => set("items", [...doc.items, line()])}>
                        Ajouter une ligne
                     </Button>
                     <div className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
                        <div className="grid grid-cols-2 gap-4 self-start">
                           <Input label="Remise" inputMode="decimal" value={doc.discount} onChange={(e) => set("discount", e.target.value)} inputClass="tabular text-right" />
                           <Input label="TVA (%)" inputMode="decimal" value={doc.taxRate} onChange={(e) => set("taxRate", e.target.value)} inputClass="tabular text-right" />
                        </div>
                        <dl className="tabular self-end text-[15px]">
                           {(totals.discount > 0 || totals.tax > 0) && (
                              <div className="flex justify-between py-1 text-muted">
                                 <dt>Sous-total</dt>
                                 <dd>{money(totals.gross, doc.currency)}</dd>
                              </div>
                           )}
                           {totals.discount > 0 && (
                              <div className="flex justify-between py-1 text-muted">
                                 <dt>Remise</dt>
                                 <dd>−{money(totals.discount, doc.currency)}</dd>
                              </div>
                           )}
                           {totals.tax > 0 && (
                              <div className="flex justify-between py-1 text-muted">
                                 <dt>TVA</dt>
                                 <dd>{money(totals.tax, doc.currency)}</dd>
                              </div>
                           )}
                           <div className="flex items-baseline justify-between border-t border-line-strong pt-2">
                              <dt className="font-medium">Total</dt>
                              <dd className="text-[24px] font-semibold tracking-[-0.02em]">{money(totals.total, doc.currency)}</dd>
                           </div>
                        </dl>
                     </div>
                  </Panel>

                  <Panel title="Remarques et conditions">
                     <div className="space-y-4">
                        <Textarea label="Remarques" rows={2} value={doc.notes} onChange={(e) => set("notes", e.target.value)} />
                        <Textarea label="Conditions de paiement" rows={2} value={doc.terms} onChange={(e) => set("terms", e.target.value)} hint={company.paymentTerms ? undefined : "À compléter : elles se préremplissent depuis Réglages > Entreprise."} />
                     </div>
                  </Panel>
               </fieldset>

               {doc.type === "invoice" && !isNew && (
                  <Panel title="Paiement">
                     <div className="flex flex-wrap items-end gap-3">
                        <Input label={`Déjà payé (${doc.currency === "EUR" ? "€" : "FCFA"})`} inputMode="decimal" value={doc.paid} onChange={(e) => set("paid", e.target.value)} inputClass="tabular text-right" />
                        <p className="pb-2.5 text-[15px] text-muted">Reste {money(Math.max(0, totals.total - number(doc.paid)), doc.currency)}</p>
                     </div>
                  </Panel>
               )}
            </div>

            <div className="space-y-4 xl:sticky xl:top-[76px]">
               <Panel>
                  <div className="flex flex-wrap gap-2">
                     <Button variant="primary" busy={busy} disabled={!ready || (!dirty && !isNew)} onClick={() => save()}>
                        Enregistrer
                     </Button>
                     {!isNew && services.mail.ready && (
                        <Button icon={Send} disabled={!ready} onClick={openSend}>
                           Envoyer par email
                        </Button>
                     )}
                     <Button icon={Download} disabled={!ready} onClick={download}>
                        Télécharger
                     </Button>
                     {!isNew && doc.client.phone && (
                        <Button variant="whatsapp" icon={FaWhatsapp} disabled={!ready} onClick={whatsapp}>
                           WhatsApp
                        </Button>
                     )}
                  </div>
                  {!isNew && (
                     <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                        {doc.type === "quote" && doc.status === "draft" && (
                           <Button size="sm" disabled={dirty} onClick={() => mark("sent")}>
                              Marquer envoyé
                           </Button>
                        )}
                        {doc.type === "quote" && doc.status === "sent" && (
                           <>
                              <Button size="sm" onClick={() => mark("accepted")}>
                                 Accepté par le client
                              </Button>
                              <Button size="sm" onClick={() => mark("refused")}>
                                 Refusé
                              </Button>
                           </>
                        )}
                        {doc.type === "quote" && ["accepted", "refused"].includes(doc.status) && (
                           <Button size="sm" onClick={() => mark("sent")}>
                              Remettre en attente
                           </Button>
                        )}
                        {doc.type === "quote" && doc.status === "accepted" && !linked && (
                           <Button size="sm" variant="primary" icon={Copy} to={`/admin/documents/nouveau?devis=${doc.id}`}>
                              Créer la facture
                           </Button>
                        )}
                        {linked && (
                           <Button size="sm" to={`/admin/documents/${linked.id}`}>
                              Voir la facture
                           </Button>
                        )}
                        {doc.type === "invoice" && doc.status === "sent" && (
                           <Button size="sm" onClick={() => mark("paid")}>
                              Marquer payée
                           </Button>
                        )}
                        {doc.type === "invoice" && doc.status === "draft" && (
                           <Button size="sm" disabled={dirty} onClick={async () => (await issued()) && mark("sent")}>
                              Émettre la facture
                           </Button>
                        )}
                        {doc.status === "draft" && (
                           <Button size="sm" variant="danger" icon={Trash2} onClick={() => setConfirm(true)}>
                              Supprimer
                           </Button>
                        )}
                     </div>
                  )}
                  {doc.sentAt && <p className="mt-3 text-[14px] text-muted">Envoyé par email le {date(doc.sentAt)}.</p>}
               </Panel>
               {missing.length > 0 && (
                  <Note tone="warn">
                     Informations à compléter dans Réglages &gt; Entreprise avant d&apos;envoyer : {missing.join(", ")}.
                  </Note>
               )}
               {doc.type === "invoice" && <Note>Cette facture n&apos;est pas une facture normalisée (e-MECeF). Vérifiez avec votre comptable si elle est obligatoire pour vous.</Note>}
               <div className="overflow-hidden rounded-[20px] border border-line bg-ink-2">
                  {pdfError ? (
                     <p className="px-6 py-10 text-center text-muted">L&apos;aperçu n&apos;a pas pu être préparé.</p>
                  ) : preview ? (
                     <>
                        <iframe title="Aperçu du PDF" src={`${preview}#toolbar=0&navpanes=0&view=FitH`} className="hidden h-[600px] w-full bg-ink-3 lg:block" />
                        <div className="p-4 lg:hidden">
                           <Button icon={Eye} href={preview} className="w-full">
                              Voir le PDF
                           </Button>
                        </div>
                     </>
                  ) : (
                     <p className="px-6 py-10 text-center text-muted">Préparation de l&apos;aperçu…</p>
                  )}
               </div>
            </div>
         </div>

         {!isNew && <SendDialog open={sending} onClose={() => setSending(false)} doc={{ ...doc, totals }} onSend={send} />}
         <Confirm
            open={confirm}
            onClose={() => setConfirm(false)}
            title="Supprimer ce brouillon ?"
            text="Il disparaît définitivement."
            action="Supprimer"
            onConfirm={async () => {
               if (await run(() => api.del(`documents/${doc.id}`), "Brouillon supprimé.")) {
                  base.current = JSON.stringify(doc);
                  setConfirm(false);
                  navigate("/admin/documents");
                  drop("documents", doc.id);
               }
            }}
         />
      </>
   );
};

const DocumentEditor = () => {
   const { id } = useParams();
   const [params] = useSearchParams();
   const { documents, settings, leads } = useAdmin();
   const isNew = id === "nouveau";
   const found = documents.find((doc) => doc.id === id);
   const lead = leads.find((item) => item.id === params.get("demande"));
   const quote = documents.find((doc) => doc.id === params.get("devis"));
   const type = params.get("type") === "facture" ? "invoice" : "quote";
   // La copie de départ ne se recalcule pas quand la liste se rafraîchit : la saisie en cours est gardée.
   const source = useMemo(
      () => (isNew ? defaultsFor({ type, settings, lead, quote }) : found && { ...found, items: found.items.map((item) => line(item)) }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [id, type, lead?.id, quote?.id, Boolean(found)],
   );
   if (!source) return <Missing />;
   return <Editor key={`${id}-${type}-${quote?.id || ""}`} source={source} isNew={isNew} />;
};

export default DocumentEditor;
