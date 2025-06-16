import { useRef, useState } from "react";
import { motion } from "framer-motion";
import emailjs from "emailjs-com";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Helmet } from "react-helmet-async"; // Assurez-vous d'avoir installé react-helmet-async

const Contact = () => {
   const form = useRef();
   const [isOpen, setIsOpen] = useState(false); // Pour gérer l'état mobile si nécessaire

   // Fonction pour défiler vers le haut
   const handleLinkClick = () => {
      setIsOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
   };

   const sendEmail = (e) => {
      e.preventDefault();

      toast.info("Envoi du message en cours...", {
         position: "top-right",
         autoClose: 4000, // Augmente le temps d'affichage à 4000ms
         hideProgressBar: false,
         closeOnClick: true,
         pauseOnHover: true,
         draggable: true,
         progress: undefined,
      });

      emailjs
         .sendForm(
            "service_uqzdlh2", //  Service ID
            "template_34a69ni", //  Template ID
            form.current,
            "k1UfC15R-VW_wFOuS" //  User ID
         )
         .then(
            (result) => {
               toast.success("Message envoyé avec succès !", {
                  position: "top-right",
                  autoClose: 4000, // Augmente le temps d'affichage à 4000ms
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
               });
               form.current.reset();
               handleLinkClick(); // Défilement après envoi
            },
            (error) => {
               toast.error(
                  "Erreur lors de l'envoi du message !",
                  {
                     position: "top-right",
                     autoClose: 4000, // Augmente le temps d'affichage à 4000ms
                     hideProgressBar: false,
                     closeOnClick: true,
                     pauseOnHover: true,
                     draggable: true,
                     progress: undefined,
                  }
               );
            }
         );
   };

   return (
      <>
         <Helmet>
            <title>Contactez-nous | GEK INNOVATECH</title>
            <meta
               name="description"
               content="Une question ou un projet ? Contactez notre équipe pour échanger sur vos besoins digitaux."
            />
            <meta
               name="keywords"
               content="contact, devis site web, GEK INNOVATECH, assistance web, développement site web"
            />
            <meta name="author" content="GEK INNOVATECH" />
            <meta property="og:title" content="Contact | GEK INNOVATECH" />
            <meta
               property="og:description"
               content="Prenez contact avec notre agence pour lancer votre projet digital."
            />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://gekinnova.com/contact" />
            <meta
               property="og:image"
               content="https://gekinnova.com/images/og-contact.jpg"
            />
         </Helmet>

         <section className="relative min-h-screen pt-32 pb-20 px-6 text-white">
            <div className="max-w-3xl mx-auto text-center mb-8">
               <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl md:text-5xl font-bold mb-4"
               >
                  Contactez-<span className="text-[#00D2A8]">nous</span>
               </motion.h2>
               <p className="text-gray-300 text-lg">
                  Une question ? Un projet ? Remplissez le formulaire ci-dessous
                  et notre équipe vous répondra rapidement.
               </p>
            </div>

            <form
               ref={form}
               onSubmit={sendEmail}
               className="max-w-3xl mx-auto bg-[#1E1E1E] p-8 rounded-2xl shadow-xl space-y-6 border border-white/5"
            >
               <input
                  type="text"
                  name="name"
                  placeholder="Votre nom"
                  required
                  className="w-full p-3 rounded-md bg-[#2A2A2A] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00D2A8]"
               />
               <input
                  type="email"
                  name="email"
                  placeholder="Votre email"
                  required
                  className="w-full p-3 rounded-md bg-[#2A2A2A] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00D2A8]"
               />
               <textarea
                  name="message"
                  rows="5"
                  placeholder="Votre message"
                  required
                  className="w-full p-3 rounded-md bg-[#2A2A2A] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00D2A8]"
               ></textarea>

               <div className="flex justify-end">
                  <motion.button
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     type="submit"
                     className="bg-[#00D2A8] hover:bg-[#00b091] text-black font-semibold px-6 py-3 rounded-lg transition shadow-lg hover:shadow-[#00D2A8]/40 cursor-pointer"
                  >
                     Envoyer
                  </motion.button>
               </div>
            </form>
         </section>
      </>
   );
};

export default Contact;
