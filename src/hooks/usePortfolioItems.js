import { useTranslation } from "react-i18next";
import portfolioExamples from "../data/portfolioData";

// Réalisations : données fixes (image, lien, offre) fusionnées avec leurs textes traduits.
const usePortfolioItems = () => {
   const { t } = useTranslation();
   const translations = t("portfolio.items", { returnObjects: true });
   return portfolioExamples.map((ex) => ({ ...ex, ...(translations.find((p) => p.id === ex.id) || {}) }));
};

export default usePortfolioItems;
