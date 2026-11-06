import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Logo from "./Logo";
import Pill from "./Pill";
import { RevealGroup, RevealItem } from "./Reveal";
import { CONTACT, whatsappLink } from "../data/contact";

const Footer = () => {
   const { t } = useTranslation();
   const services = t("services.items", { returnObjects: true });

   const links = [
      { name: t("header.home"), path: "/" },
      { name: t("header.about"), path: "/about" },
      { name: t("header.services"), path: "/services" },
      { name: t("header.plans"), path: "/plans" },
      { name: t("header.portfolio"), path: "/portfolio" },
      { name: t("header.contact"), path: "/contact" },
   ];

   const colTitle = "mb-5 text-[13px] font-medium uppercase tracking-[0.08em] text-subtle";
   const linkCls = "text-[15px] text-muted transition-colors hover:text-fg";

   return (
      <footer className="border-t border-line">
         <RevealGroup stagger={0.08} className="mx-auto grid max-w-[1200px] gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
            <RevealItem>
               <Link to="/" aria-label={t("header.homeLabel")} className="inline-block rounded-lg">
                  <Logo width={128} />
               </Link>
               <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-muted">{t("footer.tagline")}</p>
               <Pill
                  href={whatsappLink(t("common.whatsappMessage"))}
                  variant="lit"
                  size="sm"
                  icon={FaWhatsapp}
                  className="mt-6"
               >
                  {t("common.writeWhatsapp")}
               </Pill>
            </RevealItem>

            <RevealItem>
               <h2 className={colTitle}>{t("footer.navTitle")}</h2>
               <ul className="space-y-3">
                  {links.map((link) => (
                     <li key={link.path}>
                        <Link to={link.path} className={linkCls}>
                           {link.name}
                        </Link>
                     </li>
                  ))}
               </ul>
            </RevealItem>

            <RevealItem>
               <h2 className={colTitle}>{t("footer.servicesTitle")}</h2>
               <ul className="space-y-3">
                  {services.slice(0, 7).map((service, index) => (
                     <li key={index}>
                        <Link to="/services" className={linkCls}>
                           {service.title}
                        </Link>
                     </li>
                  ))}
               </ul>
            </RevealItem>

            <RevealItem>
               <h2 className={colTitle}>{t("footer.contactTitle")}</h2>
               <ul className="space-y-4 text-[15px]">
                  <li>
                     <a href={CONTACT.phoneHref} className={`flex items-center gap-3 ${linkCls}`}>
                        <Phone size={16} className="text-brand-text" aria-hidden="true" />
                        <span className="tabular">{CONTACT.phoneDisplay}</span>
                     </a>
                  </li>
                  <li>
                     <a
                        href={whatsappLink(t("common.whatsappMessage"))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 ${linkCls}`}
                     >
                        <FaWhatsapp size={16} className="text-brand-text" aria-hidden="true" />
                        {t("common.whatsapp")}
                     </a>
                  </li>
                  <li>
                     <a href={`mailto:${CONTACT.email}`} className={`flex items-center gap-3 break-all ${linkCls}`}>
                        <Mail size={16} className="flex-none text-brand-text" aria-hidden="true" />
                        {CONTACT.email}
                     </a>
                  </li>
                  <li className="flex items-start gap-3 text-muted">
                     <MapPin size={16} className="mt-1 flex-none text-brand-text" aria-hidden="true" />
                     {t("footer.location")}
                  </li>
               </ul>
            </RevealItem>
         </RevealGroup>

         <div className="border-t border-line">
            <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-5 py-6 text-[14px] text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-8">
               <p>
                  © {new Date().getFullYear()} GEK INNOVATECH. {t("footer.copyright")}
               </p>
               <Link to="/mentions-legales" className="transition-colors hover:text-fg">
                  {t("footer.mentions")}
               </Link>
            </div>
         </div>
      </footer>
   );
};

export default Footer;
