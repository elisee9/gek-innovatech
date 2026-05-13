export const handleLinkClick = (setIsOpen) => {
   if (typeof setIsOpen === "function") setIsOpen(false);
   window.scrollTo({ top: 0, behavior: "smooth" });
};
