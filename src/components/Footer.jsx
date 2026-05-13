import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Phone, MessageCircle, Mail } from "lucide-react";
import Logo from "./Logo";

function Footer() {
   const { t } = useTranslation();

   const handleScrollTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
   };

   const navLinks = [
      { name: t("header.home"), path: "/" },
      { name: t("header.about"), path: "/about" },
      { name: t("header.services"), path: "/services" },
      { name: t("header.plans"), path: "/plans" },
      { name: t("header.contact"), path: "/contact" },
   ];

   return (
      <footer className="bg-[#1E1E1E] text-white pt-10 pb-6 px-4">
         <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
            {/* Branding */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
            >
               <div className="mb-3">
                  <NavLink to="/" onClick={handleScrollTop} aria-label="GEK INNOVATECH">
                     <Logo width={130} />
                  </NavLink>
               </div>
               <p className="text-gray-400">
                  {t("footer.tagline")}
                  <br />
                  <NavLink
                     to="/portfolio"
                     className="inline-block text-white font-semibold py-3 text-xl cursor-pointer"
                     onClick={handleScrollTop}
                  >
                     {t("common.viewPortfolio")}{" "}
                     <span className="text-[#005BFF] font-black">→</span>
                  </NavLink>
               </p>
            </motion.div>

            {/* Liens */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1, duration: 0.5 }}
            >
               <h3 className="text-lg font-semibold mb-3">{t("footer.usefulLinks")}</h3>
               <ul className="text-gray-300 space-y-2">
                  {navLinks.map((link) => (
                     <li key={link.path}>
                        <NavLink
                           to={link.path}
                           className={({ isActive }) =>
                              `group inline-block relative transition-all duration-300 ${
                                 isActive ? "text-[#005BFF] font-medium" : "text-gray-300"
                              }`
                           }
                           onClick={handleScrollTop}
                        >
                           <span className="hover:text-[#00D2A8] transition-colors duration-200">
                              {link.name}
                           </span>
                           <span className="block h-0.5 w-0 group-hover:w-full bg-[#00D2A8] transition-all duration-300"></span>
                        </NavLink>
                     </li>
                  ))}
               </ul>
            </motion.div>

            {/* Contact */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2, duration: 0.5 }}
            >
               <h3 className="text-lg font-semibold mb-3">{t("footer.contact")}</h3>
               <div className="text-gray-300 space-y-4 text-sm">
                  <a
                     href="tel:+2290165426510"
                     className="flex items-center gap-3 group hover:text-[#00D2A8] transition"
                  >
                     <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#00D2A8]/10 transition">
                        <Phone size={14} className="text-[#00D2A8]" strokeWidth={1.8} />
                     </span>
                     <span className="font-medium">+229 01 65 42 6510</span>
                  </a>
                  <a
                     href="https://wa.me/2290165426510"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center gap-3 group hover:text-[#00D2A8] transition"
                  >
                     <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#00D2A8]/10 transition">
                        <MessageCircle size={14} className="text-[#00D2A8]" strokeWidth={1.8} />
                     </span>
                     <span className="font-medium">+229 01 65 42 65 10</span>
                  </a>
                  <NavLink
                     to="/contact"
                     onClick={handleScrollTop}
                     className="flex items-center gap-3 group hover:text-[#00D2A8] transition"
                  >
                     <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#00D2A8]/10 transition">
                        <Mail size={14} className="text-[#00D2A8]" strokeWidth={1.8} />
                     </span>
                     <span className="font-medium">contact@gekinnovatech.com</span>
                  </NavLink>
               </div>
            </motion.div>
         </div>

         <div className="text-center text-sm text-gray-400 mt-10 border-t border-gray-700 pt-4 space-y-2">
            <div>
               &copy;{" "}
               {new Date().getFullYear()}{" "}
               <a href="/" className="text-[#005BFF] font-bold hover:text-[#00D2A8] transition">
                  GEK INNOVATECH
               </a>
               {" — "}
               {t("footer.copyright")}
            </div>
            <div>
               <NavLink
                  to="/mentions-legales"
                  onClick={handleScrollTop}
                  className="hover:text-[#00D2A8] transition underline underline-offset-2"
               >
                  {t("footer.mentions")}
               </NavLink>
            </div>
         </div>
      </footer>
   );
}

export default Footer;
