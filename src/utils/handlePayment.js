export const handlePayment = ({ amount, email, description }) => {
   if (!window.FedaPay) {
      console.error("FedaPay library is not loaded.");
      return;
   }
   window.FedaPay.init({
      public_key: import.meta.env.VITE_FEDAPAY_PUBLIC_KEY,
      transaction: {
         amount,
         description,
         currency: { iso: "XOF" },
         customer: { email },
      },
      callback: function (response) {
         if (response.status === "approved") {
            window.location.href = "/merci";
         } else if (response.status === "declined") {
            window.location.href = "/paiement-annule";
         }
      },
   });
};
