import HeroSection from "../sections/HeroSection";
import PricingSection from "../sections/PricingSection";
import ContactSection from "../sections/ContactSection";
import WhyChooseUs from "../sections/WhyChooseUs";
import { Helmet } from "react-helmet-async";

const Home = () => {
   return (
      <>
         <Helmet>
            <title>
               GEK INNOVATECH | Création de sites web modernes et performants
            </title>
            <meta
               name="description"
               content="GEK INNOVATECH vous accompagne dans la création de sites web professionnels, sur mesure et optimisés pour le référencement."
            />
            <meta
               name="keywords"
               content="GEK INNOVATECH, agence web, création site internet, site web sur mesure, digital, Bénin"
            />
            <meta name="author" content="GEK INNOVATECH" />
            <meta
               property="og:title"
               content="GEK INNOVATECH | Création de sites web modernes"
            />
            <meta
               property="og:description"
               content="Agence spécialisée dans la création de sites web performants et designs."
            />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://gekinnova.com/" />
            <meta
               property="og:image"
               content="https://gekinnova.com/images/og-home.jpg"
            />
         </Helmet>

         {/* Section d'introduction */}
         <HeroSection />
         {/* Aperçu seulement, pas tout le contenu */}
         <section id="plans">
            <PricingSection previewOnly />
         </section>
         <section id="contact">
            <ContactSection previewOnly />
         </section>
         {/* Section WhyChooseUs */}
         <div className="mt-6 mb-10">
            <WhyChooseUs />
         </div>
      </>
   );
};

export default Home;
