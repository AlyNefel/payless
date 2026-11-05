"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  Search, SlidersHorizontal, Fuel, Users, Gauge, Car,
  X, CheckCircle, MapPin, Sparkles, Shield, Eye, Calendar,
  Check, ArrowRight, ExternalLink
} from "lucide-react";
import { CarSpinner } from "@/components/ui/CarSpinner";

interface Vehicle {
  _id: string;
  brand: string;
  model: string;
  year: number;
  categoryId?: { _id: string; name: { fr: string; en: string; ar: string }; slug: string };
  transmission: string;
  fuelType: string;
  seats: number;
  luggageCapacity?: number;
  doors?: number;
  images: { url: string; isPrimary?: boolean }[];
  status: string;
  pricing: { daily: number; currency: string; deposit?: number };
  deposit?: number;
  features?: string[];
  hasAirConditioning?: boolean;
  hasGPS?: boolean;
  hasBluetooth?: boolean;
  hasUSB?: boolean;
  totalUnits?: number;
  availableUnits?: number;
  description?: { fr: string; en: string; ar: string };
}

const TRANSMISSIONS = ["automatic", "manual"];
const FUELS = ["gasoline", "diesel", "electric", "hybrid"];
const SEATS_OPTIONS = [2, 4, 5, 7];

const fuelEmoji: Record<string, string> = {
  gasoline: "⛽", diesel: "🛢️", electric: "⚡", hybrid: "🔋"
};

