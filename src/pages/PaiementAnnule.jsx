import { useTranslation } from "react-i18next";
import Seo from "../components/Seo";
import StatusPage from "../components/StatusPage";

const PaiementAnnule = () => {
   const { t } = useTranslation();
   return (
      <>
         <Seo page="paiementAnnule" path="/paiement-annule" noindex />
         <StatusPage
            message={t("paiementAnnule.message")}
            actions={[
               { label: t("paiementAnnule.contactUs"), to: "/contact" },
               { label: t("paiementAnnule.backHome"), to: "/", dot: false },
            ]}
         />
      </>
   );
};

export default PaiementAnnule;
