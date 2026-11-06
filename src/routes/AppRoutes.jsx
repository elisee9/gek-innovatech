import { lazy, Suspense } from "react";
import MainLayout from "../layouts/MainLayout";
// L'accueil part avec le premier fichier : c'est la page d'arrivée, elle ne doit pas attendre un second téléchargement.
import Home from "../pages/Home";

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
   <div className="min-h-screen bg-ink" />
);

const wrap = (Component) => (
   <Suspense fallback={<Fallback />}>
      <Component />
   </Suspense>
);

// Bandeau d'une page (voir MainLayout) : clés de traduction de son nom dans le fil d'Ariane, de son titre et de son sous-titre.
const banner = (crumb, title, subtitle) => ({ banner: { crumb, title, subtitle } });

// Ces routes servent au navigateur (App.jsx) et à la génération des pages HTML à la compilation (entry-prerender.jsx).
export const routes = [
   {
      path: "/",
      element: <MainLayout />,
      children: [
         { path: "", element: <Home /> },
         { path: "about", element: wrap(About), handle: banner("header.about", "about.title", "about.tagline") },
         { path: "services", element: wrap(Services), handle: banner("header.services", "services.title", "services.subtitle") },
         { path: "plans", element: wrap(Plans), handle: banner("header.plans", "pricing.title", "pricing.subtitle") },
         { path: "contact", element: wrap(Contact), handle: banner("header.contact", "contactSection.title", "contactSection.subtitle") },
         { path: "portfolio", element: wrap(Portfolio), handle: banner("header.portfolio", "portfolio.sectionTitle", "portfolio.subtitle") },
         { path: "mentions-legales", element: wrap(MentionsLegales), handle: banner("mentions.title", "mentions.title") },
         { path: "merci", element: wrap(Merci), handle: banner("merci.title", "merci.title") },
         { path: "paiement-annule", element: wrap(PaiementAnnule), handle: banner("paiementAnnule.title", "paiementAnnule.title") },
      ],
   },
   { path: "/notdone", element: wrap(NotDone) },
   { path: "/notpay", element: wrap(NotPay) },
   { path: "*", element: wrap(NotFound) },
];
