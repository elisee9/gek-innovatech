import { useTranslation } from "react-i18next";
import Seo from "../components/Seo";
import StatusPage from "../components/StatusPage";

const NotDone = () => {
   const { t } = useTranslation();
   return (
      <>
         <Seo page="notDone" noindex />
         <StatusPage
            standalone
            title={t("notDone.title")}
            message={t("notDone.message")}
            detail={t("notDone.detail")}
            actions={[
               { label: t("notDone.contactUs"), to: "/contact" },
               { label: t("notDone.backHome"), to: "/", dot: false },
            ]}
         />
      </>
   );
};

export default NotDone;
