"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  MapPin,
  Calendar,
  Clock,
  ArrowRightLeft,
  Search,
  Sparkles,
  Plane,
  Building,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";

interface LocationOption {
  id: string;
  city: string;
  name: string;
  type: "airport" | "city";
}

const TUNISIA_LOCATIONS: LocationOption[] = [
  { id: "tun-airport", city: "Tunis", name: "1. Aéroport de Tunis-Carthage (TUN)", type: "airport" },
  { id: "mir-airport", city: "Monastir", name: "2. Aéroport de Monastir Habib Bourguiba (MIR)", type: "airport" },
  { id: "soukra-agency", city: "Ariana", name: "3. Agence La Soukra (Siège Social)", type: "city" },
  { id: "bizerte-city", city: "Bizerte", name: "4. Bizerte Ville", type: "city" },
  { id: "nabeul-city", city: "Nabeul", name: "5. Nabeul Ville", type: "city" },
  { id: "grand-tunis", city: "Tunis", name: "6. Grand Tunis (Livraison Hôtels & Domicile)", type: "city" },
  { id: "nbe-airport", city: "Enfidha", name: "7. Aéroport Enfidha-Hammamet (NBE)", type: "airport" },
  { id: "hammamet-city", city: "Hammamet", name: "8. Hammamet Ville & Yasmine Hammamet", type: "city" },
  { id: "sfax-city", city: "Sfax", name: "9. Sfax Ville", type: "city" },
  { id: "sousse-city", city: "Sousse", name: "10. Sousse Ville & Port El Kantaoui", type: "city" },
  { id: "jendouba-city", city: "Jendouba", name: "11. Jendouba Ville & Tabarka", type: "city" },
];

