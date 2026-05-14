import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

const TypingDots = () => (
  <div className="flex justify-start">
    <div className="bg-[#2A2A2A] border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3">
      <div className="flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-[#00D2A8] rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  </div>
);

const ChatBot = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  // messages ne contient que les échanges réels (pas le message d'accueil)
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    try {
      const response = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t("chatbot.error") },
      ]);
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
      {/* Bouton flottant */}
      <div className="fixed bottom-6 right-6 z-[10000]">
        {/* Anneaux pulsants — uniquement quand le chat est fermé */}
        {!isOpen && (
          <>
            <motion.span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: "2px solid #00D2A8" }}
              animate={{ scale: [1, 2], opacity: [0, 0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: "2px solid #00D2A8" }}
              animate={{ scale: [1, 2], opacity: [0, 0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
            />
          </>
        )}

        <motion.button
          onClick={() => setIsOpen((v) => !v)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-[#005BFF] to-[#00D2A8] flex items-center justify-center shadow-lg shadow-[#005BFF]/30"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label={t("chatbot.toggle")}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <X size={22} className="text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <MessageCircle size={22} className="text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Panneau de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-[10000] w-[360px] max-w-[calc(100vw-24px)] rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-[#00D2A8]/20 flex flex-col"
            style={{ maxHeight: "calc(100vh - 120px)" }}
          >
            {/* En-tête avec logo */}
            <div className="bg-gradient-to-r from-[#005BFF] to-[#00D2A8] px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <img
                  src="/logo.svg"
                  alt="GEK INNOVATECH"
                  className="h-8 w-auto flex-shrink-0"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
                <p className="text-white/80 text-xs truncate">
                  {t("chatbot.subtitle")}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center transition-colors"
                aria-label={t("chatbot.close")}
              >
                <X size={16} className="text-white" strokeWidth={2.5} />
              </button>
            </div>

            {/* Zone messages */}
            <div
              className="bg-[#1A1A1A] flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
              style={{ maxHeight: "340px" }}
            >
              {/* Message d'accueil — toujours dans la langue courante */}
              <div className="flex justify-start">
                <div className="max-w-[82%] bg-[#2A2A2A] text-gray-200 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed border border-white/5">
                  {t("chatbot.welcome")}
                </div>
              </div>

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-[#005BFF] to-[#0044CC] text-white rounded-br-sm"
                        : "bg-[#2A2A2A] text-gray-200 rounded-bl-sm border border-white/5"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && <TypingDots />}
              <div ref={messagesEndRef} />
            </div>

            {/* Zone saisie */}
            <div className="bg-[#1E1E1E] border-t border-white/5 px-3 py-3 flex gap-2 items-end flex-shrink-0">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder={t("chatbot.placeholder")}
                rows={1}
                className="flex-1 bg-[#2A2A2A] text-white text-sm rounded-xl px-3 py-2 resize-none outline-none border border-white/10 focus:border-[#00D2A8]/50 placeholder-gray-500 transition-colors"
                style={{ minHeight: "36px", maxHeight: "96px" }}
              />
              <motion.button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.94 }}
                className="w-9 h-9 flex-shrink-0 rounded-xl bg-gradient-to-br from-[#005BFF] to-[#00D2A8] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-opacity mb-px"
                aria-label={t("chatbot.send")}
              >
                <Send size={15} className="text-white" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
