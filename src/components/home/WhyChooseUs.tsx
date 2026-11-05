"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import {
  BadgeCheck,
  Receipt,
  CalendarCheck,
  PlaneTakeoff,
  Sparkles,
  CheckCircle2,
  Trophy,
  Users,
  Clock,
  Star,
} from "lucide-react";

export function WhyChooseUs() {
  const t = useTranslations("home");
  const locale = useLocale();

  const editorialFeaturesData = {
    fr: [
      {
        icon: BadgeCheck,
        number: "01",
        title: "Modèle Exact Garanti",
        subtitle: "Zéro Substitution & Jamais de Déclassement",
        description:
          "Lorsque vous sélectionnez une Kia Sportage ou un VW T-Cross, c'est précisément ce véhicule qui vous attend. Nous éliminons rigoureusement la pratique décevante du « ou similaire ».",
        highlight: "Garantie de réservation VIN vérifiée à 100%",
      },
      {
        icon: Receipt,
        number: "02",
        title: "Tarification Transparente Tout Compris",
        subtitle: "Zéro Surprise au Comptoir",
        description:
          "Le prix que vous voyez en ligne comprend l'assurance complète, les taxes aéroportuaires et le kilométrage illimité. Pas de frais imprévus ni de discours de vente agressifs à la prise en charge.",
        highlight: "Prix final annoncé dès le premier clic",
      },
      {
        icon: CalendarCheck,
        number: "03",
        title: "Annulation Gratuite jusqu'à 48h",
        subtitle: "Flexibilité Totale pour Vos Itinéraires",
        description:
          "Les plans de voyage changent. Annulez ou modifiez votre réservation sans pénalité jusqu'à 48 heures avant la prise en charge. Remboursements instantanés sans friction administrative.",
        highlight: "Planification sans stress avec remboursement immédiat",
      },
      {
        icon: PlaneTakeoff,
        number: "04",
        title: "Livraison VIP Aéroport & Hôtel",
        subtitle: "Remise de Clés Directe au Terminal",
        description:
          "Évitez les navettes et les files d'aéroport. Notre concierge en uniforme vous accueille directement à la sortie du terminal ou à votre hôtel avec des clés désinfectées.",
        highlight: "Valet personnalisé en moins de 4 minutes",
      },
    ],
    en: [
      {
        icon: BadgeCheck,
        number: "01",
        title: "Guaranteed Exact Model",
        subtitle: "Zero Substitutions & Never a Downgrade",
        description:
          "When you select a Kia Sportage or VW T-Cross, that is precisely the vehicle waiting for you. We strictly eliminate the disappointing 'or similar' industry practice.",
        highlight: "100% VIN-verified reservation guarantee",
      },
      {
        icon: Receipt,
        number: "02",
        title: "Transparent All-Inclusive Pricing",
        subtitle: "Zero Hidden Counter Surprises",
        description:
          "The price you see online includes comprehensive insurance, airport taxes, and unlimited mileage. No predatory desk sales pitches or unexpected fees when picking up keys.",
        highlight: "Full price transparency from the first click",
      },
      {
        icon: CalendarCheck,
        number: "03",
        title: "Free Cancellation up to 48 Hours",
        subtitle: "Complete Itinerary Flexibility",
        description:
          "Travel schedules change. Cancel or modify your booking with zero penalty up to 48 hours before pickup. Instant refunds processed without administrative friction.",
        highlight: "Stress-free travel planning with instant refunds",
      },
      {
        icon: PlaneTakeoff,
        number: "04",
        title: "VIP Airport & Hotel Delivery",
        subtitle: "Direct Terminal Curbside Hand-off",
        description:
          "Bypass rental shuttle buses and airport lines. Our uniformed concierge greets you directly at the terminal exit gate or your hotel with sanitized keys.",
        highlight: "Personalized curbside valet in under 4 minutes",
      },
    ],
    ar: [
      {
        icon: BadgeCheck,
        number: "01",
        title: "الموديل المحجوز مضمون",
        subtitle: "بدون إحلال أو تبديل أو تخفيض للفئة",
        description:
          "عندما تختار كيا سبورتاج أو VW T-Cross، هذه بالضبط السيارة التي تنتظرك. نلغي تماماً ممارسة 'أو ما يشبهها' المحبطة في هذه الصناعة.",
        highlight: "ضمان الحجز بالرقم التعريفي للسيارة (VIN) بنسبة 100%",
      },
      {
        icon: Receipt,
        number: "02",
        title: "أسعار شاملة وشفافة",
        subtitle: "بدون أي مفاجآت خفية",
        description:
          "السعر الذي تراه على الإنترنت يشمل التأمين الشامل والضرائب المطارية والمسافة غير المحدودة. لا رسوم مفاجئة ولا ضغوط بيع عند استلام المفاتيح.",
        highlight: "شفافية تامة في الأسعار منذ أول نقرة",
      },
      {
        icon: CalendarCheck,
        number: "03",
        title: "إلغاء مجاني حتى 48 ساعة",
        subtitle: "مرونة تامة في خطط سفرك",
        description:
          "خطط السفر تتغير. ألغِ أو عدّل حجزك بدون أي غرامة حتى 48 ساعة قبل الاستلام. استرداد فوري دون أي إجراءات إدارية معقدة.",
        highlight: "تخطيط بدون ضغط مع استرداد فوري",
      },
      {
        icon: PlaneTakeoff,
        number: "04",
        title: "تسليم VIP للمطار والفندق",
        subtitle: "تسليم المفاتيح مباشرة عند المطار",
        description:
          "تجنب حافلات نقل السيارات وطوابير المطار. يستقبلك موظفنا بالزي الرسمي مباشرة عند مخرج المبنى أو في فندقك بمفاتيح معقمة.",
        highlight: "خدمة valet شخصية في أقل من 4 دقائق",
      },
    ],
  };
  const editorialFeatures = editorialFeaturesData[locale as "fr" | "en" | "ar"] ?? editorialFeaturesData.en;

  const metricsData = {
    fr: [
      { value: "10 000+", label: "Voyageurs VIP Ravis", icon: Users },
      { value: "99.8%", label: "Livraison à l'Heure", icon: Clock },
      { value: "4.9 / 5", label: "Note Google & Trustpilot", icon: Star },
      { value: "11 Agences", label: "Tunis, Monastir, Enfidha, Hammamet, Sousse, Sfax, Soukra...", icon: Trophy },
    ],
    en: [
      { value: "10,000+", label: "Delighted VIP Travelers", icon: Users },
      { value: "99.8%", label: "On-Time Curbside Delivery", icon: Clock },
      { value: "4.9 / 5", label: "Trustpilot & Google Rating", icon: Star },
      { value: "11 Agencies", label: "Tunis, Monastir, Enfidha, Hammamet, Sousse, Sfax, Soukra...", icon: Trophy },
    ],
    ar: [
      { value: "+10,000", label: "مسافر VIP سعيد", icon: Users },
      { value: "99.8%", label: "تسليم في الوقت المحدد", icon: Clock },
      { value: "4.9 / 5", label: "تقييم Google وTrustpilot", icon: Star },
      { value: "11 فرعاً", label: "تونس، المنستير، النفيضة، الحمامات، سوسة، صفاقس، سكرة...", icon: Trophy },
    ],
  };
  const metrics = metricsData[locale as "fr" | "en" | "ar"] ?? metricsData.en;

  const badgeText = {
    fr: "La Différence PAYLESS",
    en: "The PAYLESS Difference",
    ar: "ما يميز PAYLESS",
  }[locale as "fr" | "en" | "ar"] ?? "The PAYLESS Difference";

  return (
    <section id="why-us" className="py-14 sm:py-24 bg-neutral-950 text-white relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{badgeText}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-display text-white">
            {t("whyPayless") || "Engineered for Uncompromising Travelers"}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-neutral-400 font-light">
            {t("whySubtitle") ||
              "Excellence automobile, assistance 24/7 partout en Tunisie, et sérénité totale du départ à l'arrivée."}
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {editorialFeatures.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative p-5 sm:p-8 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900/90 border border-white/10 hover:border-amber-400/40 backdrop-blur-xl transition-all duration-300 shadow-xl overflow-hidden"
              >
                {/* Subtle top card glow */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/0 group-hover:via-amber-400/70 to-transparent transition-all duration-500" />

                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/10 to-blue-500/10 border border-amber-400/20 flex items-center justify-center group-hover:scale-105 group-hover:border-amber-400/50 transition-all">
                    <Icon className="w-7 h-7 text-amber-400" />
                  </div>
                  <span className="text-3xl font-black text-neutral-700 group-hover:text-amber-400/40 font-display transition-colors">
                    {feat.number}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-amber-300 transition-colors">
                    {feat.title}
                  </h3>
                  <div className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                    {feat.subtitle}
                  </div>
                </div>

                <p className="mt-4 text-sm text-neutral-400 leading-relaxed">
                  {feat.description}
                </p>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-medium text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{feat.highlight}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Metrics Strip */}
        <div className="mt-16 pt-12 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {metrics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-display">
                  {item.value}
                </div>
                <div className="text-xs text-neutral-400">{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
