// src/pages/Portfolio.jsx
import React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import portfolioExamples from "../data/portfolioData";
import { Helmet } from "react-helmet-async";

const plans = [
   { id: "all", label: "Tous" },
   { id: "basic", label: "Plan Starter" },
   { id: "standard", label: "Plan Pro" },
   { id: "premium", label: "Plan Premium" },
];

const Portfolio = () => {
   const [selectedPlan, setSelectedPlan] = useState("all");

   const filteredExamples =
      selectedPlan === "all"
         ? portfolioExamples
         : portfolioExamples.filter(
              (example) => example.planId === selectedPlan
           );

   return (
      <>
         <Helmet>
            <title> Nos Réalisations | GEK INNOVATECH</title>
            <meta
               name="description"
               content="Découvrez ce que nous réalisons pour vous accompagner ! Votre succès, notre priorité."
            />
         </Helmet>
         <section className="min-h-screen py-16 px-4 md:px-10 mt-24 text-white">
            <div className="max-w-6xl mx-auto text-center">
               <h2 className="text-4xl font-bold mb-4">
                  Nos <span className="text-[#00D2A8]">Réalisations</span>
               </h2>
               <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-12">
                  Découvrez quelques exemples de sites que nous pouvons adapter
                  selon vos besoins.
               </p>

               {/* Filtres */}
               <div className="flex flex-wrap justify-center gap-4 mb-10">
                  {plans.map((plan) => (
                     <button
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`px-5 py-2 rounded-full border text-sm font-medium transition duration-300 cursor-pointer ${
                           selectedPlan === plan.id
                              ? "bg-[#00D2A8] text-black border-[#00D2A8]"
                              : "border-white/10 text-white hover:border-[#00D2A8] hover:text-[#00D2A8]"
                        }`}
                     >
                        {plan.label}
                     </button>
                  ))}
               </div>

               {/* Grille */}
               <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredExamples.map((example, index) => (
                     <motion.div
                        key={example.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.06 }}
                        className="bg-[#1C1C1C] p-3 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-white/5 cursor-pointer hover:border-[#00D2A8] hover:shadow-[#00D2A8]/40"
                     >
                        <a
                           href={example.link}
                           target="_blank"
                           rel="noopener noreferrer"
                        >
                           <img
                              src={example.image}
                              alt={example.title}
                              className="w-full h-60 object-cover"
                           />
                        </a>
                        <div className="p-5 text-left">
                           <h3 className="text-xl font-semibold mb-2">
                              {example.title}
                           </h3>
                           <p className="text-gray-400 text-sm leading-relaxed">
                              {example.description}
                           </p>
                           <a
                              href={example.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block text-[#00D2A8] text-sm font-medium hover:underline"
                           >
                              Voir l'exemple →
                           </a>
                        </div>
                     </motion.div>
                  ))}
               </div>

               {/* Message si aucun projet */}
               {filteredExamples.length === 0 && (
                  <p className="text-gray-400 mt-8 text-2xl">
                     Aucun exemple disponible pour ce plan pour le moment.
                  </p>
               )}
            </div>
         </section>
      </>
   );
};

export default Portfolio;

// Note: Ce composant affiche une section de portfolio avec des exemples de sites web réalisés. Chaque exemple est présenté dans une carte avec une image, un titre, une description et un lien vers le site en direct. Les animations sont gérées par Framer Motion pour une transition fluide lors du chargement de la page.
// Chaque carte est responsive et s'adapte à différentes tailles d'écran, offrant une expérience utilisateur agréable sur mobile et desktop. Les images et descriptions sont fictives et doivent être remplacées par des contenus réels lors de l'intégration dans le projet.
