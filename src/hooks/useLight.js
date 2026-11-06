import { useEffect, useRef } from "react";
import { animate, useReducedMotion, useSpring } from "framer-motion";
import useFinePointer from "./useFinePointer";
import { EASE, SPRING } from "../utils/motion";

// Lumière d'une surface : le halo et le bord allumé suivent le pointeur au travers des variables CSS
// --mx, --my et --lit (classe .lit-card), sans aucun rendu React pendant le mouvement.
// sweep : à son entrée dans la fenêtre, la lumière balaie la surface une fois (seul effet visible au doigt).
// tilt : inclinaison maximale en degrés vers le pointeur, souris uniquement.
const useLight = ({ tilt = 0, sweep = true } = {}) => {
   const ref = useRef(null);
   const sweepRef = useRef(null);
   const hovered = useRef(false);
   const fine = useFinePointer();
   const reduce = useReducedMotion();
   const rotateX = useSpring(0, SPRING);
   const rotateY = useSpring(0, SPRING);
   const canTilt = tilt > 0 && fine && !reduce;

   useEffect(() => {
      const el = ref.current;
      if (!el || !sweep || reduce) return undefined;
      const io = new IntersectionObserver(
         ([entry]) => {
            if (!entry.isIntersecting) return;
            io.disconnect();
            if (hovered.current) return;
            el.style.setProperty("--my", "30%");
            el.style.setProperty("--lit", "1");
            sweepRef.current = animate(-25, 125, {
               duration: 1.9,
               delay: 0.45,
               ease: EASE,
               onUpdate: (v) => el.style.setProperty("--mx", `${v}%`),
               onComplete: () => !hovered.current && el.style.setProperty("--lit", "0"),
            });
         },
         { threshold: 0.35 }
      );
      io.observe(el);
      return () => {
         io.disconnect();
         sweepRef.current?.stop();
      };
   }, [sweep, reduce]);

   const onPointerEnter = (e) => {
      if (e.pointerType !== "mouse") return;
      hovered.current = true;
      sweepRef.current?.stop();
      ref.current?.style.setProperty("--lit", "1");
   };

   const onPointerMove = (e) => {
      if (e.pointerType !== "mouse" || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      ref.current.style.setProperty("--mx", `${x}px`);
      ref.current.style.setProperty("--my", `${y}px`);
      if (canTilt) {
         rotateY.set((x / r.width - 0.5) * tilt * 2);
         rotateX.set((0.5 - y / r.height) * tilt * 2);
      }
   };

   const onPointerLeave = () => {
      hovered.current = false;
      ref.current?.style.setProperty("--lit", "0");
      rotateX.set(0);
      rotateY.set(0);
   };

   return {
      ref,
      handlers: { onPointerEnter, onPointerMove, onPointerLeave },
      style: canTilt ? { rotateX, rotateY, transformPerspective: 1100 } : undefined,
   };
};

export default useLight;
