"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import {
  Tag,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Flame,
  Calendar,
  Percent,
} from "lucide-react";

export function PromotionsBanner() {
  const t = useTranslations("home");
  const locale = useLocale();

  const [copied, setCopied] = useState(false);
  const promoCode = "PAYLESS2026";

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      toast.success("Promo code copied to clipboard!", {
        description: `Apply code "${promoCode}" at checkout to save 15% on your booking.`,
      });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      toast.info(`Promo Code: ${promoCode}`);
    }
  };

  return (
    <section id="promotions" className="py-12 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-950 via-blue-950 to-neutral-900 border border-amber-400/30 p-8 sm:p-12 text-white shadow-2xl">
          {/* Decorative ambient lights */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Promo Left Content */}
            <div className="space-y-4 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Limited Time Moroccan Voyage Offer</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
                Early Bird Summer Special —{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                  15% OFF
                </span>
              </h2>

              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-light">
                Reserve any luxury sedan, SUV, or supercar for 4+ rental days and unlock an exclusive
                15% discount plus complimentary VIP airport fast-track concierge delivery.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Valid for trips through September 2026</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-emerald-400" />
                  <span>Applicable to all 11 Tunisian Hubs & Airports</span>
                </div>
              </div>
            </div>

            {/* Promo Right Voucher Box */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col items-center gap-4 shrink-0">
              {/* Voucher Code Box */}
              <div className="w-full sm:w-auto p-4 rounded-2xl bg-neutral-900/90 border border-white/15 backdrop-blur-xl flex items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-neutral-400">
                      Promo Voucher Code
                    </div>
                    <div className="text-lg font-black tracking-widest text-amber-400 font-mono">
                      {promoCode}
                    </div>
                  </div>
                </div>

                {/* Copy button */}
                <button
                  onClick={handleCopyCode}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  aria-label="Copy promotion code"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Button */}
              <Link
                href={`/${locale}/vehicles?promoCode=${promoCode}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Claim 15% Discount</span>
                <ArrowRight className="w-4 h-4 rtl-flip" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
