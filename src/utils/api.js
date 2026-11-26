// Appels du site public vers ses fonctions. Une erreur porte le message du serveur et son code.
const call = async (url, options) => {
   const response = await fetch(url, { signal: AbortSignal.timeout(25_000), ...options });
   const data = await response.json().catch(() => ({}));
   if (!response.ok) throw Object.assign(new Error(data.error || "API"), { status: response.status });
   return data;
};

export const getJson = (url) => call(url);

export const postJson = (url, body) =>
   call(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
