"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  BadgeCheck,
  Receipt,
  CalendarCheck,
  PlaneTakeoff,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Trophy,
  Users,
  Clock,
  Star,
} from "lucide-react";

export function WhyChooseUs() {
  const t = useTranslations("home");

  const editorialFeatures = [
    {
      icon: BadgeCheck,
      number: "01",
      title: "Guaranteed Exact Model",
      subtitle: "Zero Substitutions & Never a Downgrade",
      description:
        "When you select a Mercedes S580 or a Range Rover Autobiography, that is precisely the vehicle waiting for you. We strictly eliminate the disappointing 'or similar' industry practice.",
      highlight: "100% VIN-verified reservation guarantee",
    },
    {
      icon: Receipt,
      number: "02",
      title: "Transparent All-Inclusive Pricing",
      subtitle: "Zero Hidden Counter Surprises",
      description:
        "The price you see online includes comprehensive insurance, airport taxes, VAT, and unlimited mileage. No predatory desk sales pitches or unexpected fees when picking up keys.",
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
        "Bypass rental shuttle buses and airport lines. Our uniformed concierge greets you directly at the terminal exit gate or your luxury riad/hotel with sanitized keys.",
      highlight: "Personalized curbside valet in under 4 minutes",
    },
  ];

  const metrics = [
    { value: "10,000+", label: "Delighted VIP Travelers", icon: Users },
    { value: "99.8%", label: "On-Time Curbside Delivery", icon: Clock },
    { value: "4.9 / 5", label: "Trustpilot & Google Rating", icon: Star },
    { value: "11 Agences", label: "Tunis, Monastir, Enfidha, Hammamet, Sousse, Sfax, Soukra...", icon: Trophy },
  ];

  return (
    <section id="why-us" className="py-24 bg-neutral-950 text-white relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The PAYLESS Difference</span>
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
                className="group relative p-8 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900/90 border border-white/10 hover:border-amber-400/40 backdrop-blur-xl transition-all duration-300 shadow-xl overflow-hidden"
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
