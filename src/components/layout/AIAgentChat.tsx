"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME = "Bonjour ! Je suis l'assistant Payless Car Rental Tunisie 🚗\n\nJe peux vous aider avec :\n• Nos tarifs et voitures disponibles\n• Nos 11 agences en Tunisie\n• Le processus de réservation\n• Conditions de location\n\nComment puis-je vous aider ?";

export function AIAgentChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: WELCOME }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          history: messages.slice(-10),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || "Je suis désolé, je n'ai pas pu traiter votre demande." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Une erreur est survenue. Veuillez réessayer ou nous contacter au +216 25 120 130." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Chat Panel */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 20 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="absolute bottom-20 right-0 w-[340px] sm:w-[380px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
                style={{ height: "480px" }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 text-white" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #d4af37, #f5c842)" }}>
                      <Bot className="w-5 h-5 text-[#1a1a2e]" />
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-tight">Assistant Payless</p>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                        <span className="text-[10px] text-emerald-300 font-medium">En ligne</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 dark:bg-neutral-900">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "assistant" && (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center mr-1.5 shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg, #d4af37, #f5c842)" }}>
                          <Bot className="w-3.5 h-3.5 text-[#1a1a2e]" />
                        </div>
                      )}
                      <div
                        className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                          msg.role === "user"
                            ? "bg-gradient-to-br from-amber-400 to-amber-500 text-black rounded-br-sm font-medium"
                            : "bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-100 rounded-bl-sm shadow-sm border border-gray-100 dark:border-neutral-700"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center mr-1.5 shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg, #d4af37, #f5c842)" }}>
                        <Bot className="w-3.5 h-3.5 text-[#1a1a2e]" />
                      </div>
                      <div className="bg-white dark:bg-neutral-800 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 dark:border-neutral-700 flex items-center gap-1">
                        {[0,1,2].map(i => (
                          <motion.span key={i} className="w-2 h-2 rounded-full bg-amber-400 inline-block"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Quick suggestions */}
                {messages.length <= 1 && (
                  <div className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border-t border-gray-100 dark:border-neutral-800 flex gap-1.5 overflow-x-auto">
                    {["Tarifs", "Agences", "Réservation", "Conditions"].map(s => (
                      <button
                        key={s}
                        onClick={() => { setInput(s); }}
                        className="shrink-0 px-2.5 py-1 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-amber-400 hover:text-amber-600 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="px-3 py-3 bg-white dark:bg-neutral-800 border-t border-gray-100 dark:border-neutral-700 flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Posez votre question..."
                    className="flex-1 text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
                    style={{ background: "linear-gradient(135deg, #d4af37, #f5c842)" }}
                  >
                    <Send className="w-4 h-4 text-[#1a1a2e]" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trigger Button */}
          <motion.button
            onClick={() => setOpen(!open)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #d4af37 0%, #f5c842 50%, #d4af37 100%)" }}
            aria-label="Open AI Assistant"
          >
            <AnimatePresence mode="wait">
              {open ? (
                <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X className="w-6 h-6 text-[#1a1a2e]" />
                </motion.div>
              ) : (
                <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sparkles className="w-6 h-6 text-[#1a1a2e]" />
                </motion.div>
              )}
            </AnimatePresence>
            {!open && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
