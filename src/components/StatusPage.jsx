import { Link } from "react-router-dom";
import Logo from "./Logo";
import PageBanner from "./PageBanner";
import Pill from "./Pill";
import { Reveal } from "./Reveal";

// Page courte (paiement, 404, site en préparation) : un message et deux actions, sous le bandeau.
// Dans la mise en page principale, le bandeau vient de MainLayout. standalone : page hors mise en page,
// sans en-tête ni pied de page, qui porte elle-même son bandeau, son titre et le logo.
const StatusPage = ({ title, message, detail, actions = [], code, standalone = false }) => {
   const body = (
      <section className="mx-auto w-full max-w-[1200px] px-5 py-14 sm:px-8 md:py-20">
         {code && (
            <p aria-hidden="true" className="tabular mb-6 text-[clamp(5rem,14vw,8rem)] font-semibold leading-none tracking-[-0.04em] text-fg/15">
               {code}
            </p>
         )}
         <Reveal as="p" delay={0.1} className="max-w-[60ch] text-[17px] leading-relaxed text-muted">
            {message}
         </Reveal>
         {detail && (
            <Reveal as="p" delay={0.18} className="mt-3 max-w-[60ch] text-[15px] text-subtle">
               {detail}
            </Reveal>
         )}
         {actions.length > 0 && (
            <Reveal delay={0.25} className="mt-10 flex flex-col gap-3 sm:flex-row">
               {actions.map(({ label, ...props }) => (
                  <Pill key={label} size="lg" {...props}>
                     {label}
                  </Pill>
               ))}
            </Reveal>
         )}
      </section>
   );

   if (!standalone) return body;

   return (
      <>
         <PageBanner title={title} crumb={title} structured={false}>
            <Link to="/" className="inline-block rounded-lg" aria-label="GEK INNOVATECH">
               <Logo width={116} />
            </Link>
         </PageBanner>
         {body}
      </>
   );
};

export default StatusPage;
