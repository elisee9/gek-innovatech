import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import PhraseAccroche from "./PhraseAccroche";
import Logo from "./Logo";
import { handleLinkClick } from "../utils/scrollUtils";
import { useTranslation } from "react-i18next";

const FrFlag = () => (
   <svg width="20" height="14" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" className="rounded-sm flex-shrink-0">
      <rect width="300" height="600" fill="#002395" />
      <rect x="300" width="300" height="600" fill="#fff" />
      <rect x="600" width="300" height="600" fill="#ED2939" />
   </svg>
);

const GbFlag = () => (
   <svg width="20" height="14" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg" className="rounded-sm flex-shrink-0">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
   </svg>
);

const LANGS = [
   { code: "fr", label: "FR", Flag: FrFlag },
   { code: "en", label: "EN", Flag: GbFlag },
];

const LanguageSwitcher = ({ mobile = false }) => {
   const { i18n } = useTranslation();
   const currentLang = i18n.language;

   const switchLang = (lang) => {
      i18n.changeLanguage(lang);
      localStorage.setItem("lang", lang);
   };

   if (mobile) {
      return (
         <div className="flex gap-3 mt-2">
            {LANGS.map(({ code, label, Flag }) => (
               <button
                  key={code}
                  onClick={() => switchLang(code)}
                  className={`flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg transition ${
                     currentLang === code
                        ? "bg-[#005BFF] text-white"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
               >
                  <Flag />
                  {label}
               </button>
            ))}
         </div>
      );
   }

   return (
      <div className="flex items-center gap-1 ml-4 border border-white/20 rounded-lg overflow-hidden">
         {LANGS.map(({ code, label, Flag }, i) => (
            <div key={code} className="flex items-center">
               {i > 0 && <span className="text-white/20 text-xs">|</span>}
               <button
                  onClick={() => switchLang(code)}
                  className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 transition ${
                     currentLang === code
                        ? "bg-[#005BFF] text-white"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
               >
                  <Flag />
                  {label}
               </button>
            </div>
         ))}
      </div>
   );
};

const Header = () => {
   const { t } = useTranslation();
   const [isOpen, setIsOpen] = useState(false);
   const menuRef = useRef(null);
   const [hoveredIndex, setHoveredIndex] = useState(null);

   const navLinks = [
      { name: t("header.home"), path: "/" },
      { name: t("header.about"), path: "/about" },
      { name: t("header.services"), path: "/services" },
      { name: t("header.plans"), path: "/plans" },
      { name: t("header.contact"), path: "/contact" },
   ];

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
      <header className="fixed top-0 left-0 w-full z-50 bg-[#1E1E1E]/80 backdrop-blur-lg shadow-2xl pb-2 mb-10">
         <div className="w-full bg-[#1E1E1E]/30 border-b-2 border-[#00D2A8] rounded-b-2xl mt-0">
            <PhraseAccroche />
         </div>
         <div className="max-w-7xl mx-auto pl-6 py-3 flex justify-between items-center">
            {/* Logo */}
            <NavLink to="/" onClick={() => handleLinkClick()} aria-label="GEK INNOVATECH — Accueil">
               <Logo width={145} />
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
                        onClick={() => handleLinkClick()}
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
                           style={{ bottom: "-10px" }}
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
                  href="https://wa.me/2290165426510"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 bg-[#00D2A8] hover:bg-[#00b795] px-5 py-2 rounded-lg font-medium text-white transition"
               >
                  {t("common.whatsapp")}
               </a>

               <LanguageSwitcher />
            </nav>

            {/* Mobile Nav Toggle */}
            <button
               className={`md:hidden text-[#00D2A8] text-2xl cursor-pointer z-50 transition-opacity duration-200 pr-6 ${
                  isOpen ? "opacity-80 mt-6 pr-3" : "opacity-100"
               }`}
               onClick={() => setIsOpen(!isOpen)}
               aria-label={isOpen ? t("header.closeMenu") : t("header.openMenu")}
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
                                 `text-xl font-semibold py-2 hover:text-[#00D2A8] transition-colors ${
                                    isActive ? "text-[#005BFF]" : "text-white"
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
                           href="https://wa.me/2290165426510"
                           target="_blank"
                           rel="noopener noreferrer"
                           className="bg-[#00D2A8] hover:bg-[#00b795] px-6 py-2 rounded-lg text-black font-semibold transition mt-4 w-full text-center"
                        >
                           {t("common.whatsapp")}
                        </a>
                        <LanguageSwitcher mobile />
                     </div>
                  </motion.div>
               </>
            )}
         </AnimatePresence>
      </header>
   );
};

export default Header;
