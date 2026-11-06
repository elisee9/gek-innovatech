# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Small business owners and organisations in Africa (Bénin first) and in the African diaspora in Europe (France, Belgium): shopkeepers, beauty salons, restaurants, coaches, photographers, NGOs. They want a professional website quickly, at a fixed and affordable price, without technical knowledge. Many browse on mobile, often on mobile data.

## Product Purpose

GEK INNOVATECH is a web agency that designs and delivers websites as fixed-price packages (Starter, Pro, Premium), plus related services (mobile apps, SEO, hosting, maintenance, UI/UX, marketing, web security). This site is the agency's own storefront: it must convince a visitor to start a conversation. Success means a qualified visitor writes on WhatsApp.

## Positioning

Fixed, published prices and stated delivery times (1 week for Starter, 2 to 3 weeks for Pro, 3 weeks to 1 month or more for Premium, launch included), with a direct human contact on WhatsApp, for clients on both sides: Africa and the European diaspora.

## Operating Context

- Primary conversion: WhatsApp (+229 01 65 42 65 10, wa.me/2290165426510). Secondary: contact form (EmailJS) and phone call.
- An AI assistant (Netlify function → Google Gemini) answers questions about services, prices and delivery times.
- Bilingual site, French (default) and English, via i18next.
- Hosted on Netlify, auto-deployed on push to `main`.
- Online payment (FedaPay, XOF) exists in code but is not active; orders go through contact.

## Capabilities and Constraints

- Stack: Vite + React 18 + Tailwind CSS v4 + Framer Motion + React Router 7 + react-helmet-async.
- Prices are displayed in euros (€). Plans: Starter €89, Pro €189 (recommended), Premium €349. No struck-through former prices: the owner removed them (2026-11-05). Plan prices live in `src/data/plans.js` and are repeated in the chatbot prompt (`netlify/functions/chat.js`); both must change together.
- Contact email: gekinnovatech@gmail.com (the domain gekinnovatech.com does not exist).
- Audience on mobile data: the site must stay light (no heavy background video).

## Brand Commitments

- Name: GEK INNOVATECH. Logo: diamond-ring mark with stacked "GEK / INNOVATECH" wordmark (`src/components/Logo.jsx`, `public/logo.svg`).
- Brand colours (since 2026-11-04, owner's choice after a light template they liked): navy, red and white on a light base. Navy #1D467B for the brand and for text (owner's request; black is allowed only on specific text that truly needs it), on a pale ground (#F4F6FA) with white cards; deep navy #00182F to #1D467B for the band that opens every page, with breadcrumbs on all pages except home; red #D42A1C for the WhatsApp buttons (white text) and #CC2219 for small marks. This replaces the dark palettes tried before it: red / black / white and blue #005BFF / red (2026-11-03), ember red / orange (2026-10-29) and, originally, blue #005BFF and turquoise #00D2A8.
- Voice: professional, warm, concise; tutoiement is not used on the site (vouvoiement).

## Evidence on Hand

- One live demo site: https://gek-beaute-elegance.netlify.app (Pro plan example), shown through real screenshots in `public/images/portfolio/beaute-elegance-*.webp`, in the home hero and in the Réalisations section. The owner will host another site for the hero (announced 2026-11-03): link, name, description, plan and whether it is a client site or a demo still to be supplied.
- Five other site types are offered (restaurant, coaching, e-commerce, photographer, NGO) but have no live site yet: they are listed without imagery until real screenshots exist. The former stock photos were removed in the October 2026 redesign (still in git history).
- Real figures and real client testimonials exist but have not been provided yet (owner will supply them). Until then, no figure or testimonial may be displayed; the stats and testimonials sections stay hidden when their data files are empty.
- No client logos, press, or awards on hand. Do not fabricate any.

## Product Principles

1. Every claim on the page is verifiable: published prices, delivery times, a live demo, a direct contact.
2. WhatsApp is the shortest path to a conversation; every section leads there.
3. Light and fast on a phone on mobile data, because the clients are.
4. Same experience in French and English; no hard-coded single-language text.

## Accessibility & Inclusion

Mobile-first. Readable contrast on the light base and in the navy band. Text must stay selectable (phone number, email). Respect reduced-motion preferences.
