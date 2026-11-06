import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Pill from "./Pill";
import { whatsappLink } from "../data/contact";
import { CONSENT_EVENT, readConsent } from "../utils/consent";
import { EASE } from "../utils/motion";

const onScreen = (el) => {
   if (!el) return false;
   const r = el.getBoundingClientRect();
   return r.top < window.innerHeight && r.bottom > 0;
};

// Sur téléphone, le bouton WhatsApp de l'en-tête est masqué : une barre le remplace dès que le premier écran
// est passé. Elle s'efface devant le bloc de contact et le pied de page, et attend la fermeture de la bannière cookies.
const StickyCta = () => {
   const { t } = useTranslation();
   const { pathname } = useLocation();
   const [show, setShow] = useState(false);

   useEffect(() => {
      let raf = 0;
      const check = () => {
         raf = 0;
         setShow(
            window.scrollY > window.innerHeight * 0.85 &&
               !!readConsent() &&
               !onScreen(document.getElementById("devis")) &&
               !onScreen(document.querySelector("footer"))
         );
      };
      const schedule = () => {
         if (!raf) raf = requestAnimationFrame(check);
      };
      check();
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      window.addEventListener(CONSENT_EVENT, schedule);
      return () => {
         cancelAnimationFrame(raf);
         window.removeEventListener("scroll", schedule);
         window.removeEventListener("resize", schedule);
         window.removeEventListener(CONSENT_EVENT, schedule);
      };
   }, [pathname]);

   return (
      <AnimatePresence>
         {show && (
            <motion.div
               initial={{ y: 96, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: 96, opacity: 0, transition: { duration: 0.25, ease: "easeIn" } }}
               transition={{ duration: 0.5, ease: EASE }}
               className="fixed bottom-6 left-3 right-[92px] z-[55] sm:hidden"
            >
               <Pill
                  href={whatsappLink(t("common.whatsappMessage"))}
                  variant="lit"
                  size="lg"
                  icon={FaWhatsapp}
                  shine
                  className="w-full shadow-lit-bar"
               >
                  {t("common.writeWhatsapp")}
               </Pill>
            </motion.div>
         )}
      </AnimatePresence>
   );
};

export default StickyCta;
