import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

// Pages
import Home from "../pages/Home";
import Plans from "../pages/Plans";
import Contact from "../pages/Contact";
import About from "../pages/About";
import Services from "../pages/Services";
import NotFound from "../pages/NotFound";
import Merci from "../pages/Merci";
import PaiementAnnule from "../pages/PaiementAnnule";
import Portfolio from "../pages/Portfolio";
import NotDone from "../pages/NotDone";
import NotPay from "../pages/NotPay";

const router = createBrowserRouter([
   {
      path: "/",
      element: <MainLayout />,
      children: [
         { path: "", element: <Home /> },
         { path: "plans", element: <Plans /> },
         { path: "contact", element: <Contact /> },
         { path: "about", element: <About /> },
         { path: "services", element: <Services /> },
         {
            path: "/merci",
            element: <Merci />,
         },
         {
            path: "/paiement-annule",
            element: <PaiementAnnule />,
         },
         {
            path:"/portfolio", element: <Portfolio />
         },
         {
            path:"/notdone", element: <NotDone/>
         },
         {
            path:"notpay", element: <NotPay/>
         },
      ],
   },
   { path: "*", element: <NotFound /> },
]);

export default router;
