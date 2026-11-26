import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Seo from "../components/Seo";
import Pill from "../components/Pill";
import DrawIcon from "../components/DrawIcon";
import { whatsappLink } from "../data/contact";
import { FEATURES } from "../data/features";
import { getJson, postJson } from "../utils/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMPTY = { name: "", email: "", phone: "", topic: "", website: "" };

const fieldCls = (invalid) =>
   `w-full rounded-xl border bg-ink-2 px-4 text-[16px] text-fg placeholder:text-subtle transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-4 ${
      invalid ? "border-danger/70 focus:border-danger focus:ring-danger/15" : "border-line-strong hover:border-fg/30 focus:border-brand focus:ring-brand/15"
   }`;

const choiceCls = (active) =>
   `rounded-xl border px-3 text-[15px] font-medium transition-colors ${
      active ? "border-fg bg-fg text-ink-2" : "border-line-strong bg-ink-2 text-fg hover:border-fg/30 hover:bg-ink-3"
   }`;

const Notice = ({ title, text }) => {
   const { t } = useTranslation();
   return (
      <div className="rounded-[28px] border border-line bg-ink-2 p-8 shadow-card sm:p-10">
         <h2 className="text-[24px] font-semibold tracking-[-0.02em]">{title}</h2>
         <p className="mt-3 max-w-[52ch] text-[16px] leading-relaxed text-muted">{text}</p>
         <Pill href={whatsappLink(t("common.whatsappMessage"))} variant="lit" size="lg" icon={FaWhatsapp} className="mt-7">
            {t("common.writeWhatsapp")}
         </Pill>
      </div>
   );
};

