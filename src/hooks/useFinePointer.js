import { useEffect, useState } from "react";

const QUERY = "(hover: hover) and (pointer: fine)";

// Vrai avec une souris ou un pavé tactile : les effets qui suivent le pointeur n'existent que là.
const useFinePointer = () => {
   const [fine, setFine] = useState(() => typeof window !== "undefined" && window.matchMedia(QUERY).matches);

   useEffect(() => {
      const mq = window.matchMedia(QUERY);
      const onChange = () => setFine(mq.matches);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
   }, []);

   return fine;
};

export default useFinePointer;
