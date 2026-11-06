import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Pill from "./Pill";
import { readConsent, saveConsent } from "../utils/consent";

const GA_ID = import.meta.env.VITE_GA_ID;

const loadGoogleAnalytics = () => {
   if (!GA_ID || document.getElementById("ga-script")) return;
   const script = document.createElement("script");
   script.id = "ga-script";
   script.async = true;
   script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
   document.head.appendChild(script);
   window.dataLayer = window.dataLayer || [];
   function gtag() {
      window.dataLayer.push(arguments);
   }
   window.gtag = gtag;
   gtag("js", new Date());
   gtag("config", GA_ID);
};

const CookieBanner = () => {
   const { t } = useTranslation();
   const [visible, setVisible] = useState(false);

   useEffect(() => {
      const consent = readConsent();
      if (!consent) setVisible(true);
      else if (consent === "accepted") loadGoogleAnalytics();
   }, []);

   const choose = (value) => {
      saveConsent(value);
      if (value === "accepted") loadGoogleAnalytics();
      setVisible(false);
   };

   return (
      <AnimatePresence>
         {visible && (
            <motion.div
               role="region"
               aria-label={t("cookies.title")}
               initial={{ opacity: 0, y: 24 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 24 }}
               transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
               className="fixed bottom-4 left-3 right-[92px] z-[55] flex flex-col gap-3 rounded-[20px] border border-line bg-ink-2 p-4 shadow-float sm:left-5 sm:right-auto sm:max-w-[620px] sm:flex-row sm:items-center sm:gap-5 sm:rounded-full sm:py-2.5 sm:pl-6 sm:pr-2.5"
            >
               <p className="text-[14px] leading-snug text-muted">
                  {t("cookies.text")}{" "}
                  <Link to="/mentions-legales" className="whitespace-nowrap text-brand-text underline hover:text-fg-hover">
                     {t("cookies.learnMore")}
                  </Link>
               </p>
               <div className="flex flex-none gap-2">
                  <Pill size="sm" dot={false} onClick={() => choose("declined")}>
                     {t("cookies.decline")}
                  </Pill>
                  <Pill size="sm" variant="light" dot={false} onClick={() => choose("accepted")}>
                     {t("cookies.accept")}
                  </Pill>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
   );
};

export default CookieBanner;
