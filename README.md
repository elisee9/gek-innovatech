
# 🚀 GEK INNOVATECH - Site Officiel

Bienvenue sur le dépôt du site officiel **GEK INNOVATECH**, une startup spécialisée dans la création de solutions numériques modernes et innovantes.

---

## 🌐 Aperçu

GEK INNOVATECH propose des services professionnels dans le développement web, le design et la transformation digitale.  
Ce site vitrine a été conçu pour refléter l’identité visuelle de l’entreprise et offrir une expérience fluide, moderne et responsive à nos visiteurs.

---

## 🛠️ Technologies utilisées

- ⚡ [Vite](https://vitejs.dev/) - Outil de build rapide
- ⚛️ [React](https://reactjs.org/) - Librairie JavaScript pour l’interface
- 🎨 [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitaire
- ✨ [Framer Motion](https://www.framer.com/motion/) - Animations fluides
- 🔗 [React Router](https://reactrouter.com/) - Système de navigation
- 📧 [EmailJS](https://www.emailjs.com/) - Gestion de formulaire de contact
- 🌍 [Netlify](https://www.netlify.com/) - Déploiement & hébergement

---

## 📂 Structure du projet

```

src/
├── components/     # Composants réutilisables (Header, Footer, Pill, HeroSphere, ContactForm, ChatBot…)
├── data/           # Contenus fixes : offres et prix, réalisations, coordonnées, chiffres et avis
├── hooks/          # Hooks React (réalisations traduites)
├── i18n/           # Traductions FR / EN
├── layouts/        # Layout principal (MainLayout)
├── pages/          # Pages (Home, About, Services, Plans, Portfolio, Contact, mentions…)
├── routes/         # Routing centralisé
├── sections/       # Sections de page (Hero, Services, Offres, Réalisations, Contact…)
├── utils/          # Fonctions utilitaires (prix, paiement)
├── App.jsx         # Entrée principale de l'application
└── main.jsx        # Point d'entrée React
netlify/functions/  # Fonction serveur du chatbot (Google Gemini)
```

### Modifier les contenus courants

- **Prix des offres** : `src/data/plans.js`, et le même prix dans le prompt de `netlify/functions/chat.js`.
- **Textes** : `src/i18n/locales/fr/translation.json` et `src/i18n/locales/en/translation.json`.
- **Téléphone, WhatsApp, email** : `src/data/contact.js`.
- **Chiffres clés et avis clients** : `src/data/stats.js` et `src/data/testimonials.js`. La section n'apparaît que lorsqu'ils contiennent de vraies données.
- **Modèle du chatbot** : variable `GEMINI_MODEL` dans Netlify (facultative, `gemini-3.5-flash-lite` par défaut) ; la clé reste `GEMINI_API_KEY`.

---

## ⚙️ Installation et utilisation

### 1️⃣ Cloner le dépôt
```bash
git clone https://github.com/elisee9/gek-innovatech.git
cd gek-innovatech
```

### 2️⃣ Installer les dépendances

```bash
npm install
```

### 3️⃣ Lancer le projet en local

```bash
npm run dev
```

➡️ Ouvre [http://localhost:5173](http://localhost:5173) dans ton navigateur.

### 4️⃣ Build pour la production

```bash
npm run build
```

---

## 🚀 Déploiement

Le projet est déployé sur **Netlify**.
À chaque **push sur la branche `main`**, le site est automatiquement mis à jour en ligne.

---

## 📌 Fonctionnalités principales

* ✅ Design sombre et responsive, police Barlow auto-hébergée
* ✅ Sphère de particules animée en canvas (légère, immobile si l'utilisateur réduit les animations)
* ✅ WhatsApp comme action principale, avec message prérempli selon l'offre choisie
* ✅ Formulaire de demande de devis (EmailJS) sur l'accueil et les pages principales
* ✅ Assistant virtuel IA (fonction Netlify + Google Gemini)
* ✅ Site bilingue français / anglais
* ✅ Optimisation SEO avec react-helmet-async, bannière cookies pour Google Analytics

---

## 📞 Contact

* 🌍 Site web : [GEK INNOVATECH](https://gek-innovatech.netlify.app)
* 📧 Email : [gekinnovatech@gmail.com](mailto:gekinnovatech@gmail.com)
* 📱 WhatsApp : [+229 01 65 42 65 10](https://wa.me/2290165426510)

---

## ⚖️ Licence

© Septembre 2025 **GEK INNOVATECH**. Tous droits réservés.

