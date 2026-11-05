"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import {
  ShieldCheck,
  Headphones,
  Zap,
  Sparkles,
  ArrowDown,
  Star,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";

export function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  // Parallax transforms
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.2]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.7], [0.6, 0.85]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const trustPillarsData = {
    fr: [
      { icon: ShieldCheck, title: "Flotte Vérifiée", desc: "Modèle exact garanti, zéro substitution ni déclassement" },
      { icon: Headphones, title: "Conciergerie 24/7", desc: "Assistance immédiate partout en Tunisie (+216 25 120 130)" },
      { icon: Zap, title: "Confirmation Instantanée", desc: "Bon WhatsApp & contrat immédiat après réservation" },
      { icon: BadgeCheck, title: "Options 0 TND Dépôt", desc: "Formules zéro franchise pour une sérénité totale" },
    ],
    en: [
      { icon: ShieldCheck, title: "Verified Fleet", desc: "Guaranteed exact model, zero substitutions or downgrades" },
      { icon: Headphones, title: "24/7 Roadside Concierge", desc: "Instant assistance anywhere in Tunisia (+216 25 120 130)" },
      { icon: Zap, title: "Instant Confirmation", desc: "Immediate WhatsApp voucher & contract upon booking" },
      { icon: BadgeCheck, title: "0 TND Deposit Options", desc: "Zero excess plans for total peace of mind" },
    ],
    ar: [
      { icon: ShieldCheck, title: "أسطول مضمون", desc: "نفس الموديل المحجوز مضمون بدون إحلال أو تبديل" },
      { icon: Headphones, title: "مساعدة 24/7 على الطريق", desc: "دعم فوري في كل مكان بتونس (+216 25 120 130)" },
      { icon: Zap, title: "تأكيد فوري", desc: "وصل واتساب وعقد فوريان بعد الحجز مباشرة" },
      { icon: BadgeCheck, title: "خيارات بدون وديعة", desc: "خطط بدون فرانشيز لراحة بال تامة" },
    ],
  };
  const trustPillars = trustPillarsData[locale as "fr" | "en" | "ar"] ?? trustPillarsData.fr;

  const scrollToSearch = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById("booking-search");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section ref={sectionRef} className="relative min-h-[85vh] sm:min-h-[92vh] flex items-center justify-center pt-20 sm:pt-28 pb-14 sm:pb-20 overflow-hidden bg-neutral-950">
      {/* Cinematic Parallax Background */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: bgY, scale: bgScale }}
      >
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop')`,
          }}
        />
      </motion.div>
      {/* Multilayer gradient overlay with parallax opacity */}
      <motion.div
        className="absolute inset-0 z-[1] bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/30"
        style={{ opacity: overlayOpacity }}
      />
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />

      {/* Cinematic Automotive Smoke Layer (Hidden on mobile to preserve 60fps performance) */}
      <div className="hidden sm:block absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        {/* Continuous billowing smoke plumes rising from bottom to top */}
        {[
          { left: "5%", width: 340, duration: 7.2, delay: 0 },
          { left: "20%", width: 420, duration: 8.5, delay: 1.8 },
          { left: "38%", width: 500, duration: 6.8, delay: 0.6 },
          { left: "52%", width: 460, duration: 9.1, delay: 2.5 },
          { left: "70%", width: 390, duration: 7.6, delay: 1.2 },
          { left: "85%", width: 360, duration: 8.0, delay: 3.1 },
          { left: "28%", width: 440, duration: 10.2, delay: 4.2 },
          { left: "62%", width: 480, duration: 7.9, delay: 3.8 },
        ].map((smoke, idx) => (
          <motion.div
            key={`smoke-${idx}`}
            className="absolute rounded-full pointer-events-none filter blur-3xl"
            style={{
              left: smoke.left,
              bottom: "-15%",
              width: `${smoke.width}px`,
              height: `${smoke.width * 0.9}px`,
              background:
                "radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(200,225,255,0.12) 40%, rgba(245,158,11,0.04) 70%, transparent 100%)",
            }}
            animate={{
              y: ["0%", "-140%"],
              x: ["0%", idx % 2 === 0 ? "15%" : "-15%", "0%"],
              scale: [0.7, 1.8, 3.2],
              opacity: [0, 0.5, 0.3, 0],
            }}
            transition={{
              duration: smoke.duration,
              repeat: Infinity,
              ease: [0.25, 0.1, 0.25, 1],
              delay: smoke.delay,
            }}
          />
        ))}

        {/* Dense ground drift smoke along the bottom */}
        <motion.div
          animate={{
            x: ["-5%", "5%", "-5%"],
            opacity: [0.35, 0.6, 0.35],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-10 left-0 right-0 h-48 bg-gradient-to-t from-white/12 via-blue-400/8 to-transparent filter blur-2xl pointer-events-none"
        />
      </div>

      {/* Floating automotive particles */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-amber-400/5"
            style={{
              width: `${80 + i * 40}px`,
              height: `${80 + i * 40}px`,
              left: `${10 + i * 15}%`,
              top: `${15 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4 + i * 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Decorative ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-[2]" />

      {/* Main Content with subtle parallax scroll */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center"
        style={{ y: contentY }}
      >
        {/* Luxury Tag Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-amber-300 text-xs sm:text-sm font-medium tracking-widest uppercase mb-6 shadow-xl"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Payless Car Rental Tunisia 2026</span>
          <div className="flex items-center text-amber-400 text-xs ml-1">
            <Star className="w-3 h-3 fill-amber-400" />
            <span className="ml-1 font-bold text-white">4.9/5</span>
          </div>
        </motion.div>

        {/* Editorial Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white font-display max-w-5xl leading-[1.12] sm:leading-[1.08]"
        >
          {t("tagline") || "Your Journey. Your Freedom."}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl text-neutral-300 max-w-2xl font-light leading-relaxed text-balance"
        >
          {t("subtitle") ||
            "Premium vehicles for every destination in Tunisia. Delivered directly to your airport terminal or private hotel in minutes."}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
          className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto"
        >
          <a
            href="#booking-search"
            onClick={scrollToSearch}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-black bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all group"
          >
            <span>{t("cta") || "Book Now"}</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </a>

          <Link
            href={`/${locale}/vehicles`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-white bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 backdrop-blur-md font-semibold text-xs sm:text-sm transition-all hover:-translate-y-0.5"
          >
            <span>{t("ctaSecondary") || "Explore Fleet"}</span>
            <ChevronRight className="w-4 h-4 text-amber-400 rtl-flip" />
          </Link>
        </motion.div>

        {/* Trust Indicators Pill Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="mt-10 sm:mt-16 w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 text-left rtl:text-right"
        >
          {trustPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="group p-3.5 sm:p-4 rounded-xl bg-neutral-900/60 hover:bg-neutral-900/90 border border-white/10 hover:border-amber-400/40 backdrop-blur-md transition-all duration-300 charging-card"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center group-hover:bg-amber-400/20 transition-colors shrink-0">
                    <Icon className="w-4 h-4 text-amber-400" />
                  </div>
                  <h2 className="text-xs sm:text-sm font-semibold text-white tracking-tight">
                    {pillar.title}
                  </h2>
                </div>
                <p className="text-[11px] sm:text-xs text-neutral-400 leading-snug line-clamp-2">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Subtle bottom scroll indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
        <span className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
          {locale === "ar" ? "مرر للحجز" : locale === "fr" ? "Défiler pour réserver" : "Scroll to Reserve"}
        </span>
        <div className="w-5 h-8 border border-neutral-700 rounded-full flex items-start justify-center p-1">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="w-1.5 h-1.5 bg-amber-400 rounded-full"
          />
        </div>
      </div>
    </section>
  );
}
