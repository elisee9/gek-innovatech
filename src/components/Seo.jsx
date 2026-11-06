import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { SITE } from "../data/contact";

const IMAGE = `${SITE}/og-image.jpeg`;

// Balises SEO communes : titre, description, Open Graph, Twitter et URL canonique.
// Elles sont aussi écrites dans le HTML de chaque page à la compilation : WhatsApp et Facebook les lisent sans JavaScript.
const Seo = ({ page, path = "", noindex = false, children }) => {
   const { t, i18n } = useTranslation();
   const lang = i18n.resolvedLanguage || i18n.language;
   const url = `${SITE}${path}`;
   const title = t(`meta.${page}.title`);
   const description = t(`meta.${page}.description`, { defaultValue: "" });
   const ogTitle = t(`meta.${page}.ogTitle`, { defaultValue: title });
   const ogDescription = t(`meta.${page}.ogDescription`, { defaultValue: description });

   return (
      <Helmet htmlAttributes={{ lang }}>
         <title>{title}</title>
         {description && <meta name="description" content={description} />}
         <meta name="author" content="GEK INNOVATECH" />
         <meta name="robots" content={noindex ? "noindex, follow" : "index, follow, max-image-preview:large"} />
         <meta property="og:site_name" content="GEK INNOVATECH" />
         <meta property="og:locale" content={lang === "en" ? "en_GB" : "fr_FR"} />
         <meta property="og:title" content={ogTitle} />
         {ogDescription && <meta property="og:description" content={ogDescription} />}
         <meta property="og:type" content="website" />
         <meta property="og:url" content={url} />
         <meta property="og:image" content={IMAGE} />
         <meta property="og:image:width" content="1200" />
         <meta property="og:image:height" content="630" />
         <meta property="og:image:alt" content={ogTitle} />
         <meta name="twitter:card" content="summary_large_image" />
         <meta name="twitter:title" content={ogTitle} />
         {ogDescription && <meta name="twitter:description" content={ogDescription} />}
         <meta name="twitter:image" content={IMAGE} />
         {!noindex && <link rel="canonical" href={url} />}
         {children}
      </Helmet>
   );
};

export default Seo;
