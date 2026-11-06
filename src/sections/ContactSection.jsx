import { Mail, MapPin, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import ContactForm from "../components/ContactForm";
import Pill from "../components/Pill";
import LitCard from "../components/LitCard";
import DrawIcon from "../components/DrawIcon";
import { Reveal, RevealGroup, RevealItem, RevealText, RevealWords } from "../components/Reveal";
import { CONTACT, whatsappLink } from "../data/contact";

// heading={false} : sur la page Contact, le titre et son texte sont déjà dans le bandeau.
const ContactSection = ({ heading = true }) => {
   const { t } = useTranslation();

   const rows = [
      { Icon: Phone, label: t("contactSection.phone"), value: CONTACT.phoneDisplay, href: CONTACT.phoneHref, tabular: true },
      { Icon: Mail, label: t("contactSection.email"), value: CONTACT.email, href: `mailto:${CONTACT.email}` },
      { Icon: MapPin, label: t("contactSection.location"), value: t("footer.location") },
   ];

   return (
      <section id="devis" className="relative scroll-mt-24">
         <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-10 mx-auto h-[520px] max-w-[1100px] glow-contact"
         />
         <div className="relative mx-auto grid max-w-[1200px] gap-12 px-5 py-14 sm:px-8 md:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
               {heading && (
                  <div className="mb-10">
                     <h2 className="text-[clamp(2.2rem,4.4vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.03em]">
                        <RevealWords text={t("contactSection.title")} />
                     </h2>
                     <RevealText
                        text={t("contactSection.subtitle")}
                        delay={0.3}
                        className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-muted"
                     />
                  </div>
               )}

               <Reveal delay={heading ? 0.35 : 0.1}>
                  <LitCard className="rounded-[24px] border border-signal/25 bg-signal/[0.06] p-6">
                     <p className="flex items-center gap-3 text-[18px] font-medium">
                        <span aria-hidden="true" className="relative flex h-9 w-9 flex-none items-center justify-center rounded-full bg-signal/15 text-signal">
                           <span className="absolute inset-0 rounded-full bg-signal/25 motion-safe:animate-ping [animation-duration:2.4s]" />
                           <FaWhatsapp className="relative h-[18px] w-[18px]" />
                        </span>
                        {t("contactSection.whatsappTitle")}
                     </p>
                     <p className="mt-3 text-[15px] leading-relaxed text-muted">{t("contactSection.whatsappText")}</p>
                     <Pill
                        href={whatsappLink(t("common.whatsappMessage"))}
                        variant="lit"
                        size="lg"
                        icon={FaWhatsapp}
                        shine
                        className="mt-5 w-full sm:w-auto"
                     >
                        {t("common.writeWhatsapp")}
                     </Pill>
                  </LitCard>
               </Reveal>

               <RevealGroup as="dl" stagger={0.1} delay={0.45} className="mt-8">
                  {rows.map(({ Icon, label, value, href, tabular }, index) => (
                     <RevealItem key={index} lit ruleTop={index === 0} ruleBottom className="group flex items-center gap-4 py-4">
                        <DrawIcon icon={Icon} delay={0.6 + index * 0.12} size={18} strokeWidth={1.8} className="text-brand-text" />
                        <dt className="w-24 flex-none text-[14px] text-subtle">{label}</dt>
                        <dd className={`min-w-0 break-words text-[15px] ${tabular ? "tabular" : ""}`}>
                           {href ? (
                              <a href={href} className="text-fg transition-colors hover:text-fg-hover hover:underline">
                                 {value}
                              </a>
                           ) : (
                              <span className="text-fg">{value}</span>
                           )}
                        </dd>
                     </RevealItem>
                  ))}
               </RevealGroup>
            </div>

            <Reveal delay={0.2}>
               <LitCard className="rounded-[28px]">
                  <ContactForm titleAs={heading ? "h3" : "h2"} />
               </LitCard>
            </Reveal>
         </div>
      </section>
   );
};

export default ContactSection;
