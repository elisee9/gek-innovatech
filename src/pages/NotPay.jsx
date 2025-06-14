import { handleLinkClick } from "../utils/scrollUtils";
import { NavLink } from "react-router-dom";
const NotPay = () => {
   return (
      <>
         <div className="mt-32 flex flex-col justify-center items-center text-center p-4">
            <h1 className="text-4xl font-bold text-green-600 mb-4">
               Information !
            </h1>
            <div className="text-white md:w-1/3 bg-[#00d2a866] p-6 rounded-xl shadow-lg mb-6">
               <h2 className="text-xl font-semibold mb-2 text-white">
                  <em>
                     Le paiement en ligne direct n’est pas encore disponible
                     pour le moment.
                  </em>
               </h2>
               <p className="text-base text-center text-white/80">
                  Pour passer votre commande, veuillez cliquer sur le bouton
                  ci-dessous afin de remplir le formulaire de contact. Nous vous
                  remercions pour votre confiance. <br />
                  N’hésitez pas à nous laisser un message sur WhatsApp pour
                  toute question ou précision.
               </p>
            </div>

            <NavLink
               to="/contact"
               className="bg-[#00D2A8] hover:bg-[#00b091] text-black font-semibold px-8 py-4 rounded-xl transition shadow-lg hover:shadow-[#00D2A8]/40 cursor-pointer"
               onClick={handleLinkClick}
            >
               Contactez-nous
            </NavLink>
         </div>
      </>
   );
};

export default NotPay;
