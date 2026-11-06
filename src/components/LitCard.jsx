import { motion } from "framer-motion";
import useLight from "../hooks/useLight";

// Surface éclairée : halo intérieur et bord orange qui suivent le pointeur, balayage de lumière à l'entrée.
// soft : halo seul, sans bord allumé (rangées de tableau). tilt : inclinaison maximale en degrés.
const LitCard = ({ as = "div", tilt = 0, sweep = true, soft = false, className = "", style, children, ...rest }) => {
   const Comp = motion[as];
   const { ref, handlers, style: lightStyle } = useLight({ tilt, sweep });
   return (
      <Comp
         ref={ref}
         className={`lit-card ${soft ? "lit-card--soft" : ""} ${className}`}
         style={{ ...lightStyle, ...style }}
         {...handlers}
         {...rest}
      >
         {children}
      </Comp>
   );
};

export default LitCard;
