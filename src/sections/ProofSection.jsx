import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import stats from "../data/stats";
import testimonials from "../data/testimonials";
import SectionHeading from "../components/SectionHeading";

// Chiffres et avis réels uniquement : rien n'est affiché tant que les fichiers de données sont vides.
const ProofSection = () => {
   const { t, i18n } = useTranslation();
   const lang = (i18n.resolvedLanguage || i18n.language) === "en" ? "en" : "fr";

   if (!stats.length && !testimonials.length) return null;

   return (
      <section className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8 md:py-20">
         {stats.length > 0 && (
            <dl className="grid gap-px overflow-hidden rounded-[28px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
               {stats.map((stat) => (
                  <div key={stat.value + stat.label.fr} className="bg-ink-2 p-8">
                     <dt className="text-[15px] text-muted">{stat.label[lang]}</dt>
                     <dd className="tabular mt-3 text-[44px] font-semibold leading-none tracking-[-0.03em]">{stat.value}</dd>
                  </div>
               ))}
            </dl>
         )}

         {testimonials.length > 0 && (
            <div className={stats.length ? "mt-24" : ""}>
               <SectionHeading title={t("testimonials.title")} />
               <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {testimonials.map((item) => (
                     <figure key={item.name} className="flex flex-col rounded-[24px] border border-line bg-ink-2 p-7">
                        {item.rating > 0 && (
                           <div className="flex gap-1 text-signal" aria-label={t("testimonials.rating", { rating: item.rating })}>
                              {Array.from({ length: item.rating }, (_, i) => (
                                 <Star key={i} size={16} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                              ))}
                           </div>
                        )}
                        <blockquote className="mt-5 flex-1 text-[16px] leading-relaxed text-fg/90">« {item.quote[lang]} »</blockquote>
                        <figcaption className="mt-6 border-t border-line pt-5">
                           <span className="block font-medium">{item.name}</span>
                           <span className="text-[14px] text-subtle">{item.role[lang]}</span>
                        </figcaption>
                     </figure>
                  ))}
               </div>
            </div>
         )}
      </section>
   );
};

export default ProofSection;
