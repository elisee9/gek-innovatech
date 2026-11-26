import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { LoaderCircle } from "lucide-react";
import Login from "./pages/Login";
import Shell from "./Shell";
import { AdminProvider } from "./lib/store";
import { api, SESSION_LOST } from "./lib/api";
import { Button } from "./ui";
import "./admin.css";

const Home = lazy(() => import("./pages/Home"));
const Leads = lazy(() => import("./pages/Leads"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Meetings = lazy(() => import("./pages/Meetings"));
const Documents = lazy(() => import("./pages/Documents"));
const DocumentEditor = lazy(() => import("./pages/DocumentEditor"));
const Sequences = lazy(() => import("./pages/Sequences"));
const SequenceEditor = lazy(() => import("./pages/SequenceEditor"));
const Campaigns = lazy(() => import("./pages/Campaigns"));
const Chats = lazy(() => import("./pages/Chats"));
const Plans = lazy(() => import("./pages/Plans"));
const Services = lazy(() => import("./pages/Services"));
const Projects = lazy(() => import("./pages/Projects"));
const Proof = lazy(() => import("./pages/Proof"));
const Texts = lazy(() => import("./pages/Texts"));
const Checkup = lazy(() => import("./pages/Checkup"));
const Settings = lazy(() => import("./pages/Settings"));
const Missing = lazy(() => import("./pages/Missing"));

const Wait = () => (
   <div className="flex min-h-[50vh] items-center justify-center text-muted" role="status">
      <LoaderCircle size={24} className="animate-spin" aria-hidden="true" />
      <span className="sr-only">Chargement</span>
   </div>
);

const AdminApp = () => {
   const [state, setState] = useState(null);
   const [error, setError] = useState("");

   const check = useCallback(async () => {
      try {
         setState(await api.get("etat"));
         setError("");
      } catch (failure) {
         setError(failure.message);
      }
   }, []);

   useEffect(() => {
      check();
      // L'assistant du site et le comptage ne concernent pas cette page ; la session perdue ramène à la connexion.
      const lost = () => setState((current) => (current ? { ...current, connected: false } : current));
      window.addEventListener(SESSION_LOST, lost);
      return () => window.removeEventListener(SESSION_LOST, lost);
   }, [check]);

   return (
      <div className="adm min-h-screen bg-ink text-fg">
         <Helmet>
            <title>Tableau de bord | GEK INNOVATECH</title>
            <meta name="robots" content="noindex, nofollow" />
         </Helmet>
         {error ? (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
               <p className="max-w-[44ch] text-muted">{error}</p>
               <Button onClick={check}>Réessayer</Button>
            </div>
         ) : !state ? (
            <Wait />
         ) : !state.connected ? (
            <Login state={state} onDone={check} />
         ) : (
            <AdminProvider>
               <Shell onLogout={check} email={state.email}>
                  <Suspense fallback={<Wait />}>
                     <Routes>
                        <Route index element={<Home />} />
                        <Route path="demandes" element={<Leads />} />
                        <Route path="demandes/:id" element={<Leads />} />
                        <Route path="contacts" element={<Contacts />} />
                        <Route path="rendez-vous" element={<Meetings />} />
                        <Route path="documents" element={<Documents />} />
                        <Route path="documents/:id" element={<DocumentEditor />} />
                        <Route path="sequences" element={<Sequences />} />
                        <Route path="sequences/:id" element={<SequenceEditor />} />
                        <Route path="campagnes" element={<Campaigns />} />
                        <Route path="campagnes/:id" element={<Campaigns />} />
                        <Route path="conversations" element={<Chats />} />
                        <Route path="offres" element={<Plans />} />
                        <Route path="services" element={<Services />} />
                        <Route path="realisations" element={<Projects />} />
                        <Route path="avis" element={<Proof />} />
                        <Route path="textes" element={<Texts />} />
                        <Route path="verification" element={<Checkup />} />
                        <Route path="reglages" element={<Settings />} />
                        <Route path="*" element={<Missing />} />
                     </Routes>
                  </Suspense>
               </Shell>
            </AdminProvider>
         )}
      </div>
   );
};

export default AdminApp;
