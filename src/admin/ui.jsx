import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowUp, Check, CircleAlert, CircleCheck, Info, Languages, LoaderCircle, Search, Sparkles, TriangleAlert, X } from "lucide-react";
import { api } from "./lib/api";
import { initials } from "./lib/format";

// Boutons : plein marine pour valider, contour pour le reste ; le rouge plein reste réservé à WhatsApp, comme sur le site.
const VARIANTS = {
   primary: "bg-fg text-ink-2 hover:bg-fg-hover",
   ghost: "border border-line-strong bg-ink-2 text-fg hover:border-fg/30 hover:bg-ink-3",
   quiet: "text-muted hover:bg-ink-3 hover:text-fg",
   danger: "border border-danger/30 bg-ink-2 text-danger hover:bg-danger/[0.06]",
   whatsapp: "bg-signal-fill text-on-signal hover:bg-signal-fill-hover",
};
const SIZES = { sm: "h-9 px-3.5 text-[14px]", md: "h-11 px-5 text-[15px] sm:h-10 sm:text-[14px]", icon: "h-9 w-9" };
const base = "inline-flex flex-none items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none transition-[background-color,border-color,color,opacity] duration-150 disabled:pointer-events-none disabled:opacity-50";

export const Button = ({ variant = "ghost", size = "md", icon: Icon, busy = false, to, href, className = "", children, ...rest }) => {
   const cls = `${base} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
   const inner = (
      <>
         {busy ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : Icon && <Icon size={16} strokeWidth={2} aria-hidden="true" className="flex-none" />}
         {children}
      </>
   );
   if (to) return <Link to={to} className={cls} {...rest}>{inner}</Link>;
   if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...rest}>{inner}</a>;
   return <button type="button" className={cls} {...rest} disabled={busy || rest.disabled} aria-busy={busy || undefined}>{inner}</button>;
};

export const IconButton = ({ label, icon: Icon, size = 17, className = "", ...rest }) => (
   <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 flex-none items-center justify-center rounded-full text-muted transition-colors hover:bg-ink-3 hover:text-fg disabled:pointer-events-none disabled:opacity-35 sm:h-9 sm:w-9 ${className}`}
      {...rest}
   >
      <Icon size={size} aria-hidden="true" />
   </button>
);

