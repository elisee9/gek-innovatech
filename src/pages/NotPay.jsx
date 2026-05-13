import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const NotPay = () => {
   const { t } = useTranslation();

   return (
      <div className="min-h-screen bg-[#1E1E1E] flex flex-col items-center justify-center text-white px-4 text-center">
         <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-md"
         >
            <div className="w-12 h-0.5 bg-[#005BFF] mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">{t("notPay.title")}</h1>
            <p className="text-gray-300 text-lg mb-8">{t("notPay.message")}</p>
            <Link
               to="/contact"
               className="block w-full text-center sm:w-auto sm:inline-block px-8 py-3 sm:px-12 bg-[#005BFF] text-white font-semibold rounded-lg hover:bg-[#0044cc] transition shadow-lg hover:shadow-[#005BFF]/40"
            >
               {t("notPay.cta")}
            </Link>
         </motion.div>
      </div>
   );
};

export default NotPay;
