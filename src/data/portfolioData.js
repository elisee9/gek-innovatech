// Réalisations. Seul un site réellement en ligne porte des captures ; les autres sont des types de sites proposés.
// Pour ajouter une vraie réalisation : son lien public et deux captures (ordinateur 1600 px, mobile 520 px) en .webp.
// La réalisation marquée `hero: true` s'affiche en haut de l'accueil ; à défaut, la première qui a des captures.
const portfolioExamples = [
   {
      id: 1,
      link: "https://gek-beaute-elegance.netlify.app",
      planId: "standard",
      screens: {
         desktop: "/images/portfolio/beaute-elegance-desktop.webp",
         mobile: "/images/portfolio/beaute-elegance-mobile.webp",
      },
   },
   { id: 2, link: "/notdone", planId: "standard" },
   { id: 3, link: "/notdone", planId: "premium" },
   { id: 4, link: "/notdone", planId: "standard" },
   { id: 5, link: "/notdone", planId: "basic" },
   { id: 6, link: "/notdone", planId: "premium" },
];

export default portfolioExamples;