const TONES = {
   signal: "bg-signal/10 text-signal",
   info: "bg-info/10 text-info",
   warn: "bg-warn/10 text-warn",
   ok: "bg-ok/10 text-ok",
   mute: "bg-fg/[0.07] text-muted",
};
export const Badge = ({ tone = "mute", children, dot = true }) => (
   <span className={`inline-flex flex-none items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[13px] font-medium ${TONES[tone]}`}>
      {dot && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
   </span>
);

export const Avatar = ({ name, className = "" }) => (
   <span aria-hidden="true" className={`flex h-9 w-9 flex-none items-center justify-center rounded-full bg-ink-3 text-[13px] font-semibold text-muted ${className}`}>
      {initials(name)}
   </span>
);

export const Panel = ({ title, hint, actions, children, className = "", flush = false }) => (
   <section className={`rounded-[20px] border border-line bg-ink-2 ${className}`}>
      {(title || actions) && (
         <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 pt-5 sm:px-6">
            <div className="min-w-0">
               <h2 className="text-[17px] font-semibold tracking-[-0.01em]">{title}</h2>
               {hint && <p className="mt-0.5 max-w-[68ch] text-[14px] text-muted">{hint}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
         </div>
      )}
      <div className={flush ? "mt-4" : "p-5 sm:p-6"}>{children}</div>
   </section>
);

export const PageHead = ({ title, text, back, children }) => (
   <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
         {back && (
            <Link to={back.to} className="mb-2 inline-flex items-center gap-1.5 text-[14px] font-medium text-muted hover:text-fg">
               <ArrowLeft size={15} aria-hidden="true" />
               {back.label}
            </Link>
         )}
         <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em]">{title}</h1>
         {text && <p className="mt-1.5 max-w-[68ch] text-[15px] text-muted">{text}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
   </header>
);

const control =
   "w-full rounded-xl border border-line-strong bg-ink-2 px-3.5 text-[16px] text-fg placeholder:text-subtle transition-[border-color,box-shadow] duration-150 hover:border-fg/30 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15 disabled:bg-ink disabled:text-muted sm:text-[15px]";

export const Field = ({ label, hint, error, children, className = "", action }) => {
   const id = useId();
   return (
      <div className={className}>
         <div className="mb-1.5 flex min-h-[20px] items-end justify-between gap-3">
            <label htmlFor={id} className="text-[14px] font-medium text-fg/90">
               {label}
            </label>
            {action}
         </div>
         {children({ id, "aria-describedby": hint || error ? `${id}-hint` : undefined, "aria-invalid": error ? true : undefined })}
         {(error || hint) && (
            <p id={`${id}-hint`} className={`mt-1.5 text-[13px] leading-snug ${error ? "text-danger" : "text-subtle"}`}>
               {error || hint}
            </p>
         )}
      </div>
   );
};

export const Input = ({ label, hint, error, action, className, inputClass = "", ...rest }) => (
   <Field label={label} hint={hint} error={error} action={action} className={className}>
      {(aria) => <input {...aria} {...rest} className={`h-11 ${control} ${inputClass}`} />}
   </Field>
);

// La zone de texte grandit avec son contenu.
export const AutoArea = ({ rows = 3, className = "", maxHeight = 520, ...rest }) => {
   const ref = useRef(null);
   useEffect(() => {
      const box = ref.current;
      if (!box) return;
      box.style.height = "auto";
      // Dans une fenêtre pas encore ouverte, la hauteur n'est pas mesurable : le nombre de lignes suffit.
      if (box.scrollHeight) box.style.height = `${Math.min(box.scrollHeight + 2, maxHeight)}px`;
   }, [rest.value, maxHeight]);
   return <textarea ref={ref} rows={rows} {...rest} className={`block resize-none py-2.5 leading-relaxed ${control} ${className}`} />;
};

export const Textarea = ({ label, hint, error, action, className, ...rest }) => (
   <Field label={label} hint={hint} error={error} action={action} className={className}>
      {(aria) => <AutoArea {...aria} {...rest} />}
   </Field>
);

const CHEVRON =
   "appearance-none bg-no-repeat [background-image:url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2216%22%20height=%2216%22%20fill=%22none%22%20stroke=%22%23456189%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3E%3Cpath%20d=%22m4%206%204%204%204-4%22/%3E%3C/svg%3E')] ";
export const SelectBox = ({ options, className = "", ...rest }) => (
   <select {...rest} className={`h-11 ${control} ${CHEVRON} pr-10 [background-position:right_14px_center] ${className}`}>
      {options.map(([value, label]) => (
         <option key={value} value={value}>
            {label}
         </option>
      ))}
   </select>
);
// Petite liste posée à côté d'un bouton ou dans une ligne.
export const MiniSelect = ({ label, options, className = "", ...rest }) => (
   <label>
      <span className="sr-only">{label}</span>
      <select {...rest} className={`h-9 rounded-full border border-line-strong bg-ink-2 pl-3.5 text-[14px] font-medium text-fg transition-colors hover:border-fg/30 ${CHEVRON} [background-position:right_11px_center] pr-8 ${className}`}>
         {options.map(([value, text]) => (
            <option key={value} value={value}>
               {text}
            </option>
         ))}
      </select>
   </label>
);

export const Select = ({ label, hint, error, className, ...rest }) => (
   <Field label={label} hint={hint} error={error} className={className}>
      {(aria) => <SelectBox {...aria} {...rest} />}
   </Field>
);

export const Switch = ({ checked, onChange, label, hint, disabled }) => {
   const id = useId();
   return (
      <div className="flex items-start justify-between gap-5">
         <div className="min-w-0">
            <label htmlFor={id} className="block text-[15px] font-medium">
               {label}
            </label>
            {hint && <p className="mt-0.5 max-w-[60ch] text-[14px] leading-snug text-muted">{hint}</p>}
         </div>
         <button
            id={id}
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`relative mt-0.5 h-7 w-12 flex-none rounded-full transition-colors duration-200 disabled:opacity-50 ${checked ? "bg-fg" : "bg-fg/20"}`}
         >
            <span aria-hidden="true" className={`absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink-2 transition-transform duration-200 ${checked ? "translate-x-5" : ""}`}>
               {checked && <Check size={12} strokeWidth={3} className="text-fg" />}
            </span>
         </button>
      </div>
   );
};

export const Tabs = ({ value, onChange, items, label }) => {
   const ref = useRef(null);
   // Sur téléphone, l'onglet ouvert reste visible même s'il est en fin de rangée.
   useEffect(() => {
      const row = ref.current;
      const tab = row?.querySelector('[aria-selected="true"]');
      if (tab) row.scrollLeft = Math.max(0, tab.offsetLeft - row.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2);
   }, [value]);
   return (
      <div ref={ref} role="tablist" aria-label={label} className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-ink-2 p-1 [scrollbar-width:none]">
         {items.map(([key, text, count]) => (
            <button
               key={key}
               type="button"
               role="tab"
               aria-selected={value === key}
               onClick={() => onChange(key)}
               className={`inline-flex h-9 flex-none items-center gap-2 rounded-full px-4 text-[14px] font-medium transition-colors ${value === key ? "bg-fg text-ink-2" : "text-muted hover:text-fg"}`}
            >
               {text}
               {count !== undefined && <span className={`tabular text-[13px] ${value === key ? "text-ink-2/75" : "text-subtle"}`}>{count}</span>}
            </button>
         ))}
      </div>
   );
};

export const SearchBox = ({ value, onChange, placeholder, className = "" }) => (
   <label className={`relative block ${className}`}>
      <span className="sr-only">{placeholder}</span>
      <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`h-11 pl-10! rounded-full! ${control}`} />
   </label>
);

