import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async"; // Assurez-vous d'avoir installé react-helmet

// La fonction qui permet de défiler vers le haut de la page
import { handleLinkClick } from "../utils/scrollUtils"; // Assurez-vous que cette fonction est définie dans utils/scrollUtils.js

const About = () => {
   return (
      <>
         <Helmet>
            <title>À propos de GEK INNOVATECH</title>
            <meta
               name="description"
               content="Découvrez l’histoire, la mission et les valeurs de GEK INNOVATECH, votre partenaire digital de confiance."
            />
            <meta
               name="keywords"
               content="GEK INNOVATECH, histoire, mission, agence web, Bénin, équipe"
            />
            <meta name="author" content="GEK INNOVATECH" />
            <meta property="og:title" content="À propos | GEK INNOVATECH" />
            <meta
               property="og:description"
               content="Apprenez-en plus sur notre équipe et notre vision."
            />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://gekinnova.com/a-propos" />
            <meta
               property="og:image"
               content="https://gekinnova.com/images/og-about.jpg"
            />
         </Helmet>

         <section className="relative min-h-screen flex items-center justify-center text-white px-4  pt-28 z-10">
            <motion.div
               initial={{ opacity: 0, y: 40 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1 }}
               className="text-center max-w-3xl z-10"
            >
               <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  À propos de{" "}
                  <span className="text-[#005BFF]">GEK INNOVATECH</span>
               </h1>
               <p className="text-lg md:text-xl text-gray-300 leading-relaxed space-y-4 text-justify">
                  Nous sommes une équipe passionnée par le{" "}
                  <strong>design</strong>, la <strong>performance</strong> et l’
                  <strong>innovation</strong>.
                  <br />
                  Notre mission est de transformer vos idées en{" "}
                  <strong>solutions web élégantes, rapides et efficaces</strong>
                  , parfaitement alignées avec vos objectifs.
                  <br />
                  Chez{" "}
                  <span className="text-[#00D2A8] font-semibold">
                     GEK INNOVATECH
                  </span>
                  , chaque projet est une opportunité de sublimer votre image en
                  ligne, de renforcer votre présence digitale et de captiver
                  votre audience.
                  <br />
                  Grâce à une approche centrée sur l’expérience utilisateur et
                  aux technologies les plus récentes, nous concevons des
                  interfaces intuitives, des animations fluides et une
                  performance sans compromis.
                  <br />
                  <em className="text-white/80 block mt-4">
                     Votre succès en ligne commence ici.
                  </em>
               </p>

               {/* Call-to-Action */}
               <NavLink
                  to="/services"
                  className="inline-block mt-10 px-8 py-3 mb-3 text-lg font-semibold bg-[#005BFF] hover:bg-[#0044cc] transition-colors duration-300 rounded-2xl shadow-xl cursor-pointer hover:shadow-[#0044cc]/40"
                  onClick={handleLinkClick}
               >
                  Découvrir nos services
               </NavLink>
            </motion.div>
         </section>
      </>
   );
};

export default About;

// Ce code définit une section "À propos" pour le site web de GEK INNOVATECH.
// Il utilise la bibliothèque Framer Motion pour animer l'apparition du texte.
