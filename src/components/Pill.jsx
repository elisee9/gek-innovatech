import { Link } from "react-router-dom";

const BASE =
   "group inline-flex items-center justify-center gap-2.5 rounded-full font-medium whitespace-nowrap select-none transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60";

const SIZES = {
   sm: "h-10 px-4 text-[14px]",
   md: "h-12 px-6 text-[15px]",
   lg: "h-14 px-7 text-base",
};

// « lit » est réservé au chemin principal (WhatsApp) : c'est le seul contrôle rouge de la page.
// « light » (plein, bleu) sert aux validations (envoi du formulaire, accord cookies).
const VARIANTS = {
   lit: "bg-signal-fill text-on-signal hover:bg-signal-fill-hover shadow-lit hover:shadow-lit-hover",
   light: "bg-fg text-ink-2 hover:bg-fg-hover shadow-card",
   ghost: "border border-line-strong bg-ink-2/80 text-fg hover:border-fg/30 hover:bg-ink-3",
};

const DOTS = { lit: "bg-on-signal", light: "bg-ink-2", ghost: "bg-fg" };

// shine : un reflet traverse le bouton à intervalles (boutons WhatsApp principaux).
const Pill = ({ to, href, variant = "ghost", size = "md", icon: Icon, dot, shine = false, className = "", children, ...rest }) => {
   const showDot = dot ?? !Icon;
   const cls = `${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${shine ? "shine" : ""} ${className}`;
   const inner = (
      <>
         {showDot && (
            <span
               aria-hidden="true"
               className={`h-1.5 w-1.5 flex-none rounded-full transition-transform duration-300 ease-out group-hover:scale-[1.7] ${DOTS[variant]}`}
            />
         )}
         {Icon && (
            <Icon
               aria-hidden="true"
               className="h-[18px] w-[18px] flex-none transition-transform duration-300 ease-out group-hover:-rotate-12 group-hover:scale-110"
            />
         )}
         <span>{children}</span>
      </>
   );

   if (to) {
      return (
         <Link to={to} className={cls} {...rest}>
            {inner}
         </Link>
      );
   }
   if (href) {
      const external = href.startsWith("http");
      return (
         <a href={href} className={cls} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
            {inner}
         </a>
      );
   }
   return (
      <button type="button" className={cls} {...rest}>
         {inner}
      </button>
   );
};

export default Pill;
