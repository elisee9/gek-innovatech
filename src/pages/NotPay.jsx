import { useTranslation } from "react-i18next";
import { FaWhatsapp } from "react-icons/fa";
import Seo from "../components/Seo";
import StatusPage from "../components/StatusPage";
import { whatsappLink } from "../data/contact";

const NotPay = () => {
   const { t } = useTranslation();
   return (
      <>
         <Seo page="notPay" noindex />
         <StatusPage
            standalone
            title={t("notPay.title")}
            message={t("notPay.message")}
            actions={[
               { label: t("common.writeWhatsapp"), href: whatsappLink(t("common.whatsappMessage")), variant: "lit", icon: FaWhatsapp },
               { label: t("notPay.cta"), to: "/contact" },
            ]}
         />
      </>
   );
};

export default NotPay;
