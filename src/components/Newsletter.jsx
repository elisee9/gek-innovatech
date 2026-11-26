import { useId, useRef, useState } from "react";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { postJson } from "../utils/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Inscription aux conseils par email, en bandeau réglé au-dessus du bas de page.
const Newsletter = () => {
   const { t, i18n } = useTranslation();
   const id = useId();
   const openedAt = useRef(Date.now());
   const [email, setEmail] = useState("");
   const [website, setWebsite] = useState("");
   const [status, setStatus] = useState("idle");

   const onSubmit = async (e) => {
      e.preventDefault();
      if (status === "sending") return;
      if (!EMAIL_RE.test(email.trim())) {
         setStatus("invalid");
         return;
      }
      setStatus("sending");
      try {
         await postJson("/api/abonnement", { email, website, lang: i18n.resolvedLanguage || i18n.language, elapsed: Date.now() - openedAt.current });
         setEmail("");
         setStatus("done");
      } catch {
         setStatus("error");
      }
   };

   const failed = status === "invalid" || status === "error";

   return (
      <div className="border-t border-line">
         <div className="mx-auto grid max-w-[1200px] gap-x-16 gap-y-5 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
               <h2 className="text-[18px] font-semibold tracking-[-0.01em]">{t("newsletter.title")}</h2>
               <p className="mt-1.5 max-w-[52ch] text-[15px] leading-relaxed text-muted">{t("newsletter.text")}</p>
            </div>
            <form onSubmit={onSubmit} noValidate className="relative">
               <div className="flex flex-col gap-3 sm:flex-row">
                  <label htmlFor={id} className="sr-only">
                     {t("newsletter.label")}
                  </label>
                  <input
                     id={id}
                     type="email"
                     autoComplete="email"
                     inputMode="email"
                     value={email}
                     onChange={(e) => {
                        setEmail(e.target.value);
                        if (status !== "sending") setStatus("idle");
                     }}
                     placeholder={t("newsletter.placeholder")}
                     aria-invalid={status === "invalid"}
                     aria-describedby={`${id}-status`}
                     className={`h-12 w-full min-w-0 rounded-full border bg-ink-2 px-5 text-[16px] text-fg placeholder:text-subtle transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-4 ${
                        failed ? "border-danger/70 focus:border-danger focus:ring-danger/15" : "border-line-strong hover:border-fg/30 focus:border-brand focus:ring-brand/15"
                     }`}
                  />
                  <button
                     type="submit"
                     disabled={status === "sending"}
                     className="inline-flex h-12 flex-none items-center justify-center gap-2 rounded-full bg-fg px-6 text-[15px] font-medium text-ink-2 transition-colors hover:bg-fg-hover disabled:opacity-60"
                  >
                     {status === "sending" && <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />}
                     {status === "sending" ? t("newsletter.sending") : t("newsletter.submit")}
                  </button>
               </div>
               <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <label htmlFor={`${id}-website`}>Site</label>
                  <input id={`${id}-website`} type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
               </div>
               <p id={`${id}-status`} role="status" className={`mt-2.5 min-h-[1.4em] text-[14px] ${failed ? "text-danger" : "text-muted"}`}>
                  {status === "done" && (
                     <span className="inline-flex items-center gap-1.5">
                        <CircleCheck size={16} className="text-signal" aria-hidden="true" />
                        {t("newsletter.success")}
                     </span>
                  )}
                  {failed && (
                     <span className="inline-flex items-center gap-1.5">
                        <CircleAlert size={16} aria-hidden="true" />
                        {t(status === "invalid" ? "newsletter.invalid" : "newsletter.error")}
                     </span>
                  )}
               </p>
            </form>
         </div>
      </div>
   );
};

export default Newsletter;
