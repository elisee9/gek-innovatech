import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { handleLinkClick } from "../utils/scrollUtils";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

const ContactSection = () => {
   const { t } = useTranslation();

   return (
      <section className="text-white py-10 px-6">
         <div className="max-w-5xl mx-auto text-center">
            <motion.h2
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
               className="text-3xl md:text-4xl font-bold mb-4"
            >
               {t("contactSection.title")}
            </motion.h2>
            <p className="text-gray-300 text-lg mb-8">
               {t("contactSection.subtitle")}
            </p>
            <motion.div
               whileHover={{ scale: 1.04 }}
               whileTap={{ scale: 0.97 }}
               className="block w-full max-w-xs mx-auto sm:w-auto sm:inline-block"
            >
               <Link
                  to="/contact"
                  className="flex items-center justify-center gap-2 w-full sm:w-auto sm:inline-flex bg-[#00D2A8] hover:bg-[#00b091] text-black font-semibold px-8 py-3 sm:px-12 rounded-lg transition shadow-lg hover:shadow-[#00D2A8]/40 cursor-pointer"
                  onClick={() => handleLinkClick()}
               >
                  {t("contactSection.btn")}
                  <ArrowRight size={18} strokeWidth={2} />
               </Link>
            </motion.div>
         </div>
      </section>
   );
};

export default ContactSection;
