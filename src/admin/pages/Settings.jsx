import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, Plus, RotateCcw, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { ago, date, dateTime, plural } from "../lib/format";
import { LeaveGuard, useAdmin, useDraft } from "../lib/store";
import { Badge, Button, Confirm, Detail, IconButton, Input, Note, PageHead, Panel, SaveBar, Select, Skeleton, Switch, Tabs, Textarea } from "../ui";

const TABS = [["coordonnees", "Coordonnées"], ["entreprise", "Entreprise"], ["rendez-vous", "Rendez-vous"], ["emails", "Emails"], ["assistant", "Assistant"], ["sauvegarde", "Sauvegarde"]];

const useSettings = (section) => {
   const { settings, run, patch } = useAdmin();
   const state = useDraft(settings[section]);
   const set = (field, value) => state.setDraft((prev) => ({ ...prev, [field]: value }));
   const save = () =>
      run(async () => {
         const saved = await api.put(`reglages/${section}`, { value: state.draft });
         patch("settings", (all) => ({ ...all, [section]: saved }));
         state.setDraft(saved);
      }, "Réglages enregistrés.");
   return { ...state, set, save };
};

const Contact = () => {
   const { content, saveContent } = useAdmin();
   const contact = useDraft(content.contact);
   const social = useDraft(content.social);
   const dirty = contact.dirty || social.dirty;
   const save = async () => {
      if (contact.dirty && !(await saveContent("contact", contact.draft))) return;
      if (social.dirty) await saveContent("social", social.draft);
   };
   const set = (field) => (e) => contact.setDraft((prev) => ({ ...prev, [field]: e.target.value }));
   return (
      <>
         <LeaveGuard when={dirty} />
         <div className="space-y-6">
            <Panel title="Coordonnées affichées sur le site">
               <div className="grid gap-5 sm:grid-cols-2">
                  <Input label="Téléphone" type="tel" value={contact.draft.phoneDisplay} onChange={set("phoneDisplay")} hint="Avec l'indicatif, tel qu'il s'affiche" />
                  <Input label="Numéro WhatsApp" type="tel" value={contact.draft.whatsappNumber} onChange={set("whatsappNumber")} hint="Chiffres seulement, avec l'indicatif, sans +" />
                  <Input label="Email" type="email" value={contact.draft.email} onChange={set("email")} />
               </div>
            </Panel>
            <Panel title="Réseaux sociaux" hint="Adresse complète de chaque page. Une ligne vide n'affiche rien.">
               <div className="grid gap-5 sm:grid-cols-2">
                  {[["facebook", "Facebook"], ["instagram", "Instagram"], ["linkedin", "LinkedIn"], ["tiktok", "TikTok"], ["youtube", "YouTube"]].map(([key, label]) => (
                     <Input key={key} label={label} type="url" placeholder="https://" value={social.draft[key] || ""} onChange={(e) => social.setDraft((prev) => ({ ...prev, [key]: e.target.value }))} />
                  ))}
               </div>
            </Panel>
         </div>
         <SaveBar
            dirty={dirty}
            onSave={save}
            onReset={() => {
               contact.reset();
               social.reset();
            }}
         />
      </>
   );
};

const Company = () => {
   const { draft, set, dirty, reset, save } = useSettings("company");
   const field = (name, label, props = {}) => <Input label={label} value={draft[name]} onChange={(e) => set(name, e.target.value)} {...props} />;
   return (
      <>
         <LeaveGuard when={dirty} />
         <div className="space-y-6">
            <Panel title="Identité" hint="Imprimée sur les devis et les factures. Laissez vide ce qui n'existe pas.">
               <div className="grid gap-5 sm:grid-cols-2">
                  {field("name", "Nom")}
                  {field("address", "Adresse")}
                  {field("city", "Ville")}
                  {field("country", "Pays")}
                  {field("ifu", "IFU", { hint: "Identifiant fiscal unique" })}
                  {field("rccm", "RCCM", { hint: "Registre du commerce" })}
               </div>
            </Panel>
            <Panel title="Devis et factures">
               <div className="grid gap-5 sm:grid-cols-2">
                  <Select label="Devise habituelle" value={draft.currency} onChange={(e) => set("currency", e.target.value)} options={[["XOF", "FCFA"], ["EUR", "Euro"]]} />
                  {field("quoteValidity", "Validité d'un devis (jours)", { inputMode: "numeric" })}
                  {field("taxRate", "TVA (%)", { inputMode: "decimal", hint: "0 si vous ne facturez pas la TVA. Le taux est à confirmer avec votre comptable." })}
                  {field("taxNote", "Mention sans TVA", { hint: "Affichée sous le total quand il n'y a pas de TVA. Formule à confirmer avec votre comptable." })}
                  <Textarea label="Conditions de paiement" className="sm:col-span-2" rows={3} value={draft.paymentTerms} onChange={(e) => set("paymentTerms", e.target.value)} />
                  <Textarea label="Coordonnées bancaires" rows={3} value={draft.bank} onChange={(e) => set("bank", e.target.value)} hint="Sur les factures seulement" />
                  <Textarea label="Mobile Money" rows={3} value={draft.mobileMoney} onChange={(e) => set("mobileMoney", e.target.value)} hint="Opérateur, numéro et nom du compte" />
               </div>
            </Panel>
         </div>
         <SaveBar dirty={dirty} onSave={save} onReset={reset} label="Enregistrer" />
      </>
   );
};

