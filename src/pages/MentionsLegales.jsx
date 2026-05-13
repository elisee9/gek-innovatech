import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Section = ({ title, children }) => (
   <div className="mb-10">
      <h2 className="text-xl font-bold text-[#00D2A8] mb-3 border-b border-white/10 pb-2">{title}</h2>
      <div className="text-gray-300 space-y-2 leading-relaxed text-sm">{children}</div>
   </div>
);

const MentionsLegales = () => {
   const { t, i18n } = useTranslation();

   const updatedDate = new Date().toLocaleDateString(
      i18n.language === "fr" ? "fr-FR" : "en-GB",
      { month: "long", year: "numeric" }
   );

   return (
      <>
         <Helmet>
            <title>{t("mentions.meta.title")}</title>
            <meta name="description" content={t("mentions.meta.description")} />
            <meta name="robots" content="noindex, follow" />
         </Helmet>

         <div className="min-h-screen text-white pt-36 pb-20 px-6">
            <div className="max-w-3xl mx-auto">
               <div className="w-12 h-0.5 bg-[#005BFF] mb-6" />
               <h1 className="text-3xl md:text-4xl font-bold mb-2">{t("mentions.title")}</h1>
               <p className="text-gray-400 text-sm mb-12">
                  {t("mentions.updated")} {updatedDate}
               </p>

               {/* Éditeur */}
               <Section title={t("mentions.editor.title")}>
                  <p><span className="text-white font-semibold">GEK INNOVATECH</span></p>
                  <p>{t("mentions.editor.type")}</p>
                  <p>{t("mentions.editor.country")} : Bénin</p>
                  <p>
                     {t("mentions.editor.email")} :{" "}
                     <a href="mailto:contact@gekinnovatech.com" className="text-[#00D2A8] hover:underline">
                        contact@gekinnovatech.com
                     </a>
                  </p>
                  <p>
                     {t("mentions.editor.phone")} :{" "}
                     <a href="tel:+2290165426510" className="text-[#00D2A8] hover:underline">
                        +229 01 65 42 65 10
                     </a>
                  </p>
                  <p>{t("mentions.editor.website")} : <span className="text-white">gek-innovatech.netlify.app</span></p>
               </Section>

               {/* Hébergement */}
               <Section title={t("mentions.hosting.title")}>
                  <p>{t("mentions.hosting.text")}</p>
               </Section>

               {/* Propriété intellectuelle */}
               <Section title={t("mentions.ip.title")}>
                  <p>{t("mentions.ip.text1")}</p>
                  <p>{t("mentions.ip.text2")}</p>
               </Section>

               {/* Données personnelles */}
               <Section title={t("mentions.data.title")}>
                  <p>{t("mentions.data.text1")}</p>
                  <p>{t("mentions.data.text2")}</p>
                  <p>{t("mentions.data.rights")} :{" "}
                     <a href="mailto:contact@gekinnovatech.com" className="text-[#00D2A8] hover:underline">
                        contact@gekinnovatech.com
                     </a>
                  </p>
               </Section>

               {/* Cookies */}
               <Section title={t("mentions.cookies.title")}>
                  <p>{t("mentions.cookies.text1")}</p>
                  <p>{t("mentions.cookies.text2")}</p>
               </Section>

               {/* Responsabilité */}
               <Section title={t("mentions.liability.title")}>
                  <p>{t("mentions.liability.text")}</p>
               </Section>

               {/* Droit applicable */}
               <Section title={t("mentions.law.title")}>
                  <p>{t("mentions.law.text")}</p>
               </Section>

               <div className="mt-12 pt-6 border-t border-white/10">
                  <Link to="/" className="text-[#005BFF] hover:text-[#00D2A8] transition text-sm">
                     ← {t("common.backHome")}
                  </Link>
               </div>
            </div>
         </div>
      </>
   );
};

export default MentionsLegales;
