"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Gauge,
  Fuel,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Eye,
  Loader2,
} from "lucide-react";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";

interface FleetVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  categoryLabel: string;
  image: string;
  dailyRate: number;
  dailyRateEUR: number;
  deposit: number;
  transmission: string;
  fuelType: string;
  seats: number;
  featuredTag?: string;
  features: string[];
}

type CategoryFilter = "all" | "luxury" | "suv" | "sedan" | "compact";

function normalizePrice(p: number): number {
  return p >= 1000 ? Math.round(p / 100) : p;
}

function categoryToFilter(cat: string): CategoryFilter {
  const c = (cat || "").toLowerCase();
  if (c.includes("suv") || c.includes("crossover")) return "suv";
  if (c.includes("luxury") || c.includes("prestige")) return "luxury";
  if (c.includes("sedan") || c.includes("berline")) return "sedan";
  return "compact";
}

function categoryLabel(cat: string, locale: string): string {
  const c = (cat || "").toLowerCase();
  if (c.includes("suv") || c.includes("crossover")) {
    return locale === "ar" ? "SUV ودفع رباعي" : "SUV & Crossover";
  }
  if (c.includes("luxury") || c.includes("prestige")) {
    return locale === "ar" ? "فاخرة وبريستيج" : locale === "fr" ? "Prestige & Luxe" : "Prestige & Luxury";
  }
  if (c.includes("sedan") || c.includes("berline")) {
    return locale === "ar" ? "السيدان التنفيذية" : locale === "fr" ? "Berline Executive" : "Executive Sedan";
  }
  return locale === "ar" ? "سيارة المدينة" : locale === "fr" ? "Compacte & Citadine" : "Compact & City";
}

