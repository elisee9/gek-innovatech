import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const NotDone = () => {
   const { t } = useTranslation();

   return (
      <div className="min-h-screen bg-[#1E1E1E] flex flex-col items-center justify-center text-white px-4 text-center">
         <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-md"
         >
            <div className="w-12 h-0.5 bg-[#00D2A8] mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">{t("notDone.title")}</h1>
            <p className="text-gray-300 text-lg mb-2">{t("notDone.message")}</p>
            <p className="text-gray-400 text-sm mb-8">{t("notDone.detail")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Link
                  to="/"
                  className="block w-full text-center sm:w-auto sm:inline-block px-8 py-3 sm:px-10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition"
               >
                  {t("notDone.backHome")}
               </Link>
               <Link
                  to="/contact"
                  className="block w-full text-center sm:w-auto sm:inline-block px-8 py-3 sm:px-10 bg-[#00D2A8] text-black font-semibold rounded-lg hover:bg-[#00BFA0] transition shadow-lg"
               >
                  {t("notDone.contactUs")}
               </Link>
            </div>
         </motion.div>
      </div>
   );
};

export default NotDone;
