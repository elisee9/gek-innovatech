// Images ajoutées depuis le tableau de bord. Leur nom ne change jamais de contenu : elles sont gardées un an.
import { getFile } from "../lib/store.mjs";

export default async (req) => {
   const key = new URL(req.url).pathname.slice("/media/".length);
   const found = /^[\w-]+\.(webp|jpg|png)$/.test(key) ? await getFile(key).catch(() => null) : null;
   if (!found) return new Response("Image introuvable", { status: 404 });
   return new Response(found.data, {
      headers: {
         "content-type": found.meta?.type || "image/webp",
         "cache-control": "public, max-age=31536000, immutable",
         "netlify-cdn-cache-control": "public, durable, max-age=31536000, immutable",
         "x-content-type-options": "nosniff",
      },
   });
};

export const config = { path: "/media/*" };