// Skeleton card
function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-card shadow-sm overflow-hidden animate-pulse">
      <div className="h-48 bg-muted" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="grid grid-cols-3 gap-2 py-2">
          <div className="h-3 bg-muted rounded" />
          <div className="h-3 bg-muted rounded" />
          <div className="h-3 bg-muted rounded" />
        </div>
        <div className="h-8 bg-muted rounded" />
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="h-9 bg-muted rounded-xl" />
          <div className="h-9 bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function FeaturedFleet() {
  const locale = useLocale();
  const { settings } = useCompanySettings();

  const [allVehicles, setAllVehicles] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<CategoryFilter>("all");

  useEffect(() => {
    setLoading(true);
    fetch("/api/vehicles?limit=20&status=available")
      .then((res) => res.json())
      .then((json) => {
        const raw = json.vehicles || json.data || [];
        const mapped: FleetVehicle[] = raw.map((v: any) => {
          const daily = normalizePrice(v.pricing?.daily ?? 0);
          const deposit = normalizePrice(v.pricing?.deposit ?? 0);
          const catRaw =
            (typeof v.category === "object"
              ? v.category?.name?.fr || v.category?.name?.en
              : v.category) || "compact";
          const img =
            v.images?.find((i: any) => i.isPrimary)?.url ||
            v.images?.[0]?.url ||
            "/placeholder-car.jpg";

          return {
            id: String(v._id),
            brand: v.brand || "",
            model: v.model || "",
            year: v.year || 2024,
            category: categoryToFilter(catRaw),
            categoryLabel: categoryLabel(catRaw, locale),
            image: img,
            dailyRate: daily,
            dailyRateEUR: Math.round(daily / 3.3),
            deposit,
            transmission: v.transmission || "Manual",
            fuelType: v.fuelType || "Gasoline",
            seats: v.seats || 5,
            featuredTag: v.featuredTag || undefined,
            features: v.features?.length
              ? v.features
              : ["Clim A/C", "Kilométrage Illimité", "Bluetooth"],
          };
        });
        setAllVehicles(mapped);
      })
      .catch(() => setAllVehicles([]))
      .finally(() => setLoading(false));
  }, [locale]);

  const tl = useMemo(() => {
    const defs = {
      fr: {
        badge: "Flotte Récente 2024-2026 en Tunisie",
        title: "Nos Véhicules Stars en Tunisie",
        subtitle:
          "Des citadines nerveuses aux grands SUV familiaux. Kilométrage illimité, climatisation garantie et livraison 24/7 dans 11 aéroports et agences.",
        exploreLink: "Explorer toute la Flotte",
        categories: [
          { id: "all" as CategoryFilter, label: "Toute la Flotte" },
          { id: "suv" as CategoryFilter, label: "SUV & Crossovers" },
          { id: "compact" as CategoryFilter, label: "Citadines Économiques" },
          { id: "sedan" as CategoryFilter, label: "Berlines Exécutives" },
          { id: "luxury" as CategoryFilter, label: "Prestige & Haut de Gamme" },
        ],
        kmLabel: "Illimité KM",
        perDay: "/ jour",
        depositLabel: "Caution",
        detailsBtn: "Détails",
        bookBtn: "Réserver",
        airportBannerTitle: "Livraison Directe dans 11 Agences & Aéroports en Tunisie",
        airportBannerSubtitle:
          "Aéroports Tunis-Carthage (24/7), Monastir, Enfidha, Soukra, Hammamet, Sousse, Sfax, Bizerte, Nabeul, Jendouba.",
        callCta: `Appeler ${settings.phone}`,
      },
      en: {
        badge: "2024-2026 Fleet Available Across Tunisia",
        title: "Our Top Vehicles in Tunisia",
        subtitle:
          "From agile city cars to spacious family SUVs. Unlimited mileage, guaranteed A/C, and 24/7 delivery across 11 airports and agencies.",
        exploreLink: "Explore All Models",
        categories: [
          { id: "all" as CategoryFilter, label: "Full Fleet" },
          { id: "suv" as CategoryFilter, label: "SUVs & Crossovers" },
          { id: "compact" as CategoryFilter, label: "Compact & City Cars" },
          { id: "sedan" as CategoryFilter, label: "Executive Sedans" },
          { id: "luxury" as CategoryFilter, label: "Prestige & Luxury" },
        ],
        kmLabel: "Unlimited KM",
        perDay: "/ day",
        depositLabel: "Deposit",
        detailsBtn: "Details",
        bookBtn: "Book Now",
        airportBannerTitle: "Direct Delivery at 11 Agencies & Airports in Tunisia",
        airportBannerSubtitle:
          "Tunis-Carthage Airport (24/7), Monastir, Enfidha, Soukra, Hammamet, Sousse, Sfax, Bizerte, Nabeul, Jendouba.",
        callCta: `Call ${settings.phone}`,
      },
      ar: {
        badge: "أسطول 2024-2026 في جميع أنحاء تونس",
        title: "أبرز سياراتنا في تونس",
        subtitle:
          "من سيارات المدينة الرشيقة إلى سيارات الدفع الرباعي الفسيحة. مسافة غير محدودة، تكييف مضمون وتسليم 24/7 في 11 مطاراً ووكالة.",
        exploreLink: "استكشف جميع النماذج",
        categories: [
          { id: "all" as CategoryFilter, label: "الأسطول الكامل" },
          { id: "suv" as CategoryFilter, label: "SUV ودفع رباعي" },
          { id: "compact" as CategoryFilter, label: "سيارات المدينة الاقتصادية" },
          { id: "sedan" as CategoryFilter, label: "السيدان التنفيذية" },
          { id: "luxury" as CategoryFilter, label: "فاخرة وبريستيج" },
        ],
        kmLabel: "مسافة غير محدودة",
        perDay: "/ يوم",
        depositLabel: "الوديعة",
        detailsBtn: "تفاصيل",
        bookBtn: "احجز الآن",
        airportBannerTitle: "تسليم مباشر في 11 وكالة ومطاراً في تونس",
        airportBannerSubtitle:
          "مطار تونس قرطاج (24/7)، المنستير، النفيضة، سكرة، الحمامات، سوسة، صفاقس، بنزرت، نابل، جندوبة.",
        callCta: `اتصل ${settings.phone}`,
      },
    };
    return defs[locale as "fr" | "en" | "ar"] ?? defs.fr;
  }, [locale, settings.phone]);

  const filteredVehicles = useMemo(() => {
    if (activeTab === "all") return allVehicles;
    return allVehicles.filter((v) => v.category === activeTab);
  }, [activeTab, allVehicles]);

  return (
    <section id="fleet" className="py-12 sm:py-20 bg-background relative overflow-hidden">
      {/* Background subtleties */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>{tl.badge}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground font-display">
              {tl.title}
            </h2>
            <p className="mt-3 text-base text-muted-foreground max-w-2xl font-light">
              {tl.subtitle}
            </p>
          </div>

          <Link
            href={`/${locale}/vehicles`}
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors group self-start md:self-auto"
          >
            <span>{tl.exploreLink}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform rtl-flip" />
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {tl.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === cat.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Vehicles Grid */}
        {!loading && (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredVehicles.map((vehicle) => (
                <motion.div
                  key={vehicle.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="charging-card group rounded-2xl bg-card shadow-sm flex flex-col justify-between overflow-hidden relative z-[1]"
                >
                  <div>
                    {/* Image Card Top */}
                    <div className="relative h-48 sm:h-52 w-full bg-slate-900 overflow-hidden">
                      <img
                        src={vehicle.image}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                      {/* Badge top right */}
                      {vehicle.featuredTag && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-600/90 text-white backdrop-blur-md shadow-md uppercase tracking-wider">
                          {vehicle.featuredTag}
                        </div>
                      )}

                      {/* Category bottom left */}
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-white text-[11px] font-semibold backdrop-blur-md">
                          {vehicle.categoryLabel}
                        </span>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {vehicle.brand} {vehicle.model}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{tl.kmLabel}</p>
                      </div>

                      {/* Specs Row */}
                      <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-border/60 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Gauge className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="capitalize truncate">{vehicle.transmission.slice(0, 4)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Fuel className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="capitalize truncate">{vehicle.fuelType}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{vehicle.seats} pl.</span>
                        </div>
                      </div>

                      {/* Features Badges */}
                      <div className="flex flex-wrap gap-1.5">
                        {vehicle.features.slice(0, 3).map((feat, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-muted/70 text-muted-foreground text-[10px] font-medium"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="p-5 pt-0">
                    <div className="pt-3 border-t border-border/60 flex items-baseline justify-between">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-foreground">
                            {vehicle.dailyRate}
                          </span>
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">TND</span>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            (≈ {vehicle.dailyRateEUR} €)
                          </span>
                          <span className="text-[11px] text-muted-foreground">{tl.perDay}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          <span>
                            {tl.depositLabel} : {vehicle.deposit} TND
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <Link
                        href={`/${locale}/vehicles`}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-input hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{tl.detailsBtn}</span>
                      </Link>

                      <Link
                        href={`/${locale}/booking?vehicleId=${vehicle.id}&brand=${encodeURIComponent(
                          vehicle.brand
                        )}&model=${encodeURIComponent(vehicle.model)}`}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{tl.bookBtn}</span>
                      </Link>
                    </div>
                  </div>

                  {/* Smoke / mist rising from card bottom */}
                  <div className="smoke-wrap" aria-hidden="true">
                    <span /><span /><span /><span /><span />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && filteredVehicles.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Loader2 className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {locale === "ar"
                ? "لا توجد سيارات في هذه الفئة حالياً."
                : locale === "en"
                ? "No vehicles available in this category."
                : "Aucun véhicule disponible dans cette catégorie."}
            </p>
          </div>
        )}

        {/* Airport Assistance Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h4 className="text-lg sm:text-xl font-bold flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>{tl.airportBannerTitle}</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-400">{tl.airportBannerSubtitle}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`tel:${settings.phone.replace(/\s+/g, "")}`}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/25"
            >
              {tl.callCta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
