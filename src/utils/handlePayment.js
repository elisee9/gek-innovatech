const FEDAPAY_SRC = "https://cdn.fedapay.com/checkout.js?v=1.1.8";

// Le script FedaPay n'est chargé qu'au moment d'un paiement, pas sur chaque page.
const loadFedaPay = () =>
   new Promise((resolve, reject) => {
      if (window.FedaPay) return resolve(window.FedaPay);
      const script = document.createElement("script");
      script.src = FEDAPAY_SRC;
      script.async = true;
      script.onload = () => (window.FedaPay ? resolve(window.FedaPay) : reject(new Error("FedaPay unavailable")));
      script.onerror = () => reject(new Error("FedaPay failed to load"));
      document.head.appendChild(script);
   });

export const handlePayment = async ({ amount, email, description }) => {
   let FedaPay;
   try {
      FedaPay = await loadFedaPay();
   } catch (error) {
      console.error(error);
      return;
   }
   FedaPay.init({
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
