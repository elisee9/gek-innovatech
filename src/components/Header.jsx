import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import PhraseAccroche from "./PhraseAccroche";
import { handleLinkClick } from "../utils/scrollUtils";

const navLinks = [
   {
      name: "Accueil",
      path: "/",
      icon: (
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
         </svg>
      ),
   },
   {
      name: "À Propos",
      path: "/about",
      icon: (
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
         </svg>
      ),
   },
   {
      name: "Services",
      path: "/services",
      icon: (
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
         </svg>
      ),
   },
   {
      name: "Nos Offres",
      path: "/plans",
      icon: (
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
         </svg>
      ),
   },
   {
      name: "Contact",
      path: "/contact",
      icon: (
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
         </svg>
      ),
   },
];

const Header = () => {
   const [isOpen, setIsOpen] = useState(false);
   const menuRef = useRef(null);
   const [hoveredIndex, setHoveredIndex] = useState(null);

   useEffect(() => {
      document.body.style.overflow = isOpen ? "hidden" : "auto";
      const handleClickOutside = (event) => {
         if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsOpen(false);
         }
      };
      if (isOpen) {
         document.addEventListener("mousedown", handleClickOutside);
      }
      return () => {
         document.body.style.overflow = "auto";
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, [isOpen]);

   return (
      <header className="fixed top-0 left-0 w-full z-50 bg-[#1E1E1E]/80 backdrop-blur-lg shadow-2xl pb-2">
         <div className="w-full bg-[#1E1E1E]/30 border-b-2 border-[#00D2A8] rounded-b-2xl mt-0">
            <PhraseAccroche />
         </div>
         <div className="max-w-7xl mx-auto pl-6 py-3 flex justify-between items-center">
            {/* Logo */}
            <NavLink
               to="/"
               className="text-white text-2xl font-bold"
               onClick={handleLinkClick}
            >
               <span className="text-[#005BFF]">GEK</span> INNOVATECH
            </NavLink>

            <nav className="hidden md:flex items-center gap-8 text-white relative pr-6">
               {navLinks.map((link, index) => (
                  <div
                     key={link.name}
                     onMouseEnter={() => setHoveredIndex(index)}
                     onTouchStart={() => setHoveredIndex(index)}
                     onMouseLeave={() => setHoveredIndex(null)}
                     className="relative px-2 py-1"
                  >
                     <NavLink
                        to={link.path}
                        onClick={handleLinkClick}
                        className={({ isActive }) =>
                           `font-medium transition ${
                              isActive
                                 ? "text-[#005BFF]"
                                 : "text-white hover:text-[#00D2A8]"
                           }`
                        }
                     >
                        {link.name}
                     </NavLink>
                     {(hoveredIndex === index ||
                        navLinks.findIndex(
                           (l) => location.pathname === l.path
                        ) === index) && (
                        <motion.div
                           layoutId="hoverUnderline"
                           className={`absolute left-0 w-full h-[2px] rounded ${
                              navLinks.findIndex(
                                 (l) => location.pathname === l.path
                              ) === index
                                 ? "bg-[#005BFF]"
                                 : "bg-[#00D2A8]"
                           }`}
                           style={{ bottom: "-10px" }} // Ajoute de l'espace entre le texte et la ligne
                           transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 40,
                           }}
                        />
                     )}
                  </div>
               ))}

               <a
                  href="https://wa.me/22965426510"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-6 bg-[#00D2A8] hover:bg-[#00b795] px-5 py-2 rounded-lg font-medium text-white transition"
               >
                  WhatsApp
               </a>
            </nav>

            {/* Mobile Nav Toggle */}
            <button
               className={`md:hidden text-[#00D2A8] text-2xl cursor-pointer z-50 transition-opacity duration-200 pr-6 ${
                  isOpen ? "opacity-80 mt-6 pr-3" : "opacity-100"
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
                     className="fixed top-6 right-1 h-screen/2 w-70 bg-gray-800 z-40 overflow-y-auto py-16 text-justify rounded-2xl shadow-lg"
                  >
                     <div className="h-full flex flex-col gap-5 px-8">
                        {navLinks.map((link) => (
                           <NavLink
                              key={link.name}
                              to={link.path}
                              className={({ isActive }) =>
                                 `text-xl font-semibold flex flex-row gap-8 py-2 hover:text-[#00D2A8] transition-colors
            ${isActive ? "text-[#005BFF]" : "text-white"}`
                              }
                              onClick={() => {
                                 handleLinkClick();
                                 setIsOpen(false);
                              }}
                           >
                              <span className="flex-shrink-0 pt-1 text-[#00b795]">
                                 {link.icon}
                              </span>
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
         </AnimatePresence>
      </header>
   );
};

export default Header;

// Ce code définit un composant d'en-tête réactif pour un site web, incluant un logo, des liens de navigation et un bouton pour ouvrir/fermer le menu mobile.
// Il utilise la bibliothèque Framer Motion pour les animations et gère l'état d'ouverture du menu mobile avec un hook useState.
