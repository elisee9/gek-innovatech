// « 89 € » en français, « €89 » en anglais.
export const formatPrice = (amount, lang) =>
   new Intl.NumberFormat(lang === "en" ? "en-GB" : "fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
   }).format(amount);
