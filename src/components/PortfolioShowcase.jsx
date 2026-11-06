import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Reveal, RevealGroup, RevealItem } from "./Reveal";
import { EASE, VIEWPORT } from "../utils/motion";

const host = (url) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

// Vitesse de défilement constante, quelle que soit la hauteur de la capture : environ 125 px de capture par seconde
// sur ordinateur, 250 sur téléphone (une capture plus large défile plus lentement à l'écran), et jamais moins de 16 s.
const scrollDuration = (height, pxPerSecond) => `${Math.max(16, Math.round(height / pxPerSecond))}s`;

// Cadres d'ordinateur et de téléphone autour des captures pleine page réelles, qui défilent (.site-scroll)
// tant qu'un parent porte .is-live. Partagés par la vitrine du haut de l'accueil et la section Réalisations.
export const BROWSER_FRAME =
   "overflow-hidden rounded-[18px] border border-line-strong bg-ink-3 shadow-frame";
export const PHONE_FRAME =
   "overflow-hidden rounded-[22px] border-[5px] border-ink-3 bg-ink-3 shadow-frame ring-1 ring-line-strong";

export const BrowserScreen = ({ item, loading = "lazy" }) => {
   const { t } = useTranslation();
   const [width, height] = item.screens.desktopSize;
   return (
      <>
         <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <span aria-hidden="true" className="flex gap-1.5">
               <span className="h-2.5 w-2.5 rounded-full bg-fg/15" />
               <span className="h-2.5 w-2.5 rounded-full bg-fg/15" />
               <span className="h-2.5 w-2.5 rounded-full bg-fg/15" />
            </span>
            <span className="truncate rounded-full bg-ink-2 px-3 py-1 text-[12px] text-subtle">{host(item.link)}</span>
         </div>
         <div className="site-window relative aspect-[16/10] overflow-hidden bg-white">
            <img
               src={item.screens.desktop}
               alt={t("portfolio.screenDesktop", { title: item.title })}
               width={width}
               height={height}
               loading={loading}
               className="site-scroll"
               style={{ "--scroll-dur": scrollDuration(height, 125) }}
            />
         </div>
      </>
   );
};

export const PhoneScreen = ({ item, loading = "lazy" }) => {
   const { t } = useTranslation();
   const [width, height] = item.screens.mobileSize;
   return (
      <div className="site-window relative aspect-[9/19.5] overflow-hidden rounded-[16px] bg-white">
         <img
            src={item.screens.mobile}
            alt={t("portfolio.screenMobile", { title: item.title })}
            width={width}
            height={height}
            loading={loading}
            className="site-scroll"
            style={{ "--scroll-dur": scrollDuration(height, 250), "--scroll-delay": "-4s" }}
         />
      </div>
   );
};

// Vraie réalisation en ligne : captures pleine page réelles qui défilent dans un cadre de navigateur et de téléphone.
// Le téléphone arrive après l'écran d'ordinateur et glisse à une autre vitesse au défilement : c'est le même site, en mobile.
// titleAs : h3 sous le titre de section de l'accueil, h2 directement sous le h1 du bandeau (page Réalisations).
export const FeaturedProject = ({ item, titleAs: Title = "h3" }) => {
   const { t } = useTranslation();
   const ref = useRef(null);
   const reduce = useReducedMotion();
   const live = useInView(ref, { margin: "0px 0px -10% 0px" });
   const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
   // Amplitude bornée par l'espace sous le cadre : le téléphone ne descend jamais sur le titre suivant.
   const deskY = useTransform(scrollYProgress, [0, 1], [24, -24]);
   const phoneY = useTransform(scrollYProgress, [0, 1], [48, -72]);
   const phoneRotate = useTransform(scrollYProgress, [0, 1], [5, -3]);

   return (
      <article ref={ref} className={`grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-end lg:gap-12 ${live ? "is-live" : ""}`}>
         <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t("portfolio.visit")} : ${item.title}`}
            className="group relative block pb-10 pr-8 sm:pb-14 sm:pr-14"
         >
            <motion.div style={reduce ? undefined : { y: deskY }}>
               <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.85, ease: EASE }}
                  className={`${BROWSER_FRAME} transition-[border-color] duration-500 group-hover:border-brand-text/50`}
               >
                  <BrowserScreen item={item} />
               </motion.div>
            </motion.div>
            <motion.div
               style={reduce ? undefined : { y: phoneY, rotate: phoneRotate }}
               className="absolute bottom-0 right-0 w-[28%] min-w-[110px] max-w-[190px]"
            >
               <motion.div
                  initial={{ opacity: 0, y: 70 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.85, delay: 0.25, ease: EASE }}
                  className={PHONE_FRAME}
               >
                  <PhoneScreen item={item} />
               </motion.div>
            </motion.div>
         </a>
         <Reveal delay={0.2}>
            <span className="inline-flex items-center gap-2 text-[13px] font-medium text-muted">
               <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 rounded-full bg-signal motion-safe:animate-ping" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-signal" />
               </span>
               {t("portfolio.live")} · {t(`portfolio.filters.${item.planId}`)}
            </span>
            <Title className="mt-4 text-[26px] font-semibold leading-tight tracking-[-0.02em]">{item.title}</Title>
            <p className="mt-3 text-[16px] leading-relaxed text-muted">{item.description}</p>
            <a
               href={item.link}
               target="_blank"
               rel="noopener noreferrer"
               className="group/link mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-brand-text hover:underline"
            >
               {t("portfolio.visit")}
               <ArrowUpRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
               />
            </a>
         </Reveal>
      </article>
   );
};

// Types de sites proposés : rangées réglées, sans visuel tant qu'aucune vraie capture n'existe.
export const ExampleList = ({ items, titleAs: Title = "h4" }) => {
   const { t } = useTranslation();
   if (!items.length) {
      return <p className="rounded-[24px] border border-line p-8 text-[16px] text-muted">{t("portfolio.noExamples")}</p>;
   }
   return (
      // La clé change avec la liste filtrée : les filets se retracent à chaque filtre.
      <RevealGroup as="ul" stagger={0.09} key={items.map((item) => item.id).join("-")}>
         {items.map((item, index) => (
            <RevealItem
               as="li"
               key={item.id}
               lit
               ruleTop={index === 0}
               ruleBottom
               className="group grid gap-x-8 gap-y-2 py-5 md:grid-cols-[minmax(0,260px)_1fr_auto] md:items-center"
            >
               <div className="flex items-center justify-between gap-4 md:block">
                  <Title className="text-[17px] font-medium tracking-[-0.01em] transition-transform duration-300 ease-out group-hover:translate-x-1">
                     {item.title}
                  </Title>
                  <span className="text-[13px] text-subtle md:mt-1 md:block">{t(`portfolio.filters.${item.planId}`)}</span>
               </div>
               <p className="text-[15px] leading-relaxed text-muted transition-colors duration-300 group-hover:text-fg/80">{item.description}</p>
               <Link
                  to={{ pathname: "/", hash: "#devis" }}
                  className="inline-flex items-center gap-1.5 self-start text-[15px] font-medium text-brand-text hover:underline md:self-auto"
               >
                  {t("portfolio.requestSite")}
                  <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-300 ease-out group-hover:translate-x-1" />
               </Link>
            </RevealItem>
         ))}
      </RevealGroup>
   );
};
