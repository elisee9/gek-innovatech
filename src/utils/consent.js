// Choix cookies, partagé entre la bannière et la barre WhatsApp mobile (qui attend que la bannière soit fermée).
const KEY = "cookie-consent";
export const CONSENT_EVENT = "gek:consent";

export const readConsent = () => {
   try {
      return localStorage.getItem(KEY);
   } catch {
      return null;
   }
};

export const saveConsent = (value) => {
   try {
      localStorage.setItem(KEY, value);
   } catch {
      // Stockage indisponible : le choix vaut pour cette visite.
   }
   window.dispatchEvent(new Event(CONSENT_EVENT));
};
