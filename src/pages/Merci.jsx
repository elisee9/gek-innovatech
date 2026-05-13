import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Merci = () => {
   const { t } = useTranslation();

   return (
      <>
         <Helmet>
            <title>{t("meta.merci.title")}</title>
            <meta name="description" content={t("meta.merci.description")} />
         </Helmet>

         <div className="mt-32 flex flex-col justify-center items-center text-center p-4 min-h-[60vh]">
            <div className="w-12 h-0.5 bg-[#00D2A8] mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-white mb-4">
               {t("merci.title")}
            </h1>
            <p className="text-lg text-white md:w-1/3 mb-8 text-center bg-[#00d2a822] border border-[#00D2A8]/30 p-6 rounded-xl leading-relaxed">
               {t("merci.message")}
            </p>
            <Link
               to="/"
               className="block w-full max-w-xs mx-auto text-center sm:w-auto sm:inline-block px-8 py-3 sm:px-12 bg-[#00D2A8] text-black font-semibold rounded-lg shadow hover:bg-[#00BFA0] transition"
            >
               {t("merci.backHome")}
            </Link>
         </div>
      </>
   );
};

export default Merci;
