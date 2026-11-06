import { useEffect, useRef } from "react";
import { afterPaint } from "../utils/afterPaint";

// Paysage de points : une nappe vue en perspective, au fond du bandeau marine du haut de chaque page,
// bleu acier au loin et rouge au premier plan, avec des reflets presque blancs sur les crêtes les plus proches.
// Les points proches, en bas, sont gros et vifs ; les lointains se resserrent et s'éteignent vers l'horizon.
// Des houles roulent vers le visiteur, le défilement fait avancer sur la nappe, la souris déplace
// légèrement le point de vue (les rangées proches bougent plus que les lointaines : la profondeur se lit).

const COLOR_STEPS = 10;
const ALPHA_STEPS = 8;
const HIGHLIGHT = COLOR_STEPS; // palier supplémentaire : reflet presque blanc
const DEPTH = 14; // la rangée la plus lointaine est 14 fois plus loin que la plus proche
const REVEAL = 2.2; // la nappe se déroule de l'horizon vers le visiteur (s)

const rgba = (rgb, alpha) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha.toFixed(3)})`;
const toWhite = (rgb, k) => rgb.map((v) => Math.round(v + (255 - v) * k));

// Couleurs de la charte lues dans index.css (@theme) : le canvas normalise la valeur en #rrggbb.
const readColor = (el, name) => {
   const probe = document.createElement("canvas").getContext("2d");
   probe.fillStyle = getComputedStyle(el).getPropertyValue(name).trim() || "#ffffff";
   const hex = probe.fillStyle;
   return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
};

// Couleurs pré-calculées par paliers, du lointain (dim) au proche (signal) : un seul fillStyle par paquet de points.
// Elles sont éclaircies de 20 % : en petits points sur le marine, les couleurs de marque pures s'éteignent.
const buildStyles = (from, to) => [
   ...Array.from({ length: COLOR_STEPS }, (_, c) => {
      const m = c / (COLOR_STEPS - 1);
      const rgb = toWhite(
         from.map((v, k) => v + (to[k] - v) * m),
         0.2,
      );
      return Array.from({ length: ALPHA_STEPS }, (_, i) => rgba(rgb, 0.05 + ((i + 1) / ALPHA_STEPS) ** 1.4 * 0.95));
   }),
   Array.from({ length: ALPHA_STEPS }, (_, i) => rgba(toWhite(to, 0.8), 0.25 + ((i + 1) / ALPHA_STEPS) * 0.6)),
];

const easeOutExpo = (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
const smooth = (e0, e1, x) => {
   const k = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
   return k * k * (3 - 2 * k);
};

const ParticleField = ({ className = "" }) => {
   const canvasRef = useRef(null);

   useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      // Au doigt (ou sans animations), le paysage est dessiné une seule fois : aucun calcul par image sur téléphone.
      // Il y respire doucement par une animation CSS du compositeur (.terrain-drift), qui ne coûte rien au processeur.
      const still = reduce || !finePointer;
      if (!finePointer && !reduce) canvas.classList.add("terrain-drift");
      const styles = buildStyles(readColor(canvas, "--color-dim"), readColor(canvas, "--color-signal"));
      const buckets = Array.from({ length: (COLOR_STEPS + 1) * ALPHA_STEPS }, () => []);

      let width = 0;
      let height = 0;
      let horizon = 0; // ordonnée de l'horizon à l'écran
      let reach = 0; // distance écran entre l'horizon et la rangée la plus proche
      let gap = 56; // écart entre deux colonnes proches (px)
      let gain = 1; // intensité générale, baissée sur petit écran où le texte couvre toute la largeur
      let depthStep = 1.05; // rapport de profondeur entre deux rangées voisines
      let rows = 0;
      let raf = 0;
      let running = false;
      let start = -1;
      let lastScroll = window.scrollY;
      let energy = 0;
      let ready = false;
      let onScreen = true;
      // Sur écran tactile, rangées et colonnes un peu plus espacées : un tiers de points en moins à calculer.
      const rowGap = finePointer ? 30 : 36;
      const minGap = finePointer ? 9 : 12;
      const view = { x: 0, y: 0, tx: 0, ty: 0 };
      const pointer = { x: -9999, y: -9999, inside: false, power: 0 };

      const draw = (time) => {
         const t = still ? 30 : time / 1000;
         if (start < 0) start = t;
         const reveal = still ? 1 : easeOutExpo(Math.min(1, (t - start) / REVEAL));

         // Défilement : on avance sur la nappe, et les houles se creusent un instant quand on défile vite.
         const scroll = window.scrollY;
         energy += (Math.min(1, Math.abs(scroll - lastScroll) / 30) - energy) * 0.06;
         lastScroll = scroll;
         const travel = still ? 0 : scroll * 0.012 + t * 0.4; // en rangées
         // Le paysage s'affiche pleinement au premier écran, puis se calme derrière le contenu.
         const calm = 1 - 0.45 * smooth(0, height * 0.8, scroll);

         // Point de vue : il suit doucement la souris.
         if (!still) {
            view.x += (view.tx - view.x) * 0.04;
            view.y += (view.ty - view.y) * 0.04;
         }
         pointer.power += ((pointer.inside ? 1 : 0) - pointer.power) * 0.05;
         const cx = width / 2;
         const hz = horizon + view.y * 14;
         const camX = view.x * 1.1;
         const amp = (1 + energy * 0.8) * reveal;

         ctx.clearRect(0, 0, width, height);
         for (const b of buckets) b.length = 0;

         // Les rangées s'éloignent en progression géométrique : leur écart à l'écran se resserre vers l'horizon.
         // Avancer, c'est faire glisser toutes les rangées d'un cran vers le premier plan.
         const phase = travel % 1;
         const first = Math.floor(travel);
         const logDepth = Math.log(DEPTH);
         const lit = pointer.power > 0.01 ? 110 : 0;

         for (let r = 0; r < rows; r++) {
            const z = depthStep ** (r - phase); // profondeur à l'écran : 1 au premier plan
            if (z < 0.94) continue;
            const u = Math.min(1, Math.log(z) / logDepth); // 0 au premier plan, 1 à l'horizon
            // La nappe se déroule de l'horizon vers le visiteur.
            const shown = smooth(1 - reveal * 1.15, 1.05 - reveal * 1.15, 1 - u);
            if (shown <= 0) continue;
            const fog = (1 - u) ** 0.7 * shown;
            const zw = (first + r) * 0.11; // profondeur « monde » : les houles restent attachées à la nappe
            // Au loin, une colonne sur deux (puis sur quatre) suffit : l'écart à l'écran reste d'au moins 9 px (12 au doigt).
            let step = 1;
            while ((gap * step) / z < minGap) step *= 2;
            const half = Math.ceil(((width / 2) * z) / gap) + 2;
            const k0 = Math.floor(camX);
            const kStart = Math.floor((k0 - half) / step) * step;

            for (let k = kStart; k <= k0 + half; k += step) {
               // Trois houles qui se croisent et roulent vers le visiteur.
               const h =
                  Math.sin(k * 0.42 + t * 0.5) * 0.45 +
                  Math.sin(zw * 2.3 + t * 0.85 + k * 0.08) * 0.4 +
                  Math.sin((k * 0.25 + zw * 1.6) * 1.3 + t * 0.32) * 0.3;
               const crest = smooth(0.2, 1, h);
               const x = cx + ((k - camX) * gap) / z;
               const y = hz + (reach - h * 26 * amp) / z;
               if (x < -10 || x > width + 10 || y > height + 10) continue;

               // Toute la nappe reste lisible (c'est elle qui dessine la perspective) ; les crêtes s'allument par-dessus.
               let light = fog * (0.5 + crest * 0.5 + energy * 0.1) * calm * gain;
               // Sous la souris, une lueur douce : pas d'écart, pas de blanc.
               if (lit) {
                  const dx = x - pointer.x;
                  const dy = y - pointer.y;
                  const d2 = dx * dx + dy * dy;
                  if (d2 < lit * lit) light += (1 - Math.sqrt(d2) / lit) ** 2 * 0.22 * pointer.power * fog;
               }
               if (light < 0.03) continue;
               const size = Math.max(1, (3.4 / z) * (0.8 + crest * 0.5));
               const hot = crest > 0.93 && u < 0.25;
               const m = Math.min(1, Math.max(0, crest * 0.75 + (1 - u) * 0.3 - 0.05));
               const ci = hot ? HIGHLIGHT : Math.round(m * (COLOR_STEPS - 1));
               const ai = Math.min(ALPHA_STEPS - 1, Math.floor(light * ALPHA_STEPS));
               buckets[ci * ALPHA_STEPS + ai].push(x - size / 2, y - size / 2, size);
            }
         }

         for (let c = 0; c <= COLOR_STEPS; c++) {
            for (let a = 0; a < ALPHA_STEPS; a++) {
               const list = buckets[c * ALPHA_STEPS + a];
               if (!list.length) continue;
               ctx.fillStyle = styles[c][a];
               for (let j = 0; j < list.length; j += 3) ctx.fillRect(list[j], list[j + 1], list[j + 2], list[j + 2]);
            }
         }
      };

      const loop = (time) => {
         raf = requestAnimationFrame(loop);
         draw(time);
      };

      const startLoop = () => {
         if (!ready || !onScreen || still || running || document.hidden) return;
         running = true;
         raf = requestAnimationFrame(loop);
      };

      const stopLoop = () => {
         running = false;
         cancelAnimationFrame(raf);
      };

      const resize = () => {
         const rect = canvas.getBoundingClientRect();
         // Au doigt, résolution standard : des points carrés n'y perdent rien et chaque image coûte deux fois moins.
         const dpr = Math.min(window.devicePixelRatio || 1, finePointer ? 2 : 1);
         width = rect.width;
         height = rect.height;
         canvas.width = Math.max(1, Math.round(width * dpr));
         canvas.height = Math.max(1, Math.round(height * dpr));
         ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
         const narrow = width < 640;
         horizon = height * (narrow ? 0.34 : 0.3);
         reach = height * 1.06 - horizon;
         gap = narrow ? 40 : 56;
         gain = narrow ? 0.6 : 1;
         // Rangées proches espacées d'environ 30 px à l'écran (36 au doigt).
         depthStep = 1 / (1 - rowGap / reach);
         rows = Math.ceil(Math.log(DEPTH) / Math.log(depthStep)) + 2;
         if (ready && !running) draw(performance.now());
      };

      const onPointer = (e) => {
         view.tx = (e.clientX / window.innerWidth - 0.5) * 2;
         view.ty = (e.clientY / window.innerHeight - 0.5) * 2;
         // Le canvas défile avec le bandeau : la position du pointeur est ramenée à son coin haut gauche.
         const box = canvas.getBoundingClientRect();
         pointer.x = e.clientX - box.left;
         pointer.y = e.clientY - box.top;
         pointer.inside = true;
      };
      const onPointerOut = () => {
         pointer.inside = false;
         view.tx = 0;
         view.ty = 0;
      };
      const onVisibility = () => (document.hidden ? stopLoop() : startLoop());

      const ro = new ResizeObserver(resize);
      ro.observe(canvas);
      // Hors de l'écran (bandeau dépassé), le paysage s'arrête.
      const io = new IntersectionObserver(([entry]) => {
         onScreen = entry.isIntersecting;
         if (onScreen) startLoop();
         else stopLoop();
      });
      io.observe(canvas);
      document.addEventListener("visibilitychange", onVisibility);
      if (finePointer && !reduce) {
         window.addEventListener("pointermove", onPointer, { passive: true });
         document.documentElement.addEventListener("pointerleave", onPointerOut);
      }
      resize();
      // Le paysage se déroule une fois la page affichée et le navigateur au repos : il ne retarde jamais le premier écran.
      const cancelStart = afterPaint(() => {
         ready = true;
         start = -1;
         if (still) draw(performance.now());
         else startLoop();
      });

      return () => {
         cancelStart();
         stopLoop();
         ro.disconnect();
         io.disconnect();
         document.removeEventListener("visibilitychange", onVisibility);
         window.removeEventListener("pointermove", onPointer);
         document.documentElement.removeEventListener("pointerleave", onPointerOut);
      };
   }, []);

   return (
      <>
         {/* Lueur rasante sur l'horizon : un dégradé CSS fixe plutôt qu'un dessin refait à chaque image. */}
         <div aria-hidden="true" className="terrain-glow pointer-events-none absolute inset-0" />
         <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 block h-full w-full ${className}`} />
      </>
   );
};

export default ParticleField;
