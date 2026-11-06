import { useTranslation } from "react-i18next";
import usePortfolioItems from "../hooks/usePortfolioItems";
import SectionHeading from "../components/SectionHeading";
import { ExampleList, FeaturedProject } from "../components/PortfolioShowcase";
import Pill from "../components/Pill";
import { RevealWords } from "../components/Reveal";

const PortfolioSection = () => {
   const { t } = useTranslation();
   const items = usePortfolioItems();
   const featured = items.find((item) => item.screens);
   const examples = items.filter((item) => !item.screens).slice(0, 3);

   return (
      <section className="stage mx-auto max-w-[1200px] px-5 py-14 sm:px-8 md:py-20">
         <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading align="left" title={t("portfolio.sectionTitle")} subtitle={t("portfolio.subtitle")} />
            <Pill to="/portfolio" className="self-start lg:self-auto">
               {t("portfolio.viewAll")}
            </Pill>
         </div>
         {featured && (
            <div className="mt-12">
               <FeaturedProject item={featured} />
            </div>
         )}
         <h3 className="mt-16 text-[clamp(1.5rem,2.4vw,1.9rem)] font-semibold tracking-[-0.02em]">
            <RevealWords text={t("portfolio.othersTitle")} />
         </h3>
         <div className="mt-5">
            <ExampleList items={examples} />
         </div>
      </section>
   );
};

export default PortfolioSection;
