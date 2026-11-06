import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { CircleCheck } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import HeroShowcase from "../components/HeroShowcase";
import ParticleField from "../components/ParticleField";
import Pill from "../components/Pill";
import Magnetic from "../components/Magnetic";
import DrawIcon from "../components/DrawIcon";
import SlotText from "../components/SlotText";
import { RevealText, RevealWords } from "../components/Reveal";
import { EASE } from "../utils/motion";
import { whatsappLink } from "../data/contact";

const rise = (delay) => ({
   initial: { opacity: 0, y: 22 },
   animate: { opacity: 1, y: 0 },
   transition: { duration: 0.7, delay, ease: EASE },
});

const HeroSection = () => {
   const { t } = useTranslation();
   const ref = useRef(null);
   const reduce = useReducedMotion();
   const points = t("hero.points", { returnObjects: true });
   const line1 = t("hero.titleLine1");
   const line2Delay = 0.05 + line1.split(" ").length * 0.045 + 0.04;

   // En quittant le premier écran, le texte remonte pendant que la vitrine descend plus lentement que la page.
   // Il ne s'efface qu'une fois presque sorti : sur téléphone, le visiteur le lit encore en défilant.
   const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
   const textY = useTransform(scrollYProgress, [0, 1], [0, -110]);
   const textOpacity = useTransform(scrollYProgress, [0.45, 0.9], [1, 0]);

   return (
      // Bandeau marine de l'accueil, le plus grand du site : les autres pages ont le leur (PageBanner), le reste est clair.
      <section ref={ref} className="band-dark relative isolate overflow-hidden">
         <ParticleField className="terrain-fade" />
         <div className="relative mx-auto grid max-w-[1200px] items-center gap-6 px-5 pb-14 pt-32 sm:px-8 md:pt-40 lg:grid-cols-[1.08fr_0.92fr] lg:gap-4 lg:pb-20 lg:pt-36">
            <motion.div style={reduce ? undefined : { y: textY, opacity: textOpacity }} className="relative z-10">
               {/* Séquence d'ouverture, posée en une seconde environ : les mots du titre montent, le texte sort du flou,
                   puis les actions et les atouts se posent. Le visiteur peut agir avant la fin. */}
               {/* Taille réglée pour que l'accroche tienne sur trois lignes, du petit téléphone au grand écran. */}
               <h1 className="text-[clamp(1.6rem,8.3vw,2.25rem)] font-semibold leading-[1.04] tracking-[-0.035em] sm:text-[clamp(2.25rem,3.9vw,3.5rem)]">
                  <RevealWords text={line1} trigger="load" delay={0.05} className="block text-fg" />{" "}
                  <RevealWords text={t("hero.titleLine2")} trigger="load" delay={line2Delay} className="block text-signal" />
               </h1>

               <RevealText
                  text={t("hero.lead")}
                  trigger="load"
                  fade={false}
                  delay={0.05}
                  className="mt-7 max-w-[54ch] text-[17px] leading-relaxed text-muted sm:text-[18px]"
               />

               <motion.div {...rise(0.3)} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Magnetic className="flex sm:inline-flex">
                     <Pill
                        href={whatsappLink(t("common.whatsappMessage"))}
                        variant="lit"
                        size="lg"
                        icon={FaWhatsapp}
                        shine
                        className="w-full sm:w-auto"
                     >
                        {t("common.writeWhatsapp")}
                     </Pill>
                  </Magnetic>
                  <Magnetic className="flex sm:inline-flex">
                     <Pill href="#devis" size="lg" className="w-full sm:w-auto">
                        {t("common.requestQuote")}
                     </Pill>
                  </Magnetic>
               </motion.div>

               <motion.p {...rise(0.38)} className="mt-5 text-[15px] text-subtle">
                  <SlotText text={t("hero.priceFrom")} trigger="load" delay={0.45} className="tabular font-medium text-fg" />
                  {" · "}
                  {t("hero.priceNote")}
               </motion.p>

               <div className="relative mt-10 max-w-[520px] pt-6">
                  <motion.span
                     aria-hidden="true"
                     initial={{ scaleX: 0 }}
                     animate={{ scaleX: 1 }}
                     transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
                     className="absolute inset-x-0 top-0 h-px origin-left bg-line"
                  />
                  <motion.ul
                     initial="hidden"
                     animate="show"
                     variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.5 } } }}
                     className="grid gap-x-8 gap-y-3 sm:grid-cols-2"
                  >
                     {points.map((point, i) => (
                        <motion.li
                           key={i}
                           variants={{
                              hidden: { opacity: 0, x: -10 },
                              show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
                           }}
                           className="flex items-center gap-2 text-[16px] font-medium text-fg"
                        >
                           <DrawIcon icon={CircleCheck} delay={0.55 + i * 0.07} size={17} strokeWidth={1.8} className="text-signal" />
                           {point}
                        </motion.li>
                     ))}
                  </motion.ul>
               </div>
            </motion.div>

            {/* Un vrai site livré, au-dessus du paysage de points du bandeau. */}
            <HeroShowcase progress={scrollYProgress} />
         </div>
      </section>
   );
};

export default HeroSection;
