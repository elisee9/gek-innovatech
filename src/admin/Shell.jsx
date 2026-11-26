import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, ExternalLink, FileText, House, Inbox, LayoutTemplate, ListChecks, LogOut, Menu, MessagesSquare, RefreshCw, Search, Send, Settings, ShieldCheck, Star, Tags, Type, Users, X, Zap } from "lucide-react";
import Logo from "../components/Logo";
import { api } from "./lib/api";
import { matches, needsReply } from "./lib/format";
import { useAdmin } from "./lib/store";
import { Button, IconButton, Skeleton } from "./ui";

const GROUPS = [
   [null, [["", "Accueil", House]]],
   ["Clients", [["demandes", "Demandes", Inbox], ["contacts", "Contacts", Users], ["rendez-vous", "Rendez-vous", CalendarDays], ["documents", "Devis et factures", FileText]]],
   ["Messages", [["sequences", "Séquences", Zap], ["campagnes", "Campagnes", Send], ["conversations", "Chat du site", MessagesSquare]]],
   ["Site", [["offres", "Offres", Tags], ["services", "Services", ListChecks], ["realisations", "Réalisations", LayoutTemplate], ["avis", "Avis et chiffres", Star], ["textes", "Textes", Type], ["verification", "Vérification", ShieldCheck]]],
   [null, [["reglages", "Réglages", Settings]]],
];
const MOBILE = [["", "Accueil", House], ["demandes", "Demandes", Inbox], ["rendez-vous", "Agenda", CalendarDays], ["documents", "Devis", FileText]];
const path = (key) => (key ? `/admin/${key}` : "/admin");

const useCounts = () => {
   const { leads } = useAdmin();
   return { demandes: (leads || []).filter(needsReply).length };
};

const Count = ({ n }) => (n ? <span className="tabular ml-auto rounded-full bg-signal-fill px-2 py-0.5 text-[12px] font-semibold leading-tight text-on-signal">{n}</span> : null);

const Nav = ({ onNavigate }) => {
   const counts = useCounts();
   return (
      <nav aria-label="Tableau de bord" className="flex-1 overflow-y-auto px-3 pb-4">
         {GROUPS.map(([title, items], i) => (
            <div key={i} className={i ? "mt-3.5" : ""}>
               {title && <p className="mb-1 px-3 text-[13px] font-medium text-subtle">{title}</p>}
               <ul className="space-y-0.5">
                  {items.map(([key, label, Icon]) => (
                     <li key={key}>
                        <NavLink
                           to={path(key)}
                           end={!key}
                           onClick={onNavigate}
                           className={({ isActive }) =>
                              `flex h-10 items-center gap-3 rounded-xl px-3 text-[15px] transition-colors lg:h-9 ${isActive ? "bg-fg/[0.13] font-medium text-fg" : "text-muted hover:bg-fg/[0.07] hover:text-fg"}`
                           }
                        >
                           <Icon size={18} strokeWidth={1.8} aria-hidden="true" className="flex-none" />
                           {label}
                           <Count n={counts[key]} />
                        </NavLink>
                     </li>
                  ))}
               </ul>
            </div>
         ))}
      </nav>
   );
};

const Account = ({ email, onLogout }) => (
   <div className="flex-none border-t border-line px-3 py-3">
      <a href="/" target="_blank" rel="noopener noreferrer" className="flex h-10 items-center gap-3 rounded-xl px-3 text-[15px] text-muted transition-colors hover:bg-fg/[0.07] hover:text-fg sm:hidden">
         <ExternalLink size={18} strokeWidth={1.8} aria-hidden="true" />
         Voir le site
      </a>
      <button
         type="button"
         onClick={async () => {
            await api.post("deconnexion").catch(() => {});
            onLogout();
         }}
         className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] text-muted transition-colors hover:bg-fg/[0.07] hover:text-fg"
      >
         <LogOut size={18} strokeWidth={1.8} aria-hidden="true" />
         Se déconnecter
      </button>
      <p className="truncate px-3 pt-2 text-[13px] text-subtle" title={email}>
         {email}
      </p>
   </div>
);

