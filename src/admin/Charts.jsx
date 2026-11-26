import { useState } from "react";
import { Link } from "react-router-dom";

// Échelle à pas ronds : 0, puis trois ou quatre graduations entières.
const scale = (max) => {
   const step = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000].find((s) => max / s <= 4) || Math.ceil(max / 4);
   const top = Math.max(step, Math.ceil(max / step) * step);
   return { top, ticks: Array.from({ length: top / step + 1 }, (_, i) => i * step) };
};

const word = (n, [one, many]) => `${n} ${n > 1 ? many : one}`;

// Colonnes d'une seule série : une couleur, la valeur au survol ou au clavier, et le tableau pour lire tous les chiffres.
export const Columns = ({ data, unit }) => {
   const [active, setActive] = useState(null);
   const { top, ticks } = scale(Math.max(...data.map((item) => item.value), 1));
   const shown = active === null ? null : data[active];
   return (
      <figure>
         <div className="relative h-[200px] pl-8" onPointerLeave={() => setActive(null)}>
            {ticks.map((tick) => (
               <div key={tick} aria-hidden="true" className="absolute inset-x-0 flex items-center" style={{ bottom: `${(tick / top) * 100}%`, transform: "translateY(50%)" }}>
                  <span className="tabular w-8 flex-none pr-2 text-right text-[12px] text-subtle">{tick}</span>
                  <span className="h-px flex-1 bg-line" />
               </div>
            ))}
            <div className="relative flex h-full items-end">
               {data.map((item, i) => (
                  <button
                     key={item.name}
                     type="button"
                     onPointerEnter={() => setActive(i)}
                     onFocus={() => setActive(i)}
                     onBlur={() => setActive(null)}
                     aria-label={`${item.name} : ${word(item.value, unit)}`}
                     className="group flex h-full min-w-0 flex-1 cursor-default items-end justify-center rounded-md focus-visible:outline-offset-0"
                  >
                     <span
                        className={`block w-[calc(100%-4px)] max-w-[24px] rounded-t-[4px] transition-colors duration-150 ${i === active ? "bg-info" : "bg-brand"}`}
                        style={{ height: `${(item.value / top) * 100}%`, minHeight: item.value ? 3 : 0 }}
                     />
                  </button>
               ))}
            </div>
            {shown && (
               <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-xl border border-line bg-ink-2 px-3 py-2 text-[13px] shadow-float"
                  style={{ left: `clamp(84px, calc(32px + (100% - 32px) * ${(active + 0.5) / data.length}), calc(100% - 84px))` }}
               >
                  <strong className="block text-[15px] font-semibold">{word(shown.value, unit)}</strong>
                  <span className="text-muted">{shown.name}</span>
               </div>
            )}
         </div>
         <div aria-hidden="true" className="mt-2 flex pl-8 text-[12px] text-subtle">
            {data.map((item, i) => (
               <span key={item.name} className="min-w-0 flex-1 text-center">
                  {/* Une date sur trois : les étiquettes ne se touchent pas. */}
                  {i % 3 === 0 && <span className="whitespace-nowrap">{item.label}</span>}
               </span>
            ))}
         </div>
         <details className="mt-4 text-[14px]">
            <summary className="cursor-pointer text-muted hover:text-fg">Voir les chiffres</summary>
            <table className="tabular mt-2 w-full">
               <tbody>
                  {data.map((item) => (
                     <tr key={item.name} className="border-t border-line">
                        <th scope="row" className="py-1.5 text-left font-normal text-muted">
                           {item.name}
                        </th>
                        <td className="py-1.5 text-right">{item.value}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </details>
      </figure>
   );
};

// Barres horizontales : la valeur est écrite au bout de chacune.
export const Bars = ({ data, empty }) => {
   const max = Math.max(...data.map((item) => item.value), 1);
   if (!data.some((item) => item.value)) return <p className="text-[15px] text-muted">{empty}</p>;
   return (
      <ul className="space-y-3">
         {data.map((item) => {
            const inner = (
               <>
                  <span className="flex items-baseline justify-between gap-3 text-[14px]">
                     <span className="truncate text-muted">{item.label}</span>
                     <span className="tabular font-medium">{item.value}</span>
                  </span>
                  <span aria-hidden="true" className="mt-1.5 block h-2 rounded-r-[4px] bg-fg/[0.06]">
                     <span className="block h-full rounded-r-[4px] bg-brand" style={{ width: `${(item.value / max) * 100}%` }} />
                  </span>
               </>
            );
            return (
               <li key={item.label}>
                  {item.to ? (
                     <Link to={item.to} className="block rounded-lg transition-opacity hover:opacity-80">
                        {inner}
                     </Link>
                  ) : (
                     inner
                  )}
               </li>
            );
         })}
      </ul>
   );
};
