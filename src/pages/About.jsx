import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation, Trans } from "react-i18next";
import { handleLinkClick } from "../utils/scrollUtils";

const About = () => {
   const { t } = useTranslation();

   return (
      <>
         <Helmet>
            <title>{t("meta.about.title")}</title>
            <meta name="description" content={t("meta.about.description")} />
            <meta name="keywords" content={t("meta.about.keywords")} />
            <meta name="author" content={t("common.author")} />
            <meta name="robots" content="index, follow" />
            <meta property="og:title" content={t("meta.about.ogTitle")} />
            <meta property="og:description" content={t("meta.about.ogDescription")} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://gek-innovatech.netlify.app/about" />
            <meta property="og:image" content="https://gek-innovatech.netlify.app/og-image.png" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={t("meta.about.ogTitle")} />
            <meta name="twitter:description" content={t("meta.about.ogDescription")} />
            <meta name="twitter:image" content="https://gek-innovatech.netlify.app/og-image.png" />
            <link rel="canonical" href="https://gek-innovatech.netlify.app/about" />
         </Helmet>

         <section className="relative min-h-screen flex items-center justify-center text-white px-4 pt-36 z-10">
            <motion.div
               initial={{ opacity: 0, y: 40 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1 }}
               className="text-center max-w-3xl z-10"
            >
               <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  {t("about.title")}{" "}
                  <span className="text-[#005BFF]">GEK INNOVATECH</span>
               </h1>

               <div className="text-lg md:text-xl text-gray-300 leading-relaxed space-y-4 text-left">
                  <p>{t("about.p1")}</p>
                  <p>{t("about.p2")}</p>
                  <p>
                     <Trans
                        i18nKey="about.p3"
                        components={{
                           brand: <span className="text-[#005BFF] font-semibold" />,
                        }}
                     />
                  </p>
                  <p>{t("about.p4")}</p>
                  <em className="text-white/70 block mt-4 text-base not-italic border-l-2 border-[#00D2A8] pl-4">
                     {t("about.tagline")}
                  </em>
               </div>

               <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-10 mb-3 w-full sm:w-auto sm:inline-block"
               >
                  <NavLink
                     to="/services"
                     className="block w-full sm:w-auto sm:inline-block px-8 py-3 sm:px-12 text-lg font-semibold text-center bg-[#005BFF] hover:bg-[#0044cc] transition-colors duration-300 rounded-lg shadow-xl cursor-pointer hover:shadow-[#0044cc]/40"
                     onClick={() => handleLinkClick()}
                  >
                     {t("about.cta")}
                  </NavLink>
               </motion.div>
            </motion.div>
         </section>
      </>
   );
};

export default About;