export function BookingSearchBox() {
  const t = useTranslations("booking");
  const locale = useLocale();
  const router = useRouter();

  // Tomorrow as default pickup
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  // 4 days from now as default return (3-day rental)
  const defaultReturn = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split("T")[0];
  }, []);

  const [pickupLocation, setPickupLocation] = useState<string>("tun-airport");
  const [returnLocation, setReturnLocation] = useState<string>("tun-airport");
  const [diffReturnLocation, setDiffReturnLocation] = useState<boolean>(false);
  const [pickupDate, setPickupDate] = useState<string>(tomorrow);
  const [pickupTime, setPickupTime] = useState<string>("10:00");
  const [returnDate, setReturnDate] = useState<string>(defaultReturn);
  const [returnTime, setReturnTime] = useState<string>("10:00");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Calculate rental duration in days
  const rentalDays = useMemo(() => {
    try {
      const p = new Date(`${pickupDate}T${pickupTime}`);
      const r = new Date(`${returnDate}T${returnTime}`);
      const diffMs = r.getTime() - p.getTime();
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 1;
    } catch {
      return 1;
    }
  }, [pickupDate, pickupTime, returnDate, returnTime]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const actualReturnLoc = diffReturnLocation ? returnLocation : pickupLocation;

    const params = new URLSearchParams({
      pickupLocation,
      returnLocation: actualReturnLoc,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
    });

    if (selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }

    router.push(`/vehicles?${params.toString()}`);
  };

  const timeOptions = [
    "00:00", "01:00", "02:00", "03:00", "04:00", "05:00",
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
  ];

  return (
    <div id="booking-search" className="relative z-20 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 -mt-6 sm:-mt-14 mb-12 sm:mb-16">
      <div className="backdrop-blur-xl bg-card/95 dark:bg-neutral-900/95 border border-border/80 dark:border-white/10 shadow-2xl p-4 sm:p-8 rounded-2xl relative overflow-hidden charging-card">
        {/* Subtle decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-amber-400 to-blue-700" />

        {/* Header inside search box */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {t("title") ||
                  (locale === "fr"
                    ? "Réservez votre véhicule en Tunisie"
                    : locale === "ar"
                    ? "احجز سيارتك في تونس"
                    : "Book Your Vehicle in Tunisia")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {locale === "fr"
                  ? "Livraison directe à tous les aéroports et agences en Tunisie"
                  : locale === "ar"
                  ? "تسليم مباشر في جميع مطارات وفروع تونس"
                  : "Direct delivery to any major airport or agency in Tunisia"}
              </p>
            </div>
          </div>

          {/* Duration Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-500 dark:text-amber-300 text-xs font-semibold">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>
              {locale === "fr"
                ? `${rentalDays} jour${rentalDays > 1 ? "s" : ""} de location`
                : locale === "ar"
                ? `${rentalDays} ${rentalDays === 1 ? "يوم" : "أيام"} إيجار`
                : `${rentalDays} ${rentalDays === 1 ? "Day" : "Days"} Rental`}
            </span>
          </div>
        </div>

        {/* Quick category filter tags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none text-xs">
          {[
            {
              id: "all",
              label: locale === "fr" ? "Tous les Véhicules" : locale === "ar" ? "جميع السيارات" : "All Vehicles",
            },
            {
              id: "luxury",
              label: locale === "fr" ? "Berlines Prestige" : locale === "ar" ? "سيدان فاخرة" : "Prestige Sedans",
            },
            {
              id: "suv",
              label: locale === "fr" ? "SUV & 4x4" : locale === "ar" ? "SUV ودفع رباعي" : "Luxury SUVs",
            },
            {
              id: "sport",
              label: locale === "fr" ? "Sport & Coupés" : locale === "ar" ? "رياضية وكوبيه" : "Supercars & Sport",
            },
            {
              id: "compact",
              label: locale === "fr" ? "Citadines Éco" : locale === "ar" ? "سيارات اقتصادية" : "Compact & City",
            },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-amber-400 text-black font-semibold shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Form Grid */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pickup Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>{t("pickupLocation") || "Pickup Location"}</span>
              </label>
              <div className="relative">
                <select
                  value={pickupLocation}
                  onChange={(e) => {
                    setPickupLocation(e.target.value);
                    if (!diffReturnLocation) {
                      setReturnLocation(e.target.value);
                    }
                  }}
                  className="w-full bg-background/80 dark:bg-neutral-800/80 border border-input focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-3.5 py-3 text-sm text-foreground appearance-none cursor-pointer outline-none transition-colors"
                >
                  {TUNISIA_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                  <Plane className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Return Location (or conditional if different) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t("returnLocation") || "Return Location"}</span>
                </label>
              </div>

              {diffReturnLocation ? (
                <div className="relative">
                  <select
                    value={returnLocation}
                    onChange={(e) => setReturnLocation(e.target.value)}
                    className="w-full bg-background/80 dark:bg-neutral-800/80 border border-input focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-3.5 py-3 text-sm text-foreground appearance-none cursor-pointer outline-none transition-colors"
                  >
                    {TUNISIA_LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <Plane className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setDiffReturnLocation(true)}
                  className="w-full bg-muted/40 border border-dashed border-input rounded-xl px-3.5 py-3 text-sm text-muted-foreground flex items-center justify-between cursor-pointer hover:bg-muted/70 transition-colors"
                >
                  <span className="truncate">
                    {locale === "fr"
                      ? "Même lieu que le départ ("
                      : locale === "ar"
                      ? "نفس موقع الاستلام ("
                      : "Same as pickup ("}
                    {TUNISIA_LOCATIONS.find((l) => l.id === pickupLocation)?.city || "Tunis"}
                    )
                  </span>
                  <span className="text-[11px] text-amber-500 font-semibold underline shrink-0 ml-2">
                    {locale === "fr" ? "Modifier" : locale === "ar" ? "تغيير" : "Change"}
                  </span>
                </div>
              )}
            </div>

            {/* Pickup Date & Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {locale === "fr"
                    ? "Date & Heure de Départ"
                    : locale === "ar"
                    ? "تاريخ ووقت الاستلام"
                    : "Pickup Date & Time"}
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                <input
                  type="date"
                  min={tomorrow}
                  value={pickupDate}
                  onChange={(e) => {
                    setPickupDate(e.target.value);
                    if (e.target.value > returnDate) {
                      setReturnDate(e.target.value);
                    }
                  }}
                  className="sm:col-span-3 w-full bg-background/80 dark:bg-neutral-800/80 border border-input focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none transition-colors"
                  required
                />
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="sm:col-span-2 w-full bg-background/80 dark:bg-neutral-800/80 border border-input focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-2 py-2.5 text-sm text-foreground outline-none transition-colors"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Return Date & Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>
                  {locale === "fr"
                    ? "Date & Heure de Retour"
                    : locale === "ar"
                    ? "تاريخ ووقت الإرجاع"
                    : "Return Date & Time"}
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                <input
                  type="date"
                  min={pickupDate}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="sm:col-span-3 w-full bg-background/80 dark:bg-neutral-800/80 border border-input focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none transition-colors"
                  required
                />
                <select
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="sm:col-span-2 w-full bg-background/80 dark:bg-neutral-800/80 border border-input focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-2 py-2.5 text-sm text-foreground outline-none transition-colors"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Different Return Checkbox & Big Search Button */}
          <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Different return location checkbox */}
            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-muted-foreground hover:text-foreground transition-colors">
              <input
                type="checkbox"
                checked={diffReturnLocation}
                onChange={(e) => setDiffReturnLocation(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-input cursor-pointer"
              />
              <span className="font-medium">
                {locale === "fr"
                  ? "Restituer dans une autre agence ou un autre aéroport"
                  : locale === "ar"
                  ? "إرجاع السيارة في موقع أو مطار مختلف"
                  : "Return to a different location / airport"}
              </span>
            </label>

            {/* Action CTA Button */}
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-amber-500 hover:from-blue-700 hover:to-amber-600 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Search className="w-4 h-4" />
              <span>
                {t("search") ||
                  (locale === "fr"
                    ? "Rechercher les Véhicules Disponibles"
                    : locale === "ar"
                    ? "البحث عن السيارات المتاحة"
                    : "Search Available Vehicles")}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
