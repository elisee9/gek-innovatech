import { useRef } from "react";
import { motion } from "framer-motion";
import emailjs from "emailjs-com";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { User, AtSign, MessageSquare, Send } from "lucide-react";

const Contact = () => {
   const { t } = useTranslation();
   const form = useRef();

   const sendEmail = (e) => {
      e.preventDefault();

      toast.info(t("contact.sending"), {
         position: "top-right",
         autoClose: 4000,
         hideProgressBar: false,
         closeOnClick: true,
         pauseOnHover: true,
         draggable: true,
      });

      emailjs
         .sendForm(
            "service_uqzdlh2",
            "template_34a69ni",
            form.current,
            "k1UfC15R-VW_wFOuS"
         )
         .then(
            () => {
               toast.success(t("contact.success"), {
                  position: "top-right",
                  autoClose: 4000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
               });
               form.current.reset();
               window.scrollTo({ top: 0, behavior: "smooth" });
            },
            () => {
               toast.error(t("contact.error"), {
                  position: "top-right",
                  autoClose: 4000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
               });
            }
         );
   };

   return (
      <>
         <Helmet>
            <title>{t("meta.contact.title")}</title>
            <meta name="description" content={t("meta.contact.description")} />
            <meta name="keywords" content={t("meta.contact.keywords")} />
            <meta name="author" content={t("common.author")} />
            <meta name="robots" content="index, follow" />
            <meta property="og:title" content={t("meta.contact.ogTitle")} />
            <meta property="og:description" content={t("meta.contact.ogDescription")} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://gek-innovatech.netlify.app/contact" />
            <meta property="og:image" content="https://gek-innovatech.netlify.app/og-image.jpeg" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={t("meta.contact.ogTitle")} />
            <meta name="twitter:description" content={t("meta.contact.ogDescription")} />
            <meta name="twitter:image" content="https://gek-innovatech.netlify.app/og-image.jpeg" />
            <link rel="canonical" href="https://gek-innovatech.netlify.app/contact" />
         </Helmet>

         <section className="relative min-h-screen pt-32 pb-20 px-6 text-white">
            <div className="max-w-3xl mx-auto text-center mb-8">
               <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl md:text-5xl font-bold mb-4"
               >
                  {t("contact.title")}
                  <span className="text-[#005BFF]">{t("contact.titleAccent")}</span>
               </motion.h2>
               <p className="text-gray-300 text-lg">{t("contact.subtitle")}</p>
            </div>

            <form
               ref={form}
               onSubmit={sendEmail}
               className="max-w-3xl mx-auto bg-[#1E1E1E] p-8 rounded-2xl shadow-xl space-y-6 border border-white/5"
            >
               <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" strokeWidth={1.8} />
                  <input
                     type="text"
                     name="name"
                     placeholder={t("contact.namePlaceholder")}
                     required
                     minLength={2}
                     className="w-full pl-10 pr-4 py-3 rounded-md bg-[#2A2A2A] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005BFF]"
                  />
               </div>
               <div className="relative">
                  <AtSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" strokeWidth={1.8} />
                  <input
                     type="email"
                     name="email"
                     placeholder={t("contact.emailPlaceholder")}
                     required
                     className="w-full pl-10 pr-4 py-3 rounded-md bg-[#2A2A2A] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005BFF]"
                  />
               </div>
               <div className="relative">
                  <MessageSquare size={16} className="absolute left-3 top-4 text-gray-500" strokeWidth={1.8} />
                  <textarea
                     name="message"
                     rows="5"
                     placeholder={t("contact.messagePlaceholder")}
                     required
                     minLength={10}
                     className="w-full pl-10 pr-4 py-3 rounded-md bg-[#2A2A2A] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005BFF]"
                  />
               </div>

               <div className="flex justify-end">
                  <motion.button
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     type="submit"
                     className="inline-flex items-center gap-2 bg-[#005BFF] hover:bg-[#0044cc] text-white font-semibold px-6 py-3 rounded-lg transition shadow-lg hover:shadow-[#005BFF]/40 cursor-pointer"
                  >
                     <Send size={15} strokeWidth={2} />
                     {t("contact.submit")}
                  </motion.button>
               </div>
            </form>
         </section>
      </>
   );
};

export default Contact;
