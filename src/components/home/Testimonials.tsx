"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import {
  Star,
  Quote,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
  Car,
} from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  origin: string;
  flag: string;
  avatar: string;
  carRented: string;
  location: string;
  date: string;
  rating: number;
  quote: string;
  tripPurpose: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "review-1",
    name: "Sophie Laurent",
    origin: "Lyon, France",
    flag: "🇫🇷",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
    carRented: "Kia Sportage",
    location: "Aéroport de Tunis-Carthage (TUN)",
    date: "Janvier 2026",
    rating: 5,
    quote:
      "Service impeccable dès la sortie du terminal à Tunis-Carthage. Le Kia Sportage était neuf, propre et prêt. L'agent nous attendait avec les clés. Aucun frais caché, caution gérée sans stress. La meilleure agence en Tunisie.",
    tripPurpose: "Vacances en famille & Hammamet",
  },
  {
    id: "review-2",
    name: "Karim Ben Youssef",
    origin: "Tunis, Tunisie",
    flag: "🇹🇳",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
    carRented: "Renault Clio 6",
    location: "Agence La Soukra (Ariana)",
    date: "Février 2026",
    rating: 5,
    quote:
      "Je loue régulièrement pour mes déplacements professionnels entre Tunis et Sfax. Payless / Houimli Rent a Car est la seule agence où l'on reçoit exactement le modèle choisi en parfait état, avec assistance 24/7.",
    tripPurpose: "Déplacements Professionnels",
  },
  {
    id: "review-3",
    name: "Marco Rossi",
    origin: "Milan, Italie",
    flag: "🇮🇹",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
    carRented: "Seat Arona",
    location: "Aéroport Monastir Habib Bourguiba (MIR)",
    date: "Mars 2026",
    rating: 5,
    quote:
      "Arrivé à Monastir pour un séjour à Sousse et Mahdia. Réservation effectuée en quelques minutes sur le site, confirmation WhatsApp instantanée. Voiture économique et très confortable. Recommandé à 100% !",
    tripPurpose: "Road Trip Côte Sahélienne",
  },
];

export function Testimonials() {
  const t = useTranslations("home");
  const locale = useLocale();

  const labels = {
    fr: {
      badge: "Avis Clients Vérifiés",
      verified: "Vérifié",
      ratingNote: "1 200+ Avis Vérifiés sur Google & Trustpilot",
    },
    en: {
      badge: "Verified Guest Experiences",
      verified: "Verified",
      ratingNote: "1,200+ Verified Reviews on Google & Trustpilot",
    },
    ar: {
      badge: "تجارب عملاء حقيقية",
      verified: "موثّق",
      ratingNote: "+1,200 تقييم موثق على Google وTrustpilot",
    },
  }[locale as "fr" | "en" | "ar"] ?? {
    badge: "Avis Clients Vérifiés",
    verified: "Vérifié",
    ratingNote: "1 200+ Avis Vérifiés sur Google & Trustpilot",
  };

  return (
    <section className="py-24 bg-neutral-950 text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading & Trust Score */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{labels.badge}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white">
            {t("testimonials") || "Celebrated by Discerning Travelers Worldwide"}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-neutral-400 font-light">
            {t("testimonialsSubtitle") ||
              "Read genuine reviews from international travelers, executives, and luxury enthusiasts who rely on PAYLESS."}
          </p>

          {/* Trust Score Banner */}
          <div className="mt-6 inline-flex items-center gap-3 px-5 py-2 rounded-full bg-neutral-900 border border-white/10 text-xs">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <span className="font-bold text-white">4.9 / 5</span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-300">{labels.ratingNote}</span>
          </div>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="p-8 rounded-2xl bg-neutral-900/70 border border-white/10 hover:border-amber-400/40 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between shadow-xl relative group"
            >
              <div>
                {/* Quotation Icon and Rating */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-neutral-700 group-hover:text-amber-400/30 transition-colors" />
                </div>

                {/* Review Text */}
                <p className="text-sm text-neutral-300 leading-relaxed italic mb-6">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Renter Details & Car Badge */}
              <div className="pt-6 border-t border-white/10 space-y-4">
                {/* Car Rented Badge */}
                <div className="flex items-center justify-between text-xs bg-neutral-950/80 px-3 py-2 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold truncate">
                    <Car className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.carRented}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 shrink-0 ml-2">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{labels.verified}</span>
                  </div>
                </div>

                {/* Profile row */}
                <div className="flex items-center gap-3">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-amber-400/40"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                      <span>{item.name}</span>
                      <span>{item.flag}</span>
                    </div>
                    <div className="text-xs text-neutral-400 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0 text-neutral-500" />
                      <span className="truncate">{item.origin}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
