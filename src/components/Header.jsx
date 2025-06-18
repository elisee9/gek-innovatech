import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import PhraseAccroche from "./PhraseAccroche";
import { handleLinkClick } from "../utils/scrollUtils";

const navLinks = [
   { name: "Accueil", path: "/" },
   { name: "À Propos", path: "/about" },
   { name: "Services", path: "/services" },
   { name: "Nos Offres", path: "/plans" },
   { name: "Contact", path: "/contact" },
];

const Header = () => {
   const [isOpen, setIsOpen] = useState(false);
   const menuRef = useRef(null);

   useEffect(() => {
      document.body.style.overflow = isOpen ? "hidden" : "auto";

      // Fonction pour fermer le menu quand on clique à l'extérieur
      const handleClickOutside = (event) => {
         if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsOpen(false);
         }
      };

      // Ajout de l'écouteur d'événement
      if (isOpen) {
         document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
         document.body.style.overflow = "auto";
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, [isOpen]);

   return (
      <header className="fixed top-0 left-0 w-full z-50 bg-[#1E1E1E]/80 backdrop-blur-lg shadow-md">
         <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            {/* Logo */}
            <NavLink
               to="/"
               className="text-white text-2xl font-bold"
               onClick={handleLinkClick}
            >
               <span className="text-[#005BFF]">GEK</span> INNOVATECH
            </NavLink>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8 text-white">
               {navLinks.map((link) => (
                  <NavLink
                     key={link.name}
                     to={link.path}
                     className={({ isActive }) =>
                        `transition font-medium ${
                           isActive
                              ? "text-[#00D2A8]"
                              : "text-white hover:text-[#00D2A8]"
                        }`
                     }
                     onClick={handleLinkClick}
                  >
                     {link.name}
                  </NavLink>
               ))}
               <a
                  href="https://wa.me/22965426510"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#7F00FF] px-5 py-2 rounded-full font-medium text-white hover:bg-[#6b00d8] transition"
               >
                  WhatsApp
               </a>
            </nav>

            {/* Mobile Nav Toggle */}
            <button
               className={`md:hidden text-white text-2xl cursor-pointer z-50 transition-opacity duration-200 ${
                  isOpen ? "opacity-80" : "opacity-100"
               }`}
               onClick={() => setIsOpen(!isOpen)}
               aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
               {isOpen ? <FaTimes /> : <FaBars />}
            </button>
         </div>

         {/* Mobile Nav Menu */}
         <AnimatePresence>
            {isOpen && (
               <>
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="fixed inset-0 bg-black/70 z-30"
                  />

                  <motion.div
                     ref={menuRef}
                     initial={{ x: "100%" }}
                     animate={{ x: 0 }}
                     exit={{ x: "100%" }}
                     transition={{ type: "tween", duration: 0.3 }}
                     className="fixed top-0 right-0 h-80 w-80 bg-[#1E1E1E] z-40 overflow-y-auto rounded-l-3xl"
                  >
                     <div className="h-full flex flex-col justify-center items-center gap-1 p-3 ">
                        {navLinks.map((link) => (
                           <NavLink
                              key={link.name}
                              to={link.path}
                              className={({ isActive }) =>
                                 `text-xl font-semibold transition w-full text-center py-2 ${
                                    isActive
                                       ? "text-[#00D2A8]"
                                       : "text-white hover:text-[#00D2A8] "
                                 }`
                              }
                              onClick={() => {
                                 handleLinkClick();
                                 setIsOpen(false);
                              }}
                           >
                              {link.name}
                           </NavLink>
                        ))}
                        <a
                           href="https://wa.me/22965426510"
                           target="_blank"
                           rel="noopener noreferrer"
                           className="bg-[#00D2A8] hover:bg-[#00b795] px-6 py-2 rounded-lg text-black font-semibold transition mt-4 w-full text-center"
                        >
                           WhatsApp
                        </a>
                     </div>
                  </motion.div>
               </>
            )}
            <div className="w-full bg-[#1E1E1E]/30 border-t-2 border-[#00d2a8a6]">
               <PhraseAccroche />
            </div>
         </AnimatePresence>
      </header>
   );
};

export default Header;
// Ce code définit un composant d'en-tête réactif pour un site web, incluant un logo, des liens de navigation et un bouton pour ouvrir/fermer le menu mobile.
// Il utilise la bibliothèque Framer Motion pour les animations et gère l'état d'ouverture du menu mobile avec un hook useState.
