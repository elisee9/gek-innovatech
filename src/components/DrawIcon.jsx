import { useLayoutEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const SHAPES = "path, circle, rect, line, polyline, polygon, ellipse";

// Icône au trait qui se dessine quand elle entre dans la fenêtre (classe .draw-icon).
// Le trait n'est masqué qu'une fois mesuré : sans script, l'icône reste visible.
const DrawIcon = ({ icon: Icon, delay = 0, duration = 1.1, className = "", ...props }) => {
   const ref = useRef(null);
   const reduce = useReducedMotion();
   const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
   const [armed, setArmed] = useState(false);

   useLayoutEffect(() => {
      if (reduce || !ref.current) return;
      ref.current.querySelectorAll(SHAPES).forEach((shape) => {
         const length = typeof shape.getTotalLength === "function" ? shape.getTotalLength() : 0;
         shape.style.setProperty("--len", String(Math.ceil(length) + 1));
      });
      setArmed(true);
   }, [reduce]);

   return (
      <span
         ref={ref}
         aria-hidden="true"
         className={`draw-icon inline-flex flex-none ${armed ? "is-armed" : ""} ${inView ? "is-drawn" : ""}`}
         style={{ "--draw-delay": `${delay}s`, "--draw-dur": `${duration}s` }}
      >
         <Icon className={className} {...props} />
      </span>
   );
};

export default DrawIcon;
