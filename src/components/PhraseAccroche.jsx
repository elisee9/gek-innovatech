import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const PhraseAccroche = () => {
   const { t } = useTranslation();
   const phrases = t("phraseAccroche.phrases", { returnObjects: true });

   const [currentIndex, setCurrentIndex] = useState(0);
   const [isVisible, setIsVisible] = useState(true);

   useEffect(() => {
      const animationCycle = setInterval(() => {
         setIsVisible(false);
         setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % phrases.length);
            setIsVisible(true);
         }, 1000);
      }, 10000);

      return () => clearInterval(animationCycle);
   }, [phrases.length]);

   return (
      <div className="relative w-full h-10 overflow-hidden py-1">
         <AnimatePresence mode="wait">
            {isVisible && (
               <motion.div
                  key={currentIndex}
                  initial={{ x: "100vw", opacity: 0 }}
                  animate={{
                     x: "-100%",
                     opacity: [0, 1, 1, 0],
                     transition: {
                        x: { duration: 10, ease: "linear" },
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
