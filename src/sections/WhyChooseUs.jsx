import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Zap, ShieldCheck, Lightbulb, Headphones } from "lucide-react";

const WHY_ICONS = [Zap, ShieldCheck, Lightbulb, Headphones];

const WhyChooseUs = () => {
   const { t } = useTranslation();
   const items = t("whyChooseUs.items", { returnObjects: true });

   return (
      <section className="relative text-white px-4">
         <div className="max-w-7xl mx-auto text-center">
            <motion.h2
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
               className="text-4xl md:text-5xl font-bold mb-8"
            >
               {t("whyChooseUs.title")}{" "}
               <span className="text-[#005BFF]">{t("whyChooseUs.titleAccent")}</span>{" "}?
            </motion.h2>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
               {items.map((reason, index) => {
                  const Icon = WHY_ICONS[index];
                  return (
                     <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -6 }}
                        className="bg-[#1C1C1C] p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-white/5 hover:border-[#00D2A8] hover:shadow-[#00D2A8]/20 text-left group"
                     >
                        <div className="w-12 h-12 rounded-xl bg-[#00D2A8]/10 flex items-center justify-center mb-5 group-hover:bg-[#00D2A8]/20 transition duration-300">
                           <Icon size={22} className="text-[#00D2A8]" strokeWidth={1.6} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-white">
                           {reason.title}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                           {reason.description}
                        </p>
                     </motion.div>
                  );
               })}
            </div>
         </div>
      </section>
   );
};

export default WhyChooseUs;
