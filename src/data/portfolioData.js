// src/data/portfolioData.js

import { p } from "framer-motion/client";

const portfolioExamples = [
   {
      id: 1,
      title: "Site Vitrine – Salon de Beauté",
      image: "/images/portfolio/salon.webp",
      link: "https://gek-beaute-elegance.netlify.app", // Lien avec une offre spécifique
      description:
         "Site élégant pour présenter les services d'un salon avec prise de rendez-vous.",
      planId: "standard",
   },
   {
      id: 2,
      title: "Site Restaurant",
      image: "/images/portfolio/restaurant.webp",
      link: "/notdone",
      description:
         "Menu interactif, galerie photo et formulaire de réservation.",
      planId: "standard", // Lien avec une offre spécifique
   },
   {
      id: 3,
      title: "Coaching Personnel",
      image: "/images/portfolio/coach.webp",
      link: "/notdone",
      description:
         "Site pour coachs ou formateurs avec blog et espace contact.",
      planId: "premium",
   },
   {
      id: 4,
      title: "E-commerce Minimaliste",
      image: "/images/portfolio/shop.webp",
      link: "/notdone",
      description: "Petite boutique en ligne avec catalogue et panier simple.",
      planId: "standard",
   },
   {
      id: 5,
      title: "Artiste Photographe",
      image: "/images/portfolio/photo.webp",
      link: "/notdone",
      description: "Portfolio avec galerie dynamique et formulaire de contact.",
      planId: "basic",
   },
   {
      id: 6,
      title: "Association ou ONG",
      image: "/images/portfolio/ngo.webp",
      link: "/notdone",
      description:
         "Présentation des actions, appel aux dons et formulaire de contact.",
      planId: "premium",
   },
];

export default portfolioExamples;
// Note: Ce fichier contient des exemples de sites web réalisés pour différents types de clients. Chaque exemple est lié à un plan tarifaire spécifique, permettant aux visiteurs de voir des réalisations concrètes correspondant aux offres proposées. Les images et liens sont fictifs et doivent être remplacés par des contenus réels lors de l'intégration dans le projet.
// Chaque objet dans le tableau `portfolioExamples` représente un exemple de site web, avec des propriétés telles que `id`, `title`, `image`, `link`, `planId` et `description`. Ces propriétés permettent de décrire le site, d'afficher une image, de fournir un lien vers le site en direct et de lier l'exemple à un plan tarifaire spécifique.
