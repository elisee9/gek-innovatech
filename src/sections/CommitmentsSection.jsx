import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import plans from "../data/plans";
import { formatPrice } from "../utils/formatPrice";
import SectionHeading from "../components/SectionHeading";
import SlotText from "../components/SlotText";
import { RevealGroup, RevealItem, RevealWords } from "../components/Reveal";

const DEMO_URL = "https://gek-beaute-elegance.netlify.app";

// Engagements vérifiables, en rangées réglées : prix, délais, contact, suivi, démo.
// Les valeurs chiffrées défilent comme un compteur ; les autres montent mot à mot.
const CommitmentsSection = () => {
   const { t, i18n } = useTranslation();
   const lang = i18n.resolvedLanguage || i18n.language;
   const amounts = plans.map((p) => p.amount);
   const range = t("commitments.priceRange", {
      min: formatPrice(Math.min(...amounts), lang),
      max: formatPrice(Math.max(...amounts), lang),
   });
   const rows = t("commitments.rows", { returnObjects: true });
   const values = [range, ...rows.slice(1).map((row) => row.value)];

   return (
      <section className="stage mx-auto max-w-[1200px] px-5 py-14 sm:px-8 md:py-20">
         <SectionHeading align="left" title={t("commitments.title")} subtitle={t("commitments.subtitle")} />
         <RevealGroup as="dl" stagger={0.1} className="mt-12">
            {rows.map((row, index) => (
               <RevealItem
                  key={index}
                  lit
                  ruleTop={index === 0}
                  ruleBottom
                  className="group flex flex-col gap-y-1.5 py-6 md:grid md:grid-cols-[180px_minmax(0,300px)_1fr] md:items-baseline md:gap-x-10 md:py-7"
               >
                  {/* Sur mobile, le libellé passe sous la valeur (légende), jamais au-dessus. */}
                  <dt className="order-2 text-[14px] text-subtle transition-colors duration-300 group-hover:text-brand-text md:order-none md:font-medium md:uppercase md:tracking-[0.08em]">
                     {row.label}
                  </dt>
                  <dd className="tabular order-1 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-fg md:order-none md:text-[30px]">
                     {/\d/.test(values[index]) ? (
                        <SlotText text={values[index]} delay={0.2} />
                     ) : (
                        <RevealWords text={values[index]} delay={0.15} />
                     )}
                  </dd>
                  <dd className="order-3 mt-1.5 max-w-[56ch] text-[16px] leading-relaxed text-muted transition-colors duration-300 group-hover:text-fg/80 md:order-none md:mt-0">
                     {row.text}
                     {index === rows.length - 1 && (
                        <>
                           {" "}
                           <a
                              href={DEMO_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/link inline-flex items-center gap-1 font-medium text-brand-text hover:underline"
                           >
                              {t("portfolio.visit")}
                              <ArrowUpRight
                                 size={15}
                                 aria-hidden="true"
                                 className="transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                              />
                           </a>
                        </>
                     )}
                  </dd>
               </RevealItem>
            ))}
         </RevealGroup>
      </section>
   );
};

export default CommitmentsSection;
