import { lazy, useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useMatches } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBanner from "../components/PageBanner";
import QuietBoundary from "../components/QuietBoundary";
import useStageLights from "../hooks/useStageLights";
import { afterPaint } from "../utils/afterPaint";
import { EASE } from "../utils/motion";

// Éléments secondaires, téléchargés et montés une fois la page affichée : ils ne retardent jamais le premier écran.
const CookieBanner = lazy(() => import("../components/CookieBanner"));
const ChatBot = lazy(() => import("../components/ChatBot"));
const StickyCta = lazy(() => import("../components/StickyCta"));

// À chaque clic sur un lien, remonte en haut de la page, même si c'est la page déjà ouverte,
// ou rejoint l'ancre demandée (#devis…) une fois la page chargée.
// location.key change à chaque clic, y compris quand l'adresse reste la même.
const ScrollManager = () => {
   const { pathname, hash, key } = useLocation();
   const lastPath = useRef(null);

   useEffect(() => {
      const samePage = lastPath.current === pathname;
      lastPath.current = pathname;
      if (!hash) {
         // Nouvelle page : elle s'ouvre directement en haut. Même page : la remontée se voit
         // (« auto » suit index.css : défilement doux, instantané sous « réduire les animations »).
         window.scrollTo({ top: 0, behavior: samePage ? "auto" : "instant" });
         return undefined;
      }
      // L'ancre est cherchée pendant 3 s environ : sur un téléphone lent, le bas de l'accueil se construit après le haut.
      let tries = 0;
      let raf = 0;
      const seek = () => {
         const target = document.getElementById(decodeURIComponent(hash.slice(1)));
         if (target) target.scrollIntoView({ block: "start" });
         else if (tries++ < 180) raf = requestAnimationFrame(seek);
      };
      seek();
      return () => cancelAnimationFrame(raf);
   }, [pathname, hash, key]);

   return null;
};

const MainLayout = () => {
   const { t } = useTranslation();
   const { pathname } = useLocation();
   const matches = useMatches();
   const banner = matches[matches.length - 1]?.handle?.banner;
   const firstPage = useRef(true);
   const [extras, setExtras] = useState(false);
   useStageLights();
   useEffect(() => {
      firstPage.current = false;
      return afterPaint(() => setExtras(true));
   }, []);

   return (
      <div className="relative isolate flex min-h-screen flex-col overflow-x-clip">
         <a
            href="#contenu"
            className="sr-only z-[70] rounded-full bg-fg px-5 py-3 font-medium text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
         >
            {t("common.skipToContent")}
         </a>
         <ScrollManager />
         <Header />
         <main id="contenu" className="relative flex-grow">
            {/* Le bandeau reste en place d'une page à l'autre : son titre s'affiche sans attendre le fichier de la page,
                et l'en-tête clair garde toujours son fond marine. L'accueil a le sien, plus grand (HeroSection). */}
            {banner && (
               <PageBanner
                  title={t(banner.title)}
                  subtitle={banner.subtitle ? t(banner.subtitle) : undefined}
                  crumb={t(banner.crumb)}
               />
            )}
            {/* Changement de page : le contenu se pose en remontant légèrement sous le bandeau.
                À l'arrivée sur le site, et sur l'accueil dont le bandeau doit être là tout de suite, il s'affiche sans attendre. */}
            <motion.div
               key={pathname}
               initial={firstPage.current || !banner ? false : { opacity: 0, y: 16 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.55, ease: EASE }}
            >
               <Outlet />
            </motion.div>
         </main>
         <Footer />
         {extras && (
            <>
               <QuietBoundary>
                  <CookieBanner />
               </QuietBoundary>
               <QuietBoundary>
                  <StickyCta />
               </QuietBoundary>
               <QuietBoundary>
                  <ChatBot />
               </QuietBoundary>
            </>
         )}
      </div>
   );
};

export default MainLayout;
