import { useRef } from "react";
import { motion, useInView, useReducedMotion, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";
import usePortfolioItems from "../hooks/usePortfolioItems";
import { BROWSER_FRAME, PHONE_FRAME, BrowserScreen, PhoneScreen } from "./PortfolioShowcase";
import { EASE } from "../utils/motion";

// Vitrine du haut de l'accueil : un vrai site livré, sur ordinateur et sur téléphone, plutôt qu'un visuel décoratif.
// En quittant le premier écran, l'ordinateur traîne plus que le téléphone : il paraît plus loin, la profondeur se lit.
const HeroShowcase = ({ progress }) => {
   const { t } = useTranslation();
   const ref = useRef(null);
   const reduce = useReducedMotion();
   const live = useInView(ref);
   const items = usePortfolioItems();
   const item = items.find((p) => p.hero) ?? items.find((p) => p.screens);
   const deskY = useTransform(progress, [0, 1], [0, 120]);
   const phoneY = useTransform(progress, [0, 1], [0, 40]);

   if (!item) return null;

   return (
      // Sur grand écran, la vitrine déborde un peu de sa colonne vers la marge : elle pèse autant que le titre.
      <div ref={ref} className={`relative mx-auto w-full max-w-[440px] sm:max-w-[540px] lg:w-[112%] lg:max-w-none ${live ? "is-live" : ""}`}>
         <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, delay: 0.1, ease: EASE }}
            className="absolute inset-[4%] rounded-full glow-hero"
         />
         <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t("portfolio.visit")} : ${item.title}`}
            className="group relative block pb-[16%] pl-[14%]"
         >
            <motion.div style={reduce ? undefined : { y: deskY }}>
               <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
                  className={`${BROWSER_FRAME} transition-[border-color] duration-500 group-hover:border-brand-text/50`}
               >
                  <BrowserScreen item={item} loading="eager" />
               </motion.div>
            </motion.div>

            <motion.div style={reduce ? undefined : { y: phoneY }} className="absolute bottom-0 left-0 w-[27%] min-w-[92px] max-w-[160px]">
               <motion.div
                  initial={{ opacity: 0, y: 70, rotate: 0 }}
                  animate={{ opacity: 1, y: 0, rotate: -4 }}
                  transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
                  className={PHONE_FRAME}
               >
                  <PhoneScreen item={item} loading="eager" />
               </motion.div>
            </motion.div>

            {/* Le site est réellement en ligne : l'étiquette le dit, avec l'offre qui l'a produit. */}
            <motion.span
               initial={{ opacity: 0, y: 12 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.7, delay: 0.7, ease: EASE }}
               className="absolute bottom-[4%] right-0 inline-flex items-center gap-2 rounded-full border border-line-strong bg-ink-2 px-3.5 py-2 text-[13px] text-muted shadow-float"
            >
               <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 rounded-full bg-signal motion-safe:animate-ping" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-signal" />
               </span>
               <span className="font-medium text-fg">{t("portfolio.live")}</span>
               <span aria-hidden="true">·</span>
               {t(`portfolio.filters.${item.planId}`)}
            </motion.span>
         </a>
      </div>
   );
};

export default HeroShowcase;
