"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot } from "lucide-react";
import { useLocale } from "next-intl";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGES: Record<string, string> = {
  fr: "Bonjour ! Je suis l'assistant Payless Car Rental Tunisie 🚗\n\nJe peux vous aider avec :\n• Nos tarifs et voitures disponibles\n• Nos 11 agences en Tunisie\n• Le processus de réservation\n• Conditions de location\n\nComment puis-je vous aider ?",
  en: "Hello! I am your Payless Car Rental Tunisia concierge 🚗\n\nI can help you with:\n• Rates & fleet availability\n• Airport branches in Tunisia\n• Booking process\n• Rental terms & conditions\n\nHow may I assist you today?",
  ar: "مرحباً بكم! أنا المساعد الذكي لشركة باي ليس لتأجير السيارات بتونس 🚗\n\nيمكنني مساعدتكم في:\n• الأسعار والسيارات المتاحة\n• فروعنا الـ 11 في تونس\n• خطوات الحجز والتأكيد\n• الشروط والأحكام\n\nكيف يمكنني مساعدتكم اليوم؟",
};

export function AIAgentChat() {
  const locale = useLocale();
  const { settings } = useCompanySettings();
  const [open, setOpen] = useState(false);
  const welcomeText = WELCOME_MESSAGES[locale as "fr" | "en" | "ar"] ?? WELCOME_MESSAGES.fr;
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: welcomeText }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages([{ role: "assistant", content: welcomeText }]);
  }, [welcomeText]);

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

  const quickSuggestions = {
    fr: ["Quels sont vos prix ?", "Agences aéroports ?", "Documents requis ?"],
    en: ["What are your rates?", "Airport branches?", "Required documents?"],
    ar: ["ما هي الأسعار؟", "فروع المطارات؟", "الوثائق المطلوبة؟"],
  }[locale as "fr" | "en" | "ar"] ?? ["Quels sont vos prix ?", "Agences aéroports ?", "Documents requis ?"];

  const sendMessage = async (customText?: string) => {
    const textToSend = customText ?? input;
    if (!textToSend.trim() || loading) return;
    const userMsg: Message = { role: "user", content: textToSend.trim() };
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
          locale,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || (locale === "ar" ? "أنا في خدمتكم!" : "Je reste à votre entière disposition !") }]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content:
            locale === "ar"
              ? `فريق الدعم متاح 24/7 عبر الواتساب: ${settings.whatsapp}`
              : locale === "en"
              ? `Our support team is directly available on WhatsApp 24/7: ${settings.whatsapp}`
              : `Notre équipe de réservation est joignable directement sur WhatsApp 24/7 : ${settings.whatsapp}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50"
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
                className="absolute bottom-16 sm:bottom-20 right-0 w-[calc(100vw-2rem)] max-w-[380px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
                style={{ height: "480px" }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 text-white" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #d4af37, #f5c842)" }}>
                      <Bot className="w-5 h-5 text-[#1a1a2e]" />
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-tight">
                        {locale === "ar" ? "مساعد باي ليس الذكي" : locale === "en" ? "Payless AI Concierge" : "Assistant Payless"}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                        <span className="text-[10px] text-emerald-300 font-medium">
                          {locale === "ar" ? "متصل 24/7" : locale === "en" ? "Online 24/7" : "En ligne 24/7"}
                        </span>
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
                        className={`max-w-[82%] px-3 py-2 rounded-2xl text-xs sm:text-sm whitespace-pre-wrap leading-relaxed ${
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
                  <div className="px-3 py-2 bg-gray-50 dark:bg-neutral-900 border-t border-gray-100 dark:border-neutral-800 flex gap-1.5 overflow-x-auto scrollbar-none">
                    {quickSuggestions.map((qs, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => sendMessage(qs)}
                        className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:border-amber-400 text-gray-700 dark:text-gray-300 font-medium transition-colors shrink-0"
                      >
                        {qs}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="p-3 bg-white dark:bg-neutral-800 border-t border-gray-100 dark:border-neutral-700 flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder={locale === "ar" ? "اطرح سؤالك هنا..." : locale === "en" ? "Ask your question..." : "Posez votre question..."}
                    className="flex-1 min-w-0 text-xs sm:text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #d4af37, #f5c842)" }}
                    aria-label="Send message"
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
            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-xl flex items-center justify-center cursor-pointer"
            style={{ background: "linear-gradient(135deg, #d4af37 0%, #f5c842 50%, #d4af37 100%)" }}
            aria-label="Open AI Assistant"
          >
            <AnimatePresence mode="wait">
              {open ? (
                <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#1a1a2e]" />
                </motion.div>
              ) : (
                <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#1a1a2e]" />
                </motion.div>
              )}
            </AnimatePresence>
            {!open && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