function VehiclesContent() {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [modalVehicle, setModalVehicle] = useState<Vehicle | null>(null);
  const [modalActiveImage, setModalActiveImage] = useState(0);

  const [search, setSearch] = useState("");
  const [transmission, setTransmission] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [seats, setSeats] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState(300);
  const [sortBy, setSortBy] = useState("price_asc");

  const pickupDate = searchParams.get("pickupDate") || "";
  const returnDate = searchParams.get("returnDate") || "";

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (transmission) params.set("transmission", transmission);
      if (fuelType) params.set("fuelType", fuelType);
      if (seats) params.set("seats", String(seats));
      if (maxPrice < 300) params.set("maxPrice", String(maxPrice * 100));
      if (pickupDate) params.set("pickupDate", pickupDate);
      if (returnDate) params.set("returnDate", returnDate);
      params.set("sort", sortBy);
      params.set("limit", "50");

      const res = await fetch(`/api/vehicles?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const list = data.vehicles || data.data || [];
      const count = data.total ?? data.pagination?.total ?? list.length;
      setVehicles(list);
      setTotalCount(count);
    } catch {
      setVehicles([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [search, transmission, fuelType, seats, maxPrice, sortBy, pickupDate, returnDate]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const clearFilters = () => {
    setSearch(""); setTransmission(""); setFuelType("");
    setSeats(""); setMaxPrice(300); setSortBy("price_asc");
  };

  const hasActiveFilters = !!(search || transmission || fuelType || seats || maxPrice < 300);

  const getCategoryName = (categoryId?: Vehicle["categoryId"]) => {
    if (!categoryId?.name) return "Véhicule";
    return categoryId.name[locale as "fr" | "en" | "ar"] || categoryId.name.fr || "Véhicule";
  };

  const getTransmissionLabel = (t_val: string) => {
    if (locale === "fr") return t_val === "automatic" ? "Automatique" : "Manuelle";
    if (locale === "ar") return t_val === "automatic" ? "أوتوماتيك" : "يدوي";
    return t_val === "automatic" ? "Automatic" : "Manual";
  };

  const getFuelLabel = (f: string) => {
    const labels: Record<string, Record<string, string>> = {
      gasoline: { fr: "Essence", en: "Gasoline", ar: "بنزين" },
      diesel: { fr: "Diesel", en: "Diesel", ar: "ديزل" },
      electric: { fr: "Électrique", en: "Electric", ar: "كهربائي" },
      hybrid: { fr: "Hybride", en: "Hybrid", ar: "هجين" },
    };
    return labels[f]?.[locale] || f;
  };

  const getDailyTND = (v: Vehicle) => {
    const raw = v.pricing?.daily || 8000;
    return raw > 1000 ? Math.round(raw / 100) : raw;
  };

  const getDepositTND = (v: Vehicle) => {
    const raw = v.pricing?.deposit || v.deposit || 80000;
    return raw > 1000 ? Math.round(raw / 100) : raw;
  };

  const getVehicleImages = (v: Vehicle) => {
    if (!v.images || !v.images.length) {
      return ["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80"];
    }
    return v.images.map(img => (typeof img === "string" ? img : img.url));
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-neutral-950">
      {/* Hero Banner */}
      <div className="relative bg-[#0A0A0B] py-20 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0B]/60 to-[#0A0A0B]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-4 backdrop-blur-md"
          >
            <MapPin className="w-3.5 h-3.5" /> 11 agences & aéroports en Tunisie
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4"
          >
            {locale === "fr" ? "Nos Voitures Disponibles" : locale === "ar" ? "سياراتنا المتاحة" : "Our Available Cars"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto"
          >
            {locale === "fr"
              ? "Flotte moderne 2024-2026 garantie. Réservation en ligne instantanée sans frais cachés."
              : locale === "ar"
              ? "أسطول حديث ومضمون 2024-2026. حجز فوري عبر الإنترنت بدون أي رسوم خفية."
              : "Modern 2024-2026 verified fleet. Instant online booking with zero hidden charges."}
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={locale === "fr" ? "Rechercher Clio, Sportage, MG ZS, Swift..." : locale === "ar" ? "ابحث عن كليو، سبورتاج، إم جي..." : "Search Clio, Sportage, MG ZS, Swift..."}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white dark:bg-neutral-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors text-sm font-medium ${
              hasActiveFilters ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300" : "border-border bg-white dark:bg-neutral-800 dark:text-white"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t("vehicles.filter")}
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />}
          </button>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-4 py-3 rounded-xl border border-border bg-white dark:bg-neutral-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
          >
            <option value="price_asc">{t("vehicles.priceAsc")}</option>
            <option value="price_desc">{t("vehicles.priceDesc")}</option>
            <option value="newest">{t("vehicles.newest")}</option>
          </select>
        </div>

        {/* Expanded Filters Drawer */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl border border-border shadow-sm p-6 mb-6 overflow-hidden"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">{t("vehicles.transmission")}</label>
                  <div className="flex flex-wrap gap-2">
                    {TRANSMISSIONS.map(tr => (
                      <button key={tr} onClick={() => setTransmission(transmission === tr ? "" : tr)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${transmission === tr ? "bg-amber-500 text-white border-amber-500" : "border-border hover:border-amber-300 dark:text-white"}`}>
                        {getTransmissionLabel(tr)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">{t("vehicles.fuel")}</label>
                  <div className="flex flex-wrap gap-2">
                    {FUELS.map(f => (
                      <button key={f} onClick={() => setFuelType(fuelType === f ? "" : f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${fuelType === f ? "bg-amber-500 text-white border-amber-500" : "border-border hover:border-amber-300 dark:text-white"}`}>
                        {fuelEmoji[f]} {getFuelLabel(f)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">{t("vehicles.seats")}</label>
                  <div className="flex flex-wrap gap-2">
                    {SEATS_OPTIONS.map(s => (
                      <button key={s} onClick={() => setSeats(seats === s ? "" : s)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium border transition-colors ${seats === s ? "bg-amber-500 text-white border-amber-500" : "border-border hover:border-amber-300 dark:text-white"}`}>
                        {s}+
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                    {t("vehicles.priceRange")}: {maxPrice} TND/j
                  </label>
                  <input type="range" min={50} max={300} step={10} value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-amber-500" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>50 TND</span><span>300 TND</span>
                  </div>
                </div>
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-4 flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                  <X className="w-3.5 h-3.5" />
                  {locale === "fr" ? "Effacer les filtres" : locale === "ar" ? "مسح الفلاتر" : "Clear filters"}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted-foreground font-medium">
            {loading
              ? (locale === "fr" ? "Chargement des voitures..." : locale === "ar" ? "جار التحميل..." : "Loading vehicles...")
              : `${totalCount} ${locale === "fr" ? `voiture${totalCount !== 1 ? "s" : ""} disponible${totalCount !== 1 ? "s" : ""}` : locale === "ar" ? "سيارة متاحة" : `car${totalCount !== 1 ? "s" : ""} available`}`
            }
          </p>
          {pickupDate && returnDate && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
              <CheckCircle className="w-3.5 h-3.5" />
              {locale === "fr" ? "Disponibilité vérifiée pour vos dates" : locale === "ar" ? "التوفر مؤكد لتاريخكم" : "Availability verified for your dates"}
            </div>
          )}
        </div>

        {/* Vehicle Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-neutral-800 rounded-2xl border border-border overflow-hidden animate-pulse">
                <div className="h-52 bg-gray-200 dark:bg-neutral-700" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 dark:bg-neutral-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 dark:bg-neutral-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-neutral-900 rounded-3xl border border-border">
            <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              {locale === "fr" ? "Aucune voiture trouvée" : locale === "ar" ? "لم يتم العثور على سيارات" : "No vehicles found"}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {locale === "fr" ? "Modifiez vos critères de recherche ou réinitialisez les filtres." : locale === "ar" ? "عدّل معايير البحث أو أعد ضبط الفلاتر." : "Modify your search criteria or reset filters."}
            </p>
            <button onClick={clearFilters} className="px-6 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors shadow">
              {locale === "fr" ? "Réinitialiser les filtres" : locale === "ar" ? "إعادة ضبط" : "Reset Filters"}
            </button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {vehicles.map((v, idx) => {
                const imgs = getVehicleImages(v);
                const primaryImg = imgs[0];
                const dailyTND = getDailyTND(v);
                const dailyEUR = Math.round(dailyTND / 3.35);
                const depositTND = getDepositTND(v);
                const availableCount = v.availableUnits ?? 3;
                const isAvailable = v.status === "available" && availableCount > 0;

                return (
                  <motion.div
                    key={v._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.03 }}
                    className="bg-white dark:bg-neutral-900 rounded-2xl border border-border/70 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col justify-between charging-card"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative h-52 overflow-hidden bg-gray-100 dark:bg-neutral-800">
                        <Image
                          src={primaryImg}
                          alt={`${v.brand} ${v.model}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized={primaryImg.includes("hmlrentcar") || primaryImg.includes("wpcarrental")}
                        />
                        {/* Status badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          {isAvailable ? (
                            <span className="bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-pulse" />
                              {availableCount} {locale === "ar" ? "متوفرة" : locale === "fr" ? "disponibles" : "available"}
                            </span>
                          ) : (
                            <span className="bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                              {locale === "fr" ? "Complet" : locale === "ar" ? "غير متوفر" : "Sold out"}
                            </span>
                          )}
                        </div>

                        {/* Year pill */}
                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          {v.year || 2024}
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-5">
                        <div className="mb-3">
                          <h3 className="font-extrabold text-foreground text-lg leading-tight group-hover:text-amber-500 transition-colors">
                            {v.brand} {v.model}
                          </h3>
                          <p className="text-muted-foreground text-xs font-medium mt-0.5">
                            {getCategoryName(v.categoryId)}
                          </p>
                        </div>

                        {/* Specifications Pill Badges */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/60 dark:bg-neutral-800 px-2 py-0.5 rounded-md font-medium">
                            <Gauge className="w-3 h-3" />
                            {getTransmissionLabel(v.transmission)}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/60 dark:bg-neutral-800 px-2 py-0.5 rounded-md font-medium">
                            <Fuel className="w-3 h-3" />
                            {getFuelLabel(v.fuelType)}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/60 dark:bg-neutral-800 px-2 py-0.5 rounded-md font-medium">
                            <Users className="w-3 h-3" />
                            {v.seats} {locale === "ar" ? "مقاعد" : locale === "en" ? "seats" : "places"}
                          </span>
                          <span className="text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md font-medium">
                            ❄️ {locale === "ar" ? "مكيّف" : "A/C"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Pricing & Actions */}
                    <div className="p-5 pt-0">
                      <div className="flex items-end justify-between border-t border-border/60 pt-4">
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-foreground">{dailyTND}</span>
                            <span className="text-muted-foreground text-xs font-bold uppercase">
                              TND / {locale === "ar" ? "يوم" : locale === "en" ? "day" : "jour"}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            ≈ {dailyEUR} € · {locale === "ar" ? "الوديعة:" : locale === "en" ? "Deposit:" : "Caution:"} {depositTND} TND
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setModalVehicle(v);
                              setModalActiveImage(0);
                            }}
                            className="px-3 py-2 text-xs font-bold border border-border dark:border-neutral-700 rounded-xl hover:bg-muted dark:hover:bg-neutral-800 transition-colors flex items-center gap-1 text-foreground"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-500" />
                            <span>{locale === "fr" ? "Détails" : locale === "ar" ? "تفاصيل" : "Details"}</span>
                          </button>

                          <Link
                            href={`/booking?vehicleId=${v._id}${pickupDate ? `&pickupDate=${pickupDate}` : ""}${returnDate ? `&returnDate=${returnDate}` : ""}`}
                            className="px-4 py-2 text-xs font-bold rounded-xl text-black shadow-md hover:shadow-amber-500/20 hover:scale-102 transition-all"
                            style={{ background: "linear-gradient(135deg, #d4af37, #f5c842)" }}
                          >
                            {locale === "fr" ? "Réserver" : locale === "ar" ? "احجز" : "Book"}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* QUICK DETAILS MODAL */}
      <AnimatePresence>
        {modalVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-border max-h-[90vh] flex flex-col"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setModalVehicle(null)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-6">
                {/* Main Large Image */}
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-neutral-800 shadow-inner">
                  <Image
                    src={getVehicleImages(modalVehicle)[modalActiveImage] || getVehicleImages(modalVehicle)[0]}
                    alt={`${modalVehicle.brand} ${modalVehicle.model}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    ✓ {modalVehicle.availableUnits ?? 3}{" "}
                    {locale === "ar"
                      ? "سيارات متوفرة في الأسطول"
                      : locale === "en"
                      ? "cars available in fleet"
                      : "véhicules disponibles dans le parc"}
                  </div>
                </div>

                {/* Thumbnails */}
                {getVehicleImages(modalVehicle).length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {getVehicleImages(modalVehicle).map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setModalActiveImage(i)}
                        className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                          modalActiveImage === i ? "border-amber-400 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <Image src={img} alt="Thumb" fill className="object-cover" unoptimized />
                      </button>
                    ))}
                  </div>
                )}

                {/* Title & Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
                      {getCategoryName(modalVehicle.categoryId)}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                      {modalVehicle.brand} {modalVehicle.model}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {locale === "en"
                        ? `Model year ${modalVehicle.year || 2024} · Unlimited mileage included · 24/7 Roadside Assistance in Tunisia`
                        : locale === "ar"
                        ? `سنة الموديل ${modalVehicle.year || 2024} · مسافة غير محدودة مشمولة · مساعدة على الطريق 24/7 في تونس`
                        : `Année modèle ${modalVehicle.year || 2024} · Kilométrage illimité inclus · Assistance 24/7 en Tunisie`}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-3xl font-black text-foreground">
                      {getDailyTND(modalVehicle)}{" "}
                      <span className="text-sm font-bold text-muted-foreground">
                        TND / {locale === "ar" ? "يوم" : locale === "en" ? "day" : "jour"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ≈ {Math.round(getDailyTND(modalVehicle) / 3.35)} € / {locale === "ar" ? "يوم" : locale === "en" ? "day" : "jour"} ·{" "}
                      {locale === "ar" ? "الوديعة:" : locale === "en" ? "Deposit:" : "Caution:"} {getDepositTND(modalVehicle)} TND
                    </p>
                  </div>
                </div>

                {/* Key Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-muted/40 dark:bg-neutral-800 border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">
                      {locale === "ar" ? "ناقل الحركة" : locale === "en" ? "Transmission" : "Boîte de vitesses"}
                    </p>
                    <p className="text-sm font-bold text-foreground mt-0.5 flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-amber-500" />
                      {getTransmissionLabel(modalVehicle.transmission)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 dark:bg-neutral-800 border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">
                      {locale === "ar" ? "الوقود" : locale === "en" ? "Fuel" : "Carburant"}
                    </p>
                    <p className="text-sm font-bold text-foreground mt-0.5 flex items-center gap-1.5">
                      <Fuel className="w-4 h-4 text-amber-500" />
                      {getFuelLabel(modalVehicle.fuelType)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 dark:bg-neutral-800 border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">
                      {locale === "ar" ? "السعة" : locale === "en" ? "Capacity" : "Capacité"}
                    </p>
                    <p className="text-sm font-bold text-foreground mt-0.5 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-500" />
                      {modalVehicle.seats} {locale === "ar" ? "مقاعد" : locale === "en" ? "seats" : "places"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 dark:bg-neutral-800 border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">
                      {locale === "ar" ? "الوديعة" : locale === "en" ? "Deposit" : "Caution"}
                    </p>
                    <p className="text-sm font-bold text-foreground mt-0.5 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      {getDepositTND(modalVehicle)} TND
                    </p>
                  </div>
                </div>

                {/* Features list */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    {locale === "en" ? "Equipment & Inclusions" : locale === "ar" ? "المعدات والمزايا المشمولة" : "Équipements & Inclusions"}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      locale === "en" ? "Automatic A/C climate control" : locale === "ar" ? "تكييف هواء أوتوماتيكي" : "Climatisation automatique A/C",
                      locale === "en" ? "24/7 dedicated roadside assistance across Tunisia" : locale === "ar" ? "مساعدة على الطريق 24/7 في كافة أنحاء تونس" : "Assistance routière 24h/24 partout en Tunisie",
                      locale === "en" ? "100% Unlimited mileage" : locale === "ar" ? "مسافة 100% غير محدودة" : "Kilométrage 100% illimité",
                      locale === "en" ? "Complimentary child / baby seat on request (0 TND)" : locale === "ar" ? "مقعد طفل / رضيع مجاني عند الطلب (0 د.ت)" : "Siège bébé / enfant offert sur demande (0 TND)",
                      locale === "en" ? "Free 2nd driver included (0 TND)" : locale === "ar" ? "سائق إضافي ثانٍ مجاناً (0 د.ت)" : "Second conducteur offert gratuitement (0 TND)",
                      locale === "en" ? "Zero counter queues & fast airport terminal delivery" : locale === "ar" ? "تسليم سريع بالمطار بدون طوابير" : "Prise en charge aéroport sans file d'attente",
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 sm:p-6 bg-gray-50 dark:bg-neutral-800/60 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                <Link
                  href={`/vehicles/${modalVehicle._id}`}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <span>
                    {locale === "fr"
                      ? "Voir la page détaillée complète"
                      : locale === "ar"
                      ? "عرض صفحة التفاصيل الكاملة"
                      : "View full detail page"}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 rtl-flip" />
                </Link>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setModalVehicle(null)}
                    className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors"
                  >
                    {locale === "fr" ? "Fermer" : locale === "ar" ? "إغلاق" : "Close"}
                  </button>
                  <Link
                    href={`/booking?vehicleId=${modalVehicle._id}${pickupDate ? `&pickupDate=${pickupDate}` : ""}${returnDate ? `&returnDate=${returnDate}` : ""}`}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-black font-bold text-sm shadow-lg hover:shadow-amber-500/30 transition-all hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg, #d4af37, #f5c842)" }}
                  >
                    <span>{locale === "fr" ? "Réserver ce véhicule" : locale === "ar" ? "احجز هذه السيارة" : "Book This Car"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAF9] dark:bg-neutral-950 flex items-center justify-center">
          <CarSpinner size="xl" label="Chargement du catalogue Payless Tunisie..." />
        </div>
      }
    >
      <VehiclesContent />
    </Suspense>
  );
}
