import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Logo from "./Logo";
import Pill from "./Pill";
import { whatsappLink } from "../data/contact";
import { EASE } from "../utils/motion";

const LANGS = ["fr", "en"];

const LanguageSwitcher = ({ layoutGroup, className = "" }) => {
   const { t, i18n } = useTranslation();
   const current = i18n.resolvedLanguage || i18n.language;

   const switchLang = (lang) => {
      i18n.changeLanguage(lang);
      try {
         localStorage.setItem("lang", lang);
      } catch {
         // Stockage indisponible (navigation privée) : la langue reste valable pour la session.
      }
   };

   return (
      <div role="group" aria-label={t("header.language")} className={`items-center rounded-full border border-line p-1 ${className}`}>
         {LANGS.map((lang) => (
            <button
               key={lang}
               type="button"
               onClick={() => switchLang(lang)}
               aria-pressed={current === lang}
               className={`relative h-8 rounded-full px-3 text-[13px] font-medium uppercase tracking-wide transition-colors duration-300 ${
                  current === lang ? "text-ink" : "text-muted hover:text-fg"
               }`}
            >
               {/* La pastille blanche glisse d'une langue à l'autre. */}
               {current === lang && (
                  <motion.span
                     layoutId={`lang-chip-${layoutGroup}`}
                     transition={{ duration: 0.45, ease: EASE }}
                     className="absolute inset-0 rounded-full bg-fg"
                  />
               )}
               <span className="relative">{lang}</span>
            </button>
         ))}
      </div>
   );
};

