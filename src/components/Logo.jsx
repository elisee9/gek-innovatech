const Logo = ({ width = 145, className = "" }) => {
   const height = Math.round(width * 42 / 130);

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
            <linearGradient id="gek-mark" x1="0" y1="0" x2="1" y2="1">
               <stop offset="0%" stopColor="#005BFF" />
               <stop offset="100%" stopColor="#00D2A8" />
            </linearGradient>
         </defs>

         {/* ── MARK : anneau diamant (even-odd) center(22,21) half=18 ── */}
         <path
            d="M22,3 L40,21 L22,39 L4,21 Z M22,12 L32,21 L22,30 L12,21 Z"
            fill="url(#gek-mark)"
            fillRule="evenodd"
         />
         <circle cx="22" cy="21" r="3" fill="url(#gek-mark)" />
         <circle cx="22" cy="3"  r="2" fill="#005BFF" />
         <circle cx="40" cy="21" r="2" fill="#00D2A8" />

         {/* ── WORDMARK empilé ── */}
         {/* GEK */}
         <text
            x="50"
            y="22"
            fontFamily="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif"
            fontSize="25"
            fontWeight="800"
            fill="#FFFFFF"
            letterSpacing="2"
         >
            GEK
         </text>

         {/* Séparateur horizontal */}
         <line
            x1="50" y1="27"
            x2="127" y2="27"
            stroke="#00D2A8"
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
            fill="#00D2A8"
            letterSpacing="1.5"
         >
            INNOVATECH
         </text>
      </svg>
   );
};

export default Logo;