const DAYS = [[1, "Lundi"], [2, "Mardi"], [3, "Mercredi"], [4, "Jeudi"], [5, "Vendredi"], [6, "Samedi"], [0, "Dimanche"]];

const Booking = () => {
   const { content, saveContent } = useAdmin();
   const { draft, set, dirty, reset, save } = useSettings("booking");
   const [blocked, setBlocked] = useState("");
   const setDay = (day, ranges) => set("days", { ...draft.days, [day]: ranges });
   const toggle = (mode) => set("modes", draft.modes.includes(mode) ? draft.modes.filter((item) => item !== mode) : [...draft.modes, mode]);
   const ready = DAYS.some(([day]) => draft.days[day]?.length) && draft.modes.length > 0 && (!draft.modes.includes("video") || draft.videoLink);
   const time = "tabular h-10 rounded-xl border border-line-strong bg-ink-2 px-3 text-[15px]";

   return (
      <>
         <LeaveGuard when={dirty} />
         <div className="space-y-6">
            <Panel>
               <Switch
                  label="Prise de rendez-vous sur le site"
                  hint={dirty ? "Enregistrez d'abord vos horaires." : ready ? "Ouverte, la page « Prendre rendez-vous » apparaît dans le site et les visiteurs choisissent un créneau libre." : "Indiquez au moins un horaire et un moyen de contact."}
                  checked={content.features.booking}
                  disabled={dirty || (!ready && !content.features.booking)}
                  onChange={(booking) => saveContent("features", { ...content.features, booking })}
               />
               {!content.features.booking && <Note tone="warn" className="mt-5">Les horaires ci-dessous sont une proposition de départ : vérifiez-les avant d&apos;ouvrir.</Note>}
            </Panel>
            <Panel title="Horaires" hint="Heure du Bénin. Les visiteurs voient les créneaux dans leur propre fuseau.">
               <ul>
                  {DAYS.map(([day, label]) => (
                     <li key={day} className="grid gap-x-6 gap-y-2 border-t border-line py-3 first:border-t-0 sm:grid-cols-[110px_1fr] sm:items-center">
                        <span className="font-medium">{label}</span>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                           {(draft.days[day] || []).map(([from, to], i) => (
                              <span key={i} className="flex items-center gap-1.5">
                                 <input aria-label={`${label}, début ${i + 1}`} type="time" value={from} onChange={(e) => setDay(day, draft.days[day].map((range, j) => (j === i ? [e.target.value, range[1]] : range)))} className={time} />
                                 <span className="text-subtle">à</span>
                                 <input aria-label={`${label}, fin ${i + 1}`} type="time" value={to} onChange={(e) => setDay(day, draft.days[day].map((range, j) => (j === i ? [range[0], e.target.value] : range)))} className={time} />
                                 <IconButton label={`Retirer cet horaire du ${label.toLowerCase()}`} icon={Trash2} size={15} onClick={() => setDay(day, draft.days[day].filter((_, j) => j !== i))} />
                              </span>
                           ))}
                           {!draft.days[day]?.length && <span className="text-muted">Fermé</span>}
                           <Button size="sm" variant="quiet" icon={Plus} onClick={() => setDay(day, [...(draft.days[day] || []), draft.days[day]?.length ? ["14:00", "18:00"] : ["09:00", "12:00"]])}>
                              Horaire
                           </Button>
                        </div>
                     </li>
                  ))}
               </ul>
            </Panel>
            <Panel title="Règles">
               <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <Select label="Durée" value={draft.duration} onChange={(e) => set("duration", Number(e.target.value))} options={[15, 20, 30, 45, 60].map((n) => [n, `${n} min`])} />
                  <Select label="Pause entre deux" value={draft.buffer} onChange={(e) => set("buffer", Number(e.target.value))} options={[0, 5, 10, 15, 30, 60].map((n) => [n, n ? `${n} min` : "Aucune"])} />
                  <Select label="Prévenir au moins" value={draft.notice} onChange={(e) => set("notice", Number(e.target.value))} options={[[1, "1 h avant"], [3, "3 h avant"], [6, "6 h avant"], [12, "12 h avant"], [24, "1 jour avant"], [48, "2 jours avant"]]} />
                  <Select label="Jusqu'à" value={draft.horizon} onChange={(e) => set("horizon", Number(e.target.value))} options={[[7, "1 semaine"], [14, "2 semaines"], [21, "3 semaines"], [30, "1 mois"], [60, "2 mois"]]} />
               </div>
               <fieldset className="mt-6">
                  <legend className="mb-2 text-[14px] font-medium text-fg/90">Moyens proposés</legend>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                     {[["whatsapp", "Appel WhatsApp"], ["phone", "Téléphone"], ["video", "Visio"]].map(([mode, label]) => (
                        <label key={mode} className="flex cursor-pointer items-center gap-2.5">
                           <input type="checkbox" checked={draft.modes.includes(mode)} onChange={() => toggle(mode)} className="h-[18px] w-[18px] accent-brand" />
                           {label}
                        </label>
                     ))}
                  </div>
               </fieldset>
               {draft.modes.includes("video") && <Input className="mt-5 max-w-[520px]" label="Lien de visio habituel" type="url" placeholder="https://meet.google.com/…" value={draft.videoLink} onChange={(e) => set("videoLink", e.target.value)} hint="Par exemple un lien Google Meet permanent" />}
               <div className="mt-6 border-t border-line pt-5">
                  <Switch label="Rappels automatiques" hint="Un email au client la veille et deux heures avant." checked={draft.reminders} onChange={(value) => set("reminders", value)} />
               </div>
            </Panel>
            <Panel title="Jours fermés" hint="Congés et jours fériés.">
               <div className="flex flex-wrap items-end gap-3">
                  <Input label="Jour à fermer" type="date" value={blocked} onChange={(e) => setBlocked(e.target.value)} />
                  <Button
                     disabled={!blocked || draft.blocked.includes(blocked)}
                     onClick={() => {
                        set("blocked", [...draft.blocked, blocked].sort());
                        setBlocked("");
                     }}
                  >
                     Ajouter
                  </Button>
               </div>
               {draft.blocked.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                     {draft.blocked.map((day) => (
                        <li key={day} className="inline-flex items-center gap-1 rounded-full border border-line pl-3.5 text-[14px]">
                           {date(`${day}T12:00:00Z`, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                           <IconButton label="Rouvrir ce jour" icon={Trash2} size={14} onClick={() => set("blocked", draft.blocked.filter((item) => item !== day))} />
                        </li>
                     ))}
                  </ul>
               )}
            </Panel>
         </div>
         <SaveBar dirty={dirty} onSave={save} onReset={reset} label="Enregistrer" />
      </>
   );
};

const Emails = () => {
   const { services, mails, run, refresh, email } = useAdmin();
   const mail = useSettings("mail");
   const notify = useSettings("notify");
   const [busy, setBusy] = useState(false);
   const dirty = mail.dirty || notify.dirty;
   const test = async () => {
      setBusy(true);
      await run(() => api.post("email-test"), ({ to }) => `Email d'essai envoyé à ${to}.`);
      await refresh(true);
      setBusy(false);
   };
   const KIND = { reply: "Réponse", auto: "Automatique", campaign: "Campagne", notice: "Avis interne" };

   return (
      <>
         <LeaveGuard when={dirty} />
         <div className="space-y-6">
            <Panel title="Connexion" actions={<Badge tone={services.mail.ready ? "ok" : "warn"}>{services.mail.test ? "Essai local" : services.mail.ready ? "Connecté" : "À connecter"}</Badge>}>
               {services.mail.ready ? (
                  <>
                     <dl>
                        <Detail label="Adresse">{services.mail.address}</Detail>
                        <Detail label="Aujourd'hui">{`${plural(services.mail.sentToday, "email envoyé", "emails envoyés")}`}</Detail>
                        <Detail label="Réponses">{services.inbox.ready ? (services.inbox.at ? `Relevées ${ago(services.inbox.at)}` : "Relevées toutes les 30 minutes") : "Non relevées en local"}</Detail>
                     </dl>
                     <Button className="mt-4" busy={busy} onClick={test}>
                        M&apos;envoyer un essai ({email})
                     </Button>
                  </>
               ) : (
                  <ol className="list-decimal space-y-2 pl-5 text-[15px] leading-relaxed">
                     <li>Dans le compte Google de GEK, activez la validation en deux étapes, puis créez un « mot de passe d&apos;application ».</li>
                     <li>
                        Dans Netlify, Environment variables, ajoutez <strong className="font-semibold">GMAIL_USER</strong> (l&apos;adresse Gmail) et <strong className="font-semibold">GMAIL_APP_PASSWORD</strong> (le mot de passe d&apos;application).
                     </li>
                     <li>Relancez une mise en ligne (Deploys, Trigger deploy).</li>
                  </ol>
               )}
            </Panel>
            <Panel title="Envoi">
               <div className="grid gap-5 sm:grid-cols-2">
                  <Input label="Nom de l'expéditeur" value={mail.draft.fromName} onChange={(e) => mail.set("fromName", e.target.value)} />
                  <Input label="Emails automatiques par jour, au plus" inputMode="numeric" value={mail.draft.dailyLimit} onChange={(e) => mail.set("dailyLimit", e.target.value)} hint="Gmail bloque un compte qui envoie trop : restez en dessous de 400." />
                  <Textarea className="sm:col-span-2" label="Signature" rows={3} value={mail.draft.signature} onChange={(e) => mail.set("signature", e.target.value)} />
               </div>
            </Panel>
            <Panel title="Vous prévenir">
               <div className="space-y-5">
                  <Switch label="Nouvelle demande" hint="Un email dès qu'un visiteur envoie le formulaire." checked={notify.draft.newLead} onChange={(value) => notify.set("newLead", value)} />
                  <Switch label="Nouveau rendez-vous" hint="Un email quand un visiteur prend un créneau." checked={notify.draft.newMeeting} onChange={(value) => notify.set("newMeeting", value)} />
                  <Switch label="Point du jour" hint="Chaque matin à 7 h : demandes à traiter, rendez-vous et devis en attente." checked={notify.draft.digest} onChange={(value) => notify.set("digest", value)} />
                  <Input className="max-w-[420px]" label="Adresse à prévenir" type="email" value={notify.draft.email} onChange={(e) => notify.set("email", e.target.value)} hint={`Vide : ${services.mail.address || "l'adresse Gmail connectée"}`} />
               </div>
            </Panel>
            <Panel title="Derniers emails" flush>
               {mails.length ? (
                  <ul className="pb-2">
                     {mails.slice(0, 25).map((item) => (
                        <li key={item.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-5 py-3 text-[14px] sm:px-6">
                           <span className="min-w-0 flex-1 basis-[220px]">
                              <span className="block truncate text-[15px] font-medium">{item.subject}</span>
                              <span className="block truncate text-muted">{item.ok ? item.to : item.error}</span>
                           </span>
                           <span className="text-subtle">{KIND[item.kind]}</span>
                           <span className="text-subtle">{dateTime(item.at)}</span>
                           <Badge tone={item.ok ? "ok" : "signal"}>{item.ok ? "Envoyé" : "Échec"}</Badge>
                        </li>
                     ))}
                  </ul>
               ) : (
                  <p className="border-t border-line px-6 py-8 text-center text-muted">Aucun email envoyé pour le moment.</p>
               )}
            </Panel>
         </div>
         <SaveBar
            dirty={dirty}
            label="Enregistrer"
            onSave={async () => {
               if (mail.dirty) await mail.save();
               if (notify.dirty) await notify.save();
            }}
            onReset={() => {
               mail.reset();
               notify.reset();
            }}
         />
      </>
   );
};

const Assistant = () => {
   const { content, saveContent, services } = useAdmin();
   const { draft, set, dirty, reset, save } = useSettings("ai");
   return (
      <>
         <LeaveGuard when={dirty} />
         <div className="space-y-6">
            <Panel title="Sur le site">
               <div className="space-y-5">
                  <Switch label="Assistant du site" hint="Répond aux visiteurs d'après vos offres, services et coordonnées." checked={content.features.chat} onChange={(chat) => saveContent("features", { ...content.features, chat })} />
                  <Switch label="Inscription aux emails" hint="Formulaire en pied de page et case à cocher dans la demande de devis." checked={content.features.newsletter} onChange={(newsletter) => saveContent("features", { ...content.features, newsletter })} />
                  <Textarea label="Ce que l'assistant doit savoir en plus" rows={5} value={draft.chatExtra} onChange={(e) => set("chatExtra", e.target.value)} hint="Par exemple vos moyens de paiement réels. Il s'en sert comme d'informations sûres : n'écrivez que du vrai." />
               </div>
            </Panel>
            <Panel title="Pour vos réponses" actions={<Badge tone={services.ai.ready ? "ok" : "warn"}>{services.ai.ready ? "Gemini connecté" : "Clé Gemini absente"}</Badge>}>
               <div className="space-y-5">
                  <Switch label="Préparer un brouillon pour chaque nouvelle demande" hint="Vous le trouvez écrit dans la demande. Rien n'est envoyé sans vous." checked={draft.autoDraft} onChange={(value) => set("autoDraft", value)} />
                  <Textarea label="Vos consignes" rows={4} value={draft.instructions} onChange={(e) => set("instructions", e.target.value)} hint="Ton, formules à utiliser ou à éviter, informations à rappeler." />
                  <Note>Les messages des clients sont transmis à Google (Gemini) pour préparer les textes : les mentions légales du site l&apos;indiquent.</Note>
               </div>
            </Panel>
         </div>
         <SaveBar dirty={dirty} onSave={save} onReset={reset} label="Enregistrer" />
      </>
   );
};

const Backup = () => {
   const { run, refresh } = useAdmin();
   const [history, setHistory] = useState(null);
   const [target, setTarget] = useState(null);
   useEffect(() => {
      run(async () => setHistory(await api.get("historique")));
   }, [run]);
   return (
      <div className="space-y-6">
         <Panel title="Vos données" hint="Une copie est gardée chaque jour pendant 14 jours. Vous pouvez aussi en télécharger une.">
            <Button icon={Download} href="/api/admin/export">
               Télécharger une sauvegarde
            </Button>
         </Panel>
         <Panel title="Historique du site" hint="Chaque enregistrement garde l'état précédent. Revenir en arrière s'applique tout de suite." flush>
            {!history ? (
               <div className="space-y-2 p-6">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
               </div>
            ) : history.length ? (
               <ul className="pb-2">
                  {history.map((version) => (
                     <li key={version.key} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line px-5 py-3 sm:px-6">
                        <span className="min-w-0 flex-1 basis-[200px]">
                           <span className="block font-medium">{version.label}</span>
                           <span className="block text-[14px] text-muted">{dateTime(version.at)}</span>
                        </span>
                        <Button size="sm" icon={RotateCcw} onClick={() => setTarget(version)}>
                           Annuler à partir d&apos;ici
                        </Button>
                     </li>
                  ))}
               </ul>
            ) : (
               <p className="border-t border-line px-6 py-8 text-center text-muted">Aucune modification pour le moment.</p>
            )}
         </Panel>
         <Confirm
            open={Boolean(target)}
            onClose={() => setTarget(null)}
            title="Revenir en arrière ?"
            text={target ? `Le site reprend l'état d'avant la modification « ${target.label} » du ${dateTime(target.at)}. Les modifications suivantes sont annulées aussi ; ce retour reste dans l'historique.` : ""}
            action="Revenir en arrière"
            onConfirm={async () => {
               if (await run(() => api.post("historique", { key: target.key }), "Version rétablie, en ligne.")) {
                  setTarget(null);
                  await refresh(true);
                  run(async () => setHistory(await api.get("historique")));
               }
            }}
         />
      </div>
   );
};

const Settings = () => {
   const [params, setParams] = useSearchParams();
   const tab = TABS.some(([key]) => key === params.get("onglet")) ? params.get("onglet") : "coordonnees";
   const Section = { coordonnees: Contact, entreprise: Company, "rendez-vous": Booking, emails: Emails, assistant: Assistant, sauvegarde: Backup }[tab];
   return (
      <>
         <PageHead title="Réglages" />
         <div className="mb-6">
            <Tabs label="Réglages" value={tab} onChange={(key) => setParams({ onglet: key })} items={TABS} />
         </div>
         <Section key={tab} />
      </>
   );
};

export default Settings;
