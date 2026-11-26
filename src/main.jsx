import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "./index.css";
import "./i18n/i18n";
import { applyContent, readPageContent } from "./content/apply";
import App from "./App";

// Contenu enregistré depuis le tableau de bord, écrit dans la page par le serveur : appliqué avant le premier affichage.
applyContent(readPageContent());

ReactDOM.createRoot(document.getElementById("root")).render(
   <React.StrictMode>
      <HelmetProvider>
         <App />
      </HelmetProvider>
   </React.StrictMode>
);
