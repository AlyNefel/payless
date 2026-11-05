"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tag, Copy, Check, ArrowRight, Sparkles, Clock, Users, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Promotion {
  _id: string;
  name: string;
  description?: { fr: string; en: string; ar: string };
  discountType: "percentage" | "fixed";
  discountValue: number;
  couponCode?: string;
  startDate: string;
  endDate: string;
  minRentalDays?: number;
  usageLimit?: number;
  usageCount?: number;
  applicableCategories?: string[];
  isActive: boolean;
}

const MOCK_PROMOTIONS: Promotion[] = [
  {
    _id: "1",
    name: "Summer Special",
    description: {
      fr: "Profitez de 20% de réduction sur toutes nos voitures pour vos locations d'été!",
      en: "Enjoy 20% off all vehicles for your summer rentals!",
      ar: "استمتع بخصم 20% على جميع سياراتنا لإيجارات الصيف!",
    },
    discountType: "percentage",
    discountValue: 20,
    couponCode: "PAYLESS2026",
    startDate: "2026-06-01",
    endDate: "2026-09-30",
    minRentalDays: 3,
    usageLimit: 200,
    usageCount: 47,
    isActive: true,
  },
  {
    _id: "2",
    name: "Welcome Offer",
    description: {
      fr: "10% de réduction pour votre première réservation avec PAYLESS",
      en: "10% off your first booking with PAYLESS",
      ar: "خصم 10% على حجزك الأول مع PAYLESS",
    },
    discountType: "percentage",
    discountValue: 10,
    couponCode: "WELCOME10",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    minRentalDays: 1,
    usageLimit: 500,
    usageCount: 89,
    isActive: true,
  },
  {
    _id: "3",
    name: "VIP Discount",
    description: {
      fr: "50 TND de réduction sur les locations longue durée",
      en: "50 TND off long-term rentals",
      ar: "خصم 50 د.ت على الإيجارات طويلة الأمد",
    },
    discountType: "fixed",
    discountValue: 5000,
    couponCode: "VIP500",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    minRentalDays: 7,
    usageLimit: 100,
    usageCount: 12,
    isActive: true,
  },
];

export default function PromotionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [locale, setLocale] = React.useState("fr");
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    params.then(({ locale }) => setLocale(locale));
  }, [params]);

  useEffect(() => {
    async function fetchPromotions() {
      try {
        const res = await fetch("/api/promotions");
        if (res.ok) {
          const data = await res.json();
          setPromotions(data.promotions?.length ? data.promotions : MOCK_PROMOTIONS);
        } else {
          setPromotions(MOCK_PROMOTIONS);
        }
      } catch {
        setPromotions(MOCK_PROMOTIONS);
      } finally {
        setLoading(false);
      }
    }
    fetchPromotions();
  }, []);

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isRTL = locale === "ar";

  const t = {
    title: { fr: "Offres & Promotions", en: "Offers & Promotions", ar: "العروض والتخفيضات" },
    subtitle: { fr: "Profitez de nos meilleures offres", en: "Take advantage of our best deals", ar: "استفد من أفضل عروضنا" },
    copyCode: { fr: "Copier", en: "Copy", ar: "نسخ" },
    copied: { fr: "Copié!", en: "Copied!", ar: "تم النسخ!" },
    bookNow: { fr: "Réserver avec cette offre", en: "Book with this offer", ar: "احجز بهذا العرض" },
    minDays: { fr: "Minimum", en: "Minimum", ar: "الحد الأدنى" },
    days: { fr: "jours", en: "days", ar: "أيام" },
    until: { fr: "Valable jusqu'au", en: "Valid until", ar: "صالح حتى" },
    uses: { fr: "utilisations", en: "uses", ar: "استخدامات" },
    noPromos: { fr: "Aucune promotion active", en: "No active promotions", ar: "لا توجد عروض نشطة" },
  };

  const getText = (key: keyof typeof t) => t[key][locale as "fr" | "en" | "ar"] ?? t[key].fr;
  const getDesc = (desc?: { fr: string; en: string; ar: string }) =>
    desc?.[locale as "fr" | "en" | "ar"] ?? desc?.fr ?? "";

  return (
    <div className={cn("min-h-screen bg-[#0A0A0B] text-white pt-24 pb-20", isRTL && "rtl")}>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-sm font-medium">
              {locale === "fr" ? "Offres exclusives" : locale === "ar" ? "عروض حصرية" : "Exclusive Offers"}
            </span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold font-playfair mb-4">{getText("title")}</h1>
          <p className="text-xl text-white/60">{getText("subtitle")}</p>
        </motion.div>
      </div>

      {/* Promotions Grid */}
      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-white/10 rounded mb-3 w-3/4" />
                <div className="h-4 bg-white/10 rounded mb-2 w-full" />
                <div className="h-4 bg-white/10 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="h-16 w-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/50">{getText("noPromos")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map((promo, i) => (
              <motion.div
                key={promo._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="charging-card group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#D4AF37]/30 transition-all duration-300"
              >
                {/* Discount Badge */}
                <div className="absolute top-4 right-4 bg-[#D4AF37] text-black font-bold px-3 py-1.5 rounded-xl text-lg">
                  {promo.discountType === "percentage"
                    ? `-${promo.discountValue}%`
                    : `-${promo.discountValue / 100} TND`}
                </div>

                <div className="p-6">
                  <div className="flex items-start gap-3 mb-4 pr-20">
                    <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Percent className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg leading-tight">{promo.name}</h3>
                    </div>
                  </div>

                  <p className="text-white/60 text-sm mb-4 leading-relaxed">{getDesc(promo.description)}</p>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-white/40">
                    {promo.minRentalDays && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {getText("minDays")}: {promo.minRentalDays} {getText("days")}
                      </div>
                    )}
                    {promo.endDate && (
                      <div className="flex items-center gap-1.5">
                        <Tag className="h-3 w-3" />
                        {getText("until")} {new Date(promo.endDate).toLocaleDateString(locale === "ar" ? "ar-TN" : locale === "fr" ? "fr-FR" : "en-GB")}
                      </div>
                    )}
                    {promo.usageLimit && (
                      <div className="flex items-center gap-1.5 col-span-2">
                        <Users className="h-3 w-3" />
                        {promo.usageCount ?? 0}/{promo.usageLimit} {getText("uses")}
                      </div>
                    )}
                  </div>

                  {/* Usage Progress */}
                  {promo.usageLimit && promo.usageCount !== undefined && (
                    <div className="mb-4">
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#D4AF37] rounded-full transition-all"
                          style={{ width: `${Math.min((promo.usageCount / promo.usageLimit) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Coupon Code */}
                  {promo.couponCode && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex-1 bg-[#D4AF37]/10 border border-[#D4AF37]/20 border-dashed rounded-lg px-3 py-2">
                        <span className="font-mono font-bold text-[#D4AF37] tracking-widest text-sm">
                          {promo.couponCode}
                        </span>
                      </div>
                      <button
                        onClick={() => copyCode(promo.couponCode!)}
                        className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
                      >
                        {copiedCode === promo.couponCode ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-white/60" />
                        )}
                      </button>
                    </div>
                  )}

                  <Button
                    onClick={() =>
                      router.push(`/${locale}/booking${promo.couponCode ? `?coupon=${promo.couponCode}` : ""}`)
                    }
                    className="w-full bg-[#1D4ED8] hover:bg-[#1e40af] text-white font-semibold rounded-xl h-10"
                  >
                    {getText("bookNow")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

