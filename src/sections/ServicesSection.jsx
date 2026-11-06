import { BarChart3, Cloud, Code2, LayoutTemplate, Palette, Rocket, Search, ShieldCheck, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import SectionHeading from "../components/SectionHeading";
import Pill from "../components/Pill";
import DrawIcon from "../components/DrawIcon";
import { RevealGroup, RevealItem, Unroll } from "../components/Reveal";

// Dans l'ordre des services des fichiers de traduction.
const ICONS = [Code2, LayoutTemplate, Smartphone, BarChart3, Rocket, Palette, Search, Cloud, ShieldCheck];

// Tableau réglé : service, description, et dans quelles offres il est inclus (d'après le détail des offres).
// Il se déroule à son arrivée, chaque icône se dessine, et la rangée survolée s'éclaire sous la souris.
// heading={false} : sur la page Services, le titre est déjà dans le bandeau.
const ServicesSection = ({ heading = true }) => {
   const { t } = useTranslation();
   const items = t("services.items", { returnObjects: true });
   // Hiérarchie des titres : sous le titre de section h2 (accueil) ou directement sous le h1 du bandeau (page Services).
   const RowTitle = heading ? "h3" : "h2";

   return (
      <section className="stage mx-auto max-w-[1200px] px-5 py-14 sm:px-8 md:py-20">
         {heading && (
            <div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
               <SectionHeading align="left" title={t("services.title")} subtitle={t("services.subtitle")} />
               <Pill to="/plans" className="self-start lg:self-auto">
                  {t("services.cta")}
               </Pill>
            </div>
         )}

         <Unroll className="overflow-hidden rounded-[28px] border border-line bg-ink-2 shadow-card">
            <div
               aria-hidden="true"
               className="hidden grid-cols-[minmax(0,260px)_1fr_200px] gap-8 border-b border-line px-7 py-4 text-[13px] font-medium uppercase tracking-[0.08em] text-subtle md:grid"
            >
               <span>{t("services.colService")}</span>
               <span>{t("services.colDescription")}</span>
               <span>{t("services.colIncluded")}</span>
            </div>
            <RevealGroup as="ul" stagger={0.07} delay={0.25}>
               {items.map((service, index) => {
                  const Icon = ICONS[index];
                  const quote = service.includedKey === "quote";
                  const chip = quote ? "border border-line-strong text-muted" : "bg-signal/12 text-signal group-hover:bg-signal/20";
                  return (
                     <RevealItem
                        as="li"
                        key={index}
                        lit
                        ruleTop={index > 0}
                        className="group grid gap-x-8 gap-y-2 px-6 py-5 transition-colors duration-300 hover:bg-ink-3/60 sm:px-7 md:grid-cols-[minmax(0,260px)_1fr_200px] md:items-center"
                     >
                        <div className="flex items-center justify-between gap-4 md:justify-start">
                           <RowTitle className="flex items-center gap-3 text-[17px] font-medium tracking-[-0.01em]">
                              <span className="flex flex-none items-center justify-center rounded-full transition-[border-color,transform] duration-300 ease-out group-hover:scale-110 md:h-9 md:w-9 md:border md:border-line md:bg-ink md:group-hover:border-brand-text/50">
                                 <DrawIcon icon={Icon} delay={0.3 + index * 0.07} size={18} strokeWidth={1.8} className="text-brand-text" />
                              </span>
                              <span className="transition-transform duration-300 ease-out group-hover:translate-x-1">{service.title}</span>
                           </RowTitle>
                           <span className={`flex-none rounded-full px-2.5 py-0.5 text-[12px] font-medium transition-colors md:hidden ${chip}`}>
                              {service.included}
                           </span>
                        </div>
                        <p className="text-[15px] leading-relaxed text-muted transition-colors duration-300 group-hover:text-fg/80">
                           {service.description}
                        </p>
                        <p className="hidden md:block">
                           <span className="sr-only">{t("services.colIncluded")} : </span>
                           <span className={`inline-flex rounded-full px-3 py-1 text-[13px] font-medium transition-colors duration-300 ${chip}`}>
                              {service.included}
                           </span>
                        </p>
                     </RevealItem>
                  );
               })}
            </RevealGroup>
         </Unroll>
      </section>
   );
};

export default ServicesSection;
