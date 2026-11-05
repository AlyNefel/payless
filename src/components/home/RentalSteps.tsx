"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import {
  MapPin,
  Car,
  KeyRound,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export function RentalSteps() {
  const t = useTranslations("home");
  const locale = useLocale();

  const steps = [
    {
      step: "01",
      icon: MapPin,
      title: t("step1Title") || "Select Destination & Dates",
      desc:
        t("step1Desc") ||
        (locale === "fr"
          ? "Choisissez vos agences de départ et de retour parmi nos 11 points en Tunisie (Tunis-Carthage, Monastir, Enfidha, Hammamet, Sousse, Sfax)."
          : locale === "ar"
          ? "اختر مواقع الاستلام والإرجاع من بين 11 فرعاً في تونس (مطار تونس، المنستير، النفيضة، الحمامات، سوسة، صفاقس)."
          : "Choose your pickup & return locations from our 11 hubs across Tunisia (Tunis-Carthage, Monastir, Enfidha, Hammamet, Sousse, Sfax)."),
      detail: locale === "fr" ? "Livraison aéroport 24/7 ou en ville" : locale === "ar" ? "تسليم بالمطار 24/7 أو بالمدينة" : "24/7 Airport Curbside or City Delivery",
    },
    {
      step: "02",
      icon: Car,
      title: t("step2Title") || "Choose Premium Vehicle & Add-ons",
      desc:
        t("step2Desc") ||
        (locale === "fr"
          ? "Parcourez nos 25 voitures vérifiées : citadines économiques, berlines ou SUV familiaux. Sièges bébé gratuits."
          : locale === "ar"
          ? "تصفح أسطولنا من 25 سيارة مضمونة: سيارات اقتصادية، سيدان أو دفع رباعي. مقاعد أطفال مجانية."
          : "Browse our 25 verified vehicles: economic hatchbacks, sedans, or family SUVs. Free baby seats included."),
      detail: locale === "fr" ? "Modèle exact garanti à 100%" : locale === "ar" ? "موديل مضمون 100%" : "100% Guaranteed Exact Model",
    },
    {
      step: "03",
      icon: KeyRound,
      title: t("step3Title") || "Fast Confirmation & Drive Away",
      desc:
        t("step3Desc") ||
        (locale === "fr"
          ? "Confirmez votre véhicule en 2 minutes. Recevez votre confirmation WhatsApp instantanée. Prise en main rapide sans attente."
          : locale === "ar"
          ? "أكد حجزك في دقيقتين. استلم التأكيد فوراً عبر الواتساب واستلم سيارتك بدون أي انتظار."
          : "Secure your car in under 2 minutes. Instant WhatsApp confirmation & voucher. Quick airport terminal pickup."),
      detail: locale === "fr" ? "Zéro file d'attente au comptoir" : locale === "ar" ? "بدون طوابير انتظار" : "Zero Counter Queues",
    },
  ];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {locale === "fr"
                ? "Réservation Simplifiée"
                : locale === "ar"
                ? "حجز سهل وسريع"
                : "Effortless Reservation"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground font-display tracking-tight">
            {t("howItWorks") ||
              (locale === "fr"
                ? "Louez votre véhicule en 3 étapes simples"
                : locale === "ar"
                ? "استأجر سيارتك في 3 خطوات بسيطة"
                : "Rent Your Vehicle in 3 Simple Steps")}
          </h2>

          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            {t("howSubtitle") ||
              (locale === "fr"
                ? "De la sélection du modèle à la remise des clés, une expérience fluide et sans attente."
                : locale === "ar"
                ? "من اختيار السيارة إلى استلام المفاتيح، تجربة سلسة بدون انتظار."
                : "From booking to taking the wheel, we have reimagined car rental into a seamless, five-star experience.")}
          </p>
        </div>

        {/* 3 Step Progression Container */}
        <div className="relative">
          {/* Connecting glowing line for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-[15%] right-[15%] h-0.5 -translate-y-12 bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400 opacity-40 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="group relative p-8 rounded-2xl bg-card border border-border/80 hover:border-amber-400/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Step badge and icon */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-500 group-hover:bg-amber-400 group-hover:text-black transition-all">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-4xl font-black font-display text-muted-foreground/30 group-hover:text-amber-500/40 transition-colors">
                        {step.step}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-amber-500 transition-colors">
                      {step.title}
                    </h3>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  {/* Micro pill feature */}
                  <div className="mt-6 pt-4 border-t border-border/60 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{step.detail}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
