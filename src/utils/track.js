// Comptage anonyme pour le tableau de bord : un nombre par jour, sans cookie ni identifiant de visiteur.
const send = (type) => {
   // Les navigateurs pilotés par un programme (robots, tests) ne comptent pas.
   if (navigator.webdriver) return;
   try {
      navigator.sendBeacon("/api/evenement", new Blob([JSON.stringify({ type })], { type: "application/json" }));
   } catch {
      // Le comptage n'empêche jamais le site de fonctionner.
   }
};

let visited = false;
export const countVisit = () => {
   if (visited) return;
   visited = true;
   send("visit");
};

// Clics sur WhatsApp et sur le téléphone, où qu'ils soient dans la page.
export const watchContactClicks = () => {
   const onClick = (e) => {
      const href = e.target.closest?.("a")?.getAttribute("href") || "";
      if (href.startsWith("https://wa.me/")) send("whatsapp");
      else if (href.startsWith("tel:")) send("call");
   };
   document.addEventListener("click", onClick, { capture: true });
   return () => document.removeEventListener("click", onClick, { capture: true });
};
