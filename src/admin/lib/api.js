// Appels du tableau de bord. Une session expirée prévient l'application, qui redemande la connexion sans perdre la page.
export const SESSION_LOST = "gek:session";

const request = async (method, path, body, options = {}) => {
   let response;
   try {
      response = await fetch(`/api/admin/${path}`, {
         method,
         signal: AbortSignal.timeout(options.timeout || 65_000),
         headers: options.raw ? { "Content-Type": options.raw } : body !== undefined ? { "Content-Type": "application/json" } : {},
         body: options.raw ? body : body !== undefined ? JSON.stringify(body) : undefined,
      });
   } catch {
      throw new Error("Pas de réponse du serveur. Vérifiez la connexion internet et réessayez.");
   }
   const data = (response.headers.get("content-type") || "").includes("json") ? await response.json().catch(() => ({})) : {};
   if (!response.ok) {
      if (response.status === 401 && path !== "connexion") window.dispatchEvent(new Event(SESSION_LOST));
      throw Object.assign(new Error(data.error || "Le serveur a répondu par une erreur. Réessayez dans un instant."), { status: response.status });
   }
   return data;
};

export const api = {
   get: (path) => request("GET", path),
   post: (path, body = {}) => request("POST", path, body),
   put: (path, body) => request("PUT", path, body),
   patch: (path, body) => request("PATCH", path, body),
   del: (path) => request("DELETE", path),
   upload: (path, blob) => request("POST", path, blob, { raw: blob.type }),
   ai: (task, body = {}) => request("POST", "ia", { task, ...body }),
};
