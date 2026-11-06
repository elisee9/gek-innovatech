import { useTranslation } from "react-i18next";
import { FaWhatsapp } from "react-icons/fa";
import Seo from "../components/Seo";
import StatusPage from "../components/StatusPage";
import { whatsappLink } from "../data/contact";

const Merci = () => {
   const { t } = useTranslation();
   return (
      <>
         <Seo page="merci" path="/merci" noindex />
         <StatusPage
            message={t("merci.message")}
            actions={[
               { label: t("common.writeWhatsapp"), href: whatsappLink(t("merci.whatsappMessage")), variant: "lit", icon: FaWhatsapp },
               { label: t("common.backHome"), to: "/" },
            ]}
         />
      </>
   );
};

export default Merci;
