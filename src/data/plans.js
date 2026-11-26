// Prix en euros (paiement unique). Les textes des offres sont dans les fichiers de traduction.
// Ce sont les valeurs d'origine : celles enregistrées depuis le tableau de bord les remplacent (src/content/).
// Les prix cités dans les textes ({prix_min}, {prix_pro}…) et par l'assistant suivent automatiquement.
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
