import { motion } from "framer-motion";
import plans from "../data/plans";
import { NavLink } from "react-router-dom";
import { handleLinkClick } from "../utils/scrollUtils";
import { useTranslation } from "react-i18next";
import { Check, Layers, Rocket, Crown } from "lucide-react";

const PLAN_ICONS = { 1: Layers, 2: Rocket, 3: Crown };

const PricingSection = () => {
   const { t } = useTranslation();
   const planTranslations = t("pricing.plans", { returnObjects: true });

   const mergedPlans = plans.map((plan) => {
      const tr = planTranslations.find((p) => p.id === plan.id) || {};
      return { ...plan, ...tr };
   });

   return (
      <section className="relative py-2 px-6 backdrop-blur-sm pt-16" id="plans">
         <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 z-0" />

         <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               className="text-center mb-6"
            >
               <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#00D2A8] to-[#005BFF]">
                  {t("pricing.title")}
               </h2>
               <p className="text-gray-300 text-lg max-w-xl mx-auto">
                  {t("pricing.subtitle")}
               </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 cursor-pointer items-stretch">
               {mergedPlans.map((plan, index) => {
                  const PlanIcon = PLAN_ICONS[plan.id];
                  const isPremium = plan.premium === true;
                  const isRecommended = plan.recommended === true;

                  const cardClass = isPremium
                     ? "from-[#1A1200] via-[#1E1A00] to-[#1E1E1E] border-2 border-amber-400/70 shadow-[0_0_40px_rgba(251,191,36,0.15)]"
                     : isRecommended
                     ? "from-[#005BFF]/20 to-[#00D2A8]/10 border-2 border-[#00D2A8]"
                     : "from-[#2A2A2A] to-[#1E1E1E] border border-[#00D2A8]/30";

                  const iconColor = isPremium
                     ? "text-amber-400"
                     : isRecommended
                     ? "text-[#00D2A8]"
                     : "text-gray-300";

                  const iconBg = isPremium
                     ? "bg-amber-400/15"
                     : isRecommended
                     ? "bg-[#00D2A8]/20"
                     : "bg-white/5";

                  const priceColor = isPremium ? "text-amber-400" : "text-[#00D2A8]";

                  const checkColor = isPremium ? "text-amber-400" : "text-[#00D2A8]";

                  const ctaClass = isPremium
                     ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:from-amber-400 hover:to-yellow-300"
                     : isRecommended
                     ? "bg-gradient-to-r from-[#00D2A8] to-[#005BFF] text-black"
                     : "bg-[#2A2A2A] text-[#00D2A8] border border-[#00D2A8] hover:bg-[#00D2A8]/10";

                  return (
                     <div key={plan.id} className={isPremium ? "md:-translate-y-5" : ""}>
                     <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                           duration: 0.6,
                           delay: index * 0.15,
                           type: "spring",
                           stiffness: 100,
                        }}
                        whileHover={{ y: isPremium ? -14 : -10 }}
                        className={`flex flex-col h-full relative bg-gradient-to-b ${cardClass} rounded-xl p-8 shadow-lg overflow-hidden`}
                     >
                        {isPremium && (
                           <>
                              <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-bold px-4 py-1 rounded-bl-lg tracking-wide uppercase">
                                 {t("pricing.premiumBadge")}
                              </div>
                              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.08),transparent_60%)] pointer-events-none" />
                           </>
                        )}

                        {isRecommended && (
                           <div className="absolute top-0 right-0 bg-[#00D2A8] text-black text-sm font-bold px-4 py-1 rounded-bl-lg">
                              {t("pricing.recommended")}
                           </div>
                        )}

                        {plan.promotion && (
                           <div className="absolute top-0 left-0 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-br-lg">
                              {plan.promotion}
                           </div>
                        )}

                        <div className="mb-6 mt-4">
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}>
                              <PlanIcon size={22} className={iconColor} strokeWidth={1.6} />
                           </div>
                           <h3 className={`text-2xl font-bold mb-1 ${isPremium ? "text-amber-50" : ""}`}>
                              {plan.title}
                           </h3>
                           <p className="text-gray-400">{plan.description}</p>
                           <div className="my-4">
                              <span className={`text-2xl font-bold ${priceColor}`}>
                                 {plan.price}
                              </span>
                              <span className="text-sm text-gray-400 font-normal ml-1">
                                 / {t("pricing.period")}
                              </span>
                              {plan.oldPrice && (
                                 <span className="text-base text-red-400 line-through ml-3">
                                    {plan.oldPrice}
                                 </span>
                              )}
                           </div>
                        </div>

                        <p className="text-gray-400 text-sm mb-4">
                           {t("pricing.delivery")} <strong className="text-white">{plan.deliveryTime}</strong>
                        </p>

                        <ul className="space-y-3 mb-6 flex-1">
                           {(plan.features || []).map((feature, i) => (
                              <li key={i} className="flex items-start gap-2">
                                 <Check size={14} className={`${checkColor} mt-0.5 flex-shrink-0`} strokeWidth={2.5} />
                                 <span className="text-gray-300 text-sm">{feature}</span>
                              </li>
                           ))}
                        </ul>

                        {plan.example && plan.example !== "/notdone" && (
                           <div className="mb-4">
                              <a
                                 href={plan.example}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className={`text-sm hover:underline ${isPremium ? "text-amber-400" : "text-[#00D2A8]"}`}
                              >
                                 {t("pricing.seeExample")} →
                              </a>
                           </div>
                        )}

                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                           <NavLink
                              to="/contact"
                              onClick={() => handleLinkClick()}
                              className={`block w-full py-3 rounded-lg font-semibold text-center transition-all cursor-pointer ${ctaClass}`}
                           >
                              {t("pricing.getplan")}
                           </NavLink>
                        </motion.div>
                     </motion.div>
                     </div>
                  );
               })}
            </div>
         </div>
      </section>
   );
};

export default PricingSection;