const Header = () => {
   const { t } = useTranslation();
   const { pathname } = useLocation();
   const [open, setOpen] = useState(false);
   const [scrolled, setScrolled] = useState(false);
   const [hovered, setHovered] = useState(null);
   const menuButton = useRef(null);

   const links = [
      { name: t("header.home"), path: "/" },
      { name: t("header.about"), path: "/about" },
      { name: t("header.services"), path: "/services" },
      { name: t("header.plans"), path: "/plans" },
      { name: t("header.portfolio"), path: "/portfolio" },
      { name: t("header.contact"), path: "/contact" },
   ];

   useEffect(() => {
      setOpen(false);
   }, [pathname]);

   useEffect(() => {
      const onScroll = () => setScrolled(window.scrollY > 12);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
   }, []);

   useEffect(() => {
      if (!open) return undefined;
      document.body.style.overflow = "hidden";
      // Échap ferme le menu et rend la main au bouton qui l'a ouvert.
      const onKey = (e) => {
         if (e.key !== "Escape") return;
         setOpen(false);
         menuButton.current?.focus();
      };
      window.addEventListener("keydown", onKey);
      return () => {
         document.body.style.overflow = "";
         window.removeEventListener("keydown", onKey);
      };
   }, [open]);

   // Chaque page s'ouvre sur un bandeau marine : l'en-tête y reste transparent, en couleurs claires, jusqu'au premier défilement.
   const solid = scrolled || open;

   return (
      <motion.header
         initial={{ y: -28, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ duration: 0.6, ease: EASE }}
         className={`fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4 ${solid ? "" : "on-dark"}`}
      >
         <div
            className={`relative mx-auto flex h-16 max-w-[1200px] items-center justify-between rounded-full border pl-5 pr-2.5 transition-[background-color,border-color,box-shadow] duration-300 ${
               solid ? "border-line bg-ink-2 shadow-float" : "border-transparent bg-transparent"
            }`}
         >
            <Link to="/" aria-label={t("header.homeLabel")} className="rounded-lg">
               <Logo width={116} />
            </Link>

            <nav aria-label={t("header.navLabel")} className="hidden lg:block">
               <ul className="flex items-center gap-0.5" onPointerLeave={() => setHovered(null)}>
                  {links.map((link) => (
                     <li key={link.path} onPointerEnter={() => setHovered(link.path)}>
                        <NavLink
                           to={link.path}
                           end={link.path === "/"}
                           className={({ isActive }) =>
                              `relative flex items-center gap-2 rounded-full px-3.5 py-2 text-[15px] transition-colors duration-300 ${
                                 isActive ? "text-fg" : "text-muted hover:text-fg"
                              }`
                           }
                        >
                           {({ isActive }) => (
                              <>
                                 {/* Le fond suit le lien survolé ; le point rouge glisse vers la page ouverte. */}
                                 {hovered === link.path && (
                                    <motion.span
                                       layoutId="nav-hover"
                                       transition={{ duration: 0.35, ease: EASE }}
                                       className="absolute inset-0 rounded-full bg-fg/[0.06]"
                                    />
                                 )}
                                 <span aria-hidden="true" className="relative h-1.5 w-1.5">
                                    {isActive && (
                                       <motion.span
                                          layoutId="nav-active"
                                          transition={{ duration: 0.5, ease: EASE }}
                                          className="absolute inset-0 rounded-full bg-signal shadow-spark"
                                       />
                                    )}
                                 </span>
                                 <span className="relative">{link.name}</span>
                              </>
                           )}
                        </NavLink>
                     </li>
                  ))}
               </ul>
            </nav>

            <div className="flex items-center gap-2">
               <LanguageSwitcher layoutGroup="bar" className="hidden sm:flex" />
               <Pill
                  href={whatsappLink(t("common.whatsappMessage"))}
                  variant="lit"
                  size="sm"
                  icon={FaWhatsapp}
                  className="hidden sm:inline-flex"
               >
                  {t("common.whatsapp")}
               </Pill>
               <button
                  ref={menuButton}
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  aria-expanded={open}
                  aria-controls="mobile-menu"
                  aria-label={open ? t("header.closeMenu") : t("header.openMenu")}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-fg transition-colors hover:bg-ink-3 lg:hidden"
               >
                  {open ? <X size={20} /> : <Menu size={20} />}
               </button>
            </div>
         </div>

         <AnimatePresence>
            {open && (
               // Voile derrière le menu : toucher à côté le referme.
               <motion.div
                  key="veil"
                  aria-hidden="true"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 -z-10 bg-brand-deep/40 lg:hidden"
               />
            )}
            {/* Choisir un lien referme le menu, même s'il mène à une ancre de la page déjà ouverte (#devis). */}
            {open && (
               <motion.div
                  key="sheet"
                  id="mobile-menu"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(e) => e.target.closest("a") && setOpen(false)}
                  className="mx-auto mt-2 max-h-[calc(100dvh-6rem)] max-w-[1200px] overflow-y-auto overscroll-contain rounded-[28px] border border-line bg-ink-2 p-6 shadow-float lg:hidden"
               >
                  <nav aria-label={t("header.navLabel")}>
                     <motion.ul
                        initial="hidden"
                        animate="show"
                        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } } }}
                        className="flex flex-col"
                     >
                        {links.map((link) => (
                           <motion.li
                              key={link.path}
                              variants={{
                                 hidden: { opacity: 0, x: -14 },
                                 show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
                              }}
                              className="border-b border-line last:border-b-0"
                           >
                              <NavLink
                                 to={link.path}
                                 end={link.path === "/"}
                                 className={({ isActive }) =>
                                    `flex items-center gap-3 py-3.5 text-[22px] font-medium tracking-[-0.01em] ${
                                       isActive ? "text-fg" : "text-muted"
                                    }`
                                 }
                              >
                                 {({ isActive }) => (
                                    <>
                                       <span
                                          aria-hidden="true"
                                          className={`h-1.5 w-1.5 rounded-full bg-signal ${isActive ? "opacity-100" : "opacity-0"}`}
                                       />
                                       {link.name}
                                    </>
                                 )}
                              </NavLink>
                           </motion.li>
                        ))}
                     </motion.ul>
                  </nav>
                  <div className="mt-6 flex flex-col gap-3">
                     <Pill href={whatsappLink(t("common.whatsappMessage"))} variant="lit" size="lg" icon={FaWhatsapp}>
                        {t("common.writeWhatsapp")}
                     </Pill>
                     <Pill to={{ pathname: "/", hash: "#devis" }} size="lg">
                        {t("common.requestQuote")}
                     </Pill>
                     <LanguageSwitcher layoutGroup="sheet" className="mt-2 flex self-start sm:hidden" />
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </motion.header>
   );
};

export default Header;
