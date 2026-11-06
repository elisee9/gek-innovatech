import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Check, Clock } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import plans from "../data/plans";
import { whatsappLink } from "../data/contact";
import { formatPrice } from "../utils/formatPrice";
import { EASE, VIEWPORT } from "../utils/motion";
import SectionHeading from "../components/SectionHeading";
import Pill from "../components/Pill";
import LitCard from "../components/LitCard";
import SlotText from "../components/SlotText";
import { Reveal, RevealGroup, RevealItem } from "../components/Reveal";


// Les cartes montent de la profondeur en se redressant, l'une après l'autre.
const cardVariants = {
   hidden: { opacity: 0, y: 90, rotateX: 16 },
   show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.8, ease: EASE } },
};

const checkVariants = {
   hidden: { scale: 0, rotate: -60 },
   show: { scale: 1, rotate: 0, transition: { duration: 0.55, ease: EASE } },
};

const PlanCard = ({ plan, titleAs: Title }) => {
   const { t } = useTranslation();
   const ref = useRef(null);
   // L'anneau de lumière ne tourne que lorsque la carte est à l'écran.
   const live = useInView(ref, { margin: "100px 0px" });
   const featured = plan.recommended === true;
   const message = t("pricing.whatsappPlan", { plan: plan.title, price: plan.price });

   return (
      <motion.article ref={ref} variants={cardVariants} style={{ transformOrigin: "50% 100%" }} className="h-full">
         <LitCard
            tilt={featured ? 3.5 : 5}
            className={`relative flex h-full flex-col rounded-[28px] border p-7 transition-shadow duration-500 sm:p-8 ${
               featured
                  ? `border-brand-text/45 featured-fill shadow-featured hover:shadow-featured-hover ${live ? "is-live" : ""}`
                  : "border-line bg-ink-2 shadow-card hover:shadow-float"
            }`}
         >
            {featured && (
               <>
                  <span aria-hidden="true" className="orbit-glow" />
                  <span aria-hidden="true" className="orbit-ring" />
                  <span aria-hidden="true" className="orbit-cover featured-fill bg-ink-2" />
               </>
            )}

            <div className="flex items-start justify-between gap-4">
               <div>
                  <Title className="text-[22px] font-semibold tracking-[-0.015em]">{plan.title}</Title>
                  <p className="mt-1.5 text-[15px] text-muted lg:min-h-[3em]">{plan.description}</p>
               </div>
               {featured && (
                  <span className="flex-none rounded-full bg-brand px-3 py-1 text-[12px] font-medium text-ink-2">
                     {t("pricing.recommended")}
                  </span>
               )}
            </div>

            <div className="mt-8 flex flex-wrap items-end gap-x-3 gap-y-1">
               <SlotText text={plan.price} delay={0.4} className="tabular text-[52px] font-semibold tracking-[-0.03em]" />
               <span className="pb-2 text-[15px] text-subtle">{t("pricing.period")}</span>
            </div>

            <p className="mt-6 flex items-center gap-2 border-y border-line py-3.5 text-[15px] text-muted">
               <motion.span
                  aria-hidden="true"
                  initial={{ rotate: -270, opacity: 0 }}
                  whileInView={{ rotate: 0, opacity: 1 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
                  className="inline-flex"
               >
                  <Clock size={16} strokeWidth={1.8} className="text-brand-text" />
               </motion.span>
               {t("pricing.delivery")} <strong className="font-medium text-fg">{plan.deliveryTime}</strong>
            </p>

            <RevealGroup as="ul" stagger={0.045} delay={0.45} className="mt-2 flex-1">
               {(plan.features || []).map((feature, index) => (
                  <RevealItem
                     as="li"
                     key={index}
                     ruleTop={index > 0}
                     className="flex items-start gap-3 py-2.5 text-[15px] leading-snug text-fg/85"
                  >
                     <motion.span variants={checkVariants} className="mt-0.5 inline-flex flex-none">
                        <Check size={16} strokeWidth={2.2} className="text-signal" aria-hidden="true" />
                     </motion.span>
                     {feature}
                  </RevealItem>
               ))}
            </RevealGroup>

            <div className="mt-8 flex flex-col gap-3">
               <Pill
                  href={whatsappLink(message)}
                  variant={featured ? "lit" : "ghost"}
                  size="lg"
                  icon={FaWhatsapp}
                  shine={featured}
                  className="w-full"
               >
                  {t("pricing.choose", { plan: plan.title })}
               </Pill>
               {plan.example && plan.example.startsWith("http") && (
                  <a
                     href={plan.example}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="group/link inline-flex items-center justify-center gap-1.5 text-[14px] font-medium text-brand-text hover:underline"
                  >
                     {t("pricing.seeExample")}
                     <ArrowUpRight
                        size={15}
                        aria-hidden="true"
                        className="transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                     />
                  </a>
               )}
            </div>
         </LitCard>
      </motion.article>
   );
};

// heading={false} : sur la page Offres, le titre est déjà dans le bandeau.
const PricingSection = ({ heading = true }) => {
   const { t, i18n } = useTranslation();
   const lang = i18n.resolvedLanguage || i18n.language;
   const translations = t("pricing.plans", { returnObjects: true });
   const merged = plans.map((plan) => ({
      ...plan,
      ...(translations.find((p) => p.id === plan.id) || {}),
      price: formatPrice(plan.amount, lang),
   }));

   return (
      <section id="offres" className="stage mx-auto max-w-[1200px] scroll-mt-28 px-5 py-14 sm:px-8 md:py-20">
         {heading && <SectionHeading className="mb-14" title={t("pricing.title")} subtitle={t("pricing.subtitle")} />}

         <RevealGroup stagger={0.14} className="grid items-stretch gap-5 [perspective:1400px] lg:grid-cols-3">
            {merged.map((plan) => (
               <PlanCard key={plan.id} plan={plan} titleAs={heading ? "h3" : "h2"} />
            ))}
         </RevealGroup>

         <Reveal className="mt-8">
            <LitCard className="flex flex-col items-start gap-4 rounded-[24px] border border-line px-7 py-6 sm:flex-row sm:items-center sm:justify-between">
               <p className="max-w-[60ch] text-[16px] text-muted">{t("pricing.custom")}</p>
               <Pill to={{ pathname: "/", hash: "#devis" }}>{t("common.requestQuote")}</Pill>
            </LitCard>
         </Reveal>
      </section>
   );
};

export default PricingSection;
