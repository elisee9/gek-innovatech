// App.jsx
import { RouterProvider } from "react-router-dom";
import router from "./routes/AppRoutes";
import "react-toastify/dist/ReactToastify.css";
import "./App.css"; // Assurez-vous d'importer votre fichier CSS
import React from "react";

function App() {
   return (
         <RouterProvider router={router} />
   );
}
export default App;
