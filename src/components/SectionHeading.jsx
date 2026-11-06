import { RevealText, RevealWords } from "./Reveal";

// Titre d'une section. Le titre principal de chaque page est dans son bandeau (HeroSection, PageBanner).
const SectionHeading = ({ title, subtitle, align = "center", className = "" }) => {
   const centered = align === "center";
   return (
      <div className={`${centered ? "mx-auto text-center" : ""} max-w-[46rem] ${className}`}>
         <h2 className="text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-fg">
            <RevealWords text={title} />
         </h2>
         {subtitle && (
            <RevealText
               text={subtitle}
               delay={0.3}
               className={`mt-5 text-[17px] leading-relaxed text-muted ${centered ? "mx-auto" : ""} max-w-[60ch]`}
            />
         )}
      </div>
   );
};

export default SectionHeading;
