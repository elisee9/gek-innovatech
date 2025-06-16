import { motion } from "framer-motion";
import PricingSection from "../sections/PricingSection";
import { Link } from "react-router-dom";
import { handleLinkClick } from "../utils/scrollUtils";
import { Helmet } from "react-helmet-async";

function Plans() {
   return (
      <>
         <Helmet>
            <title>Nos Offres | GEK INNOVATECH</title>
            <meta
               name="description"
               content="Choisissez parmi nos offres web adaptées à vos besoins et à votre budget. Des solutions flexibles et professionnelles."
            />
            <meta
               name="keywords"
               content="offres site web, prix site internet, plans, forfaits web, GEK INNOVATECH"
            />
            <meta name="author" content="GEK INNOVATECH" />
            <meta property="og:title" content="Nos Offres | GEK INNOVATECH" />
            <meta
               property="og:description"
               content="Comparez nos forfaits et choisissez l’offre qui vous convient."
            />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://gekinnova.com/offres" />
            <meta
               property="og:image"
               content="https://gekinnova.com/images/og-plans.jpg"
            />
         </Helmet>

         <div className="mt-24 mb-8">
            <div>
               <PricingSection />
            </div>
            <div>
               {/* CTA vers la page Contact */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.06 }}
                  className="mt-2 text-center"
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
         </div>
      </>
   );
}

export default Plans;