// Recherche rapide (Ctrl K) : pages, demandes, contacts et documents.
const Finder = ({ open, onClose }) => {
   const { leads = [], contacts = [], documents = [], meetings = [] } = useAdmin();
   const navigate = useNavigate();
   const ref = useRef(null);
   const [query, setQuery] = useState("");
   const [active, setActive] = useState(0);

   useEffect(() => {
      if (!open) return;
      setQuery("");
      setActive(0);
      ref.current?.showModal();
   }, [open]);

   const results = useMemo(() => {
      const pages = GROUPS.flatMap(([, items]) => items).map(([key, label, Icon]) => ({ to: path(key), label, kind: "Page", Icon }));
      if (!query.trim()) return pages.slice(0, 8);
      return [
         ...pages.filter((item) => matches(query, item.label)),
         ...leads.filter((lead) => matches(query, lead.name, lead.company, lead.email, lead.phone)).map((lead) => ({ to: `/admin/demandes/${lead.id}`, label: lead.name, kind: lead.company || "Demande", Icon: Inbox })),
         ...documents.filter((doc) => matches(query, doc.number, doc.client.name, doc.client.company)).map((doc) => ({ to: `/admin/documents/${doc.id}`, label: doc.number || "Brouillon", kind: doc.client.company || doc.client.name, Icon: FileText })),
         ...contacts.filter((contact) => matches(query, contact.name, contact.email, contact.phone, contact.company)).map((contact) => ({ to: `/admin/contacts?fiche=${contact.id}`, label: contact.name || contact.email || contact.phone, kind: "Contact", Icon: Users })),
         ...meetings.filter((meeting) => matches(query, meeting.name, meeting.title)).map((meeting) => ({ to: `/admin/rendez-vous?ouvrir=${meeting.id}`, label: meeting.name, kind: "Rendez-vous", Icon: CalendarDays })),
      ].slice(0, 12);
   }, [query, leads, contacts, documents, meetings]);

   if (!open) return null;
   const go = (item) => {
      onClose();
      if (item) navigate(item.to);
   };
   return (
      <dialog
         ref={ref}
         aria-label="Rechercher"
         onCancel={(e) => {
            e.preventDefault();
            onClose();
         }}
         onMouseDown={(e) => e.target === ref.current && onClose()}
         className="mx-auto mt-[12vh] w-[calc(100vw-32px)] max-w-[560px] overflow-hidden rounded-[22px] border border-line bg-ink-2 p-0 shadow-float"
      >
         <div className="flex items-center gap-3 border-b border-line px-5">
            <Search size={18} aria-hidden="true" className="flex-none text-subtle" />
            <input
               autoFocus
               role="combobox"
               aria-expanded="true"
               aria-controls="adm-finder"
               aria-activedescendant={results[active] ? `adm-finder-${active}` : undefined}
               aria-label="Rechercher"
               value={query}
               onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
               }}
               onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                     e.preventDefault();
                     setActive((i) => Math.min(results.length - 1, i + 1));
                  } else if (e.key === "ArrowUp") {
                     e.preventDefault();
                     setActive((i) => Math.max(0, i - 1));
                  } else if (e.key === "Enter") go(results[active]);
               }}
               placeholder="Un nom, un numéro de devis, une page…"
               className="h-14 w-full bg-transparent text-[16px] placeholder:text-subtle focus:outline-none"
            />
            <IconButton label="Fermer" icon={X} onClick={onClose} />
         </div>
         <ul id="adm-finder" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
            {results.map((item, i) => (
               <li key={`${item.to}-${i}`} id={`adm-finder-${i}`} role="option" aria-selected={i === active}>
                  <button type="button" tabIndex={-1} onClick={() => go(item)} onMouseMove={() => setActive(i)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${i === active ? "bg-ink-3" : ""}`}>
                     <item.Icon size={17} aria-hidden="true" className="flex-none text-brand-text" />
                     <span className="min-w-0 flex-1 truncate">{item.label}</span>
                     <span className="truncate text-[13px] text-subtle">{item.kind}</span>
                  </button>
               </li>
            ))}
            {!results.length && <li className="px-3 py-6 text-center text-muted">Aucun résultat</li>}
         </ul>
      </dialog>
   );
};

const Shell = ({ children, email, onLogout }) => {
   const { pathname } = useLocation();
   const { loading, error, refresh, refreshing, services } = useAdmin();
   const counts = useCounts();
   const [menu, setMenu] = useState(false);
   const [finder, setFinder] = useState(false);

   useEffect(() => {
      setMenu(false);
      window.scrollTo({ top: 0, behavior: "instant" });
   }, [pathname]);

   useEffect(() => {
      const onKey = (e) => {
         if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
            e.preventDefault();
            setFinder(true);
         }
         if (e.key === "Escape") setMenu(false);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
   }, []);

   return (
      <div className="min-h-screen lg:pl-[248px]">
         <a href="#adm-contenu" className="sr-only z-[95] rounded-full bg-fg px-5 py-3 font-medium text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
            Aller au contenu
         </a>
         <aside className="band-dark fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col lg:flex">
            <a href="/admin" className="flex-none px-6 pb-4 pt-5" aria-label="Accueil du tableau de bord">
               <Logo width={120} />
            </a>
            <Nav />
            <Account email={email} onLogout={onLogout} />
         </aside>

         {menu && (
            <div className="fixed inset-0 z-[70] lg:hidden">
               <button type="button" aria-label="Fermer le menu" onClick={() => setMenu(false)} className="absolute inset-0 bg-brand-deep/45" />
               <div role="dialog" aria-label="Menu" className="band-dark absolute inset-y-0 right-0 flex w-[min(320px,86vw)] flex-col">
                  <div className="flex items-center justify-between py-4 pl-6 pr-3">
                     <Logo width={108} />
                     <IconButton label="Fermer le menu" icon={X} onClick={() => setMenu(false)} />
                  </div>
                  <Nav onNavigate={() => setMenu(false)} />
                  <Account email={email} onLogout={onLogout} />
               </div>
            </div>
         )}

         <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-ink/95 px-4 py-2.5 sm:px-6 lg:px-9">
            <a href="/admin" className="mr-auto lg:hidden" aria-label="Accueil du tableau de bord">
               <Logo width={92} />
            </a>
            <button
               type="button"
               onClick={() => setFinder(true)}
               aria-label="Rechercher"
               className="mr-auto hidden h-10 w-full max-w-[360px] items-center gap-3 rounded-full border border-line-strong bg-ink-2 px-4 text-[14px] text-subtle transition-colors hover:border-fg/30 lg:flex"
            >
               <Search size={16} aria-hidden="true" />
               Rechercher
               <kbd className="ml-auto font-sans text-[13px]">Ctrl K</kbd>
            </button>
            {services?.local && <span className="hidden rounded-full bg-warn/10 px-3 py-1 text-[13px] font-medium text-warn sm:inline">Local, aucun email ne part</span>}
            <Button size="sm" icon={ExternalLink} href="/" className="max-sm:hidden!">
               Voir le site
            </Button>
            <IconButton label="Rechercher" icon={Search} onClick={() => setFinder(true)} className="lg:hidden" />
            <IconButton label="Actualiser" icon={RefreshCw} onClick={() => refresh()} disabled={refreshing} className={refreshing ? "animate-spin" : ""} />
         </div>

         <main id="adm-contenu" className="mx-auto max-w-[1280px] px-4 pb-28 pt-7 sm:px-6 lg:px-9 lg:pb-14">
            {loading && error ? (
               <div className="py-20 text-center">
                  <p className="text-muted">{error}</p>
                  <Button onClick={() => refresh()} className="mt-4">
                     Réessayer
                  </Button>
               </div>
            ) : loading ? (
               <div aria-busy="true" className="space-y-4">
                  <Skeleton className="h-9 w-64" />
                  <Skeleton className="h-28" />
                  <Skeleton className="h-64" />
               </div>
            ) : (
               children
            )}
         </main>

         <nav aria-label="Raccourcis" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-line bg-ink-2 pb-[env(safe-area-inset-bottom)] lg:hidden">
            {MOBILE.map(([key, label, Icon]) => (
               <NavLink key={key} to={path(key)} end={!key} className={({ isActive }) => `relative flex h-16 flex-col items-center justify-center gap-1 text-[12px] ${isActive ? "font-semibold text-fg" : "text-subtle"}`}>
                  <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
                  {label}
                  {counts[key] > 0 && <span className="tabular absolute left-1/2 top-2 ml-2 rounded-full bg-signal-fill px-1.5 text-[11px] font-semibold text-on-signal">{counts[key]}</span>}
               </NavLink>
            ))}
            <button type="button" onClick={() => setMenu(true)} className="flex h-16 flex-col items-center justify-center gap-1 text-[12px] text-subtle">
               <Menu size={21} strokeWidth={1.8} aria-hidden="true" />
               Menu
            </button>
         </nav>

         <Finder open={finder} onClose={() => setFinder(false)} />
      </div>
   );
};

export default Shell;
