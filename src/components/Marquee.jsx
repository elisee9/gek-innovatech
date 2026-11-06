import { useEffect, useRef } from "react";
import {
   motion,
   useAnimationFrame,
   useInView,
   useMotionValue,
   useReducedMotion,
   useScroll,
   useSpring,
   useVelocity,
} from "framer-motion";

const COPIES = 3;

// Bandeau défilant : il avance seul, accélère avec la vitesse de défilement de la page et change
// de sens quand on remonte. Il s'arrête hors de la fenêtre ; sous « réduire les animations », la liste reste fixe.
const Marquee = ({ items, label, speed = 46 }) => {
   const reduce = useReducedMotion();
   const ref = useRef(null);
   const setRef = useRef(null);
   const width = useRef(0);
   const direction = useRef(-1);
   const inView = useInView(ref);
   const x = useMotionValue(0);
   const { scrollY } = useScroll();
   const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 320 });

   useEffect(() => {
      if (reduce || !setRef.current) return undefined;
      const ro = new ResizeObserver(() => {
         width.current = setRef.current?.offsetWidth || 0;
      });
      ro.observe(setRef.current);
      return () => ro.disconnect();
   }, [reduce]);

   useAnimationFrame((_, delta) => {
      if (reduce || !inView || !width.current) return;
      const v = velocity.get();
      if (v > 8) direction.current = -1;
      else if (v < -8) direction.current = 1;
      const boost = Math.min(6, Math.abs(v) / 280);
      let next = x.get() + direction.current * speed * (1 + boost) * (Math.min(delta, 50) / 1000);
      if (next <= -width.current) next += width.current;
      else if (next > 0) next -= width.current;
      x.set(next);
   });

   const entries = items.map((item, i) => (
      <span key={i} className="flex items-center">
         <span className="px-7 sm:px-10">{item}</span>
         <span className={`h-2 w-2 flex-none rounded-full ${i % 2 ? "bg-fg" : "bg-signal"}`} />
      </span>
   ));

   const row = (copy) => (
      <div key={copy} ref={copy === 0 ? setRef : undefined} className="flex flex-none items-center">
         {entries}
      </div>
   );

   return (
      <section
         ref={ref}
         aria-label={label}
         className="relative overflow-hidden border-y border-line py-6 text-[clamp(1.6rem,3.2vw,2.6rem)] font-semibold tracking-[-0.025em] text-fg/90 md:py-8"
      >
         <ul className="sr-only">
            {items.map((item, i) => (
               <li key={i}>{item}</li>
            ))}
         </ul>
         {reduce ? (
            <div aria-hidden="true" className="mx-auto flex max-w-[1200px] flex-wrap justify-center gap-y-3 px-5 text-[clamp(1.25rem,2.4vw,2rem)]">
               {entries}
            </div>
         ) : (
            <motion.div aria-hidden="true" style={{ x }} className="flex w-max whitespace-nowrap">
               {Array.from({ length: COPIES }, (_, copy) => row(copy))}
            </motion.div>
         )}
         {/* Fondu des bords : le texte entre et sort de scène au lieu d'être coupé net. */}
         <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink to-transparent sm:w-40" />
         <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink to-transparent sm:w-40" />
      </section>
   );
};

export default Marquee;
