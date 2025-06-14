import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ToastContainer } from "react-toastify";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";
// Importing necessary libraries and components

ReactDOM.createRoot(document.getElementById("root")).render(
   <React.StrictMode>
      <HelmetProvider>
         <App />
         <ToastContainer theme="colored" />
      </HelmetProvider>
   </React.StrictMode>
);
