export const handlePayment = ({ amount, email, description }) => {
   if (!window.FedaPay) {
      alert("Erreur : FedaPay n’est pas chargé !");
      console.error("FedaPay library is not loaded.");
      return;
   }
   window.FedaPay.init({
      public_key: "pk_live_OTiwYKxLVDs7ntthUvRBHa7b",
      transaction: {
         amount,
         description,
         currency: {
            iso: "XOF",
         },
         customer: {
            email,
         },
      },
      callback: function (response) {
         if (response.status === "approved") {
            window.location.href = "/merci"; // Redirige vers la page de remerciement
         } else if (response.status === "declined") {
            window.location.href = "/erreur"; // Redirige vers la page d'erreur
         }
      },
   });
};
