import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Download, FilePlus2 } from "lucide-react";
import { date, docState, DOC_STATUS, matches, money } from "../lib/format";
import { saveCsv } from "../lib/csv";
import { useAdmin } from "../lib/store";
import { Badge, Button, Empty, PageHead, SearchBox, Tabs } from "../ui";

const total = (list, currency) => list.filter((doc) => doc.currency === currency).reduce((sum, doc) => sum + doc.totals.total - (doc.type === "invoice" && doc.status !== "paid" ? doc.paid || 0 : 0), 0);
const amounts = (list) => [total(list, "XOF") && money(total(list, "XOF"), "XOF"), total(list, "EUR") && money(total(list, "EUR"), "EUR")].filter(Boolean).join(" + ") || money(0);

const Documents = () => {
   const { documents } = useAdmin();
   const navigate = useNavigate();
   const [tab, setTab] = useState("all");
   const [query, setQuery] = useState("");
   const list = documents.filter((doc) => (tab === "all" || doc.type === tab) && matches(query, doc.number, doc.client.name, doc.client.company, doc.subject));
   const year = new Date().getFullYear();
   const quotes = documents.filter((doc) => doc.type === "quote" && doc.status === "sent");
   const unpaid = documents.filter((doc) => doc.type === "invoice" && doc.status === "sent");
   const paid = documents.filter((doc) => doc.type === "invoice" && doc.status === "paid" && doc.date.startsWith(String(year)));

   const exportFile = () =>
      saveCsv(
         "devis-factures-gek.csv",
         ["Type", "Numéro", "Date", "Client", "Objet", "Total", "Devise", "Payé", "Statut"],
         list.map((doc) => [doc.type === "quote" ? "Devis" : "Facture", doc.number, doc.date, doc.client.company || doc.client.name, doc.subject, doc.totals.total, doc.currency, doc.paid || 0, DOC_STATUS[docState(doc)].label]),
      );

   return (
      <>
         <PageHead title="Devis et factures">
            <Button icon={Download} disabled={!list.length} onClick={exportFile}>
               Exporter
            </Button>
            <Button icon={FilePlus2} to="/admin/documents/nouveau?type=facture">
               Nouvelle facture
            </Button>
            <Button variant="primary" icon={FilePlus2} to="/admin/documents/nouveau">
               Nouveau devis
            </Button>
         </PageHead>

         {documents.length > 0 && (
            <dl className="mb-6 grid gap-px overflow-hidden rounded-[20px] border border-line bg-line sm:grid-cols-3">
               {[
                  ["Devis en attente", quotes],
                  ["Factures à encaisser", unpaid],
                  [`Encaissé en ${year}`, paid],
               ].map(([label, items]) => (
                  <div key={label} className="bg-ink-2 px-5 py-4">
                     <dt className="text-[14px] text-muted">{label}</dt>
                     <dd className="mt-1 text-[22px] font-semibold tracking-[-0.015em]">{amounts(items)}</dd>
                  </div>
               ))}
            </dl>
         )}

         <div className="mb-5 flex flex-wrap items-center gap-3">
            <Tabs label="Documents affichés" value={tab} onChange={setTab} items={[["all", "Tous", documents.length], ["quote", "Devis", documents.filter((doc) => doc.type === "quote").length], ["invoice", "Factures", documents.filter((doc) => doc.type === "invoice").length]]} />
            <SearchBox value={query} onChange={setQuery} placeholder="Numéro, client, objet" className="min-w-[220px] flex-1 sm:max-w-[320px]" />
         </div>

         {!documents.length ? (
            <Empty title="Aucun devis pour le moment" text="Créez un devis depuis une demande : l'assistant prépare les lignes d'après vos offres, vous ajustez et vous envoyez le PDF.">
               <Button variant="primary" icon={FilePlus2} to="/admin/documents/nouveau">
                  Créer un devis
               </Button>
            </Empty>
         ) : !list.length ? (
            <Empty title="Aucun document dans cette vue" />
         ) : (
            <div className="overflow-hidden rounded-[20px] border border-line bg-ink-2">
               <table className="w-full text-left text-[15px]">
                  <thead className="hidden text-[13px] text-subtle md:table-header-group">
                     <tr>
                        <th scope="col" className="px-6 py-3 font-medium">Numéro</th>
                        <th scope="col" className="px-4 py-3 font-medium">Client</th>
                        <th scope="col" className="px-4 py-3 font-medium">Date</th>
                        <th scope="col" className="px-4 py-3 font-medium">Statut</th>
                        <th scope="col" className="px-6 py-3 text-right font-medium">Total</th>
                     </tr>
                  </thead>
                  <tbody>
                     {list.map((doc) => {
                        const state = DOC_STATUS[docState(doc)];
                        return (
                           <tr key={doc.id} onClick={() => navigate(`/admin/documents/${doc.id}`)} className="grid cursor-pointer grid-cols-[1fr_auto] gap-x-4 border-t border-line px-5 py-3.5 transition-colors first:border-t-0 hover:bg-ink-3/60 md:table-row md:p-0 md:first:border-t">
                              <td className="md:px-6 md:py-3.5">
                                 <Link to={`/admin/documents/${doc.id}`} onClick={(e) => e.stopPropagation()} className="tabular font-medium hover:underline">
                                    {doc.number || "Brouillon"}
                                 </Link>
                                 <span className="block text-[14px] text-muted">{doc.type === "quote" ? "Devis" : "Facture"}</span>
                              </td>
                              <td className="order-3 md:order-none md:px-4 md:py-3.5">
                                 {doc.client.company || doc.client.name}
                                 {doc.subject && <span className="block text-[14px] text-muted">{doc.subject}</span>}
                              </td>
                              <td className="hidden whitespace-nowrap text-[14px] text-muted md:table-cell md:px-4 md:py-3.5">{date(`${doc.date}T12:00:00Z`)}</td>
                              <td className="order-4 justify-self-end md:order-none md:px-4 md:py-3.5">
                                 <Badge tone={state.tone}>{state.label}</Badge>
                              </td>
                              <td className="tabular whitespace-nowrap text-right font-medium md:px-6 md:py-3.5">{money(doc.totals.total, doc.currency)}</td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         )}
      </>
   );
};

export default Documents;
