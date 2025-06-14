import { motion } from "framer-motion";
import { FaBolt, FaUserShield, FaLightbulb, FaTools } from "react-icons/fa";

const reasons = [
   {
      icon: <FaBolt size={28} />,
      title: "Performance optimale",
      description:
         "Nos solutions sont conçues pour être rapides, fluides et parfaitement optimisées pour offrir une expérience utilisateur exceptionnelle.",
   },
   {
      icon: <FaUserShield size={28} />,
      title: "Fiabilité & sécurité",
      description:
         "Nous assurons une sécurité renforcée pour protéger vos données et celles de vos clients avec les meilleures pratiques du marché.",
   },
   {
      icon: <FaLightbulb size={28} />,
      title: "Créativité & innovation",
      description:
         "Chaque projet est une opportunité pour innover. Nous combinons design et technologie pour créer des expériences uniques.",
   },
   {
      icon: <FaTools size={28} />,
      title: "Support technique dédié",
      description:
         "Nous restons disponibles pour vous accompagner après la livraison, avec un support rapide, humain et réactif.",
   },
];

const WhyChooseUs = () => {
   return (
      <section className="relative text-white px-4 ">
         <div className="max-w-7xl mx-auto text-center">
            <motion.h2
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
               className="text-4xl md:text-5xl font-bold mb-8"
            >
               Pourquoi <span className="text-[#00D2A8]">nous choisir</span> ?
            </motion.h2>

            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
               {reasons.map((reason, index) => (
                  <motion.div
                     key={index}
                     initial={{ opacity: 0, y: 40 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.1, delay: index * 0.1 }}
                     viewport={{ once: true }}
                     whileHover={{ scale: 1.06 }}
                     className="bg-[#1C1C1C] p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-white/5 cursor-pointer hover:border-[#00D2A8] hover:shadow-[#00D2A8]/40"
                  >
                     <div className="text-[#00D2A8] mb-4">{reason.icon}</div>
                     <h3 className="text-xl font-semibold mb-2">
                        {reason.title}
                     </h3>
                     <p className="text-gray-400 text-sm leading-relaxed">
                        {reason.description}
                     </p>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>
   );
};

export default WhyChooseUs;
