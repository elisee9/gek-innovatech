import { FaWhatsapp } from "react-icons/fa";
const NotDone = () => {
   return (
      <>
         <div className="mt-32 flex flex-col justify-center items-center text-center p-4">
            <h1 className="text-4xl font-bold text-[#00b091] mb-4">
               Information !
            </h1>
            <p className="text-gray-600 md:w-1/3 bg-white shadow-12 p-6 rounded-xl shadow-xl mb-6">
               <h2 className="text-xl font-semibold mb-3">
                  <p>Ce site ne vous est pas accessible pour le moment.</p>
               </h2>
               <p className="text-base text-center">
                  Pour toute demande ou clarification, veuillez contacter notre
                  service client chez{" "}
                  <b className="font-bold text-[#005BFF]">
                     <a href="/contact">GEK INNOVATECH</a>.{" "}
                  </b>
                  Merci pour votre compréhension et votre confiance. N’hésitez
                  pas à nous laisser un message via WhatsApp si besoin.
               </p>
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
