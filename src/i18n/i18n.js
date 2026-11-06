import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "./locales/fr/translation.json";
import en from "./locales/en/translation.json";

const savedLang = () => {
   try {
      return localStorage.getItem("lang");
   } catch {
      return null;
   }
};

i18n.use(initReactI18next).init({
   resources: {
      fr: { translation: fr },
      en: { translation: en },
   },
   lng: savedLang() || "fr",
   fallbackLng: "fr",
   supportedLngs: ["fr", "en"],
   interpolation: {
      escapeValue: false,
   },
});

// Hors navigateur (génération des pages à la compilation), il n'y a pas de document à mettre à jour.
if (typeof document !== "undefined") {
   document.documentElement.lang = i18n.language;

   i18n.on("languageChanged", (lang) => {
      document.documentElement.lang = lang;
   });
}

export default i18n;
