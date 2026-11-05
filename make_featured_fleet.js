const fs = require('fs');

const fleet = JSON.parse(fs.readFileSync('payless-car-rental/compiled_fleet.json', 'utf8'));

// Pick 8 premier showcase vehicles
const showcaseSlugs = [
  'kia-sportage',
  'mg-zs-bva',
  'seat-leon-bva',
  'vw-t-cross-bva',
  'seat-ibiza-bva-excellence',
  'renault-clio-6-bvm',
  'vw-virtus-bva',
  'suzuki-swift-bva'
];

const selectedFleet = fleet.filter(f => showcaseSlugs.includes(f.slug));

const fleetJsArray = selectedFleet.map(c => {
  let cat = "compact";
  let catLabel = "Compacte & Citadine";
  if (c.category === "SUV") {
    cat = "suv";
    catLabel = "SUV & Crossover";
  } else if (c.category === "Luxury" || c.name.includes("Sportage") || c.name.includes("Leon")) {
    cat = "luxury";
    catLabel = "Prestige & SUV";
  } else if (c.name.includes("Virtus")) {
    cat = "sedan";
    catLabel = "Berline Routière";
  }

  return `  {
    id: "${c.id}",
    brand: "${c.brand}",
    model: "${c.model}",
    year: 2024,
    category: "${cat}",
    categoryLabel: "${catLabel}",
    image: "${c.mainImage}",
    dailyRate: ${c.dailyPriceTND},
    dailyRateEUR: ${c.dailyPriceEUR},
    deposit: ${c.depositTND},
    transmission: "${c.transmission === 'automatic' ? 'Automatic' : 'Manual'}",
    fuelType: "${c.fuelType === 'diesel' ? 'Diesel' : 'Gasoline'}",
    seats: ${c.seats},
    luggage: ${c.luggage},
    featuredTag: "${c.name.includes('Sportage') ? 'Grand SUV N°1' : c.name.includes('Clio') ? 'Top Location Vacances' : c.name.includes('Excellence') ? 'Série Exclusive' : 'Disponible 24/7'}",
    features: ["Clim A/C", "Kilométrage Illimité", "Bluetooth Audio", "Zéro Caution Possible"],
  }`;
}).join(',\n');

const fullFile = `"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Briefcase,
  Gauge,
  Fuel,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Eye,
} from "lucide-react";

interface FleetVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: "luxury" | "suv" | "sedan" | "compact";
  categoryLabel: string;
  image: string;
  dailyRate: number; // in TND
  dailyRateEUR: number; // in EUR
  deposit: number;
  transmission: "Automatic" | "Manual";
  fuelType: "Gasoline" | "Diesel";
  seats: number;
  luggage: number;
  featuredTag?: string;
  features: string[];
}

const FLEET_DATA: FleetVehicle[] = [
${fleetJsArray}
];

type CategoryFilter = "all" | "luxury" | "suv" | "sedan" | "compact";

export function FeaturedFleet() {
  const t = useTranslations("home");
  const bookingT = useTranslations("booking");
  const locale = useLocale();

  const [activeTab, setActiveTab] = useState<CategoryFilter>("all");

  const categories: { id: CategoryFilter; label: string }[] = [
    { id: "all", label: "Toute la Flotte (25 Modèles)" },
    { id: "suv", label: "SUV & Crossovers" },
    { id: "compact", label: "Citadines Économiques" },
    { id: "sedan", label: "Berlines Exécutives" },
    { id: "luxury", label: "Prestige & Haut de Gamme" },
  ];

  const filteredVehicles = useMemo(() => {
    if (activeTab === "all") return FLEET_DATA;
    return FLEET_DATA.filter((v) => v.category === activeTab);
  }, [activeTab]);

  return (
    <section id="fleet" className="py-20 bg-background relative overflow-hidden">
      {/* Background subtleties */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Flotte Récente 2024-2026 en Tunisie</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground font-display">
              Nos Véhicules Stars en Tunisie
            </h2>
            <p className="mt-3 text-base text-muted-foreground max-w-2xl font-light">
              Des citadines nerveuses aux grands SUV familiaux. Kilométrage illimité, climatisation garantie et livraison 24/7 dans 11 aéroports et agences.
            </p>
          </div>

          <Link
            href={\`/\${locale}/vehicles\`}
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors group self-start md:self-auto"
          >
            <span>Explorer les 25 Modèles</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform rtl-flip" />
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={\`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 \${
                activeTab === cat.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }\`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Vehicles Grid */}
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
                className="group rounded-2xl bg-card border border-border/70 hover:border-blue-500/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Image Card Top */}
                  <div className="relative h-48 sm:h-52 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={vehicle.image}
                      alt={\`\${vehicle.brand} \${vehicle.model}\`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Année {vehicle.year} • Illimité KM
                      </p>
                    </div>

                    {/* Specs Row */}
                    <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-border/60 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="capitalize">{vehicle.transmission.slice(0, 4)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Fuel className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="capitalize">{vehicle.fuelType}</span>
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
                        <span className="text-[11px] text-muted-foreground">/ jour</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>Caution : {vehicle.deposit} TND</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Link
                      href={\`/\${locale}/vehicles\`}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-input hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Détails</span>
                    </Link>

                    <Link
                      href={\`/\${locale}/booking?vehicleId=\${vehicle.id}&brand=\${encodeURIComponent(
                        vehicle.brand
                      )}&model=\${encodeURIComponent(vehicle.model)}\`}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Réserver</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Airport Assistance Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h4 className="text-lg sm:text-xl font-bold flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Livraison Directe dans 11 Agences & Aéroports en Tunisie</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-400">
              Aéroports Tunis-Carthage (24/7), Monastir, Enfidha, Soukra, Hammamet, Sousse, Sfax, Bizerte, Nabeul, Jendouba.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:+21625120130"
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/25"
            >
              Appeler +216 25 120 130
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
`;

fs.writeFileSync('payless-car-rental/src/components/home/FeaturedFleet.tsx', fullFile, 'utf8');
console.log('Successfully updated FeaturedFleet.tsx with real Tunisian fleet and TND/EUR pricing!');

