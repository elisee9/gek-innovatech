import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

function NotFound() {
   const { t } = useTranslation();

   return (
      <>
         <Helmet>
            <title>{t("meta.notFound.title")}</title>
         </Helmet>

         <div className="min-h-screen flex flex-col items-center justify-center text-white px-4 text-center">
            <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
            >
               <p className="text-[120px] md:text-[180px] font-black leading-none text-[#005BFF] opacity-20 select-none">
                  {t("notFound.code")}
               </p>
               <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-4 -translate-y-8">
                  {t("notFound.title")}
               </h1>
               <p className="text-gray-400 text-lg mb-8 -translate-y-4">
                  {t("notFound.message")}
               </p>
               <Link
                  to="/"
                  className="block w-full max-w-xs mx-auto text-center sm:w-auto sm:inline-block px-8 py-3 sm:px-12 bg-[#005BFF] text-white font-semibold rounded-lg hover:bg-[#0044cc] transition shadow-lg"
               >
                  {t("notFound.backHome")}
               </Link>
            </motion.div>
         </div>
      </>
   );
}

export default NotFound;
