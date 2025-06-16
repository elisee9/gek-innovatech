import { Helmet } from "react-helmet-async";

const PaiementAnnule = () => {
   return (
      <>
         <Helmet>
            <title>Paiement Annulé | GEK INNOVATECH</title>
            <meta
               name="description"
               content="Le paiement a été annulé. Vous pouvez réessayer à tout moment."
            />
         </Helmet>

         <div className=" mt-32 flex flex-col justify-center items-center text-center p-4 mb-4">
            <h1 className="text-4xl font-bold text-red-600 mb-4">
               ❌ Paiement annulé
            </h1>
            <p className="text-lg text-white mb-6">
               Vous avez annulé le paiement. N'hésitez pas à réessayer si
               besoin.
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

export default PaiementAnnule;
