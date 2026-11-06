import { useId } from "react";

// Les couleurs suivent le contexte : marine sur fond clair, version claire dans le bandeau marine (.on-dark, .band-dark).
const Logo = ({ width = 145, className = "" }) => {
   const height = Math.round(width * 42 / 130);
   // Un dégradé par logo (en-tête, pied de page, chat) : chacun garde les couleurs de son propre fond.
   const gradient = `gek-mark-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

   return (
      <svg
         viewBox="0 0 130 42"
         width={width}
         height={height}
         xmlns="http://www.w3.org/2000/svg"
         aria-label="GEK INNOVATECH"
         className={className}
      >
         <defs>
            <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
               <stop offset="0%" style={{ stopColor: "var(--color-brand)" }} />
               <stop offset="100%" style={{ stopColor: "var(--color-signal)" }} />
            </linearGradient>
         </defs>

         {/* ── MARK : anneau diamant (even-odd) center(22,21) half=18 ── */}
         <path
            d="M22,3 L40,21 L22,39 L4,21 Z M22,12 L32,21 L22,30 L12,21 Z"
            fill={`url(#${gradient})`}
            fillRule="evenodd"
         />
         <circle cx="22" cy="21" r="3" fill={`url(#${gradient})`} />
         <circle cx="22" cy="3"  r="2" className="fill-brand" />
         <circle cx="40" cy="21" r="2" className="fill-signal" />

         {/* ── WORDMARK empilé ── */}
         {/* GEK */}
         <text
            x="50"
            y="22"
            fontFamily="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif"
            fontSize="25"
            fontWeight="800"
            className="fill-fg"
            letterSpacing="2"
         >
            GEK
         </text>

         {/* Séparateur horizontal */}
         <line
            x1="50" y1="27"
            x2="127" y2="27"
            className="stroke-signal"
            strokeWidth="1.2"
            strokeOpacity="0.6"
         />

         {/* INNOVATECH */}
         <text
            x="50"
            y="38"
            fontFamily="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif"
            fontSize="10"
            fontWeight="500"
            className="fill-signal"
            letterSpacing="1.5"
         >
            INNOVATECH
         </text>
      </svg>
   );
};

export default Logo;
