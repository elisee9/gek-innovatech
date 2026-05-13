import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "./locales/fr/translation.json";
import en from "./locales/en/translation.json";

i18n.use(initReactI18next).init({
   resources: {
      fr: { translation: fr },
      en: { translation: en },
   },
   lng: localStorage.getItem("lang") || "fr",
   fallbackLng: "fr",
   interpolation: {
      escapeValue: false,
   },
});

i18n.on("initialized", () => {
   document.documentElement.lang = i18n.language;
});

i18n.on("languageChanged", (lang) => {
   document.documentElement.lang = lang;
});

export default i18n;
