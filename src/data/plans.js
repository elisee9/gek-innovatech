import { ol } from "framer-motion/client";

const plans = [
   {
      id: 1,
      title: "Plan Starter",
      description: "Idéal pour se lancer rapidement",
      price: "9.550 FCFA",
      oldPrice: "47.750 FCFA",
      period: "unique",
      recommended: false,
      deliveryTime: "3 jours",
      example: "/notdone",
      features: [
         "Landing page simple (1 page)",
         "Personnalisation couleurs/textes",
         "Hébergement gratuit (Vercel)",
         "Formulaire de contact basique",
         "Boutons WhatsApp/Appel directs",
         "Indexation Google basique",
         "Nom de domaine .vercel.app",
         "Responsive design (mobile-friendly)",
         "Support technique pendant 1 semaine",
      ],
      limitations: [
         "Pas de nom de domaine personnalisé",
         "Pas de maintenance incluse",
         "2 révisions max pendant le développement",
      ],
      promotion: "-80% ",
   },
   {
      id: 2,
      title: "Plan Pro",
      description:
         "Solution professionnelle pour TPE/PME (Petites et Moyennes Entreprises)",
      price: "15.550 FCFA",
      oldPrice: "77.750 FCFA",
      period: "unique",
      recommended: true,
      deliveryTime: "5 jours",
      example: "https://gek-beaute-elegance.netlify.app", // Lien avec une offre spécifique
      features: [
         "Tout inclus dans le Starter +",
         "Site multi-pages (jusqu'à 5 pages)",
         "Nom de domaine partagé (votrebusiness.gekinnova.com)",
         "SEO optimisé (métadonnées basiques)",
         "Maintenance 1 mois incluse",
         "Modifications post-livraison (1 fois)",
         "Intégration réseaux sociaux",
         "Analytics Google basique",
         "Certificat SSL inclus",
         "Support prioritaire",
      ],
      bestFor: [
         "Artisans indépendants",
         "Petites boutiques locales",
         "Professionnels libéraux",
      ],
      promotion: "-80% ",
   },
   {
      id: 3,
      title: "Plan Premium",
      description: "Solution sur-mesure pour visibilité maximale",
      price: "26.550 FCFA",
      oldPrice: "132.750 FCFA",
      period: "unique",
      recommended: false,
      deliveryTime: "1 semaine",
      example: "/notdone",
      promotion: "-80% ",
      features: [
         "Tout inclus dans le Pro +",
         "Nom de domaine personnalisé (.fr/.com etc.)",
         "Site jusqu'à 10 pages",
         "Hébergement professionnel (Hostinger)",
         "3 emails professionnels (@votredomaine.fr)",
         "SEO avancé (schema.org, sitemap)",
         "Intégration Google Maps + avis",
         "Maintenance 2 mois incluse",
         "Modifications illimitées pendant 15 jours",
         "Backup quotidien",
         "Statistiques détaillées",
         "Formation 1h offerte",
      ],
      bestFor: [
         "Restaurants/cafés",
         "Sociétés de services",
         "Professionnels avec forte concurrence",
      ],
   },
];

export default plans;
