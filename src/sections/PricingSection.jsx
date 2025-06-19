import { motion } from "framer-motion";
import plans from "../data/plans";
import { FaCheck, FaCrown, FaClock, FaExternalLinkAlt } from "react-icons/fa";
import PromotionBadge from "../components/PromotionBadge";
import { BadgePercent } from "lucide-react";
import portfolioExamples from "../data/portfolioData";
import { NavLink } from "react-router-dom";
import { handleLinkClick } from "../utils/scrollUtils";

const PricingSection = () => {
   return (
      <section className="relative py-5 px-6 backdrop-blur-sm mt-6" id="plans">
         <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 z-0"></div>

         <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               className="text-center mb-4"
            >
               <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#00D2A8] to-[#005BFF]">
                  Nos Plans Tarifaires
               </h2>
               <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                  Des solutions adaptées à chaque étape de votre croissance
                  digitale.
                  <br />
                  Choisissez le plan qui convient le mieux à vos besoins.
               </p>
            </motion.div>

            <PromotionBadge />

            <div className="grid md:grid-cols-3 gap-8 cursor-pointer">
               {plans.map((plan, index) => {
                  {/* const onChoosePlan = () => {
                     const amount = parseInt(plan.price.replace(/\D/g, ""));
                     const description = `Achat du plan ${plan.title}`;
                     const email = prompt(
                        "Entrez votre email pour continuer :"
                     );

                     if (email) {
                        handlePayment({ amount, email, description });
                     }
                  }; */}

                  const example = portfolioExamples.find(
                     (item) => item.planId === plan.id
                  );

                  return (
                     <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                           duration: 0.6,
                           delay: index * 0.15,
                           type: "spring",
                           stiffness: 100,
                        }}
                        whileHover={{ y: -10 }}
                        className={`relative bg-gradient-to-b ${
                           plan.recommended
                              ? "from-[#005BFF]/20 to-[#00D2A8]/10 border-2 border-[#00D2A8]"
                              : "from-[#2A2A2A] to-[#1E1E1E] border border-[#00D2A8]/30"
                        } rounded-xl p-8 shadow-lg overflow-hidden`}
                     >
                        {plan.recommended && (
                           <div className="absolute top-0 right-0 bg-[#00D2A8] text-black font-bold px-4 py-1 rounded-bl-lg flex items-center">
                              <FaCrown className="mr-2" /> Meilleure offre
                           </div>
                        )}

                        <div className="mb-6">
                           <h3 className="text-2xl font-bold mb-1">
                              {plan.title}
                           </h3>
                           <p className="text-gray-400">{plan.description}</p>
                           <p className="text-2xl font-bold my-4 text-[#00D2A8]">
                              {plan.price}
                              <span className="text-sm text-gray-400 font-normal">
                                 /{plan.period}
                              </span>
                              {plan.oldPrice && (
                                 <span className="text-lg text-red-500 line-through ml-2">
                                    {plan.oldPrice}
                                 </span>
                              )}
                           </p>
                        </div>

                        <div className="flex items-center text-gray-400 text-sm mb-3">
                           <FaClock className="mr-2 text-[#00D2A8]" />
                           Livraison en {plan.deliveryTime}
                        </div>

                        {plan.promotion && (
                           <div className="absolute top-0 left-0 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-br-lg flex items-center gap-1">
                              <BadgePercent className="w-4 h-4" />
                              {plan.promotion}
                           </div>
                        )}

                        <ul className="space-y-3 mb-6">
                           {plan.features.map((feature, i) => (
                              <li key={i} className="flex items-start">
                                 <FaCheck className="text-[#00D2A8] mt-1 mr-2 flex-shrink-0" />
                                 <span className="text-gray-300">
                                    {feature}
                                 </span>
                              </li>
                           ))}
                        </ul>

                        {plan.example && (
                           <div className="mb-6">
                              <a
                                 href={plan.example}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-[#00D2A8] text-sm flex items-center hover:underline"
                              >
                                 Voir un exemple{" "}
                                 <FaExternalLinkAlt className="ml-1 text-xs" />
                              </a>
                           </div>
                        )}

                        <motion.button
                           whileHover={{ scale: 1.03 }}
                           whileTap={{ scale: 0.97 }}
                           className={`w-full py-3 rounded-lg font-semibold transition-all cursor-pointer ${
                              plan.recommended
                                 ? "bg-gradient-to-r from-[#00D2A8] to-[#005BFF] text-black cursor-pointer"
                                 : "bg-[#2A2A2A] text-[#00D2A8] border border-[#00D2A8] hover:bg-[#00D2A8]/10 cursor-pointer"
                           }`}
                        >
                           <NavLink to="/notpay" onClick={handleLinkClick}>Obtenir ce plan</NavLink>
                        </motion.button>
                     </motion.div>
                  );
               })}
            </div>
         </div>
      </section>
   );
};

export default PricingSection;
