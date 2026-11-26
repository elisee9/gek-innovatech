import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Download, Plus, Trash2, Upload } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { api } from "../lib/api";
import { ago, date, dateTime, matches, plural, SOURCE_LABEL, whatsappUrl } from "../lib/format";
import { readCsv, saveCsv } from "../lib/csv";
import { useAdmin } from "../lib/store";
import { Avatar, Badge, Button, Confirm, Detail, Dialog, Empty, Input, Note, PageHead, SearchBox, Select, Tabs, Textarea } from "../ui";

const consent = (contact) => (contact.noFollowUp || contact.marketing?.ok === false ? ["mute", "Désinscrit"] : contact.marketing?.ok ? ["ok", "A accepté"] : ["warn", "Sans accord"]);

const EMPTY = { name: "", company: "", email: "", phone: "", lang: "fr", notes: "", tags: [] };

const Card = ({ contact, onClose }) => {
   const { run, put, drop, leads, refresh } = useAdmin();
   const [values, setValues] = useState({ ...EMPTY, ...contact, tags: (contact.tags || []).join(", ") });
   const [busy, setBusy] = useState(false);
   const [confirm, setConfirm] = useState(false);
   const isNew = !contact.id;
   const set = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));
   const own = leads.filter((lead) => lead.contactId === contact.id);

   const save = async () => {
      setBusy(true);
      const body = { ...values, tags: values.tags.split(",") };
      const saved = await run(async () => {
         const item = isNew ? await api.post("contacts", body) : contact;
         if (!item) throw new Error("Indiquez une adresse email ou un numéro de téléphone.");
         return api.patch(`contacts/${item.id}`, { name: body.name, email: body.email, phone: body.phone, company: body.company, lang: body.lang, notes: body.notes, tags: body.tags });
      }, "Contact enregistré.");
      setBusy(false);
      if (!saved || saved === true) return;
      put("contacts", saved);
      onClose();
   };

   return (
      <>
         <Dialog
            open
            side
            onClose={onClose}
            title={isNew ? "Nouveau contact" : contact.name || contact.email || contact.phone}
            footer={
               <>
                  <Button onClick={onClose}>Fermer</Button>
                  <Button variant="primary" busy={busy} disabled={!values.email.trim() && !values.phone.trim()} onClick={save}>
                     Enregistrer
                  </Button>
               </>
            }
         >
            <div className="space-y-5">
               <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Nom" value={values.name} onChange={set("name")} />
                  <Input label="Entreprise" value={values.company} onChange={set("company")} />
                  <Input label="Email" type="email" inputMode="email" value={values.email} onChange={set("email")} />
                  <Input label="Téléphone / WhatsApp" type="tel" inputMode="tel" value={values.phone} onChange={set("phone")} />
                  <Select label="Langue" value={values.lang} onChange={set("lang")} options={[["fr", "Français"], ["en", "Anglais"]]} />
                  <Input label="Étiquettes" value={values.tags} onChange={set("tags")} hint="Séparées par des virgules" />
               </div>
               <Textarea label="Notes" rows={3} value={values.notes} onChange={set("notes")} />
               {!isNew && (
                  <>
                     <dl className="rounded-2xl border border-line px-4 py-1.5">
                        <Detail label="Origine">{contact.sources.map((source) => SOURCE_LABEL[source] || source).join(", ")}</Detail>
                        <Detail label="Ajouté">{dateTime(contact.createdAt)}</Detail>
                        <Detail label="Emails">
                           {consent(contact)[1]}
                           {contact.marketing?.at && `, le ${date(contact.marketing.at)} (${SOURCE_LABEL[contact.marketing.source] || contact.marketing.source})`}
                        </Detail>
                        <Detail label="Demandes">
                           {own.length > 0 &&
                              own.map((lead) => (
                                 <Link key={lead.id} to={`/admin/demandes/${lead.id}`} className="block font-medium text-brand-text hover:underline">
                                    {date(lead.createdAt)}
                                 </Link>
                              ))}
                        </Detail>
                     </dl>
                     <div className="flex flex-wrap gap-2">
                        {contact.phone && (
                           <Button size="sm" variant="whatsapp" icon={FaWhatsapp} href={whatsappUrl(contact.phone)}>
                              WhatsApp
                           </Button>
                        )}
                        {contact.marketing?.ok && !contact.noFollowUp && (
                           <Button
                              size="sm"
                              onClick={async () => {
                                 const saved = await run(() => api.patch(`contacts/${contact.id}`, { marketing: false }), "Contact désinscrit.");
                                 if (saved) {
                                    put("contacts", saved);
                                    refresh(true);
                                    onClose();
                                 }
                              }}
                           >
                              Désinscrire des emails
                           </Button>
                        )}
                        <Button size="sm" variant="danger" icon={Trash2} onClick={() => setConfirm(true)}>
                           Supprimer
                        </Button>
                     </div>
                  </>
               )}
            </div>
         </Dialog>
         <Confirm
            open={confirm}
            onClose={() => setConfirm(false)}
            title="Supprimer ce contact ?"
            text="Sa fiche est effacée et ses relances s'arrêtent. Ses demandes restent dans la liste : supprimez-les aussi s'il a demandé l'effacement de ses données."
            action="Supprimer"
            onConfirm={async () => {
               if (await run(() => api.del(`contacts/${contact.id}`), "Contact supprimé.")) {
                  setConfirm(false);
                  onClose();
                  drop("contacts", contact.id);
               }
            }}
         />
      </>
   );
};

