import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { EASE } from "../utils/motion";

const ROW = 52; // hauteur d'une option (px), pour savoir s'il reste la place de s'ouvrir vers le bas

// Comparaison sans accents ni majuscules, pour la recherche au clavier.
const plain = (text) =>
   String(text)
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();

// Liste déroulante du site (modèle « select-only combobox » du W3C), à la place du <select> natif
// dont la liste ouverte garde le style du système. Clavier complet, souris et toucher.
// options : [{ value, label, meta }] ; meta s'affiche à droite (prix, délai).
const Select = ({ id, labelId, value, onChange, options, className = "" }) => {
   const listId = useId();
   const root = useRef(null);
   const field = useRef(null);
   const typed = useRef({ text: "", at: 0 });
   const [open, setOpen] = useState(false);
   const [active, setActive] = useState(0);
   const [upward, setUpward] = useState(false);
   const selected = Math.max(0, options.findIndex((option) => option.value === value));
   const last = options.length - 1;
   const optionId = (index) => `${listId}-${index}`;

   const show = (index = selected) => {
      // Vers le haut si la place manque sous le champ (bas d'écran, clavier du téléphone ouvert).
      const box = field.current.getBoundingClientRect();
      const needed = options.length * ROW + 24;
      setUpward(window.innerHeight - box.bottom < needed && box.top > needed);
      setActive(index);
      setOpen(true);
   };

   const choose = (index) => {
      onChange(options[index].value);
      setOpen(false);
   };

   // Un clic ou un toucher hors de la liste la referme.
   useEffect(() => {
      if (!open) return undefined;
      const away = (e) => !root.current?.contains(e.target) && setOpen(false);
      document.addEventListener("pointerdown", away);
      return () => document.removeEventListener("pointerdown", away);
   }, [open]);

   // Les premières lettres tapées désignent une option ; la même lettre répétée passe à la suivante.
   const find = (key) => {
      const now = Date.now();
      const memo = typed.current;
      memo.text = now - memo.at > 700 ? key : memo.text + key;
      memo.at = now;
      const query = plain(memo.text);
      const from = open ? active : selected;
      const offset = query.length === 1 ? 1 : 0;
      for (let k = 0; k < options.length; k++) {
         const index = (from + offset + k) % options.length;
         if (plain(options[index].label).startsWith(query)) return index;
      }
      return -1;
   };

   const printable = (e) => e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey;

   const onKeyDown = (e) => {
      if (!open) {
         if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
            e.preventDefault();
            show();
         } else if (e.key === "Home" || e.key === "End") {
            e.preventDefault();
            show(e.key === "Home" ? 0 : last);
         } else if (printable(e)) {
            const index = find(e.key);
            if (index >= 0) show(index);
         }
         return;
      }
      switch (e.key) {
         case "ArrowDown":
            e.preventDefault();
            setActive((index) => Math.min(last, index + 1));
            break;
         case "ArrowUp":
            e.preventDefault();
            if (e.altKey) choose(active);
            else setActive((index) => Math.max(0, index - 1));
            break;
         case "Home":
         case "PageUp":
            e.preventDefault();
            setActive(0);
            break;
         case "End":
         case "PageDown":
            e.preventDefault();
            setActive(last);
            break;
         case "Enter":
         case " ":
            e.preventDefault();
            choose(active);
            break;
         case "Escape":
            e.preventDefault();
            setOpen(false);
            break;
         case "Tab":
            choose(active);
            break;
         default:
            if (printable(e)) {
               const index = find(e.key);
               if (index >= 0) setActive(index);
            }
      }
   };

   const current = options[selected];

   return (
      <div ref={root} className="relative">
         <div
            ref={field}
            id={id}
            role="combobox"
            tabIndex={0}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            aria-labelledby={labelId}
            aria-activedescendant={open ? optionId(active) : undefined}
            onClick={() => (open ? setOpen(false) : show())}
            onKeyDown={onKeyDown}
            onBlur={() => setOpen(false)}
            className={`flex cursor-pointer select-none items-center gap-3 ${className}`}
         >
            <span className="min-w-0 flex-1 truncate">{current.label}</span>
            <ChevronDown
               size={18}
               aria-hidden="true"
               className={`flex-none text-muted transition-transform duration-300 ease-out ${open ? "rotate-180" : ""}`}
            />
         </div>

         {/* Pendant le choix à la souris ou au doigt, le champ garde le focus (onPointerDown).
             La liste prend au moins la largeur du champ, plus si prix et délai doivent tenir sur la même ligne. */}
         <AnimatePresence>
            {open && (
               <motion.ul
                  id={listId}
                  role="listbox"
                  aria-labelledby={labelId}
                  tabIndex={-1}
                  initial={{ opacity: 0, y: upward ? 6 : -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: upward ? 4 : -4, scale: 0.98, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.2, ease: EASE }}
                  onPointerDown={(e) => e.preventDefault()}
                  className={`absolute right-0 z-30 w-full rounded-2xl sm:w-max sm:min-w-full border border-line bg-ink-2 p-1.5 shadow-float ${
                     upward ? "bottom-full mb-2 origin-bottom" : "top-full mt-2 origin-top"
                  }`}
               >
                  {options.map((option, index) => (
                     <li
                        key={option.value}
                        id={optionId(index)}
                        role="option"
                        aria-selected={index === selected}
                        onPointerEnter={() => setActive(index)}
                        onClick={() => choose(index)}
                        className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-[15px] transition-colors duration-150 ${
                           index === active ? "bg-ink-3" : ""
                        } ${index === selected ? "font-medium text-fg" : "text-muted"}`}
                     >
                        <Check
                           size={16}
                           strokeWidth={2.2}
                           aria-hidden="true"
                           className={`flex-none text-signal ${index === selected ? "" : "invisible"}`}
                        />
                        {/* Prix et délai à droite ; sur un écran trop étroit, ils passent sous le nom de l'offre. */}
                        <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-4">
                           <span className="whitespace-nowrap">{option.label}</span>
                           {option.meta && <span className="tabular whitespace-nowrap text-[14px] font-normal text-subtle">{option.meta}</span>}
                        </span>
                     </li>
                  ))}
               </motion.ul>
            )}
         </AnimatePresence>
      </div>
   );
};

export default Select;