// Prise de rendez-vous : le jour, l'heure (dans le fuseau du visiteur), puis les coordonnées.
// Les créneaux viennent des horaires réglés dans le tableau de bord, moins les rendez-vous déjà pris.
const Booking = () => {
   const { t, i18n } = useTranslation();
   const id = useId();
   const lang = (i18n.resolvedLanguage || i18n.language) === "en" ? "en-GB" : "fr-FR";
   const zone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
   const openedAt = useRef(Date.now());
   const formRef = useRef(null);
   const [data, setData] = useState(null);
   const [loadError, setLoadError] = useState(false);
   const [day, setDay] = useState(null);
   const [start, setStart] = useState(null);
   const [mode, setMode] = useState(null);
   const [values, setValues] = useState(EMPTY);
   const [errors, setErrors] = useState({});
   const [status, setStatus] = useState("idle");
   const [failure, setFailure] = useState("");
   const [done, setDone] = useState(null);

   const load = useCallback(async () => {
      setLoadError(false);
      try {
         const result = await getJson("/api/creneaux");
         setData(result);
         setMode((current) => current || result.modes?.[0] || null);
      } catch {
         setLoadError(true);
      }
   }, []);

   useEffect(() => {
      load();
   }, [load]);

   // Regroupe les créneaux par jour du visiteur : un horaire du soir au Bénin peut tomber le lendemain ailleurs.
   const days = useMemo(() => {
      const groups = new Map();
      for (const slot of (data?.days || []).flatMap((item) => item.slots)) {
         const key = new Date(slot).toLocaleDateString("en-CA");
         groups.set(key, [...(groups.get(key) || []), slot]);
      }
      return [...groups.entries()];
   }, [data]);

   const activeDay = day && days.some(([key]) => key === day) ? day : days[0]?.[0];
   const slots = days.find(([key]) => key === activeDay)?.[1] || [];
   const format = (value, options) => new Date(value).toLocaleString(lang, options);
   const needsPhone = mode === "whatsapp" || mode === "phone";

   const update = (field) => (e) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
   };

   const onSubmit = async (e) => {
      e.preventDefault();
      if (status === "sending") return;
      const found = {};
      if (values.name.trim().length < 2) found.name = true;
      if (!EMAIL_RE.test(values.email.trim())) found.email = true;
      if (needsPhone && values.phone.replace(/\D/g, "").length < 8) found.phone = true;
      setErrors(found);
      if (Object.keys(found).length) {
         formRef.current?.querySelector(`[name="${Object.keys(found)[0]}"]`)?.focus();
         return;
      }
      setStatus("sending");
      setFailure("");
      try {
         const result = await postJson("/api/rendez-vous", { ...values, start, mode, lang: i18n.resolvedLanguage || i18n.language, elapsed: Date.now() - openedAt.current });
         setDone({ name: values.name.trim(), email: values.email.trim(), emailed: result.emailed, start });
         setValues(EMPTY);
         setStart(null);
      } catch (error) {
         setFailure(error.status === 409 || error.status === 400 || error.status === 429 ? error.message : t("booking.loadError"));
         // Créneau pris entre-temps : la liste se met à jour et le visiteur en choisit un autre.
         if (error.status === 409) {
            setStart(null);
            load();
         }
      } finally {
         setStatus("idle");
      }
   };

   const errorText = (field) =>
      errors[field] && (
         <p id={`${id}-${field}-error`} className="mt-2 flex items-start gap-1.5 text-[14px] leading-snug text-danger">
            <CircleAlert size={16} aria-hidden="true" className="mt-px flex-none" />
            {t(`booking.errors.${field}`)}
         </p>
      );

   const field = (name, props = {}, optional = false) => (
      <div>
         <label htmlFor={`${id}-${name}`} className="mb-2 block text-[14px] font-medium text-fg/90">
            {t(`booking.${name}`)} {optional && <span className="font-normal text-subtle">{t("form.optional")}</span>}
         </label>
         <input
            id={`${id}-${name}`}
            name={name}
            value={values[name]}
            onChange={update(name)}
            aria-invalid={!!errors[name]}
            aria-describedby={errors[name] ? `${id}-${name}-error` : undefined}
            className={`h-12 ${fieldCls(errors[name])}`}
            {...props}
         />
         {errorText(name)}
      </div>
   );

   const content = () => {
      if (done) {
         return (
            <div role="status" className="rounded-[28px] border border-line bg-ink-2 p-8 shadow-float sm:p-10">
               <DrawIcon icon={CircleCheck} delay={0.15} duration={1.2} size={40} strokeWidth={1.6} className="text-signal" />
               <h2 className="mt-6 text-[28px] font-semibold tracking-[-0.02em]">{t("booking.successTitle")}</h2>
               <p className="mt-3 text-[17px] text-fg">
                  {t("booking.successText", { name: done.name, when: format(done.start, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) })}
               </p>
               {done.emailed && <p className="mt-2 text-[16px] text-muted">{t("booking.successEmail", { email: done.email })}</p>}
            </div>
         );
      }
      if (loadError) {
         return (
            <div role="alert" className="rounded-[28px] border border-line bg-ink-2 p-8 sm:p-10">
               <p className="text-[16px] text-muted">{t("booking.loadError")}</p>
               <Pill onClick={load} className="mt-5">
                  {t("booking.retry")}
               </Pill>
            </div>
         );
      }
      if (!data) {
         return (
            <p className="flex items-center gap-2.5 text-[16px] text-muted">
               <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
               {t("booking.loading")}
            </p>
         );
      }
      if (!data.open) return <Notice title={t("booking.closedTitle")} text={t("booking.closedText")} />;
      if (!days.length) return <Notice title={t("booking.emptyTitle")} text={t("booking.closedText")} />;

      return (
         <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
               <h2 className="text-[20px] font-semibold tracking-[-0.01em]">{t("booking.pickDay")}</h2>
               <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {days.map(([key, list]) => (
                     <button
                        key={key}
                        type="button"
                        aria-pressed={key === activeDay}
                        onClick={() => {
                           setDay(key);
                           setStart(null);
                        }}
                        className={`flex h-16 flex-col items-center justify-center leading-tight ${choiceCls(key === activeDay)}`}
                     >
                        <span className="text-[13px] font-normal opacity-80">{format(list[0], { weekday: "short" })}</span>
                        <span>{format(list[0], { day: "numeric", month: "short" })}</span>
                     </button>
                  ))}
               </div>
               <h2 className="mt-9 text-[20px] font-semibold tracking-[-0.01em]">{t("booking.pickTime")}</h2>
               <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((slot) => (
                     <button key={slot} type="button" aria-pressed={slot === start} onClick={() => setStart(slot)} className={`tabular h-12 ${choiceCls(slot === start)}`}>
                        {format(slot, { hour: "2-digit", minute: "2-digit" })}
                     </button>
                  ))}
               </div>
               <p className="mt-4 text-[14px] text-subtle">
                  {t("booking.duration", { minutes: data.duration })} · {t("booking.zone", { zone })}
               </p>
            </div>

            <form ref={formRef} onSubmit={onSubmit} noValidate className="relative self-start rounded-[28px] border border-line bg-ink-2 p-6 shadow-float sm:p-8">
               <h2 className="text-[22px] font-semibold tracking-[-0.015em]">{t("booking.detailsTitle")}</h2>
               <p className="mt-2 min-h-[1.6em] text-[15px] text-muted" aria-live="polite">
                  {start ? format(start, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : t("booking.pickTime")}
               </p>
               {data.modes.length > 1 && (
                  <fieldset className="mt-6">
                     <legend className="mb-2 text-[14px] font-medium text-fg/90">{t("booking.mode")}</legend>
                     <div className="flex flex-wrap gap-2">
                        {data.modes.map((item) => (
                           <button key={item} type="button" aria-pressed={item === mode} onClick={() => setMode(item)} className={`h-11 ${choiceCls(item === mode)}`}>
                              {t(`booking.modes.${item}`)}
                           </button>
                        ))}
                     </div>
                  </fieldset>
               )}
               <div className="mt-6 space-y-5">
                  {field("name", { type: "text", autoComplete: "name" })}
                  {field("email", { type: "email", autoComplete: "email", inputMode: "email", placeholder: t("form.emailPh") })}
                  {field("phone", { type: "tel", autoComplete: "tel", inputMode: "tel", placeholder: t("form.phonePh") }, !needsPhone)}
                  <div>
                     <label htmlFor={`${id}-topic`} className="mb-2 block text-[14px] font-medium text-fg/90">
                        {t("booking.topic")} <span className="font-normal text-subtle">{t("form.optional")}</span>
                     </label>
                     <textarea id={`${id}-topic`} name="topic" rows={3} value={values.topic} onChange={update("topic")} placeholder={t("booking.topicPh")} className={`block resize-none py-3 leading-relaxed ${fieldCls(false)}`} />
                  </div>
               </div>
               <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <label htmlFor={`${id}-website`}>Site</label>
                  <input id={`${id}-website`} type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={update("website")} />
               </div>
               {failure && (
                  <p role="alert" className="mt-5 flex items-start gap-2 rounded-2xl border border-danger/25 bg-danger/[0.06] p-4 text-[15px] leading-relaxed">
                     <CircleAlert size={18} className="mt-0.5 flex-none text-danger" aria-hidden="true" />
                     {failure}
                  </p>
               )}
               <Pill type="submit" variant="light" size="lg" disabled={!start || status === "sending"} className="mt-7 w-full">
                  {status === "sending" ? t("booking.sending") : t("booking.submit")}
               </Pill>
               <p className="mt-4 text-[13px] leading-relaxed text-subtle">{t("form.privacy")}</p>
            </form>
         </div>
      );
   };

   return (
      <>
         {/* Fermée, la page ne doit pas apparaître dans Google. */}
         <Seo page="booking" path="/rendez-vous" noindex={!FEATURES.booking} />
         <section className="mx-auto min-h-[420px] max-w-[1200px] px-5 py-14 sm:px-8 md:py-20">{content()}</section>
      </>
   );
};

export default Booking;
