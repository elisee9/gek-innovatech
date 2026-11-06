import { useEffect, useId, useRef, useState } from "react";
import emailjs from "emailjs-com";
import { Link } from "react-router-dom";
import { ArrowRight, CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Pill from "./Pill";
import Select from "./Select";
import DrawIcon from "./DrawIcon";
import plans from "../data/plans";
import { whatsappLink } from "../data/contact";
import { formatPrice } from "../utils/formatPrice";
import { EASE } from "../utils/motion";

const EMAILJS_SERVICE_ID = "service_uqzdlh2";
const EMAILJS_TEMPLATE_ID = "template_34a69ni";
const EMAILJS_PUBLIC_KEY = "k1UfC15R-VW_wFOuS";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Dans l'ordre des offres de data/plans.js (Starter, Pro, Premium), puis « je ne sais pas encore ».
const PLANS = ["starter", "pro", "premium", "unsure"];
const MESSAGE_MAX_HEIGHT = 360; // au-delà, la zone de texte défile au lieu de grandir
const EMPTY = { name: "", email: "", phone: "", plan: "unsure", message: "" };

const validate = (v) => {
   const errors = {};
   if (v.name.trim().length < 2) errors.name = "name";
   if (!EMAIL_RE.test(v.email.trim())) errors.email = "email";
   if (v.message.trim().length < 10) errors.message = "message";
   return errors;
};

const fieldCls = (invalid) =>
   `w-full rounded-xl border bg-ink-2 px-4 text-[16px] text-fg placeholder:text-subtle transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-4 ${
      invalid
         ? "border-danger/70 focus:border-danger focus:ring-danger/15"
         : "border-line-strong hover:border-fg/30 focus:border-brand focus:ring-brand/15"
   }`;

// titleAs : niveau du titre, selon que la section a son propre h2 ou se trouve directement sous le h1 du bandeau.
const ContactForm = ({ titleAs: Title = "h3" }) => {
   const { t, i18n } = useTranslation();
   const id = useId();
   const formRef = useRef(null);
   const messageRef = useRef(null);
   const [values, setValues] = useState(EMPTY);
   const [errors, setErrors] = useState({});
   const [status, setStatus] = useState("idle");
   const [sentTo, setSentTo] = useState(null);
   const lang = i18n.resolvedLanguage || i18n.language;
   const planTexts = t("pricing.plans", { returnObjects: true });
   const planOptions = PLANS.map((plan, i) => ({
      value: plan,
      label: t(`form.planOptions.${plan}`),
      meta: plans[i] ? `${formatPrice(plans[i].amount, lang)} · ${planTexts[i]?.deliveryTime}` : null,
   }));

   // La zone de texte grandit avec le message, sans poignée de redimensionnement.
   useEffect(() => {
      const box = messageRef.current;
      if (!box) return;
      box.style.height = "auto";
      box.style.height = `${Math.min(box.scrollHeight + 2, MESSAGE_MAX_HEIGHT)}px`;
   }, [values.message]);

   const check = (field, v) => validate(v)[field];

   const update = (field) => (e) => {
      const next = { ...values, [field]: e.target.value };
      setValues(next);
      // Une erreur affichée disparaît dès que la saisie devient valide.
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: check(field, next) }));
   };

   // En quittant un champ rempli, ce qui ne va pas est signalé tout de suite ; un champ vide attend l'envoi.
   const leave = (field) => () => {
      if (values[field].trim()) setErrors((prev) => ({ ...prev, [field]: check(field, values) }));
   };

   const onSubmit = async (e) => {
      e.preventDefault();
      if (status === "sending") return;
      const found = validate(values);
      setErrors(found);
      if (Object.keys(found).length) {
         formRef.current?.querySelector(`[name="${Object.keys(found)[0]}"]`)?.focus();
         return;
      }

      setStatus("sending");
      const planLabel = t(`form.planOptions.${values.plan}`);
      const message = [
         values.message.trim(),
         "",
         `— ${t("form.plan")} : ${planLabel}`,
         `— ${t("form.phone")} : ${values.phone.trim() || "—"}`,
         `— ${t("form.langLabel")} : ${(i18n.resolvedLanguage || i18n.language).toUpperCase()}`,
      ].join("\n");

      try {
         await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            { name: values.name.trim(), email: values.email.trim(), message, phone: values.phone.trim(), plan: planLabel },
            EMAILJS_PUBLIC_KEY
         );
         setSentTo({ name: values.name.trim(), email: values.email.trim() });
         setValues(EMPTY);
         setStatus("sent");
      } catch {
         setStatus("error");
      }
   };

   if (status === "sent") {
      return (
         <motion.div
            role="status"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex min-h-[420px] flex-col items-start justify-center rounded-[28px] border border-line bg-ink-2 p-8 shadow-float sm:p-10"
         >
            {/* La coche se trace : l'envoi est confirmé par un geste, pas seulement par un texte. */}
            <DrawIcon icon={CircleCheck} delay={0.15} duration={1.2} size={40} strokeWidth={1.6} className="text-signal" />
            <Title className="mt-6 text-[28px] font-semibold tracking-[-0.02em]">{t("form.successTitle")}</Title>
            <p className="mt-3 max-w-[44ch] text-[16px] leading-relaxed text-muted">
               {t("form.successText", { name: sentTo?.name, email: sentTo?.email })}
            </p>
            <button
               type="button"
               onClick={() => setStatus("idle")}
               className="mt-8 inline-flex items-center gap-2 text-[15px] font-medium text-brand-text hover:underline"
            >
               {t("form.again")}
               <ArrowRight size={16} aria-hidden="true" />
            </button>
         </motion.div>
      );
   }

   const errorText = (field) =>
      errors[field] && (
         <motion.p
            id={`${id}-${field}-error`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="mt-2 flex items-start gap-1.5 text-[14px] leading-snug text-danger"
         >
            <CircleAlert size={16} strokeWidth={2} aria-hidden="true" className="mt-px flex-none" />
            {t(`form.errors.${field}`)}
         </motion.p>
      );

   const labelCls = "mb-2 block text-[14px] font-medium text-fg/90";

   return (
      <form
         ref={formRef}
         onSubmit={onSubmit}
         noValidate
         className="rounded-[28px] border border-line bg-ink-2 p-6 shadow-float sm:p-9"
      >
         <Title className="text-[24px] font-semibold tracking-[-0.02em]">{t("form.title")}</Title>
         <p className="mt-2 text-[15px] text-muted">{t("form.intro")}</p>

         <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div>
               <label htmlFor={`${id}-name`} className={labelCls}>
                  {t("form.name")}
               </label>
               <input
                  id={`${id}-name`}
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={values.name}
                  onChange={update("name")}
                  onBlur={leave("name")}
                  placeholder={t("form.namePh")}
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? `${id}-name-error` : undefined}
                  className={`h-12 ${fieldCls(errors.name)}`}
               />
               {errorText("name")}
            </div>
            <div>
               <label htmlFor={`${id}-email`} className={labelCls}>
                  {t("form.email")}
               </label>
               <input
                  id={`${id}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={values.email}
                  onChange={update("email")}
                  onBlur={leave("email")}
                  placeholder={t("form.emailPh")}
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? `${id}-email-error` : undefined}
                  className={`h-12 ${fieldCls(errors.email)}`}
               />
               {errorText("email")}
            </div>
            <div>
               <label htmlFor={`${id}-phone`} className={labelCls}>
                  {t("form.phone")} <span className="font-normal text-subtle">{t("form.optional")}</span>
               </label>
               <input
                  id={`${id}-phone`}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={values.phone}
                  onChange={update("phone")}
                  placeholder={t("form.phonePh")}
                  className={`h-12 ${fieldCls(false)}`}
               />
            </div>
            <div>
               <span id={`${id}-plan-label`} className={labelCls}>
                  {t("form.plan")}
               </span>
               <Select
                  id={`${id}-plan`}
                  labelId={`${id}-plan-label`}
                  value={values.plan}
                  onChange={(plan) => setValues((prev) => ({ ...prev, plan }))}
                  options={planOptions}
                  className={`h-12 ${fieldCls(false)}`}
               />
            </div>
            <div className="sm:col-span-2">
               <label htmlFor={`${id}-message`} className={labelCls}>
                  {t("form.message")}
               </label>
               <textarea
                  ref={messageRef}
                  id={`${id}-message`}
                  name="message"
                  rows={5}
                  value={values.message}
                  onChange={update("message")}
                  onBlur={leave("message")}
                  placeholder={t("form.messagePh")}
                  aria-required="true"
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? `${id}-message-error` : undefined}
                  className={`block resize-none py-3 leading-relaxed ${fieldCls(errors.message)}`}
               />
               {errorText("message")}
            </div>
         </div>

         {status === "error" && (
            <motion.div
               role="alert"
               initial={{ opacity: 0, y: -8 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.35, ease: EASE }}
               className="mt-6 rounded-2xl border border-danger/25 bg-danger/[0.06] p-4 text-[15px] leading-relaxed text-fg"
            >
               {t("form.errorText")}{" "}
               <a
                  href={whatsappLink(t("common.whatsappMessage"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-signal underline"
               >
                  <FaWhatsapp aria-hidden="true" />
                  {t("common.whatsapp")}
               </a>
            </motion.div>
         )}

         <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-[40ch] text-[13px] leading-relaxed text-subtle">
               {t("form.privacy")}{" "}
               <Link to="/mentions-legales" className="underline hover:text-fg">
                  {t("form.privacyLink")}
               </Link>
            </p>
            <Pill
               type="submit"
               variant="light"
               size="lg"
               disabled={status === "sending"}
               aria-busy={status === "sending"}
               dot={status !== "sending"}
            >
               {status === "sending" ? (
                  <span className="inline-flex items-center gap-2">
                     <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
                     {t("form.sending")}
                  </span>
               ) : (
                  t("form.submit")
               )}
            </Pill>
         </div>
      </form>
   );
};

export default ContactForm;
