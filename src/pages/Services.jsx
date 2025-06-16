import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ServicesCards from "../sections/ServicesCards";
import { handleLinkClick } from "../utils/scrollUtils";
import { Helmet } from "react-helmet-async"; // Assurez-vous d'avoir installé react-helmet-async

const Services = () => {
   return (
      <>
         <Helmet>
            <title>Nos Services | GEK INNOVATECH</title>
            <meta
               name="description"
               content="Découvrez les services web de GEK INNOVATECH : création de sites vitrine, e-commerce, optimisation SEO, refonte de site, etc."
            />
            <meta
               name="keywords"
               content="services web, création site, SEO, e-commerce, maintenance site web, GEK INNOVATECH"
            />
            <meta name="author" content="GEK INNOVATECH" />
            <meta property="og:title" content="Nos Services | GEK INNOVATECH" />
            <meta
               property="og:description"
               content="Une large gamme de services pour booster votre présence en ligne."
            />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://gekinnova.com/services" />
            <meta
               property="og:image"
               content="https://gekinnova.com/images/og-services.jpg"
            />
         </Helmet>

         <section className="relative min-h-screen text-white pt-32 pb-16 px-4">
            <ServicesCards />

            <div className="text-center">
               {/* CTA vers la page Contact */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.06 }}
                  className="mt-6"
               >
                  <Link
                     to="/contact"
                     className="inline-block bg-[#00D2A8] text-black font-semibold py-3 px-8 rounded-full hover:bg-[#00BFA0] transition-colors duration-300 cursor-pointer hover:border-[#00D2A8] hover:shadow-[#00D2A8]/40 shadow-lg"
                     onClick={handleLinkClick}
                  >
                     Discutons de votre projet
                  </Link>
               </motion.div>
            </div>
         </section>
      </>
   );
};

export default Services;
