import { Outlet } from "react-router-dom";
import BackgroundVideo from "../components/BackgroundVideo";
import Header from "../components/Header";
import Footer from "../components/Footer";

const MainLayout = () => {
   return (
      <div className="relative min-h-screen flex flex-col overflow-hidden ">
         {/* Vidéo de fond */}

         <BackgroundVideo />

         {/* Overlay sombre global (optionnel mais conseillé) */}
         <div className="absolute inset-0 bg-black/10 z-0" />

         {/* Contenu principal au-dessus de la vidéo */}
         <div className="relative z-10 flex flex-col min-h-screen">
            <Header />

            <main className="bg-transparent flex-grow">
               <Outlet />
            </main>

            <Footer />
         </div>
      </div>
   );
};

export default MainLayout;

// Ce code définit une mise en page principale pour l'application, incluant un en-tête, un pied de page et un espace pour le contenu principal.
// L'en-tête et le pied de page sont des composants réutilisables, tandis que l'espace principal est rempli par le contenu des différentes pages via le composant Outlet de React Router.