const NOTE = {
   info: ["border-line bg-ink-3/60", Info, "text-info"],
   warn: ["border-warn/25 bg-warn/[0.06]", TriangleAlert, "text-warn"],
   error: ["border-danger/25 bg-danger/[0.05]", CircleAlert, "text-danger"],
   ok: ["border-ok/25 bg-ok/[0.06]", CircleCheck, "text-ok"],
};
export const Note = ({ tone = "info", children, className = "" }) => {
   const [box, Icon, color] = NOTE[tone];
   return (
      <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-[14px] leading-relaxed ${box} ${className}`}>
         <Icon size={18} aria-hidden="true" className={`mt-0.5 flex-none ${color}`} />
         <div className="min-w-0 flex-1">{children}</div>
      </div>
   );
};

export const Empty = ({ title, text, children }) => (
   <div className="rounded-[20px] border border-dashed border-line-strong px-6 py-12 text-center">
      <p className="text-[17px] font-semibold">{title}</p>
      {text && <p className="mx-auto mt-1.5 max-w-[52ch] text-[15px] text-muted">{text}</p>}
      {children && <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div>}
   </div>
);

export const Skeleton = ({ className = "" }) => <div className={`adm-skeleton ${className}`} />;

// Fenêtre native : le clavier y reste, Échap la ferme. side = panneau latéral.
export const Dialog = ({ open, onClose, title, children, footer, side = false, wide = false }) => {
   const ref = useRef(null);
   const id = useId();
   useEffect(() => {
      const box = ref.current;
      if (!box) return;
      if (open && !box.open) box.showModal();
      if (!open && box.open) box.close();
   }, [open]);
   if (!open) return null;
   return (
      <dialog
         ref={ref}
         aria-labelledby={id}
         onCancel={(e) => {
            e.preventDefault();
            onClose();
         }}
         onMouseDown={(e) => e.target === ref.current && onClose()}
         className={
            side
               ? "adm-drawer w-full max-w-[560px] overflow-hidden border-l border-line bg-ink-2 p-0 shadow-float"
               : `m-auto max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] overflow-hidden rounded-[24px] border border-line bg-ink-2 p-0 shadow-float ${wide ? "max-w-[880px]" : "max-w-[520px]"}`
         }
      >
         <div className={`flex flex-col ${side ? "h-dvh" : "max-h-[calc(100dvh-34px)]"}`}>
            <div className="flex flex-none items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
               <h2 id={id} className="text-[18px] font-semibold tracking-[-0.01em]">
                  {title}
               </h2>
               <IconButton label="Fermer" icon={X} onClick={onClose} />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
            {footer && <div className="flex flex-none flex-wrap justify-end gap-2 border-t border-line px-5 py-4 sm:px-6">{footer}</div>}
         </div>
      </dialog>
   );
};

export const Confirm = ({ open, title, text, action, onConfirm, onClose }) => {
   const [busy, setBusy] = useState(false);
   return (
      <Dialog
         open={open}
         onClose={onClose}
         title={title}
         footer={
            <>
               <Button onClick={onClose}>Annuler</Button>
               <Button
                  variant="danger"
                  busy={busy}
                  onClick={async () => {
                     setBusy(true);
                     await onConfirm();
                     setBusy(false);
                  }}
               >
                  {action}
               </Button>
            </>
         }
      >
         <p className="text-[15px] leading-relaxed text-muted">{text}</p>
      </Dialog>
   );
};

export const Toasts = ({ items }) => (
   <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-24 z-[90] flex flex-col items-center gap-2 lg:bottom-6">
      {items.map((item) => (
         <p key={item.id} className={`flex max-w-[560px] items-start gap-2.5 rounded-2xl px-4 py-3 text-[15px] font-medium shadow-float ${item.tone === "error" ? "bg-danger text-ink-2" : "bg-fg text-ink-2"}`}>
            {item.tone === "error" ? <CircleAlert size={18} className="mt-0.5 flex-none" aria-hidden="true" /> : <CircleCheck size={18} className="mt-0.5 flex-none" aria-hidden="true" />}
            {item.text}
         </p>
      ))}
   </div>
);

// Barre d'enregistrement : visible seulement quand il y a quelque chose à enregistrer.
export const SaveBar = ({ dirty, onSave, onReset, label = "Enregistrer et mettre en ligne" }) => {
   const [busy, setBusy] = useState(false);
   if (!dirty) return null;
   return (
      <div className="sticky bottom-20 z-30 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-line-strong bg-ink-2 px-5 py-3 shadow-float lg:bottom-5">
         <p className="text-[14px] font-medium">Modifications non enregistrées</p>
         <div className="flex flex-wrap gap-2">
            <Button onClick={onReset}>Annuler</Button>
            <Button
               variant="primary"
               busy={busy}
               onClick={async () => {
                  setBusy(true);
                  await onSave();
                  setBusy(false);
               }}
            >
               {label}
            </Button>
         </div>
      </div>
   );
};

export const AiButton = ({ onRun, children, size = "sm", variant = "ghost", disabled }) => {
   const [busy, setBusy] = useState(false);
   return (
      <Button
         size={size}
         variant={variant}
         icon={Sparkles}
         busy={busy}
         disabled={disabled}
         onClick={async () => {
            setBusy(true);
            await onRun();
            setBusy(false);
         }}
      >
         {children}
      </Button>
   );
};

// Texte en français et en anglais, côte à côte ; l'anglais peut être traduit puis relu.
export const Bilingual = ({ label, value, onChange, area = false, rows, hint, onError, placeholder }) => {
   const [busy, setBusy] = useState(false);
   const current = value || { fr: "", en: "" };
   const set = (lang, next) => onChange({ ...current, [lang]: next });
   const translate = async () => {
      setBusy(true);
      try {
         const result = await api.ai("translate", { texts: { text: current.fr }, to: "en" });
         if (result.text) set("en", result.text);
      } catch (error) {
         onError?.(error.message);
      } finally {
         setBusy(false);
      }
   };
   const Component = area ? Textarea : Input;
   return (
      <div className="grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-2">
         <Component label={`${label} · français`} value={current.fr || ""} onChange={(e) => set("fr", e.target.value)} rows={rows} hint={hint} placeholder={placeholder} lang="fr" />
         <Component
            label={`${label} · anglais`}
            value={current.en || ""}
            onChange={(e) => set("en", e.target.value)}
            rows={rows}
            placeholder="Vide : le français s'affiche"
            lang="en"
            action={
               current.fr?.trim() && (
                  <button type="button" onClick={translate} disabled={busy} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-text hover:underline disabled:opacity-50">
                     {busy ? <LoaderCircle size={13} className="animate-spin" aria-hidden="true" /> : <Languages size={13} aria-hidden="true" />}
                     Traduire
                  </button>
               )
            }
         />
      </div>
   );
};

export const moveItem = (list, index, offset) => {
   const next = [...list];
   const target = index + offset;
   if (target < 0 || target >= next.length) return list;
   [next[index], next[target]] = [next[target], next[index]];
   return next;
};

export const MoveButtons = ({ index, count, onMove }) => (
   <>
      <IconButton label="Monter" icon={ArrowUp} disabled={index === 0} onClick={() => onMove(-1)} />
      <IconButton label="Descendre" icon={ArrowDown} disabled={index === count - 1} onClick={() => onMove(1)} />
   </>
);

export const Row = ({ children, className = "", ...rest }) => (
   <li className={`border-t border-line first:border-t-0 ${className}`} {...rest}>
      {children}
   </li>
);

export const Detail = ({ label, children }) =>
   children ? (
      <div className="grid grid-cols-[112px_1fr] gap-3 border-t border-line py-2.5 text-[14px] first:border-t-0">
         <dt className="text-subtle">{label}</dt>
         <dd className="min-w-0 break-words text-fg">{children}</dd>
      </div>
   ) : null;
