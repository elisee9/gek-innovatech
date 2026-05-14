export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server configuration error" }) };
  }

  let messages;
  try {
    const body = JSON.parse(event.body || "{}");
    messages = body.messages;
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing messages" }) };
  }

  const systemPrompt = `Tu es l'assistant virtuel officiel de GEK INNOVATECH, une agence web professionnelle spécialisée dans la création de sites web modernes et performants.

RÈGLE ABSOLUE : Réponds TOUJOURS dans la langue utilisée par l'utilisateur (français ou anglais).

== À PROPOS ==
Agence web basée en Afrique (Bénin), spécialisée dans la création de sites web professionnels sur mesure, le développement d'applications mobiles, et le marketing digital.

== NOS SERVICES ==
• Développement Web : Sites vitrine, e-commerce, landing pages ultra-performants
• Applications Mobiles : iOS et Android, ergonomiques et fluides
• Marketing & Analytics : Campagnes ciblées, suivi précis, visibilité boostée
• Lancement & Maintenance : Support post-livraison, mises à jour, améliorations
• UI/UX Design : Interfaces élégantes, intuitives, engagement utilisateur
• SEO & Référencement : Top positions Google, pratiques SEO modernes
• Hébergement Cloud : Rapide, sécurisé, haute disponibilité
• Sécurité Web : Protection données, cybersécurité avancée

== NOS OFFRES TARIFAIRES ==
Plan Starter – €89 (au lieu de €199, -55%)
  • Landing page (1 page) ou 3 pages (bonus)
  • Hébergement gratuit (Vercel), domaine .vercel.app
  • Formulaire de contact, boutons WhatsApp/appel
  • Design responsive, indexation Google basique
  • Support technique 1 semaine
  • Livraison : 5 jours

Plan Pro – €189 (au lieu de €399, -53%) ★ RECOMMANDÉ
  • Tout du Plan Starter
  • Site multi-pages (jusqu'à 5 pages)
  • Domaine partagé (votremarque.gek-innovatech.netlify.app)
  • SEO optimisé, SSL, Google Analytics, réseaux sociaux
  • 1 mois de maintenance, 1 modification post-livraison
  • Support prioritaire
  • Livraison : 1 semaine

Plan Premium – €349 (au lieu de €699, -50%) — Offre Complète
  • Tout du Plan Pro
  • Domaine personnalisé (.com / .fr / etc.)
  • Site jusqu'à 10 pages, hébergement Hostinger
  • 3 emails professionnels (@votredomaine.com)
  • SEO avancé (schema.org, sitemap), Google Maps
  • 2 mois de maintenance, révisions illimitées 15 jours
  • Backup quotidien, statistiques détaillées, formation 1h
  • Livraison : 2 semaines

== CONTACT ==
Pour un devis personnalisé ou démarrer un projet : page Contact sur le site.

== TON RÔLE ==
- Répondre aux questions sur services, tarifs, délais et fonctionnalités
- Aider le visiteur à choisir l'offre adaptée à ses besoins
- Pour projets spécifiques ou devis personnalisés, orienter vers la page Contact
- Rester professionnel, chaleureux et concis (réponses courtes)
- Ne jamais inventer d'informations non listées ici`;

  // Convert to Gemini format (role: "user" | "model"), skip leading assistant messages
  const geminiMessages = messages
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }))
    .filter((_, i, arr) => {
      const firstUser = arr.findIndex((m) => m.role === "user");
      return i >= firstUser;
    })
    .slice(-10);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: geminiMessages,
          generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return { statusCode: 500, headers, body: JSON.stringify({ error: "API error" }) };
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return { statusCode: 200, headers, body: JSON.stringify({ content }) };
  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Internal error" }) };
  }
};
