import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import Logo from "./Logo";

const TypingDots = () => (
   <div className="flex justify-start" aria-hidden="true">
      <div className="rounded-2xl rounded-bl-md border border-line bg-ink-3 px-4 py-3">
         <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
               <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-signal"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
               />
            ))}
         </div>
      </div>
   </div>
);

const ChatBot = () => {
   const { t } = useTranslation();
   const [isOpen, setIsOpen] = useState(false);
   // Seulement les échanges réels : le message d'accueil est rendu à part, dans la langue courante.
   const [messages, setMessages] = useState([]);
   const [input, setInput] = useState("");
   const [loading, setLoading] = useState(false);
   const messagesEndRef = useRef(null);
   const textareaRef = useRef(null);

   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
   }, [messages, loading]);

   useEffect(() => {
      if (!isOpen) return undefined;
      const timer = setTimeout(() => textareaRef.current?.focus(), 200);
      const onKey = (e) => e.key === "Escape" && setIsOpen(false);
      window.addEventListener("keydown", onKey);
      return () => {
         clearTimeout(timer);
         window.removeEventListener("keydown", onKey);
      };
   }, [isOpen]);

   const handleTextareaChange = (e) => {
      setInput(e.target.value);
      e.target.style.height = "auto";
      e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
   };

   const sendMessage = async () => {
      const trimmed = input.trim();
      if (!trimmed || loading) return;

      const updatedMessages = [...messages, { role: "user", content: trimmed }];
      setMessages(updatedMessages);
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      setLoading(true);

      try {
         const response = await fetch("/.netlify/functions/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: updatedMessages }),
         });
         if (!response.ok) throw new Error("API error");
         const data = await response.json();
         setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
      } catch {
         setMessages((prev) => [...prev, { role: "assistant", content: t("chatbot.error") }]);
      } finally {
         setLoading(false);
      }
   };

   const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
         e.preventDefault();
         sendMessage();
      }
   };

   return (
      <>
         {/* Couleurs du bandeau (.on-dark), bleu vif et contour blanc : le bouton ressort sur les pages claires
             comme sur le bandeau marine, où un fond marine se fondrait. */}
         <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            aria-expanded={isOpen}
            aria-controls="gek-chat"
            aria-label={isOpen ? t("chatbot.close") : t("chatbot.toggle")}
            title={isOpen ? t("chatbot.close") : t("chatbot.toggle")}
            className="on-dark fixed bottom-5 right-5 z-[60] flex h-16 w-16 items-center justify-center rounded-full border-2 border-fg bg-brand text-fg shadow-chat transition-transform duration-200 hover:scale-105 focus-visible:outline-brand active:scale-95"
         >
            {/* Trois appels à l'arrivée sur la page, jamais pendant une conversation. */}
            {!isOpen && messages.length === 0 && <span aria-hidden="true" className="chat-call absolute inset-0 -z-10 rounded-full bg-brand" />}
            {isOpen ? <X size={26} /> : <MessageCircle size={26} />}
         </button>

         <AnimatePresence>
            {isOpen && (
               <motion.section
                  id="gek-chat"
                  aria-label={t("chatbot.subtitle")}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed bottom-24 right-3 z-[60] flex w-[380px] max-w-[calc(100vw-24px)] origin-bottom-right flex-col overflow-hidden rounded-[24px] border border-line bg-ink-2 shadow-float sm:right-5"
                  style={{ maxHeight: "min(600px, calc(100dvh - 120px))" }}
               >
                  <div className="flex flex-none items-center justify-between gap-3 border-b border-line px-5 py-4">
                     <div className="flex min-w-0 items-center gap-3">
                        <Logo width={92} />
                        <span className="truncate text-[13px] text-subtle">{t("chatbot.subtitle")}</span>
                     </div>
                     <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-muted transition-colors hover:bg-ink-3 hover:text-fg"
                        aria-label={t("chatbot.close")}
                     >
                        <X size={18} />
                     </button>
                  </div>

                  <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
                     <div className="flex justify-start">
                        <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-line bg-ink-3 px-4 py-2.5 text-[15px] leading-relaxed text-fg/90">
                           {t("chatbot.welcome")}
                        </div>
                     </div>

                     {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                           <div
                              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
                                 msg.role === "user"
                                    ? "rounded-br-md bg-brand text-ink-2"
                                    : "rounded-bl-md border border-line bg-ink-3 text-fg/90"
                              }`}
                           >
                              {msg.content}
                           </div>
                        </div>
                     ))}

                     {loading && <TypingDots />}
                     <div ref={messagesEndRef} />
                  </div>

                  <div className="flex flex-none items-end gap-2 border-t border-line p-3">
                     <label htmlFor="gek-chat-input" className="sr-only">
                        {t("chatbot.placeholder")}
                     </label>
                     <textarea
                        id="gek-chat-input"
                        ref={textareaRef}
                        value={input}
                        onChange={handleTextareaChange}
                        onKeyDown={handleKeyDown}
                        placeholder={t("chatbot.placeholder")}
                        rows={1}
                        className="max-h-24 min-h-11 flex-1 resize-none rounded-2xl border border-line-strong bg-ink px-4 py-2.5 text-[16px] text-fg placeholder:text-subtle focus:border-brand focus:outline-none"
                     />
                     <button
                        type="button"
                        onClick={sendMessage}
                        disabled={!input.trim() || loading}
                        className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-fg text-ink-2 transition-[background-color,opacity] hover:bg-fg-hover disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={t("chatbot.send")}
                     >
                        <Send size={17} />
                     </button>
                  </div>
               </motion.section>
            )}
         </AnimatePresence>
      </>
   );
};

export default ChatBot;
