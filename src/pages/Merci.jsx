import { Helmet } from "react-helmet-async";

const Merci = () => {
   return (
      <>
         <Helmet>
            <title>Paiement Réussi | GEK INNOVATECH</title>
            <meta
               name="description"
               content="Merci pour votre confiance ! Votre paiement a été effectué avec succès."
            />
         </Helmet>

         <div className="mt-32 flex flex-col justify-center items-center text-center p-4">
            <h1 className="text-4xl font-bold text-green-600 mb-4">
               🎉 Paiement réussi !
            </h1>
            <p className="text-lg text-white md:w-1/3 mb-6 text-center bg-[#00d2a866] p-4 rounded-lg shadow-lg">
               Votre paiement a été effectué avec succès. <br />
               Merci pour votre confiance. Vous allez recevoir un email de
               confirmation sous peu. N'oubliez pas de nous laisser un message sur
               WhatsApp avec votre reçu du paiement.
            </p>
            <a
               href="/"
               className="mt-4 inline-block px-6 py-3 bg-[#00D2A8] text-black font-semibold rounded-lg shadow hover:bg-[#00BFA0]"
            >
               Retour à l'accueil
            </a>
         </div>
      </>
   );
};

export default Merci;
