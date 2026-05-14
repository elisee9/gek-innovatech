import HeroSection from "../sections/HeroSection";
import PricingSection from "../sections/PricingSection";
import ContactSection from "../sections/ContactSection";
import WhyChooseUs from "../sections/WhyChooseUs";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

const Home = () => {
   const { t } = useTranslation();

   return (
      <>
         <Helmet>
            <title>{t("meta.home.title")}</title>
            <meta name="description" content={t("meta.home.description")} />
            <meta name="keywords" content={t("meta.home.keywords")} />
            <meta name="author" content={t("common.author")} />
            <meta name="robots" content="index, follow" />
            <meta property="og:title" content={t("meta.home.ogTitle")} />
            <meta property="og:description" content={t("meta.home.ogDescription")} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://gek-innovatech.netlify.app/" />
            <meta property="og:image" content="https://gek-innovatech.netlify.app/og-image.jpeg" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={t("meta.home.ogTitle")} />
            <meta name="twitter:description" content={t("meta.home.ogDescription")} />
            <meta name="twitter:image" content="https://gek-innovatech.netlify.app/og-image.jpeg" />
            <link rel="canonical" href="https://gek-innovatech.netlify.app/" />
            <script type="application/ld+json">{JSON.stringify({
               "@context": "https://schema.org",
               "@type": "ProfessionalService",
               "name": "GEK INNOVATECH",
               "url": "https://gek-innovatech.netlify.app",
               "logo": "https://gek-innovatech.netlify.app/og-image.jpeg",
               "description": "Agence web spécialisée dans la création de sites web performants, modernes et sur mesure.",
               "telephone": "+2290165426510",
               "email": "contact@gekinnovatech.com",
               "address": { "@type": "PostalAddress", "addressCountry": "BJ" },
               "areaServed": "Worldwide",
               "serviceType": ["Web Design", "Web Development", "SEO", "Mobile Applications"],
               "priceRange": "€€"
            })}</script>
         </Helmet>

         <HeroSection />
         <section id="plans">
            <PricingSection previewOnly />
         </section>
         <section id="contact">
            <ContactSection />
         </section>
         <div className="mt-6 mb-10">
            <WhyChooseUs />
         </div>
      </>
   );
};

export default Home;
