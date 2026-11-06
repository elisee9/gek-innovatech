import { useTranslation } from "react-i18next";
import Seo from "../components/Seo";
import PricingSection from "../sections/PricingSection";
import ContactSection from "../sections/ContactSection";
import plans from "../data/plans";
import { SITE } from "../data/contact";

const Plans = () => {
   const { t } = useTranslation();
   const titles = t("pricing.plans", { returnObjects: true });
   // Les prix publiés, déclarés aux moteurs de recherche depuis la même source que les cartes affichées.
   const structuredData = {
      "@context": "https://schema.org",
      "@type": "Service",
      name: t("meta.plans.ogTitle"),
      serviceType: "Web Design",
      provider: { "@type": "ProfessionalService", name: "GEK INNOVATECH", url: `${SITE}/` },
      areaServed: ["Africa", "Europe"],
      hasOfferCatalog: {
         "@type": "OfferCatalog",
         name: t("meta.plans.ogTitle"),
         itemListElement: plans.map((plan) => ({
            "@type": "Offer",
            name: titles.find((item) => item.id === plan.id)?.title,
            price: plan.amount,
            priceCurrency: "EUR",
            url: `${SITE}/plans`,
         })),
      },
   };

   return (
      <>
         <Seo page="plans" path="/plans">
            <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
         </Seo>
         <PricingSection heading={false} />
         <ContactSection />
      </>
   );
};

export default Plans;
