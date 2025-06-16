import React from "react";
import { motion } from "framer-motion";
import {
   FaLaptopCode,
   FaMobileAlt,
   FaChartLine,
   FaRocket,
   FaPaintBrush,
   FaSearch,
   FaCloud,
   FaShieldAlt,
   // FaUserGraduate, // Commenté pour éviter l'erreur de non-utilisation
} from "react-icons/fa";

const services = [
   {
         icon: <FaLaptopCode className="text-4xl text-[#00D2A8]" />,
         title: "Développement Web",
         description:
            "Des sites performants, modernes et optimisés pour tous les écrans, avec un excellent référencement naturel (SEO).",
      },
      {
         icon: <FaMobileAlt className="text-4xl text-green-500" />,
         title: "Applications Mobiles",
         description:
            "Des applications fluides et ergonomiques, pour iOS et Android, pensées pour votre audience mobile.",
      },
      {
         icon: <FaChartLine className="text-4xl text-orange-400" />,
         title: "Marketing & Analyse",
         description:
            "Des campagnes ciblées, un suivi précis et des outils pour booster votre visibilité et vos performances.",
      },
      {
         icon: <FaRocket className="text-4xl text-pink-500" />,
         title: "Lancement & Maintenance",
         description:
            "Nous vous accompagnons après la mise en ligne avec un support, des mises à jour et des évolutions personnalisées.",
      },
      {
         icon: <FaPaintBrush className="text-4xl text-pink-400" />,
         title: "Design UI/UX",
         description:
            "Des interfaces élégantes et intuitives qui améliorent l’expérience utilisateur et l'engagement.",
      },
      {
         icon: <FaSearch className="text-4xl text-yellow-400" />,
         title: "SEO & Référencement",
         description:
            "Boostez votre position sur les moteurs de recherche grâce à des pratiques SEO modernes et efficaces.",
      },
      {
         icon: <FaCloud className="text-4xl text-blue-400" />,
         title: "Hébergement Cloud",
         description:
            "Des solutions cloud rapides et sécurisées pour garantir la haute disponibilité de vos services.",
      },
      {
         icon: <FaShieldAlt className="text-4xl text-red-500" />,
         title: "Sécurité Web",
         description:
            "Protégez vos données et celles de vos clients grâce à des solutions de cybersécurité avancées.",
      },
      // {
      //    icon: <FaUserGraduate className="text-4xl text-purple-500" />,
      //    title: "Formation & Support",
      //    description:
      //       "Des formations personnalisées et un support technique réactif pour vous accompagner dans votre projet.",
      // },
];

const ServicesCards = () => {
   return (
      <section className="">
         <div className="max-w-7xl mx-auto text-center">
            <motion.h2
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
               className="text-4xl md:text-5xl font-bold mb-4"
            >
               Nos <span className="text-[#00D2A8]">Services</span>
            </motion.h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-12">
               Découvrez l’ensemble des solutions que nous proposons pour
               accompagner votre succès numérique.
            </p>

            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 px-4">
               {services.map((service, index) => (
                  <motion.div
                     key={index}
                     initial={{ opacity: 0, y: 40 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.1, delay: index * 0.1 }}
                     viewport={{ once: true }}
                     whileHover={{ scale: 1.06 }}
                     className="bg-[#1C1C1C] p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-white/5 cursor-pointer hover:border-[#00D2A8] hover:shadow-[#00D2A8]/40"
                  >
                     <div className="mb-4">{service.icon}</div>
                     <h3 className="text-xl font-semibold mb-2">
                        {service.title}
                     </h3>
                     <p className="text-gray-400 text-sm leading-relaxed">
                        {service.description}
                     </p>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>
   );
};

export default ServicesCards;
