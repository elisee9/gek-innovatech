import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

const HeroSection = () => {
   const { t } = useTranslation();
   const ref = useRef(null);
   const isInView = useInView(ref, { once: false });

   return (
      <div className="relative mt-32 w-full flex items-center justify-center text-white overflow-hidden pb-20 md:pb-28 mb-6">
         <div className="absolute inset-0 z-10" />

         <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeInOut" }}
            className="relative z-20 text-center px-6 md:px-10 pt-12 md:pt-16"
         >
            <h1 className="text-3xl md:text-5xl font-bold leading-snug mb-5 tracking-tight">
               {t("hero.welcome")}{" "}
               <span className="text-[#005BFF]">GEK INNOVATECH</span>
            </h1>

            <h2 className="text-base md:text-xl font-medium text-gray-100 leading-relaxed mb-5 max-w-xl mx-auto">
               {t("hero.subtitle")}
            </h2>

            <p className="text-sm md:text-base text-gray-400 max-w-lg mx-auto mb-10 leading-relaxed">
               {t("hero.description")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-2xl mx-auto">
               <motion.a
                  href="tel:+2290165426510"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="block w-full text-center bg-[#00D2A8] hover:bg-[#00b795] text-black font-semibold px-8 py-3 rounded-lg transition duration-300 shadow-lg hover:shadow-[#00D2A8]/40"
               >
                  {t("common.call")}
               </motion.a>
               <motion.a
                  href="https://wa.me/2290165426510"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="block w-full text-center hover:bg-[#00b795] text-white hover:text-black font-semibold px-8 py-3 rounded-lg transition duration-300 border border-[#00b795] shadow-lg"
               >
                  {t("common.whatsapp")}
               </motion.a>
            </div>
         </motion.div>
      </div>
   );
};

export default HeroSection;
