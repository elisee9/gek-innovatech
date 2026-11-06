import { useRef } from "react";
import { motion, useReducedMotion, useSpring } from "framer-motion";
import useFinePointer from "../hooks/useFinePointer";
import { SPRING } from "../utils/motion";

// Aimant : le bouton se laisse attirer vers la souris quand elle passe dessus, puis revient en place.
const Magnetic = ({ strength = 0.28, className = "", children }) => {
   const ref = useRef(null);
   const fine = useFinePointer();
   const reduce = useReducedMotion();
   const x = useSpring(0, SPRING);
   const y = useSpring(0, SPRING);

   if (!fine || reduce) return <span className={className}>{children}</span>;

   const onPointerMove = (e) => {
      const r = ref.current.getBoundingClientRect();
      x.set((e.clientX - (r.left + r.width / 2)) * strength);
      y.set((e.clientY - (r.top + r.height / 2)) * strength);
   };
   const onPointerLeave = () => {
      x.set(0);
      y.set(0);
   };

   return (
      <motion.span ref={ref} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} style={{ x, y }} className={className}>
         {children}
      </motion.span>
   );
};

export default Magnetic;
