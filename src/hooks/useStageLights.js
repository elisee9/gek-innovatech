import { useEffect } from "react";

// Allume le projecteur (.stage::before) de chaque section quand elle entre dans la fenêtre.
// Les pages sont chargées à la demande : un MutationObserver rattrape les sections qui arrivent après coup.
const useStageLights = (rootId = "contenu") => {
   useEffect(() => {
      const root = document.getElementById(rootId);
      if (!root || !("IntersectionObserver" in window)) return undefined;
      document.documentElement.classList.add("stage-js");

      const io = new IntersectionObserver(
         (entries) => {
            for (const entry of entries) {
               if (!entry.isIntersecting) continue;
               entry.target.classList.add("is-lit");
               io.unobserve(entry.target);
            }
         },
         { rootMargin: "0px 0px -18% 0px" }
      );
      const scan = () => root.querySelectorAll(".stage:not(.is-lit)").forEach((el) => io.observe(el));
      const mo = new MutationObserver(scan);

      scan();
      mo.observe(root, { childList: true, subtree: true });
      return () => {
         io.disconnect();
         mo.disconnect();
      };
   }, [rootId]);
};

export default useStageLights;
