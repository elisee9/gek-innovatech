import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useBlocker } from "react-router-dom";
import { resolveContent } from "../../content/model";
import { api } from "./api";
import { Confirm, Toasts } from "../ui";

const Admin = createContext(null);
// eslint-disable-next-line react-refresh/only-export-components
export const useAdmin = () => useContext(Admin);

const upsert = (list, item) => (list.some((one) => one.id === item.id) ? list.map((one) => (one.id === item.id ? item : one)) : [item, ...list]);

export const AdminProvider = ({ children }) => {
   const [data, setData] = useState(null);
   const [error, setError] = useState("");
   const [refreshing, setRefreshing] = useState(false);
   const [toasts, setToasts] = useState([]);
   const counter = useRef(0);

   const toast = useCallback((text, tone = "ok") => {
      const id = ++counter.current;
      setToasts((list) => [...list.slice(-2), { id, text, tone }]);
      window.setTimeout(() => setToasts((list) => list.filter((item) => item.id !== id)), tone === "error" ? 8000 : 4500);
   }, []);

   const refresh = useCallback(async (quiet = false) => {
      setRefreshing(!quiet);
      try {
         setData(await api.get("tout"));
         setError("");
      } catch (failure) {
         setError(failure.message);
      } finally {
         setRefreshing(false);
      }
   }, []);

   useEffect(() => {
      refresh();
   }, [refresh]);

   // De retour sur l'onglet, les nouvelles demandes apparaissent sans recharger la page.
   const last = useRef(Date.now());
   useEffect(() => {
      const onShow = () => {
         if (document.visibilityState !== "visible" || Date.now() - last.current < 60_000) return;
         last.current = Date.now();
         refresh(true);
      };
      document.addEventListener("visibilitychange", onShow);
      const timer = window.setInterval(onShow, 180_000);
      return () => {
         document.removeEventListener("visibilitychange", onShow);
         window.clearInterval(timer);
      };
   }, [refresh]);

   const patch = useCallback((key, value) => setData((current) => (current ? { ...current, [key]: typeof value === "function" ? value(current[key]) : value } : current)), []);
   const put = useCallback((key, item) => patch(key, (list) => upsert(list, item)), [patch]);
   const drop = useCallback((key, id) => patch(key, (list) => list.filter((item) => item.id !== id)), [patch]);

   // Exécute une action, affiche son erreur s'il y en a une, et renvoie son résultat (ou null).
   const run = useCallback(
      async (job, success) => {
         try {
            const result = await job();
            if (success) toast(typeof success === "function" ? success(result) : success);
            return result ?? true;
         } catch (failure) {
            toast(failure.message, "error");
            return null;
         }
      },
      [toast],
   );

   const saveContent = useCallback(
      (section, value) =>
         run(async () => {
            const result = await api.put(`contenu/${section}`, { value });
            patch("content", (content) => ({ ...(content || {}), [section]: result.saved }));
            toast(result.live ? "Enregistré, en ligne." : "Enregistré. La mise en ligne peut prendre quelques minutes.");
            return result;
         }),
      [patch, run, toast],
   );

   const content = useMemo(() => (data ? resolveContent(data.content) : null), [data]);

   const value = useMemo(
      () => ({ ...data, saved: data?.content, content, loading: !data, error, refreshing, refresh, patch, put, drop, run, toast, saveContent }),
      [data, content, error, refreshing, refresh, patch, put, drop, run, toast, saveContent],
   );

   return (
      <Admin.Provider value={value}>
         {children}
         <Toasts items={toasts} />
      </Admin.Provider>
   );
};

// Copie de travail d'un contenu : rien n'est en ligne avant « Enregistrer ».
// eslint-disable-next-line react-refresh/only-export-components
export const useDraft = (source) => {
   const key = JSON.stringify(source);
   const [draft, setDraft] = useState(() => JSON.parse(key));
   const base = useRef(key);
   useEffect(() => {
      // Le contenu enregistré a changé ailleurs : la copie suit, sauf s'il y a des modifications en cours.
      setDraft((current) => (JSON.stringify(current) === base.current ? JSON.parse(key) : current));
      base.current = key;
   }, [key]);
   const dirty = JSON.stringify(draft) !== key;
   return { draft, setDraft, dirty, reset: () => setDraft(JSON.parse(key)) };
};

// Demande confirmation avant de quitter une page qui a des modifications non enregistrées.
export const LeaveGuard = ({ when }) => {
   const blocker = useBlocker(({ currentLocation, nextLocation }) => when && currentLocation.pathname !== nextLocation.pathname);
   useEffect(() => {
      if (!when) return undefined;
      const warn = (e) => e.preventDefault();
      window.addEventListener("beforeunload", warn);
      return () => window.removeEventListener("beforeunload", warn);
   }, [when]);
   return (
      <Confirm
         open={blocker.state === "blocked"}
         title="Quitter sans enregistrer ?"
         text="Vos modifications sur cette page seront perdues."
         action="Quitter sans enregistrer"
         onConfirm={() => blocker.proceed?.()}
         onClose={() => blocker.reset?.()}
      />
   );
};
