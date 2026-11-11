"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Car,
  Filter,
  Search,
  RefreshCw,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  SlidersHorizontal,
  Sparkles,
  Info,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAdminLang } from "@/contexts/AdminLangContext";
import { CarSpinner } from "@/components/ui/CarSpinner";

interface VehicleItem {
  _id: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  category?: string;
  status?: string;
  images?: { url: string; isPrimary: boolean }[];
  pricing?: { daily: number };
}

interface BookingEvent {
  id: string;
  _id: string;
  reference: string;
  status: string;
  paymentStatus?: string;
  vehicleId: string;
  vehicleName: string;
  licensePlate?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  pickupDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  rentalDuration?: number;
  pickupLocation?: string;
  returnLocation?: string;
  totalAmount?: number;
  currency?: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  confirmed: {
    bg: "bg-blue-600 hover:bg-blue-500",
    text: "text-white",
    border: "border-blue-700",
    badge: "bg-blue-500 text-white",
  },
  active: {
    bg: "bg-emerald-600 hover:bg-emerald-500",
    text: "text-white",
    border: "border-emerald-700",
    badge: "bg-emerald-500 text-white",
  },
  in_progress: {
    bg: "bg-emerald-600 hover:bg-emerald-500",
    text: "text-white",
    border: "border-emerald-700",
    badge: "bg-emerald-500 text-white",
  },
  pending: {
    bg: "bg-amber-500 hover:bg-amber-400",
    text: "text-slate-950",
    border: "border-amber-600",
    badge: "bg-amber-400 text-slate-900 font-bold",
  },
  completed: {
    bg: "bg-indigo-600 hover:bg-indigo-500",
    text: "text-white",
    border: "border-indigo-700",
    badge: "bg-indigo-500 text-white",
  },
  cancelled: {
    bg: "bg-rose-600/80 hover:bg-rose-600",
    text: "text-white line-through opacity-75",
    border: "border-rose-700",
    badge: "bg-rose-500 text-white",
  },
  maintenance: {
    bg: "bg-orange-600 hover:bg-orange-500",
    text: "text-white",
    border: "border-orange-700",
    badge: "bg-orange-500 text-white",
  },
};

