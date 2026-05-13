import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
   Code2,
   Smartphone,
   BarChart3,
   Rocket,
   Palette,
   Search,
   Cloud,
   ShieldCheck,
} from "lucide-react";

const SERVICE_ICONS = [Code2, Smartphone, BarChart3, Rocket, Palette, Search, Cloud, ShieldCheck];

const ServicesCards = () => {
   const { t } = useTranslation();
   const items = t("services.items", { returnObjects: true });

   return (
      <section>
         <div className="max-w-7xl mx-auto text-center">
            <motion.h2
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
               className="text-4xl md:text-5xl font-bold mb-4"
            >
               {t("services.title")}{" "}
               <span className="text-[#005BFF]">{t("services.titleAccent")}</span>
            </motion.h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-12">
               {t("services.subtitle")}
            </p>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 px-4">
               {items.map((service, index) => {
                  const Icon = SERVICE_ICONS[index];
                  return (
                     <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.07 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -6 }}
                        className="bg-[#1C1C1C] p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-white/5 hover:border-[#005BFF] hover:shadow-[#005BFF]/20 text-left group"
                     >
                        <div className="w-12 h-12 rounded-xl bg-[#005BFF]/10 flex items-center justify-center mb-5 group-hover:bg-[#005BFF]/20 transition duration-300">
                           <Icon size={22} className="text-[#005BFF]" strokeWidth={1.6} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-white">
                           {service.title}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                           {service.description}
                        </p>
                     </motion.div>
                  );
               })}
            </div>
         </div>
      </section>
   );
};

export default ServicesCards;
