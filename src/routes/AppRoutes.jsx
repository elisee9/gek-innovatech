import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import MainLayout from "../layouts/MainLayout";

const Home = lazy(() => import("../pages/Home"));
const Plans = lazy(() => import("../pages/Plans"));
const Contact = lazy(() => import("../pages/Contact"));
const About = lazy(() => import("../pages/About"));
const Services = lazy(() => import("../pages/Services"));
const Portfolio = lazy(() => import("../pages/Portfolio"));
const Merci = lazy(() => import("../pages/Merci"));
const PaiementAnnule = lazy(() => import("../pages/PaiementAnnule"));
const NotFound = lazy(() => import("../pages/NotFound"));
const NotDone = lazy(() => import("../pages/NotDone"));
const NotPay = lazy(() => import("../pages/NotPay"));
const MentionsLegales = lazy(() => import("../pages/MentionsLegales"));

const Fallback = () => (
   <div className="min-h-screen flex items-center justify-center bg-[#1E1E1E]" />
);

const wrap = (Component) => (
   <Suspense fallback={<Fallback />}>
      <Component />
   </Suspense>
);

const router = createBrowserRouter([
   {
      path: "/",
      element: <MainLayout />,
      children: [
         { path: "", element: wrap(Home) },
         { path: "about", element: wrap(About) },
         { path: "services", element: wrap(Services) },
         { path: "plans", element: wrap(Plans) },
         { path: "contact", element: wrap(Contact) },
         { path: "portfolio", element: wrap(Portfolio) },
         { path: "mentions-legales", element: wrap(MentionsLegales) },
         { path: "merci", element: wrap(Merci) },
         { path: "paiement-annule", element: wrap(PaiementAnnule) },
      ],
   },
   { path: "/notdone", element: wrap(NotDone) },
   { path: "/notpay", element: wrap(NotPay) },
   { path: "*", element: wrap(NotFound) },
]);

export default router;