const COLUMNS = [["name", ["nom", "name", "prenom", "nom complet"]], ["email", ["email", "e-mail", "mail", "adresse email"]], ["phone", ["telephone", "phone", "whatsapp", "tel"]], ["company", ["entreprise", "societe", "company"]]];

const Contacts = () => {
   const { contacts, run, refresh } = useAdmin();
   const [params, setParams] = useSearchParams();
   const [query, setQuery] = useState("");
   const [tab, setTab] = useState("all");
   const [tag, setTag] = useState("");
   const [editing, setEditing] = useState(null);
   const fileRef = useRef(null);

   useEffect(() => {
      const id = params.get("fiche");
      if (!id) return;
      setEditing(contacts.find((contact) => contact.id === id) || null);
      setParams({}, { replace: true });
   }, [params, contacts, setParams]);

   const subscribed = (contact) => contact.marketing?.ok && !contact.noFollowUp && contact.email;
   const tags = useMemo(() => [...new Set(contacts.flatMap((contact) => contact.tags))].sort(), [contacts]);
   const list = contacts.filter(
      (contact) => (tab === "all" || (tab === "subscribed" ? subscribed(contact) : !subscribed(contact))) && (!tag || contact.tags.includes(tag)) && matches(query, contact.name, contact.email, contact.phone, contact.company, contact.tags.join(" ")),
   );

   const importFile = async (e) => {
      const [file] = e.target.files;
      e.target.value = "";
      if (!file) return;
      const rows = readCsv(await file.text()).map((row) => Object.fromEntries(COLUMNS.map(([key, names]) => [key, names.map((name) => row[name]).find(Boolean) || ""])));
      const usable = rows.filter((row) => row.email || row.phone);
      await run(async () => {
         if (!usable.length) throw new Error("Aucune ligne utilisable : il faut une colonne « email » ou « téléphone ».");
         const { added } = await api.post("contacts-import", { rows: usable });
         await refresh(true);
         return added;
      }, (added) => `${plural(added, "contact importé", "contacts importés")}. Ils n'ont pas encore accepté de recevoir vos emails.`);
   };

   const exportFile = () =>
      saveCsv(
         "contacts-gek.csv",
         ["Nom", "Entreprise", "Email", "Téléphone", "Langue", "Origine", "Étiquettes", "Emails", "Ajouté le"],
         list.map((contact) => [contact.name, contact.company, contact.email, contact.phone, contact.lang, contact.sources.map((source) => SOURCE_LABEL[source] || source).join(", "), contact.tags.join(", "), consent(contact)[1], date(contact.createdAt)]),
      );

   return (
      <>
         <PageHead title="Contacts" text="Toutes les adresses et numéros laissés sur le site, dans le chat, par rendez-vous ou ajoutés à la main, réunis en une fiche par personne.">
            <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={importFile} className="hidden" />
            <Button icon={Upload} onClick={() => fileRef.current.click()}>
               Importer
            </Button>
            <Button icon={Download} disabled={!list.length} onClick={exportFile}>
               Exporter
            </Button>
            <Button variant="primary" icon={Plus} onClick={() => setEditing(EMPTY)}>
               Ajouter
            </Button>
         </PageHead>

         <div className="mb-5 flex flex-wrap items-center gap-3">
            <Tabs label="Contacts affichés" value={tab} onChange={setTab} items={[["all", "Tous", contacts.length], ["subscribed", "Ont accepté nos emails", contacts.filter(subscribed).length], ["none", "Sans accord", contacts.filter((contact) => !subscribed(contact)).length]]} />
            <SearchBox value={query} onChange={setQuery} placeholder="Rechercher un contact" className="min-w-[220px] flex-1 sm:max-w-[320px]" />
         </div>
         {tags.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filtrer par étiquette">
               {tags.map((item) => (
                  <button key={item} type="button" aria-pressed={tag === item} onClick={() => setTag(tag === item ? "" : item)} className={`h-9 rounded-full border px-3.5 text-[14px] transition-colors ${tag === item ? "border-fg bg-fg text-ink-2" : "border-line-strong bg-ink-2 text-muted hover:text-fg"}`}>
                     {item}
                  </button>
               ))}
            </div>
         )}

         {!contacts.length ? (
            <Empty title="Aucun contact pour le moment" text="Chaque demande, inscription ou rendez-vous crée une fiche ici. Vous pouvez aussi importer un fichier CSV." />
         ) : !list.length ? (
            <Empty title="Aucun contact dans cette vue" />
         ) : (
            <div className="overflow-hidden rounded-[20px] border border-line bg-ink-2">
               <table className="w-full text-left text-[15px]">
                  <thead className="hidden text-[13px] text-subtle md:table-header-group">
                     <tr>
                        <th scope="col" className="px-6 py-3 font-medium">Contact</th>
                        <th scope="col" className="px-4 py-3 font-medium">Coordonnées</th>
                        <th scope="col" className="px-4 py-3 font-medium">Origine</th>
                        <th scope="col" className="px-4 py-3 font-medium">Emails</th>
                        <th scope="col" className="px-6 py-3 text-right font-medium">Activité</th>
                     </tr>
                  </thead>
                  <tbody>
                     {list.slice(0, 300).map((contact) => {
                        const [tone, label] = consent(contact);
                        return (
                           <tr key={contact.id} className="block border-t border-line transition-colors first:border-t-0 hover:bg-ink-3/60 md:table-row md:first:border-t">
                              <td className="block px-5 pb-1 pt-3.5 md:table-cell md:px-6 md:py-3.5">
                                 <button type="button" onClick={() => setEditing(contact)} className="flex items-center gap-3 text-left">
                                    <Avatar name={contact.name || contact.email} />
                                    <span className="min-w-0">
                                       <span className="block font-medium hover:underline">{contact.name || contact.email || contact.phone}</span>
                                       {contact.company && <span className="block text-[14px] text-muted">{contact.company}</span>}
                                    </span>
                                 </button>
                              </td>
                              <td className="block break-all px-5 py-0.5 pl-[68px] text-[14px] text-muted md:table-cell md:px-4 md:py-3.5">
                                 {contact.email && contact.name && <span className="block">{contact.email}</span>}
                                 {contact.phone && <span className="tabular block">{contact.phone}</span>}
                              </td>
                              <td className="hidden px-4 py-3.5 text-[14px] text-muted md:table-cell">
                                 {contact.sources.map((source) => SOURCE_LABEL[source] || source).join(", ")}
                                 {contact.tags.length > 0 && <span className="block text-subtle">{contact.tags.join(", ")}</span>}
                              </td>
                              <td className="inline-block px-5 pb-3.5 pl-[68px] pt-1.5 md:table-cell md:px-4 md:py-3.5">
                                 <Badge tone={tone}>{label}</Badge>
                              </td>
                              <td className="hidden whitespace-nowrap px-6 py-3.5 text-right text-[14px] text-subtle md:table-cell">{ago(contact.lastAt || contact.createdAt)}</td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
               {list.length > 300 && <p className="border-t border-line px-6 py-3 text-[14px] text-subtle">300 premiers contacts affichés : affinez la recherche pour voir les autres.</p>}
            </div>
         )}
         <Note className="mt-5">Les campagnes ne partent qu&apos;aux personnes qui ont coché la case d&apos;accord sur le site. Un contact importé ou ajouté à la main ne les reçoit pas.</Note>
         {editing && <Card key={editing.id || "new"} contact={editing} onClose={() => setEditing(null)} />}
      </>
   );
};

export default Contacts;
