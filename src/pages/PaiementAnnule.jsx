import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const PaiementAnnule = () => {
   const { t } = useTranslation();

   return (
      <>
         <Helmet>
            <title>{t("meta.paiementAnnule.title")}</title>
            <meta name="description" content={t("meta.paiementAnnule.description")} />
         </Helmet>

         <div className="mt-32 flex flex-col justify-center items-center text-center p-4 min-h-[60vh] mb-4">
            <div className="w-12 h-0.5 bg-red-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-white mb-4">
               {t("paiementAnnule.title")}
            </h1>
            <p className="text-lg text-white mb-8 md:max-w-md leading-relaxed">
               {t("paiementAnnule.message")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
               <Link
                  to="/"
                  className="block w-full text-center sm:w-auto sm:inline-block px-8 py-3 sm:px-10 bg-[#1E1E1E] border border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition"
               >
                  {t("paiementAnnule.backHome")}
               </Link>
               <Link
                  to="/contact"
                  className="block w-full text-center sm:w-auto sm:inline-block px-8 py-3 sm:px-10 bg-[#00D2A8] text-black font-semibold rounded-lg shadow hover:bg-[#00BFA0] transition"
               >
                  {t("paiementAnnule.contactUs")}
               </Link>
            </div>
         </div>
      </>
   );
};

export default PaiementAnnule;
