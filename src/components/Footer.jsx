import React from "react";
import { NavLink } from "react-router-dom";
import { FaWhatsapp, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";


function Footer() {
   const handleScrollTop = () => {
      window.scrollTo({
         top: 0,
         behavior: "smooth",
      });
   };

   const navLinks = [
      { name: "Accueil", path: "/" },
      { name: "À Propos", path: "/about" },
      { name: "Nos Services", path: "/services" },
      { name: "Nos Tarifs", path: "/plans" },
      { name: "Contact", path: "/contact" },
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
               <h2 className="text-2xl font-bold mb-3">
                  <NavLink
                     to="/"
                     className="hover:text-white"
                     onClick={handleScrollTop}
                  >
                     <span className="text-[#005BFF]">GEK</span> INNOVATECH
                  </NavLink>
               </h2>
               <p className="text-gray-400">
                  Nous développons des sites web modernes, rapides et adaptés à
                  vos besoins. <br />
                  <NavLink
                     to="/portfolio"
                     className="inline-block text-white font-semibold py-3 px-4 text-xl cursor-pointer"
                     onClick={handleScrollTop}
                  >
                     Nos{" "}
                     <span className="text-[#00D2A8]">
                        Réalisations <span className="font-black">→</span>
                     </span>
                  </NavLink>
               </p>
            </motion.div>

            {/*  Liens  */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1, duration: 0.5 }}
            >
               <h3 className="text-lg font-semibold mb-3">Liens utiles</h3>
               <ul className="text-gray-300 space-y-2">
                  {navLinks.map((link) => (
                     <li key={link.path}>
                        <NavLink
                           to={link.path}
                           className={({ isActive }) =>
                              `group inline-block relative transition-all duration-300 ${
                                 isActive
                                    ? "text-[#00D2A8] font-medium"
                                    : "text-gray-300"
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
               <h3 className="text-lg font-semibold mb-3">Contact</h3>
               <div className="text-gray-300 space-y-2 text-sm">
                  <div className="flex items-center gap-2 group">
                     <FaPhoneAlt className="text-[#00D2A8] group-hover:scale-110 transition-transform duration-300" />
                     <span>+229 01 65 42 6510</span>
                  </div>
                  <div className="flex items-center gap-2 group">
                     <FaWhatsapp className="text-green-500 group-hover:text-green-400 transition duration-300" />
                     <a
                        href="https://wa.me/22965426510"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-green-400 transition"
                     >
                        WhatsApp : +229 65 42 65 10
                     </a>
                  </div>
                  <div className="flex items-center gap-2 group">
                     <FaEnvelope className="text-yellow-400 group-hover:text-yellow-300 transition duration-300" />
                     <NavLink
                        to="/contact"
                        className="hover:text-yellow-300 transition"
                        onClick={handleScrollTop}
                     >
                        contact@gekinnovatech.com
                     </NavLink>
                  </div>
               </div>
            </motion.div>
         </div>

         <div className="text-center text-sm text-gray-400 mt-10 border-t border-gray-700 pt-4">
            © {new Date().getFullYear()} GEK INNOVATECH. Tous droits réservés.
         </div>
      </footer>
   );
}

export default Footer;

// Ce code définit le pied de page du site web de GEK INNOVATECH.
// Il utilise la bibliothèque Framer Motion pour animer l'apparition des éléments.
// Le pied de page contient des informations de contact, des liens vers d'autres pages du site et une mention légale sur les droits d'auteur.
