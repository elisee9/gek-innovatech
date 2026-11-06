import { motion } from "framer-motion";
import useTextChanged from "../hooks/useTextChanged";
import { EASE, VIEWPORT } from "../utils/motion";

// Deux tours de chiffres : chaque colonne déroule au moins un tour complet avant de se poser.
const STRIP = [..."01234567890123456789"];
const LINE = "1.1em";

const digitVariants = (digit) => ({
   hidden: { y: "0%" },
   show: { y: `${-((10 + digit) / STRIP.length) * 100}%`, transition: { duration: 1.2, ease: EASE } },
});

const runVariants = {
   hidden: { opacity: 0 },
   show: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

// Texte dont les chiffres défilent comme un compteur avant de se poser (prix, délais).
// Le texte réel reste lisible par les lecteurs d'écran ; le compteur visible leur est masqué.
const SlotText = ({ text, trigger = "view", delay = 0, stagger = 0.09, className = "" }) => {
   const value = String(text);
   const translated = useTextChanged(value);
   if (translated) {
      return (
         <span className={`inline-flex items-start whitespace-pre ${className}`} style={{ lineHeight: LINE }}>
            {value}
         </span>
      );
   }

   const tokens = value.match(/\d|\D+/g) || [];
   const play = trigger === "load" ? { animate: "show" } : { whileInView: "show", viewport: VIEWPORT };

   return (
      <motion.span
         className={`inline-flex items-start ${className}`}
         style={{ lineHeight: LINE }}
         initial="hidden"
         {...play}
         variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      >
         <span className="sr-only">{value}</span>
         {tokens.map((token, i) =>
            /\d/.test(token) ? (
               <span key={i} aria-hidden="true" className="inline-block select-none overflow-hidden" style={{ height: LINE }}>
                  <motion.span className="block" variants={digitVariants(Number(token))}>
                     {STRIP.map((d, k) => (
                        <span key={k} className="block" style={{ height: LINE }}>
                           {d}
                        </span>
                     ))}
                  </motion.span>
               </span>
            ) : (
               <motion.span key={i} aria-hidden="true" className="whitespace-pre" variants={runVariants}>
                  {token}
               </motion.span>
            )
         )}
      </motion.span>
   );
};

export default SlotText;
