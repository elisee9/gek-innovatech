import { motion } from "framer-motion";
import PricingSection from "../sections/PricingSection";
import { Link } from "react-router-dom";
import { handleLinkClick } from "../utils/scrollUtils";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

function Plans() {
   const { t } = useTranslation();

   return (
      <>
         <Helmet>
            <title>{t("meta.plans.title")}</title>
            <meta name="description" content={t("meta.plans.description")} />
            <meta name="keywords" content={t("meta.plans.keywords")} />
            <meta name="author" content={t("common.author")} />
            <meta name="robots" content="index, follow" />
            <meta property="og:title" content={t("meta.plans.ogTitle")} />
            <meta property="og:description" content={t("meta.plans.ogDescription")} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://gek-innovatech.netlify.app/plans" />
            <meta property="og:image" content="https://gek-innovatech.netlify.app/og-image.jpeg" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={t("meta.plans.ogTitle")} />
            <meta name="twitter:description" content={t("meta.plans.ogDescription")} />
            <meta name="twitter:image" content="https://gek-innovatech.netlify.app/og-image.jpeg" />
            <link rel="canonical" href="https://gek-innovatech.netlify.app/plans" />
         </Helmet>

         <div className="mt-24 mb-8">
            <PricingSection />
            <div className="text-center mt-8">
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full max-w-xs mx-auto sm:w-auto sm:max-w-none"
               >
                  <Link
                     to="/contact"
                     className="block w-full text-center sm:w-auto sm:inline-block bg-[#005BFF] text-white font-semibold py-3 px-8 sm:px-12 rounded-lg hover:bg-[#0044cc] transition-colors duration-300 cursor-pointer shadow-lg hover:shadow-[#005BFF]/40"
                     onClick={() => handleLinkClick()}
                  >
                     {t("common.discussProject")}
                  </Link>
               </motion.div>
            </div>
         </div>
      </>
   );
}

export default Plans;
