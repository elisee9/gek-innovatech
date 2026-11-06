import { motion, useReducedMotion } from "framer-motion";
import useLight from "../hooks/useLight";
import useTextChanged from "../hooks/useTextChanged";
import { EASE, VIEWPORT } from "../utils/motion";

// Vocabulaire de mouvement du site, un geste par rôle :
// les titres montent mot à mot en pivotant derrière une ligne de coupe, les paragraphes sortent du flou d'un bloc,
// les filets sont tracés par un point de lumière, les blocs se posent, les tableaux se déroulent.
// Sous « réduire les animations », MotionConfig (App.jsx) supprime les déplacements et garde les fondus.

const wordVariants = {
   hidden: { y: "115%", rotate: 6, opacity: 0 },
   show: { y: "0%", rotate: 0, opacity: 1, transition: { duration: 0.75, ease: EASE } },
};

// Titre découpé en mots. trigger="load" pour le premier écran, sinon à l'entrée dans la fenêtre.
export const RevealWords = ({ text, delay = 0, stagger = 0.045, trigger = "view", className = "" }) => {
   const translated = useTextChanged(text);
   if (translated) return <span className={className}>{text}</span>;

   // Coupe sur les espaces ordinaires seulement : une espace insécable garde deux mots ensemble (« le web »).
   const words = String(text).split(/ +/).filter(Boolean);
   const play = trigger === "load" ? { animate: "show" } : { whileInView: "show", viewport: VIEWPORT };
   return (
      <motion.span
         className={className}
         initial="hidden"
         {...play}
         variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      >
         {words.map((word, i) => (
            <span key={`${word}-${i}`}>
               {/* La marge basse évite de couper les jambages (g, p, j) pendant la montée. */}
               <span className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-top">
                  <motion.span className="inline-block origin-[0%_100%]" variants={wordVariants}>
                     {word}
                  </motion.span>
               </span>
               {i < words.length - 1 && " "}
            </span>
         ))}
      </motion.span>
   );
};

// Le filtre est retiré à la fin de l'entrée : laissé en place, même à 0 px, il adoucit le texte.
const wash = (delay, fade) => ({
   hidden: { opacity: fade ? 0 : 1, filter: "blur(6px)", y: 12 },
   show: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.6, delay, ease: EASE }, transitionEnd: { filter: "none" } },
});

// Paragraphe qui sort du flou d'un seul bloc : un seul élément animé, quelle que soit la longueur du texte
// (un flou par mot coûtait des centaines d'animations au chargement, surtout sur téléphone).
// fade={false} : le texte est là dès la première image et se précise (premier écran, compté tout de suite comme affiché).
export const RevealText = ({ as = "p", text, delay = 0, trigger = "view", fade = true, className = "" }) => {
   const Comp = motion[as];
   const play = trigger === "load" ? { animate: "show" } : { whileInView: "show", viewport: VIEWPORT };
   return (
      <Comp className={className} initial="hidden" {...play} variants={wash(delay, fade)}>
         {text}
      </Comp>
   );
};

// Conteneur qui déclenche ses enfants en cascade lorsqu'il entre dans la fenêtre.
export const RevealGroup = ({ as = "div", stagger = 0.07, delay = 0, className = "", children, ...rest }) => {
   const Comp = motion[as];
   return (
      <Comp
         className={className}
         initial="hidden"
         whileInView="show"
         viewport={VIEWPORT}
         variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
         {...rest}
      >
         {children}
      </Comp>
   );
};

const itemVariants = {
   hidden: { opacity: 0, y: 22 },
   show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const ruleVariants = {
   hidden: { x: "-101%" },
   show: { x: "0%", transition: { duration: 0.9, ease: EASE } },
};

const tipVariants = {
   hidden: { opacity: 1 },
   show: { opacity: 0, transition: { duration: 0.6, delay: 0.55, ease: "easeOut" } },
};

// Filet tracé par la lumière : la ligne glisse depuis la gauche, une tête rouge la précède puis s'éteint.
const Rule = ({ position }) => (
   <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 h-px overflow-x-clip ${position === "top" ? "top-0" : "bottom-0"}`}
   >
      <motion.span variants={ruleVariants} className="absolute inset-0 block">
         <span className="absolute inset-0 bg-line" />
         <motion.span variants={tipVariants} className="absolute inset-y-0 right-0 block w-40 motion-reduce:hidden">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent to-signal/80" />
            <span className="absolute -right-0.5 -top-[2px] h-[5px] w-[5px] rounded-full bg-signal shadow-spark" />
         </motion.span>
      </motion.span>
   </span>
);

// Élément d'un groupe : il monte en fondu ; ruleTop / ruleBottom tracent son filet ;
// lit allume un halo qui suit la souris (rangées de tableaux et de listes).
export const RevealItem = ({ as = "div", ruleTop = false, ruleBottom = false, lit = false, className = "", children, ...rest }) => {
   const Comp = motion[as];
   const light = useLight({ sweep: false });
   const ruled = ruleTop || ruleBottom;
   return (
      <Comp
         ref={lit ? light.ref : undefined}
         {...(lit ? light.handlers : {})}
         className={`${ruled ? "relative" : ""} ${lit ? "lit-card lit-card--soft" : ""} ${className}`}
         variants={itemVariants}
         {...rest}
      >
         {ruleTop && <Rule position="top" />}
         {children}
         {ruleBottom && <Rule position="bottom" />}
      </Comp>
   );
};

// Bloc isolé (paragraphe, carte, formulaire) qui se pose à son entrée dans la fenêtre.
export const Reveal = ({ as = "div", delay = 0, className = "", children, ...rest }) => {
   const Comp = motion[as];
   return (
      <Comp
         className={className}
         initial={{ opacity: 0, y: 24 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={VIEWPORT}
         transition={{ duration: 0.7, delay, ease: EASE }}
         {...rest}
      >
         {children}
      </Comp>
   );
};

// Tableau qui se déroule de haut en bas, comme une feuille qu'on tire (masque d'écrêtage).
export const Unroll = ({ delay = 0, radius = 28, className = "", children, ...rest }) => {
   const reduce = useReducedMotion();
   const closed = `inset(0% 0% 100% 0% round ${radius}px)`;
   const open = `inset(0% 0% 0% 0% round ${radius}px)`;
   return (
      <motion.div
         className={className}
         initial={reduce ? { opacity: 0 } : { clipPath: closed, opacity: 0.4 }}
         whileInView={reduce ? { opacity: 1 } : { clipPath: open, opacity: 1 }}
         viewport={VIEWPORT}
         transition={{ duration: 1, delay, ease: EASE }}
         {...rest}
      >
         {children}
      </motion.div>
   );
};
