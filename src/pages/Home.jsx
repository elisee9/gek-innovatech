import { startTransition, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Seo from "../components/Seo";
import Marquee from "../components/Marquee";
import HeroSection from "../sections/HeroSection";
import CommitmentsSection from "../sections/CommitmentsSection";
import ServicesSection from "../sections/ServicesSection";
import PricingSection from "../sections/PricingSection";
import PortfolioSection from "../sections/PortfolioSection";
import ProofSection from "../sections/ProofSection";
import ContactSection from "../sections/ContactSection";
import { CONTACT, SITE } from "../data/contact";
import plans from "../data/plans";

const amounts = plans.map((plan) => plan.amount);

const STRUCTURED_DATA = {
   "@context": "https://schema.org",
   "@type": "ProfessionalService",
   name: "GEK INNOVATECH",
   url: `${SITE}/`,
   logo: `${SITE}/logo.svg`,
   image: `${SITE}/og-image.jpeg`,
   description: "Agence web basée au Bénin, spécialisée dans la création de sites web performants, modernes et sur mesure.",
   telephone: "+2290165426510",
   email: CONTACT.email,
   address: { "@type": "PostalAddress", addressCountry: "BJ" },
   areaServed: ["Africa", "Europe"],
   serviceType: ["Web Design", "Web Development", "SEO", "Mobile Applications"],
   priceRange: `${Math.min(...amounts)} € - ${Math.max(...amounts)} €`,
};

// Aide Google à afficher le nom du site dans ses résultats.
const WEBSITE_DATA = {
   "@context": "https://schema.org",
   "@type": "WebSite",
   name: "GEK INNOVATECH",
   url: `${SITE}/`,
};

const SECTIONS = [CommitmentsSection, ServicesSection, PricingSection, PortfolioSection, ProofSection, ContactSection];

const Home = () => {
   const { t } = useTranslation();
   // Le premier écran s'affiche seul ; les sections suivantes se construisent ensuite une à une, avec une pause
   // entre chacune : le téléphone n'est jamais bloqué longtemps et le haut de page apparaît plus tôt.
   // À la génération du HTML (hors navigateur), toutes les sections sont écrites d'un coup pour les moteurs de recherche.
   const [built, setBuilt] = useState(typeof window === "undefined" ? SECTIONS.length : 0);
   useEffect(() => {
      if (built >= SECTIONS.length) return undefined;
      const id = window.setTimeout(() => startTransition(() => setBuilt((n) => n + 1)), 0);
      return () => window.clearTimeout(id);
   }, [built]);

   return (
      <>
         <Seo page="home" path="/">
            <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
            <script type="application/ld+json">{JSON.stringify(WEBSITE_DATA)}</script>
         </Seo>
         <HeroSection />
         <Marquee label={t("marquee.label")} items={t("marquee.items", { returnObjects: true })} />
         {/* La liste ne fait que s'allonger : la position suffit comme clé. */}
         {SECTIONS.slice(0, built).map((Section, i) => (
            <Section key={i} />
         ))}
         {/* Réserve la place du reste de la page : le pied de page ne remonte pas dans le premier écran. */}
         {built < SECTIONS.length && <div className="min-h-screen" />}
      </>
   );
};

export default Home;
