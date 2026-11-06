import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import ParticleField from "./ParticleField";
import { RevealText, RevealWords } from "./Reveal";
import { SITE } from "../data/contact";
import { EASE } from "../utils/motion";

const Breadcrumbs = ({ current }) => {
   const { t } = useTranslation();
   const { pathname } = useLocation();
   return (
      <nav aria-label={t("common.breadcrumbLabel")}>
         <ol className="flex flex-wrap items-center gap-x-2 text-[15px]">
            <li>
               {/* Zone de toucher agrandie au doigt, sans décaler la ligne. */}
               <Link to="/" className="-my-2 inline-block rounded py-2 text-muted transition-colors hover:text-fg hover:underline">
                  {t("header.home")}
               </Link>
            </li>
            <li aria-hidden="true" className="flex">
               <ChevronRight size={15} strokeWidth={2.2} className="text-signal" />
            </li>
            <motion.li
               key={pathname}
               aria-current="page"
               initial={{ opacity: 0, x: -6 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.4, ease: EASE }}
               className="font-medium text-fg"
            >
               {current}
            </motion.li>
         </ol>
      </nav>
   );
};

// Bandeau du haut de chaque page, même famille que celui de l'accueil : fond marine, paysage de points, fil d'Ariane et titre.
// Hauteur minimale commune et texte calé en bas : d'une page à l'autre, le contenu commence au même endroit.
// structured : déclare aussi le fil d'Ariane à Google (sans objet sur une page d'erreur, dont l'adresse est quelconque).
const PageBanner = ({ title, subtitle, crumb, structured = true, children }) => {
   const { t } = useTranslation();
   const { pathname } = useLocation();

   return (
      <section className="band-dark relative isolate flex min-h-[320px] flex-col justify-end overflow-hidden md:min-h-[420px]">
         {structured && (
            <Helmet>
               <script type="application/ld+json">
                  {JSON.stringify({
                     "@context": "https://schema.org",
                     "@type": "BreadcrumbList",
                     itemListElement: [
                        { "@type": "ListItem", position: 1, name: t("header.home"), item: `${SITE}/` },
                        { "@type": "ListItem", position: 2, name: crumb, item: `${SITE}${pathname}` },
                     ],
                  })}
               </script>
            </Helmet>
         )}
         <ParticleField className="terrain-fade" />
         {/* Pages hors mise en page, sans en-tête : leur logo se pose en haut du bandeau, aligné sur le contenu. */}
         {children && <div className="absolute inset-x-0 top-0 z-10 mx-auto w-full max-w-[1200px] px-5 pt-6 sm:px-8">{children}</div>}
         <div className="relative mx-auto w-full max-w-[1200px] px-5 pb-10 pt-28 sm:px-8 md:pb-14 md:pt-32">
            <Breadcrumbs current={crumb} />
            {/* La clé rejoue l'entrée du titre à chaque page, pas au changement de langue : le bandeau, lui, reste en place. */}
            <h1 className="mt-4 text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-fg">
               <RevealWords key={pathname} text={title} trigger="load" delay={0.05} />
            </h1>
            {subtitle && (
               <RevealText
                  key={pathname}
                  text={subtitle}
                  trigger="load"
                  fade={false}
                  delay={0.05}
                  className="mt-5 max-w-[60ch] text-[17px] leading-relaxed text-muted"
               />
            )}
         </div>
      </section>
   );
};

export default PageBanner;
