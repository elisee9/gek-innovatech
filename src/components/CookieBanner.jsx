import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const GA_ID = import.meta.env.VITE_GA_ID;

const loadGoogleAnalytics = () => {
   if (!GA_ID || document.getElementById("ga-script")) return;
   const script = document.createElement("script");
   script.id = "ga-script";
   script.async = true;
   script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
   document.head.appendChild(script);
   window.dataLayer = window.dataLayer || [];
   function gtag() { window.dataLayer.push(arguments); }
   window.gtag = gtag;
   gtag("js", new Date());
   gtag("config", GA_ID);
};

const CookieBanner = () => {
   const { t } = useTranslation();
   const [visible, setVisible] = useState(false);

   useEffect(() => {
      const consent = localStorage.getItem("cookie-consent");
      if (!consent) {
         setVisible(true);
      } else if (consent === "accepted") {
         loadGoogleAnalytics();
      }
   }, []);

   const handleAccept = () => {
      localStorage.setItem("cookie-consent", "accepted");
      loadGoogleAnalytics();
      setVisible(false);
   };

   const handleDecline = () => {
      localStorage.setItem("cookie-consent", "declined");
      setVisible(false);
   };

   return (
      <AnimatePresence>
         {visible && (
            <motion.div
               initial={{ y: 100, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: 100, opacity: 0 }}
               transition={{ duration: 0.4, ease: "easeOut" }}
               className="fixed bottom-0 left-0 right-0 z-[9999] p-4"
            >
               <div className="max-w-4xl mx-auto bg-[#1E1E1E] border border-white/10 rounded-xl shadow-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1 text-sm text-gray-300 leading-relaxed">
                     <span className="text-white font-semibold">{t("cookies.title")} 🍪</span>{" "}
                     {t("cookies.text")}{" "}
                     <Link to="/mentions-legales" className="text-[#00D2A8] underline hover:text-white transition">
                        {t("cookies.learnMore")}
                     </Link>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                     <button
                        onClick={handleDecline}
                        className="px-5 py-2 text-sm font-semibold rounded-lg border border-white/20 text-gray-300 hover:bg-white/10 transition"
                     >
                        {t("cookies.decline")}
                     </button>
                     <button
                        onClick={handleAccept}
                        className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#005BFF] text-white hover:bg-[#0044cc] transition shadow-lg"
                     >
                        {t("cookies.accept")}
                     </button>
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
   );
};

export default CookieBanner;
