import { motion } from "framer-motion";

function PromotionBadge() {
   return (
      <motion.div
         initial={{ scale: 0.8, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         transition={{
            type: "spring",
            stiffness: 200,
            damping: 10,
            duration: 0.5,
         }}
         whileHover={{ scale: 1.03 }}
         className="flex items-center justify-center py-2 sm:py-12 md:mt-2 sm:mb-4"
      >
         <div className="relative w-full max-w-4xl">
            {/* Badge principal - Responsive */}
            <div className="bg-gradient-to-r from-[#00D2A8] to-[#005BFF] text-white py-1 sm:px-1 sm:py-2 md:px-1 md:py-4 rounded-lg shadow-lg flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1 w-full max-sm:mb-3">
               <div className="flex items-center">
                  <span className="font-bold text-sm sm:text-base md:text-xl whitespace-nowrap border-b-6 border-white pb-1 sm:pb-2 md:pb-1">
                     <b>Promotion spéciale</b>
                  </span>
                  <motion.span
                     animate={{ rotate: [0, 10, -10, 0] }}
                     transition={{
                        repeat: Infinity,
                        repeatType: "mirror",
                        duration: 2,
                        ease: "easeInOut",
                     }}
                     className="text-4xl ml-1 sm:ml-1"
                  >
                     {" "}🎉
                  </motion.span>
               </div>

               <span className="font-bold text-xs sm:text-sm md:text-lg text-center">
                  <span className="block sm:inline">
                    80% de réduction sur tous les plans
                  </span>
                  <span className="hidden sm:inline"> </span>
                  <span className="block sm:inline">
                     uniquement pour ce mois.
                  </span>
               </span>
            </div>

            {/* Pointe du badge (optionnel) - Responsive */}
            <div className="absolute -bottom-1 right-[10%] sm:right-5 w-3 h-3 sm:w-4 sm:h-4 bg-[#005BFF] transform rotate-45 max-sm:mb-6"></div>
         </div>
      </motion.div>
   );
}

export default PromotionBadge;
