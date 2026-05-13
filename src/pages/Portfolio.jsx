import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import portfolioExamples from "../data/portfolioData";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

const FILTER_IDS = ["all", "basic", "standard", "premium"];

const Portfolio = () => {
   const { t } = useTranslation();
   const [selectedPlan, setSelectedPlan] = useState("all");

   const portfolioTranslations = t("portfolio.items", { returnObjects: true });

   const items = portfolioExamples.map((ex) => {
      const tr = portfolioTranslations.find((p) => p.id === ex.id) || {};
      return { ...ex, ...tr };
   });

   const filtered =
      selectedPlan === "all"
         ? items
         : items.filter((ex) => ex.planId === selectedPlan);

   const isExternal = (url) => url.startsWith("http");

   return (
      <>
         <Helmet>
            <title>{t("meta.portfolio.title")}</title>
            <meta name="description" content={t("meta.portfolio.description")} />
            <meta name="keywords" content={t("meta.portfolio.keywords")} />
            <meta name="author" content={t("common.author")} />
            <meta name="robots" content="index, follow" />
            <meta property="og:title" content={t("meta.portfolio.ogTitle")} />
            <meta property="og:description" content={t("meta.portfolio.ogDescription")} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://gek-innovatech.netlify.app/portfolio" />
            <meta property="og:image" content="https://gek-innovatech.netlify.app/og-image.png" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={t("meta.portfolio.ogTitle")} />
            <meta name="twitter:description" content={t("meta.portfolio.ogDescription")} />
            <meta name="twitter:image" content="https://gek-innovatech.netlify.app/og-image.png" />
            <link rel="canonical" href="https://gek-innovatech.netlify.app/portfolio" />
         </Helmet>

         <section className="min-h-screen py-16 px-4 md:px-10 mt-24 text-white">
            <div className="max-w-6xl mx-auto text-center">
               <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl font-bold mb-4"
               >
                  {t("portfolio.headingBefore")}{" "}
                  <span className="text-[#005BFF]">{t("portfolio.headingAccent")}</span>
               </motion.h1>

               <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-12">
                  {t("portfolio.subtitle")}
               </p>

               <div className="flex flex-wrap justify-center gap-3 mb-10">
                  {FILTER_IDS.map((id) => (
                     <button
                        key={id}
                        onClick={() => setSelectedPlan(id)}
                        className={`px-5 py-2 rounded-full border text-sm font-medium transition duration-300 cursor-pointer ${
                           selectedPlan === id
                              ? "bg-[#00D2A8] text-black border-[#00D2A8]"
                              : "border-white/10 text-white hover:border-[#00D2A8] hover:text-[#00D2A8]"
                        }`}
                     >
                        {t(`portfolio.filters.${id}`)}
                     </button>
                  ))}
               </div>

               {/* Grille */}
               <AnimatePresence mode="wait">
                  <motion.div
                     key={selectedPlan}
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     transition={{ duration: 0.3 }}
                     className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  >
                     {filtered.map((example) => {
                        const external = isExternal(example.link);
                        const linkProps = external
                           ? { target: "_blank", rel: "noopener noreferrer" }
                           : {};

                        return (
                           <motion.div
                              key={example.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              whileHover={{ y: -6 }}
                              transition={{ duration: 0.4 }}
                              className="bg-[#1C1C1C] rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-white/5 hover:border-[#005BFF] hover:shadow-[#005BFF]/20 overflow-hidden"
                           >
                              <a href={example.link} {...linkProps}>
                                 <img
                                    src={example.image}
                                    alt={example.title}
                                    className="w-full h-56 object-cover"
                                    loading="lazy"
                                 />
                              </a>
                              <div className="p-5 text-left">
                                 <h3 className="text-lg font-semibold mb-1 text-white">
                                    {example.title}
                                 </h3>
                                 <p className="text-gray-400 text-sm leading-relaxed mb-3">
                                    {example.description}
                                 </p>
                                 {external ? (
                                    <a
                                       href={example.link}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="text-[#00D2A8] text-sm font-medium hover:underline"
                                    >
                                       {t("common.seeExample")} →
                                    </a>
                                 ) : (
                                    <Link
                                       to="/contact"
                                       className="text-[#005BFF] text-sm font-medium hover:underline"
                                    >
                                       {t("portfolio.requestSite")}
                                    </Link>
                                 )}
                              </div>
                           </motion.div>
                        );
                     })}
                  </motion.div>
               </AnimatePresence>

               {filtered.length === 0 && (
                  <p className="text-gray-400 mt-8 text-xl">
                     {t("portfolio.noExamples")}
                  </p>
               )}
            </div>
         </section>
      </>
   );
};

export default Portfolio;
