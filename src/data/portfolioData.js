// Réalisations. Seul un site réellement en ligne porte des captures ; les autres sont des types de sites proposés.
// Pour ajouter une vraie réalisation : son lien public et deux captures pleine page en .webp (ordinateur 1600 px de large,
// mobile 520 px), avec leurs dimensions exactes : le défilement dans les cadres en dépend.
// La réalisation marquée `hero: true` s'affiche en haut de l'accueil ; à défaut, la première qui a des captures.
const portfolioExamples = [
   {
      id: 7,
      link: "https://www.twenty-one-nexus.com/fr/",
      planId: "quote",
      hero: true,
      screens: {
         desktop: "/images/portfolio/nexus-desktop.webp",
         mobile: "/images/portfolio/nexus-mobile.webp",
         desktopSize: [1599, 3255],
         mobileSize: [519, 4764],
      },
   },
   {
      id: 1,
      link: "https://gek-beaute-elegance.netlify.app",
      planId: "basic",
      screens: {
         desktop: "/images/portfolio/beaute-elegance-desktop.webp",
         mobile: "/images/portfolio/beaute-elegance-mobile.webp",
         desktopSize: [1600, 2511],
         mobileSize: [520, 4019],
      },
   },
   { id: 2, link: "/notdone", planId: "standard" },
   { id: 3, link: "/notdone", planId: "premium" },
   { id: 4, link: "/notdone", planId: "standard" },
   { id: 5, link: "/notdone", planId: "basic" },
   { id: 6, link: "/notdone", planId: "premium" },
];

export default portfolioExamples;