export default function CalendarPage() {
  const { lang } = useAdminLang();
  const isEn = lang === "en";

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [bookings, setBookings] = useState<BookingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingEvent | null>(null);

  const timelineContainerRef = useRef<HTMLDivElement>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleDateString(isEn ? "en-US" : "fr-FR", {
    month: "long",
    year: "numeric",
  });

  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  // Today indicator
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDay = today.getDate();

  // Fetch real vehicles & bookings from API
  const loadData = async () => {
    setLoading(true);
    try {
      const [vehRes, bookRes] = await Promise.all([
        fetch("/api/vehicles?limit=100").then((r) => r.json()),
        fetch("/api/admin/bookings?limit=300").then((r) => r.json()),
      ]);

      if (vehRes.success && Array.isArray(vehRes.vehicles)) {
        setVehicles(vehRes.vehicles);
      }
      if (bookRes.success && Array.isArray(bookRes.bookings)) {
        setBookings(bookRes.bookings);
      }
    } catch (err) {
      console.error("Failed to load calendar data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter vehicles by search
  const filteredVehicles = useMemo(() => {
    if (!search.trim()) return vehicles;
    const q = search.toLowerCase();
    return vehicles.filter(
      (v) =>
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.licensePlate?.toLowerCase().includes(q)
    );
  }, [vehicles, search]);

  // Month navigation
  const prevMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Scroll to current day on load or month change
  useEffect(() => {
    if (isCurrentMonth && timelineContainerRef.current) {
      const dayWidth = 42;
      const scrollPos = Math.max(0, (todayDay - 3) * dayWidth);
      timelineContainerRef.current.scrollTo({ left: scrollPos, behavior: "smooth" });
    }
  }, [isCurrentMonth, todayDay, month]);

  // Compute stats for current month
  const monthStats = useMemo(() => {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month, daysInMonth, 23, 59, 59);

    const activeInMonth = bookings.filter((b) => {
      if (!b.pickupDate || !b.returnDate) return false;
      const p = new Date(b.pickupDate);
      const r = new Date(b.returnDate);
      return p <= monthEnd && r >= monthStart;
    });

    const confirmedCount = activeInMonth.filter((b) => b.status === "confirmed").length;
    const ongoingCount = activeInMonth.filter((b) => b.status === "active" || b.status === "in_progress").length;
    const pendingCount = activeInMonth.filter((b) => b.status === "pending").length;

    return {
      total: activeInMonth.length,
      confirmed: confirmedCount,
      ongoing: ongoingCount,
      pending: pendingCount,
    };
  }, [bookings, year, month, daysInMonth]);

  // Helper to extract and lay out bookings for a given vehicle without overlap
  const getBookingsForVehicle = (vehicle: VehicleItem) => {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month, daysInMonth, 23, 59, 59);

    const filtered = bookings.filter((b) => {
      // Exclude cancelled or rejected reservations from calendar (user requirement)
      if (b.status === "cancelled" || b.status === "rejected") return false;

      // Status filter
      if (statusFilter !== "all" && b.status !== statusFilter) return false;

      // Match vehicle by ID or Brand+Model
      const matchId =
        b.vehicleId &&
        (b.vehicleId === vehicle._id ||
          (typeof b.vehicleId === "object" && (b.vehicleId as any)._id === vehicle._id));
      const matchName =
        b.vehicleName &&
        b.vehicleName.toLowerCase().includes(vehicle.brand.toLowerCase()) &&
        b.vehicleName.toLowerCase().includes(vehicle.model.toLowerCase());

      if (!matchId && !matchName) return false;

      if (!b.pickupDate || !b.returnDate) return false;
      const p = new Date(b.pickupDate);
      const r = new Date(b.returnDate);

      // Check overlap with current month
      return p <= monthEnd && r >= monthStart;
    });

    // Sort chronologically
    const sorted = [...filtered].sort(
      (a, b) => new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime()
    );

    // Multi-track allocation: prevents overlapping bookings on the same day from stacking on top of each other
    const trackEndTimes: number[] = [];
    const bookingsWithTrack = sorted.map((b) => {
      const pTime = new Date(b.pickupDate).getTime();
      const rTime = new Date(b.returnDate).getTime();

      let assignedTrack = -1;
      for (let i = 0; i < trackEndTimes.length; i++) {
        // If track i is free before this booking starts
        if (trackEndTimes[i] < pTime) {
          assignedTrack = i;
          trackEndTimes[i] = rTime;
          break;
        }
      }
      if (assignedTrack === -1) {
        assignedTrack = trackEndTimes.length;
        trackEndTimes.push(rTime);
      }

      return { ...b, trackIndex: assignedTrack };
    });

    const totalTracks = Math.max(1, trackEndTimes.length);
    return { list: bookingsWithTrack, totalTracks };
  };

  const DAY_WIDTH = 44; // px per day cell

  return (
    <div className="space-y-6 max-w-full pb-12">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isEn ? "Fleet Availability Timeline" : "Calendrier de Disponibilité"}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isEn
                  ? "Live Gantt availability view synced with active MongoDB reservations."
                  : "Vue timeline interactive et synchronisée en temps réel avec la base de données."}
              </p>
            </div>
          </div>
        </div>

        {/* Month selector & actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Today button */}
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
          >
            {isEn ? "Today" : "Aujourd'hui"}
          </button>

          {/* Month Stepper */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
              title={isEn ? "Previous Month" : "Mois précédent"}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs sm:text-sm font-bold capitalize text-slate-900 dark:text-white min-w-[130px] text-center">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
              title={isEn ? "Next Month" : "Mois suivant"}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh button */}
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title={isEn ? "Reload data" : "Actualiser"}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* MONTH STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold uppercase text-slate-400">
            {isEn ? "Total Bookings in Month" : "Réservations ce mois"}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {monthStats.total}
            </span>
            <span className="text-xs text-slate-500">
              {isEn ? "rentals" : "locations"}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">
            {isEn ? "Active / In Progress" : "En cours (sur route)"}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {monthStats.ongoing}
            </span>
            <span className="text-xs text-slate-500">{isEn ? "cars out" : "voitures"}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold uppercase text-blue-600 dark:text-blue-400">
            {isEn ? "Confirmed Upcoming" : "Confirmées à venir"}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {monthStats.confirmed}
            </span>
            <span className="text-xs text-slate-500">{isEn ? "booked" : "planifiées"}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold uppercase text-amber-600 dark:text-amber-400">
            {isEn ? "Pending Confirmation" : "En attente validation"}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {monthStats.pending}
            </span>
            <span className="text-xs text-slate-500">{isEn ? "pending" : "demandes"}</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search vehicle */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isEn ? "Filter vehicle name or plate..." : "Filtrer par modèle ou matricule..."
            }
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white shadow-sm"
          />
        </div>

        {/* Legend / Status Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === "all"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            {isEn ? "All Statuses" : "Tous"}
          </button>

          <button
            onClick={() => setStatusFilter("active")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === "active"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100"
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{isEn ? "Active" : "En cours"}</span>
          </button>

          <button
            onClick={() => setStatusFilter("confirmed")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === "confirmed"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100"
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{isEn ? "Confirmed" : "Confirmée"}</span>
          </button>

          <button
            onClick={() => setStatusFilter("pending")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === "pending"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100"
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span>{isEn ? "Pending" : "En attente"}</span>
          </button>
        </div>
      </div>

      {/* GANTT TIMELINE CONTAINER - 100% RESPONSIVE WITH STICKY VEHICLE COLUMN */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400">
            <CarSpinner
              size="lg"
              label={isEn ? "Syncing timeline with active bookings..." : "Synchronisation de la timeline flotte..."}
            />
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="py-16 text-center">
            <Car className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-500">
              {isEn ? "No vehicles found in fleet" : "Aucun véhicule trouvé"}
            </p>
          </div>
        ) : (
          <div ref={timelineContainerRef} className="overflow-x-auto relative">
            <div style={{ minWidth: `${200 + daysInMonth * DAY_WIDTH}px` }}>
              {/* TIMELINE HEADER: DAYS ROW */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/80 sticky top-0 z-30 backdrop-blur">
                {/* Sticky Left Column: Vehicle title */}
                <div className="w-56 shrink-0 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-slate-50 dark:bg-slate-800 z-40 shadow-sm flex items-center justify-between">
                  <span>{isEn ? "Vehicle" : "Véhicule"}</span>
                  <span className="text-[10px] font-mono font-normal text-slate-400">
                    {filteredVehicles.length} {isEn ? "cars" : "autos"}
                  </span>
                </div>

                {/* Day Columns */}
                <div className="flex flex-1">
                  {days.map((d) => {
                    const dateObj = new Date(year, month, d);
                    const dayOfWeek = dateObj.getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    const isToday = isCurrentMonth && d === todayDay;

                    const dayNamesFr = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
                    const dayNamesEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                    const dayName = isEn ? dayNamesEn[dayOfWeek] : dayNamesFr[dayOfWeek];

                    return (
                      <div
                        key={d}
                        style={{ width: `${DAY_WIDTH}px` }}
                        className={`shrink-0 py-2.5 text-center border-r border-slate-200/60 dark:border-slate-800/60 transition-colors relative ${
                          isToday
                            ? "bg-blue-50/80 dark:bg-blue-950/40 font-bold"
                            : isWeekend
                            ? "bg-slate-100/60 dark:bg-slate-800/40"
                            : ""
                        }`}
                      >
                        <div
                          className={`text-[10px] font-medium uppercase tracking-tight ${
                            isToday
                              ? "text-blue-600 dark:text-blue-400 font-bold"
                              : isWeekend
                              ? "text-slate-400 dark:text-slate-500"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {dayName}
                        </div>
                        <div
                          className={`text-xs mt-0.5 mx-auto w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                            isToday
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {d}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* VEHICLE ROWS & GANTT BARS */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredVehicles.map((v) => {
                  const { list: vehicleBookings, totalTracks } = getBookingsForVehicle(v);
                  const thumb = v.images?.find((i) => i.isPrimary)?.url || v.images?.[0]?.url;
                  const rowHeight = Math.max(58, 16 + totalTracks * 34);

                  return (
                    <div
                      key={v._id}
                      style={{ minHeight: `${rowHeight}px` }}
                      className="flex group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors relative"
                    >
                      {/* Sticky Left Column: Vehicle Info */}
                      <div className="w-56 shrink-0 p-3 border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/90 z-20 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 relative overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                          {thumb ? (
                            <Image
                              src={thumb}
                              alt={v.model}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <Car className="w-5 h-5 m-auto text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {v.brand} {v.model}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700">
                              {v.licensePlate || "TUN-2026"}
                            </span>
                            {vehicleBookings.length > 0 && (
                              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                {vehicleBookings.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Timeline Day Grid & Overlaid Bars */}
                      <div className="flex-1 relative flex" style={{ minHeight: `${rowHeight}px` }}>
                        {/* Background Grid Columns */}
                        {days.map((d) => {
                          const dateObj = new Date(year, month, d);
                          const dayOfWeek = dateObj.getDay();
                          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                          const isToday = isCurrentMonth && d === todayDay;

                          return (
                            <div
                              key={d}
                              style={{ width: `${DAY_WIDTH}px` }}
                              className={`shrink-0 h-full border-r border-slate-100 dark:border-slate-800/50 ${
                                isToday
                                  ? "bg-blue-50/30 dark:bg-blue-950/20"
                                  : isWeekend
                                  ? "bg-slate-50/50 dark:bg-slate-800/10"
                                  : ""
                              }`}
                            />
                          );
                        })}

                        {/* Booking Gantt Bars (Multi-track with no overlaps) */}
                        {vehicleBookings.map((b: any) => {
                          const p = new Date(b.pickupDate);
                          const r = new Date(b.returnDate);

                          // Calculate start and end day clamped to current month
                          let startDay = 1;
                          let startsBeforeMonth = false;
                          if (p.getFullYear() === year && p.getMonth() === month) {
                            startDay = p.getDate();
                          } else if (p < new Date(year, month, 1)) {
                            startsBeforeMonth = true;
                            startDay = 1;
                          }

                          let endDay = daysInMonth;
                          let endsAfterMonth = false;
                          if (r.getFullYear() === year && r.getMonth() === month) {
                            endDay = r.getDate();
                          } else if (r > new Date(year, month, daysInMonth)) {
                            endsAfterMonth = true;
                            endDay = daysInMonth;
                          }

                          const spanDays = Math.max(1, endDay - startDay + 1);
                          const leftPx = (startDay - 1) * DAY_WIDTH + 2;
                          const widthPx = spanDays * DAY_WIDTH - 4;

                          const track = b.trackIndex || 0;
                          const barTop = 8 + track * 34;

                          const statusStyle =
                            STATUS_COLORS[b.status] || STATUS_COLORS.confirmed;

                          return (
                            <div
                              key={b.id || b._id}
                              onClick={() => setSelectedBooking(b)}
                              style={{
                                left: `${leftPx}px`,
                                width: `${widthPx}px`,
                                top: `${barTop}px`,
                                height: "28px",
                              }}
                              className={`absolute rounded-lg px-2 flex items-center justify-between text-xs font-semibold cursor-pointer transition-all duration-200 z-10 shadow-sm border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} hover:scale-[1.02] hover:z-30`}
                              title={`${b.reference} - ${b.customerName} (${b.pickupDate} -> ${b.returnDate})`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                {startsBeforeMonth && (
                                  <span className="text-[10px] opacity-75">◀</span>
                                )}
                                <span className="truncate text-[11px] font-bold">
                                  {b.customerName || "Client"}
                                </span>
                                <span className="hidden sm:inline font-mono text-[9px] opacity-75">
                                  {b.reference}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0 ml-1">
                                <span className="text-[10px] opacity-90 hidden md:inline">
                                  {spanDays}j
                                </span>
                                {endsAfterMonth && (
                                  <span className="text-[10px] opacity-75">▶</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOOKING DETAILS MODAL */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
                      #{selectedBooking.reference}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                        STATUS_COLORS[selectedBooking.status]?.badge || "bg-blue-500 text-white"
                      }`}
                    >
                      {selectedBooking.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedBooking.vehicleName} • {selectedBooking.licensePlate || "TUN-2026"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="py-4 space-y-4">
                {/* Customer card */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-slate-400">
                      {isEn ? "Customer Details" : "Informations Client"}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {selectedBooking.customerName}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    {selectedBooking.customerPhone && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" /> {isEn ? "Phone:" : "Tél :"}
                        </span>
                        <a
                          href={`https://wa.me/${selectedBooking.customerPhone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          {selectedBooking.customerPhone} (WhatsApp)
                        </a>
                      </div>
                    )}
                    {selectedBooking.customerEmail && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" /> Email :
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {selectedBooking.customerEmail}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rental dates & agency */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block mb-0.5">
                      {isEn ? "Pickup Date & Place" : "Date & Lieu Départ"}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white block text-sm">
                      {selectedBooking.pickupDate}
                    </span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      {selectedBooking.pickupLocation || "Agence"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block mb-0.5">
                      {isEn ? "Return Date & Place" : "Date & Lieu Retour"}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white block text-sm">
                      {selectedBooking.returnDate}
                    </span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      {selectedBooking.returnLocation || "Agence"}
                    </span>
                  </div>
                </div>

                {/* Financial overview */}
                <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                      {isEn ? "Total Rental Amount" : "Montant Total de la Location"}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isEn ? "Includes Timbre Fiscal & LF 2026" : "Inclus Timbre Fiscal & LF 2026 (TTC)"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-700 dark:text-blue-400">
                      {selectedBooking.totalAmount ? (selectedBooking.totalAmount / 100).toLocaleString("fr-FR") : "0"}{" "}
                      TND
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                >
                  {isEn ? "Close" : "Fermer"}
                </button>
                <Link
                  href={`/admin/bookings?search=${selectedBooking.reference}`}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {isEn ? "View in Bookings Manager" : "Gérer la réservation"}
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
