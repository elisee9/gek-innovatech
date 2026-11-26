import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { ago, dateTime, plural } from "../lib/format";
import { useAdmin } from "../lib/store";
import { Button, Confirm, Empty, PageHead, Skeleton } from "../ui";

const Chats = () => {
   const { run, content } = useAdmin();
   const [list, setList] = useState(null);
   const [open, setOpen] = useState(null);
   const [confirm, setConfirm] = useState(false);

   useEffect(() => {
      run(async () => setList(await api.get("conversations")));
   }, [run]);

   const current = list?.find((chat) => chat.key === open) || list?.[0];
   const question = (chat) => chat.messages.find((message) => message.role === "user")?.content || "";

   return (
      <>
         <PageHead title="Chat du site" text="Les questions posées à l'assistant par les visiteurs, gardées 90 jours. Elles montrent ce que le site n'explique pas encore assez.">
            <Button to="/admin/reglages?onglet=assistant">Régler l&apos;assistant</Button>
         </PageHead>
         {!list ? (
            <div className="space-y-3" aria-busy="true">
               <Skeleton className="h-16" />
               <Skeleton className="h-16" />
               <Skeleton className="h-16" />
            </div>
         ) : !list.length ? (
            <Empty title="Aucune conversation pour le moment" text={content.features.chat ? "Les échanges des visiteurs avec l'assistant apparaîtront ici." : "L'assistant est éteint sur le site (Réglages > Assistant)."} />
         ) : (
            <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
               <ul className="overflow-hidden rounded-[20px] border border-line bg-ink-2 lg:max-h-[70vh] lg:overflow-y-auto">
                  {list.map((chat) => (
                     <li key={chat.key} className="border-t border-line first:border-t-0">
                        <button type="button" aria-pressed={chat.key === current?.key} onClick={() => setOpen(chat.key)} className={`block w-full px-5 py-3.5 text-left transition-colors ${chat.key === current?.key ? "bg-ink-3" : "hover:bg-ink-3/60"}`}>
                           <span className="line-clamp-2 text-[15px] font-medium leading-snug">{question(chat)}</span>
                           <span className="mt-1 block text-[13px] text-subtle">
                              {ago(chat.at)} · {plural(chat.messages.length, "message")}
                              {chat.lang === "en" ? " · anglais" : ""}
                           </span>
                        </button>
                     </li>
                  ))}
               </ul>
               {current && (
                  <section aria-label="Conversation" className="rounded-[20px] border border-line bg-ink-2 p-5">
                     <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="text-[14px] text-muted">{dateTime(current.startedAt)}</p>
                        <Button size="sm" variant="danger" icon={Trash2} onClick={() => setConfirm(true)}>
                           Supprimer
                        </Button>
                     </div>
                     <div className="space-y-3">
                        {current.messages.map((message, i) => (
                           <div key={i} className={`flex ${message.role === "user" ? "justify-start" : "justify-end"}`}>
                              <p className={`max-w-[86%] whitespace-pre-wrap break-words rounded-[18px] px-4 py-2.5 text-[15px] leading-relaxed ${message.role === "user" ? "rounded-bl-md border border-line bg-ink-3" : "rounded-br-md bg-brand text-ink-2"}`}>{message.content}</p>
                           </div>
                        ))}
                     </div>
                  </section>
               )}
            </div>
         )}
         <Confirm
            open={confirm}
            onClose={() => setConfirm(false)}
            title="Supprimer cette conversation ?"
            text="Elle est effacée définitivement."
            action="Supprimer"
            onConfirm={async () => {
               if (await run(() => api.del(`conversations/${current.key.replace("chats/", "")}`), "Conversation supprimée.")) {
                  setList((items) => items.filter((chat) => chat.key !== current.key));
                  setConfirm(false);
               }
            }}
         />
      </>
   );
};

export default Chats;
