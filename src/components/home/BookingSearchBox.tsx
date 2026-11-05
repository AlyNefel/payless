"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  MapPin,
  Calendar,
  Clock,
  Search,
  Sparkles,
  Plane,
  CalendarDays,
  ChevronDown,
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
    <div id="booking-search" className="relative z-20 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-6 sm:-mt-14 mb-12 sm:mb-16">
      <div className="backdrop-blur-xl bg-card/95 dark:bg-neutral-900/95 border border-border/80 dark:border-white/10 shadow-2xl p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden charging-card w-full">
        {/* Subtle decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-amber-400 to-blue-700" />

        {/* Header inside search box */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-border/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-foreground truncate">
                {t("title") ||
                  (locale === "fr"
                    ? "Réservez votre véhicule en Tunisie"
                    : locale === "ar"
                    ? "احجز سيارتك في تونس"
                    : "Book Your Vehicle in Tunisia")}
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                {locale === "fr"
                  ? "Livraison directe à tous les aéroports et agences en Tunisie"
                  : locale === "ar"
                  ? "تسليم مباشر في جميع مطارات وفروع تونس"
                  : "Direct delivery to any major airport or agency in Tunisia"}
              </p>
            </div>
          </div>

          {/* Duration Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-500 dark:text-amber-300 text-xs font-semibold shrink-0">
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
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none text-xs -mx-1 px-1">
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
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all shrink-0 active:scale-95 ${
                selectedCategory === cat.id
                  ? "bg-amber-400 text-black font-semibold shadow-xs"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Form Grid */}
        <form onSubmit={handleSearch} className="space-y-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
            {/* Pickup Location */}
            <div className="space-y-1.5 w-full min-w-0">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{t("pickupLocation") || "Pickup Location"}</span>
              </label>
              <div className="relative w-full min-w-0">
                <select
                  value={pickupLocation}
                  onChange={(e) => {
                    setPickupLocation(e.target.value);
                    if (!diffReturnLocation) {
                      setReturnLocation(e.target.value);
                    }
                  }}
                  className="w-full min-w-0 bg-background dark:bg-neutral-800 border border-input focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-3.5 pr-10 rtl:pr-3.5 rtl:pl-10 h-11 text-xs sm:text-sm text-foreground appearance-none cursor-pointer outline-none transition-colors truncate"
                >
                  {TUNISIA_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 rtl:right-auto rtl:left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                  <Plane className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Return Location (or toggle button) */}
            <div className="space-y-1.5 w-full min-w-0">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">{t("returnLocation") || "Return Location"}</span>
                </label>
              </div>

              {diffReturnLocation ? (
                <div className="relative w-full min-w-0">
                  <select
                    value={returnLocation}
                    onChange={(e) => setReturnLocation(e.target.value)}
                    className="w-full min-w-0 bg-background dark:bg-neutral-800 border border-input focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-3.5 pr-10 rtl:pr-3.5 rtl:pl-10 h-11 text-xs sm:text-sm text-foreground appearance-none cursor-pointer outline-none transition-colors truncate"
                  >
                    {TUNISIA_LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 rtl:right-auto rtl:left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <Plane className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setDiffReturnLocation(true)}
                  className="w-full min-w-0 bg-muted/40 border border-dashed border-input rounded-xl px-3.5 h-11 text-xs sm:text-sm text-muted-foreground flex items-center justify-between cursor-pointer hover:bg-muted/70 active:bg-muted transition-colors text-left rtl:text-right"
                >
                  <span className="truncate flex-1 pr-2 rtl:pr-0 rtl:pl-2">
                    {locale === "fr"
                      ? "Même lieu ("
                      : locale === "ar"
                      ? "نفس الموقع ("
                      : "Same location ("}
                    {TUNISIA_LOCATIONS.find((l) => l.id === pickupLocation)?.city || "Tunis"}
                    )
                  </span>
                  <span className="text-[11px] text-amber-500 font-bold shrink-0">
                    {locale === "fr" ? "Modifier" : locale === "ar" ? "تغيير" : "Change"}
                  </span>
                </button>
              )}
            </div>

            {/* Pickup Date & Time */}
            <div className="space-y-1.5 w-full min-w-0">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">
                  {locale === "fr"
                    ? "Départ (Date & Heure)"
                    : locale === "ar"
                    ? "تاريخ ووقت الاستلام"
                    : "Pickup (Date & Time)"}
                </span>
              </label>
              <div className="grid grid-cols-5 gap-2 w-full min-w-0">
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
                  className="col-span-3 w-full min-w-0 bg-background dark:bg-neutral-800 border border-input focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-3 h-11 text-xs sm:text-sm text-foreground outline-none transition-colors"
                  required
                />
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="col-span-2 w-full min-w-0 bg-background dark:bg-neutral-800 border border-input focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-2 h-11 text-xs sm:text-sm text-foreground outline-none transition-colors"
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
            <div className="space-y-1.5 w-full min-w-0">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">
                  {locale === "fr"
                    ? "Retour (Date & Heure)"
                    : locale === "ar"
                    ? "تاريخ ووقت الإرجاع"
                    : "Return (Date & Time)"}
                </span>
              </label>
              <div className="grid grid-cols-5 gap-2 w-full min-w-0">
                <input
                  type="date"
                  min={pickupDate}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="col-span-3 w-full min-w-0 bg-background dark:bg-neutral-800 border border-input focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-3 h-11 text-xs sm:text-sm text-foreground outline-none transition-colors"
                  required
                />
                <select
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="col-span-2 w-full min-w-0 bg-background dark:bg-neutral-800 border border-input focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-2 h-11 text-xs sm:text-sm text-foreground outline-none transition-colors"
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
          <div className="pt-2 sm:pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 w-full">
            {/* Different return location checkbox */}
            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
              <input
                type="checkbox"
                checked={diffReturnLocation}
                onChange={(e) => setDiffReturnLocation(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-input cursor-pointer shrink-0"
              />
              <span className="font-medium text-xs leading-tight">
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
              className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2.5 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-[#1D4ED8] hover:from-blue-700 hover:to-blue-800 text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all cursor-pointer shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>
                {t("search") ||
                  (locale === "fr"
                    ? "Rechercher les Véhicules"
                    : locale === "ar"
                    ? "البحث عن السيارات"
                    : "Search Available Vehicles")}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingSearchBox;