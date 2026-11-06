import { Trans, useTranslation } from "react-i18next";
import { FaWhatsapp } from "react-icons/fa";
import Seo from "../components/Seo";
import Pill from "../components/Pill";
import { RevealGroup, RevealItem } from "../components/Reveal";
import CommitmentsSection from "../sections/CommitmentsSection";
import ProofSection from "../sections/ProofSection";
import ContactSection from "../sections/ContactSection";
import plans from "../data/plans";
import { whatsappLink } from "../data/contact";
import { formatPrice } from "../utils/formatPrice";

const About = () => {
   const { t, i18n } = useTranslation();
   const lang = i18n.resolvedLanguage || i18n.language;
   const amounts = plans.map((p) => p.amount);
   const prices = { min: formatPrice(Math.min(...amounts), lang), max: formatPrice(Math.max(...amounts), lang) };
   const facts = t("about.facts", { returnObjects: true });

   return (
      <>
         <Seo page="about" path="/about" />

         <section className="stage mx-auto max-w-[1200px] px-5 pb-8 pt-14 sm:px-8 md:pt-20">
            <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
               <RevealGroup as="dl" stagger={0.08} delay={0.1} className="self-start">
                  {facts.map((fact, index) => (
                     <RevealItem
                        key={index}
                        ruleTop={index === 0}
                        ruleBottom
                        className="flex flex-col gap-1 py-4 sm:flex-row sm:gap-6"
                     >
                        <dt className="w-32 flex-none text-[14px] text-subtle">{fact.label}</dt>
                        <dd className="text-[16px] text-fg">{fact.value}</dd>
                     </RevealItem>
                  ))}
               </RevealGroup>
               <RevealGroup stagger={0.09} delay={0.15} className="space-y-5 text-[17px] leading-relaxed text-muted">
                  <RevealItem as="p" className="text-[19px] text-fg/90">
                     {t("about.p1")}
                  </RevealItem>
                  <RevealItem as="p">{t("about.p2", prices)}</RevealItem>
                  <RevealItem as="p">
                     <Trans i18nKey="about.p3" components={{ brand: <span className="font-medium text-fg" /> }} />
                  </RevealItem>
                  <RevealItem as="p">{t("about.p4")}</RevealItem>
                  <RevealItem className="flex flex-col gap-3 pt-3 sm:flex-row">
                     <Pill href={whatsappLink(t("common.whatsappMessage"))} variant="lit" size="lg" icon={FaWhatsapp}>
                        {t("common.writeWhatsapp")}
                     </Pill>
                     <Pill to="/services" size="lg">
                        {t("about.cta")}
                     </Pill>
                  </RevealItem>
               </RevealGroup>
            </div>
         </section>

         <CommitmentsSection />
         <ProofSection />
         <ContactSection />
      </>
   );
};

export default About;
