import { FaWhatsapp } from "react-icons/fa";
const NotDone = () => {
   return (
      <>
         <div className="mt-32 flex flex-col justify-center items-center text-center p-4">
            <h1 className="text-4xl font-bold text-green-600 mb-4">
               Information !
            </h1>
            <p className="text-lg text-white/80 md:w-1/3 mb-6 text-center bg-[#00d2a866] p-4 rounded-lg shadow-lg">
               <h2 className="font-bold text-white text-center mb-2">
                  <em>Ce site ne vous est pas accessible pour le moment.</em>
               </h2>
               Pour toute demande ou clarification, veuillez contacter notre
               service client chez{" "}
               <b className="font-bold text-[#005BFF]">GEK INNOVATECH</b>.
               <br />
               Merci pour votre compréhension et votre confiance.
               <br />
               N’hésitez pas à nous laisser un message via WhatsApp si besoin.
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

export default NotDone;
