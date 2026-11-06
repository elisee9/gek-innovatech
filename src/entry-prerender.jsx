import { Writable } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from "react-router-dom";
import "./i18n/i18n";
import { routes } from "./routes/AppRoutes";

const handler = createStaticHandler(routes);

// Rend une page à la compilation (voir scripts/prerender.mjs), avec les vrais composants :
// son texte et ses balises SEO viennent de la même source que le site.
export const prerender = async (path) => {
   const context = await handler.query(new Request(`https://gek-innovatech.netlify.app${path}`));
   const router = createStaticRouter(handler.dataRoutes, context);
   const helmetContext = {};

   const body = await new Promise((resolve, reject) => {
      let html = "";
      const sink = new Writable({
         write(chunk, _encoding, done) {
            html += chunk;
            done();
         },
      });
      sink.on("finish", () => resolve(html));
      const { pipe } = renderToPipeableStream(
         <HelmetProvider context={helmetContext}>
            <StaticRouterProvider router={router} context={context} hydrate={false} />
         </HelmetProvider>,
         { onAllReady: () => pipe(sink), onShellError: reject, onError: reject },
      );
   });

   const { title, meta, link, script } = helmetContext.helmet;
   return { body, head: [title, meta, link, script].map((tag) => tag.toString()).join("\n      ") };
};
