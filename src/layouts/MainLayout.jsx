import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import BackgroundVideo from "../components/BackgroundVideo";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CookieBanner from "../components/CookieBanner";
import ChatBot from "../components/ChatBot";

const ScrollToTop = () => {
   const { pathname } = useLocation();
   useEffect(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
   }, [pathname]);
   return null;
};

const MainLayout = () => {
   return (
      <div className="relative min-h-screen flex flex-col overflow-hidden">
         <BackgroundVideo />
         <div className="absolute inset-0 bg-black/60 z-0" />
         <div className="relative z-10 flex flex-col min-h-screen">
            <ScrollToTop />
            <Header />
            <main className="bg-transparent flex-grow">
               <Outlet />
            </main>
            <Footer />
         </div>
         <CookieBanner />
         <ChatBot />
      </div>
   );
};

export default MainLayout;
