import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { handleLinkClick } from "../utils/scrollUtils";

const ContactSection = () => {
   return (
      <>
         <section className="text-white py-10 px-6">
            <div className="max-w-5xl mx-auto text-center">
               <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl md:text-4xl font-bold mb-4"
               >
                  Un projet à concrétiser ?
               </motion.h2>
               <p className="text-gray-300 text-lg mb-8">
                  Notre équipe est prête à vous accompagner dans la réalisation
                  de vos idées. Discutons-en dès maintenant !
               </p>
               <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
               >
                  <Link
                     to="/contact"
                     className="bg-[#00D2A8] hover:bg-[#00b091] text-black font-semibold px-8 py-4 rounded-xl transition shadow-lg hover:shadow-[#00D2A8]/40 cursor-pointer"
                     onClick={handleLinkClick}
                  >
                     Contactez-nous
                  </Link>
               </motion.div>
            </div>
         </section>
      </>
   );
};

export default ContactSection;
