import { useRef, useState } from "react";
import { ChevronDown, ExternalLink, Eye, EyeOff, ImageUp, LayoutTemplate, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { uploadImage } from "../lib/image";
import { LeaveGuard, useAdmin, useDraft } from "../lib/store";
import { Badge, Bilingual, Button, IconButton, Input, MoveButtons, moveItem, Note, PageHead, SaveBar, Select } from "../ui";

const PLANS = [["basic", "Plan Starter"], ["standard", "Plan Pro"], ["premium", "Plan Premium"], ["quote", "Sur devis"]];

const Shot = ({ label, hint, src, size, width, onDone }) => {
   const { run, patch } = useAdmin();
   const ref = useRef(null);
   const [busy, setBusy] = useState(false);
   const pick = async (e) => {
      const [file] = e.target.files;
      e.target.value = "";
      if (!file) return;
      setBusy(true);
      const media = await run(() => uploadImage(file, width), "Image ajoutée. Enregistrez pour la mettre en ligne.");
      setBusy(false);
      if (!media) return;
      patch("media", (list) => [media, ...list]);
      onDone(media.url, [media.width, media.height]);
   };
   return (
      <div>
         <p className="mb-1.5 text-[14px] font-medium text-fg/90">{label}</p>
         <div className="flex items-start gap-4">
            <div className="h-[132px] w-[104px] flex-none overflow-hidden rounded-xl border border-line bg-ink-3">
               {src && <img src={src} alt="" className="h-full w-full object-cover object-top" />}
            </div>
            <div>
               <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" onChange={pick} className="hidden" />
               <Button size="sm" icon={busy ? LoaderCircle : ImageUp} disabled={busy} onClick={() => ref.current.click()}>
                  {busy ? "Ajout…" : src ? "Remplacer" : "Ajouter l'image"}
               </Button>
               <p className="mt-2 max-w-[26ch] text-[13px] leading-snug text-subtle">{size ? `${size[0]} × ${size[1]} px. ` : ""}{hint}</p>
            </div>
         </div>
      </div>
   );
};

const Projects = () => {
   const { content, saveContent, toast } = useAdmin();
   const { draft, setDraft, dirty, reset } = useDraft(content.projects);
   const [open, setOpen] = useState(null);
   const set = (id, patch) => setDraft((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)));
   const setScreens = (project, patch) => set(project.id, { screens: { ...(project.screens || {}), ...patch } });
   const onError = (text) => toast(text, "error");
   const complete = (project) => Boolean(project.screens?.desktop && project.screens?.mobile);

   const add = () => {
      const id = Math.max(0, ...draft.map((project) => Number(project.id) || 0)) + 1;
      setDraft((list) => [{ id, link: "", planId: "quote", title: { fr: "", en: "" }, description: { fr: "", en: "" } }, ...list]);
      setOpen(id);
   };
   // Une réalisation aux captures incomplètes est enregistrée sans captures : elle s'affiche comme type de site.
   const save = () => saveContent("projects", draft.map((project) => (complete(project) ? project : { ...project, screens: undefined, hero: false })));

   return (
      <>
         <LeaveGuard when={dirty} />
         <PageHead title="Réalisations" text="Les sites livrés ont leurs deux captures ; sans captures, une réalisation s'affiche comme un type de site proposé.">
            <Button icon={ExternalLink} href="/portfolio">
               Voir la page
            </Button>
            <Button variant="primary" icon={Plus} onClick={add}>
               Ajouter
            </Button>
         </PageHead>
         <ul className="overflow-hidden rounded-[20px] border border-line bg-ink-2">
            {draft.map((project, index) => {
               const expanded = open === project.id;
               return (
                  <li key={project.id} className="border-t border-line first:border-t-0">
                     <div className="flex items-center gap-2 py-2 pl-5 pr-3 sm:pl-6">
                        <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : project.id)} className="flex min-w-0 flex-1 items-center gap-4 py-2 text-left">
                           <span className="h-12 w-[68px] flex-none overflow-hidden rounded-lg border border-line bg-ink-3">
                              {project.screens?.desktop ? <img src={project.screens.desktop} alt="" className="h-full w-full object-cover object-top" /> : <LayoutTemplate size={20} strokeWidth={1.6} aria-hidden="true" className="m-auto h-full text-subtle/60" />}
                           </span>
                           <span className="min-w-0 flex-1">
                              <span className={`block truncate font-medium ${project.hidden ? "opacity-55" : ""}`}>{project.title.fr || "Sans titre"}</span>
                              <span className="block truncate text-[14px] text-muted">{complete(project) ? project.link : PLANS.find(([key]) => key === project.planId)?.[1]}</span>
                           </span>
                           <span className="hidden gap-1.5 md:flex">
                              {project.hidden && <Badge>Masquée</Badge>}
                              {project.hero && <Badge tone="info">Haut de l&apos;accueil</Badge>}
                              {complete(project) && !project.hidden && <Badge tone="ok">En ligne</Badge>}
                           </span>
                           <ChevronDown size={18} aria-hidden="true" className={`flex-none text-subtle transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
                        </button>
                        <span className="hidden sm:flex">
                           <MoveButtons index={index} count={draft.length} onMove={(offset) => setDraft((list) => moveItem(list, index, offset))} />
                        </span>
                        <IconButton label={project.hidden ? `Afficher ${project.title.fr}` : `Masquer ${project.title.fr}`} icon={project.hidden ? EyeOff : Eye} onClick={() => set(project.id, { hidden: !project.hidden })} />
                     </div>
                     {expanded && (
                        <div className="space-y-5 border-t border-line bg-ink/60 px-5 py-5 sm:px-6">
                           <Bilingual label="Titre" value={project.title} onChange={(title) => set(project.id, { title })} onError={onError} />
                           <Bilingual area rows={3} label="Description" value={project.description} onChange={(description) => set(project.id, { description })} onError={onError} />
                           <div className="grid gap-5 sm:grid-cols-2">
                              <Input label="Adresse du site" type="url" inputMode="url" value={project.link === "/notdone" ? "" : project.link} onChange={(e) => set(project.id, { link: e.target.value.trim() })} placeholder="https://" />
                              <Select label="Offre" value={project.planId} onChange={(e) => set(project.id, { planId: e.target.value })} options={PLANS} />
                           </div>
                           <div className="grid gap-6 sm:grid-cols-2">
                              <Shot label="Capture ordinateur" hint="Page entière, 1600 px de large : elle défile dans le cadre." src={project.screens?.desktop} size={project.screens?.desktopSize} width={1600} onDone={(desktop, desktopSize) => setScreens(project, { desktop, desktopSize })} />
                              <Shot label="Capture téléphone" hint="Page entière, 520 px de large." src={project.screens?.mobile} size={project.screens?.mobileSize} width={520} onDone={(mobile, mobileSize) => setScreens(project, { mobile, mobileSize })} />
                           </div>
                           <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
                              <Button size="sm" disabled={!complete(project) || project.hero || project.hidden} onClick={() => setDraft((list) => list.map((item) => ({ ...item, hero: item.id === project.id })))}>
                                 {project.hero ? "Affichée en haut de l'accueil" : "Afficher en haut de l'accueil"}
                              </Button>
                              <span className="flex sm:hidden">
                                 <MoveButtons index={index} count={draft.length} onMove={(offset) => setDraft((list) => moveItem(list, index, offset))} />
                              </span>
                              <Button size="sm" variant="danger" icon={Trash2} onClick={() => setDraft((list) => list.filter((item) => item.id !== project.id))}>
                                 Retirer
                              </Button>
                           </div>
                        </div>
                     )}
                  </li>
               );
            })}
         </ul>
         <Note className="mt-5">N&apos;ajoutez que des sites réellement livrés, avec l&apos;accord du client pour les montrer.</Note>
         <SaveBar dirty={dirty} onSave={save} onReset={reset} />
      </>
   );
};

export default Projects;
