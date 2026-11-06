import { useState } from "react";
import { useTranslation } from "react-i18next";
import Seo from "../components/Seo";
import { RevealWords } from "../components/Reveal";
import { ExampleList, FeaturedProject } from "../components/PortfolioShowcase";
import ContactSection from "../sections/ContactSection";
import usePortfolioItems from "../hooks/usePortfolioItems";

const FILTER_IDS = ["all", "basic", "standard", "premium"];

const Portfolio = () => {
   const { t } = useTranslation();
   const [selected, setSelected] = useState("all");
   const items = usePortfolioItems();
   const featured = items.find((item) => item.screens);
   const examples = items.filter((item) => !item.screens && (selected === "all" || item.planId === selected));

   return (
      <>
         <Seo page="portfolio" path="/portfolio" />

         <section className="stage mx-auto max-w-[1200px] px-5 py-14 sm:px-8 md:py-20">
            {featured && (
               <div className="mb-20">
                  <FeaturedProject item={featured} titleAs="h2" />
               </div>
            )}

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
               <h2 className="text-[clamp(1.6rem,2.6vw,2.1rem)] font-semibold tracking-[-0.02em]">
                  <RevealWords text={t("portfolio.othersTitle")} />
               </h2>
               <div role="group" aria-label={t("portfolio.filterLabel")} className="flex flex-wrap gap-2">
                  {FILTER_IDS.map((id) => (
                     <button
                        key={id}
                        type="button"
                        onClick={() => setSelected(id)}
                        aria-pressed={selected === id}
                        className={`h-10 rounded-full border px-4 text-[14px] font-medium transition-colors ${
                           selected === id
                              ? "border-fg bg-fg text-ink"
                              : "border-line-strong bg-ink-2 text-muted hover:border-fg/30 hover:text-fg"
                        }`}
                     >
                        {t(`portfolio.filters.${id}`)}
                     </button>
                  ))}
               </div>
            </div>
            <div className="mt-6">
               <ExampleList items={examples} titleAs="h3" />
            </div>
         </section>

         <ContactSection />
      </>
   );
};

export default Portfolio;
