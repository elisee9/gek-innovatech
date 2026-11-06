import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "./index.css";
import "./i18n/i18n";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
   <React.StrictMode>
      <HelmetProvider>
         <App />
      </HelmetProvider>
   </React.StrictMode>
);
