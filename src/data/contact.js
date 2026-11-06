// Adresse publique du site, pour les balises SEO et les données structurées.
export const SITE = "https://gek-innovatech.netlify.app";

// Coordonnées affichées partout sur le site : les modifier ici uniquement.
export const CONTACT = {
   phoneDisplay: "+229 01 65 42 65 10",
   phoneHref: "tel:+2290165426510",
   whatsappNumber: "2290165426510",
   email: "gekinnovatech@gmail.com",
};

export const whatsappLink = (text) =>
   `https://wa.me/${CONTACT.whatsappNumber}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
