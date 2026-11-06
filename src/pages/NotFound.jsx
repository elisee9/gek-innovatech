import { useTranslation } from "react-i18next";
import Seo from "../components/Seo";
import StatusPage from "../components/StatusPage";

const NotFound = () => {
   const { t } = useTranslation();
   return (
      <>
         <Seo page="notFound" noindex />
         <StatusPage
            standalone
            code={t("notFound.code")}
            title={t("notFound.title")}
            message={t("notFound.message")}
            actions={[{ label: t("notFound.backHome"), to: "/" }]}
         />
      </>
   );
};

export default NotFound;
