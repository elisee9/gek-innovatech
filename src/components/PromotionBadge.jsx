import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

function PromotionBadge() {
   const { i18n } = useTranslation();

   const label =
      i18n.language === "en"
         ? "Special offer — up to 55% off all plans this month."
         : "Promotion spéciale — jusqu'à 55% de réduction sur tous les plans ce mois-ci.";

   return (
      <motion.div
         initial={{ scale: 0.95, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         transition={{ type: "spring", stiffness: 200, damping: 15 }}
         className="flex items-center justify-center py-4 sm:py-8"
      >
         <div className="w-full max-w-4xl bg-gradient-to-r from-[#00D2A8] to-[#005BFF] text-white py-3 px-6 rounded-lg shadow-lg text-center font-semibold text-sm sm:text-base md:text-lg">
            {label}
         </div>
      </motion.div>
   );
}

export default PromotionBadge;
