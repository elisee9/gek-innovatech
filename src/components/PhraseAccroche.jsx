import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PhraseAccroche = () => {
   const phrases = [
      "Partenaire tech premium pour entreprises ambitieuses.",
      "Sites & apps web ultra-optimisés.",
      "Référencement Google certifié(SEO).",
      "Stratégie digitale clé en main.",
      "Développements sur mesure avec garantie.",
      "Expertise technique labellisée.",
   ];

   const [currentIndex, setCurrentIndex] = useState(0);
   const [isVisible, setIsVisible] = useState(true);

   useEffect(() => {
      const animationCycle = setInterval(() => {
         setIsVisible(false);

         setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % phrases.length);
            setIsVisible(true);
         }, 1000); // Temps de fondu entre les phrases
      }, 10000); // 6s animation + 2s pause

      return () => clearInterval(animationCycle);
   }, []);

   return (
      <div className="relative w-full h-10 overflow-hidden py-1">
         <AnimatePresence mode="wait">
            {isVisible && (
               <motion.div
                  key={currentIndex}
                  initial={{ x: "100vw", opacity: 0 }} // Commence hors écran à droite
                  animate={{
                     x: "-100%", // Va jusqu'au bout à gauche
                     opacity: [0, 1, 1, 0], // Fondu entrant/sortant
                     transition: {
                        x: {
                           duration: 10,
                           ease: "linear",
                        },
                        opacity: {
                           duration: 12,
                           times: [0, 0.1, 0.9, 1],
                           ease: "easeInOut",
                        },
                     },
                  }}
                  className="absolute top-2 whitespace-nowrap md:text-lg font-mono text-white px-2"
               >
                  {phrases[currentIndex]}
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
};

export default PhraseAccroche;
// Ce code définit un composant React qui affiche une phrase d'accroche animée pour un site web.
