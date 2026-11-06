import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Seo from "../components/Seo";
import { CONTACT } from "../data/contact";

const Section = ({ title, children }) => (
   <section className="grid gap-3 border-t border-line py-9 md:grid-cols-[220px_1fr] md:gap-10">
      <h2 className="text-[17px] font-medium text-fg">{title}</h2>
      <div className="max-w-[68ch] space-y-3 text-[16px] leading-relaxed text-muted">{children}</div>
   </section>
);

const MentionsLegales = () => {
   const { t, i18n } = useTranslation();
   const updatedDate = new Date().toLocaleDateString((i18n.resolvedLanguage || i18n.language) === "en" ? "en-GB" : "fr-FR", {
      month: "long",
      year: "numeric",
   });
   const linkCls = "text-brand-text underline hover:text-fg-hover";

   return (
      <>
         <Seo page="mentions" path="/mentions-legales" noindex />

         <article className="mx-auto max-w-[1200px] px-5 pb-24 pt-10 sm:px-8 md:pt-14">
            <p className="text-[15px] text-subtle">
               {t("mentions.updated")} {updatedDate}
            </p>

            <div className="mt-8">
               <Section title={t("mentions.editor.title")}>
                  <p className="font-medium text-fg">GEK INNOVATECH</p>
                  <p>{t("mentions.editor.type")}</p>
                  <p>
                     {t("mentions.editor.country")} : Bénin
                  </p>
                  <p>
                     {t("mentions.editor.email")} :{" "}
                     <a href={`mailto:${CONTACT.email}`} className={linkCls}>
                        {CONTACT.email}
                     </a>
                  </p>
                  <p>
                     {t("mentions.editor.phone")} :{" "}
                     <a href={CONTACT.phoneHref} className={`tabular ${linkCls}`}>
                        {CONTACT.phoneDisplay}
                     </a>
                  </p>
                  <p>
                     {t("mentions.editor.website")} : gek-innovatech.netlify.app
                  </p>
               </Section>

               <Section title={t("mentions.hosting.title")}>
                  <p>{t("mentions.hosting.text")}</p>
               </Section>

               <Section title={t("mentions.ip.title")}>
                  <p>{t("mentions.ip.text1")}</p>
                  <p>{t("mentions.ip.text2")}</p>
               </Section>

               <Section title={t("mentions.data.title")}>
                  <p>{t("mentions.data.text1")}</p>
                  <p>{t("mentions.data.text2")}</p>
                  <p>
                     {t("mentions.data.rights")} :{" "}
                     <Link to="/contact" className={linkCls}>
                        {t("common.contactPage")}
                     </Link>
                  </p>
               </Section>

               <Section title={t("mentions.cookies.title")}>
                  <p>{t("mentions.cookies.text1")}</p>
                  <p>{t("mentions.cookies.text2")}</p>
               </Section>

               <Section title={t("mentions.liability.title")}>
                  <p>{t("mentions.liability.text")}</p>
               </Section>

               <Section title={t("mentions.law.title")}>
                  <p>{t("mentions.law.text")}</p>
               </Section>
            </div>
         </article>
      </>
   );
};

export default MentionsLegales;
