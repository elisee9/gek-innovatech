// Prix en euros (paiement unique). Les textes des offres sont dans les fichiers de traduction.
// Si un prix change ici, mettre aussi à jour le prompt du chatbot (netlify/functions/chat.js)
// et les textes de référencement (« meta » dans les fichiers de traduction : accueil et offres).
const plans = [
   {
      id: 1,
      amount: 95,
      recommended: false,
      example: "https://gek-beaute-elegance.netlify.app",
   },
   {
      id: 2,
      amount: 170,
      recommended: true,
      example: "/notdone",
   },
   {
      id: 3,
      amount: 350,
      recommended: false,
      premium: true,
      example: "/notdone",
   },
];

export default plans;
