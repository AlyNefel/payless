"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function WhatsAppWidget() {
  const [show, setShow] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Tooltip */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="bg-white text-gray-800 text-xs font-semibold px-3 py-2 rounded-xl shadow-lg border border-gray-100 whitespace-nowrap flex items-center gap-1.5 mb-1"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                En ligne 24/7
              </motion.div>
            )}
          </AnimatePresence>

          {/* Button */}
          <motion.a
            href="https://wa.me/21625120130?text=Bonjour%20Payless%20Car%20Rental%20Tunisie%20!%20Je%20souhaite%20faire%20une%20r%C3%A9servation."
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center"
            style={{ backgroundColor: "#25D366" }}
            aria-label="Chat on WhatsApp"
          >
            {/* Pulse rings */}
            <span className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-ping" />
            <span className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-ping" style={{ animationDelay: "0.5s" }} />
            <svg viewBox="0 0 32 32" className="w-8 h-8 relative z-10" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.164 0 0 7.164 0 16c0 2.82.738 5.469 2.027 7.773L0 32l8.473-2.006A15.92 15.92 0 0016 32c8.836 0 16-7.164 16-16S24.836 0 16 0zm0 29.23a13.19 13.19 0 01-6.738-1.844l-.484-.285-4.996 1.18 1.219-4.863-.316-.5A13.173 13.173 0 012.77 16C2.77 9.007 8.007 3.77 16 3.77S29.23 9.007 29.23 16 23.993 29.23 16 29.23zm7.328-9.895c-.398-.199-2.359-1.164-2.726-1.297-.367-.133-.633-.199-.899.199-.266.398-1.031 1.297-1.265 1.563-.234.266-.469.3-.867.1-.398-.2-1.684-.621-3.207-1.981-1.184-1.059-1.984-2.367-2.218-2.765-.234-.398-.025-.613.175-.812.18-.18.398-.469.598-.703.199-.234.266-.398.398-.664.133-.266.066-.5-.033-.703-.1-.199-.899-2.168-1.231-2.969-.324-.781-.652-.676-.899-.688-.234-.012-.5-.015-.765-.015-.266 0-.699.1-1.066.5-.367.398-1.398 1.367-1.398 3.332s1.43 3.864 1.629 4.13c.199.266 2.812 4.297 6.812 6.027.953.41 1.695.656 2.277.84.957.305 1.828.261 2.516.158.769-.114 2.359-.964 2.692-1.895.332-.93.332-1.727.234-1.895-.098-.168-.365-.266-.765-.465z"/>
            </svg>
          </motion.a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
