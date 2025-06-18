import { motion } from "framer-motion";
import { FaPhoneAlt, FaWhatsapp, FaChevronDown } from "react-icons/fa";
import { useInView } from "framer-motion";
import { useRef } from "react";

const HeroSection = () => {
   const ref = useRef(null);
   const isInView = useInView(ref, { once: false });
   return (
      <div className="relative mt-32 w-full flex items-center justify-center text-white overflow-hidden mb-2">
         {/* Overlay de dégradé sombre pour améliorer la lisibilité */}
         <div className="absolute inset-0 z-10" />

         {/* Contenu Hero */}
         <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeInOut" }}
            className="relative z-20 text-center px-4"
         >
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
               Bienvenue chez{" "}
               <span className="text-[#005BFF]">GEK INNOVATECH</span>
            </h1>

            <h2 className="text-xl md:text-2xl font-semibold leading-tight mb-4">
               Transformez votre image digitale. Marquez les esprits.
            </h2>

            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-8">
               Nous créons des sites web ultra-performants, au design raffiné et
               sur-mesure pour booster votre visibilité. Attirez plus de
               clients, affirmez votre présence en ligne et démarquez-vous
               durablement de la concurrence.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
               <a
                  href="tel:+2290165426510"
                  className="bg-[#00D2A8] hover:bg-[#00b795] text-black font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition duration-300"
               >
                  <FaPhoneAlt /> Appeler
               </a>
               <a
                  href="https://wa.me/22965426510"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#00D2A8] hover:bg-[#00b795] text-black font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition duration-300"
               >
                  <FaWhatsapp /> WhatsApp
               </a>
            </div>
         </motion.div>
      </div>
   );
};

export default HeroSection;
