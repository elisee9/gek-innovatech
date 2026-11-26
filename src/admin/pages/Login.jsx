import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Logo from "../../components/Logo";
import ParticleField from "../../components/ParticleField";
import { api } from "../lib/api";
import { Button, Input, Note } from "../ui";

const Setup = ({ reason }) => (
   <div>
      <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em]">Compte à configurer</h1>
      <p className="mt-2 text-muted">
         {reason === "short" ? "Le mot de passe défini dans Netlify est trop court : il faut au moins 12 caractères." : "Le compte administrateur se définit dans Netlify, en deux variables."}
      </p>
      <ol className="mt-6 list-decimal space-y-2.5 pl-5 text-[15px] leading-relaxed">
         <li>Dans Netlify, ouvrez le site, puis Site configuration, Environment variables.</li>
         <li>
            Ajoutez <strong className="font-semibold">ADMIN_EMAIL</strong> : votre adresse.
         </li>
         <li>
            Ajoutez <strong className="font-semibold">ADMIN_PASSWORD</strong> : un mot de passe d&apos;au moins 12 caractères, que vous n&apos;utilisez nulle part ailleurs.
         </li>
         <li>Dans Deploys, choisissez Trigger deploy : le compte est actif à la fin de la mise en ligne.</li>
      </ol>
   </div>
);

const Login = ({ state, onDone }) => {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [remember, setRemember] = useState(false);
   const [shown, setShown] = useState(false);
   const [busy, setBusy] = useState(false);
   const [error, setError] = useState("");

   const submit = async (e) => {
      e.preventDefault();
      setBusy(true);
      setError("");
      try {
         await api.post("connexion", { email, password, remember });
         await onDone();
      } catch (failure) {
         setError(failure.message);
         setBusy(false);
      }
   };

   return (
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
         <div className="band-dark relative isolate flex min-h-[168px] flex-col justify-between overflow-hidden p-6 sm:p-10 lg:min-h-screen">
            <ParticleField className="terrain-fade" />
            <a href="/" aria-label="GEK INNOVATECH, retour au site" className="relative">
               <Logo width={132} />
            </a>
            <p className="relative hidden max-w-[16ch] text-[40px] font-semibold leading-[1.06] tracking-[-0.03em] lg:block">
               Vos clients, vos rendez-vous, votre site.
            </p>
         </div>
         <div className="flex items-center px-5 py-10 sm:px-10">
            <div className="mx-auto w-full max-w-[420px]">
               {!state.configured ? (
                  <Setup reason={state.reason} />
               ) : (
                  <form onSubmit={submit}>
                     <h1 className="text-[28px] font-semibold tracking-[-0.02em]">Tableau de bord</h1>
                     <div className="mt-7 space-y-5">
                        <Input label="Email" type="email" autoComplete="username" inputMode="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
                        <Input
                           label="Mot de passe"
                           type={shown ? "text" : "password"}
                           autoComplete="current-password"
                           required
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           action={
                              <button type="button" onClick={() => setShown((v) => !v)} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-text hover:underline">
                                 {shown ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                                 {shown ? "Masquer" : "Afficher"}
                              </button>
                           }
                        />
                        <label className="flex cursor-pointer items-center gap-3 text-[15px]">
                           <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-[18px] w-[18px] accent-brand" />
                           Rester connecté 30 jours sur cet appareil
                        </label>
                     </div>
                     {error && (
                        <Note tone="error" className="mt-5">
                           <span role="alert">{error}</span>
                        </Note>
                     )}
                     <Button type="submit" variant="primary" busy={busy} className="mt-7 w-full">
                        Se connecter
                     </Button>
                  </form>
               )}
            </div>
         </div>
      </div>
   );
};

export default Login;
