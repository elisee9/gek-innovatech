import { Outlet } from "react-router-dom";
import BackgroundVideo from "../components/BackgroundVideo";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CookieBanner from "../components/CookieBanner";

const MainLayout = () => {
   return (
      <div className="relative min-h-screen flex flex-col overflow-hidden">
         <BackgroundVideo />
         <div className="absolute inset-0 bg-black/10 z-0" />
         <div className="relative z-10 flex flex-col min-h-screen">
            <Header />
            <main className="bg-transparent flex-grow">
               <Outlet />
            </main>
            <Footer />
         </div>
         <CookieBanner />
      </div>
   );
};

export default MainLayout;
