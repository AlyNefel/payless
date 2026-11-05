"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Edit3,
  Save,
  X,
  Gauge,
  Calendar,
  FileText,
  Car,
  ChevronRight,
  LayoutGrid,
  Table as TableIcon,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useAdminLang } from "@/contexts/AdminLangContext";
import { CarSpinner } from "@/components/ui/CarSpinner";

interface GarageVehicle {
  _id: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  status: string;
  images: { url: string; isPrimary: boolean }[];
  transmission?: string;
  fuelType?: string;
  mileage: number;
  lastVidangeMileage: number;
  nextVidangeMileage: number;
  vidangeInterval: number;
  remainingKm: number;
  isUrgent: boolean;
  isOverdue: boolean;
  percentUsed: number;
  garageNotes: string;
  technicalInspectionDate: string | null;
  category: string;
}

interface GarageStats {
  total: number;
  alertsCount: number;
  overdueCount: number;
  totalNeedAttention: number;
  okCount: number;
}

export default function GaragePage() {
  const { lang } = useAdminLang();
  const isEn = lang === "en";

  const [vehicles, setVehicles] = useState<GarageVehicle[]>([]);
  const [stats, setStats] = useState<GarageStats>({
    total: 0,
    alertsCount: 0,
    overdueCount: 0,
    totalNeedAttention: 0,
    okCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "alert" | "overdue" | "ok">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Edit vehicle state
  const [editingVehicle, setEditingVehicle] = useState<GarageVehicle | null>(null);
  const [editMileage, setEditMileage] = useState<number>(0);
  const [editLastVidange, setEditLastVidange] = useState<number>(0);
  const [editNextVidange, setEditNextVidange] = useState<number>(0);
  const [editInterval, setEditInterval] = useState<number>(10000);
  const [editNotes, setEditNotes] = useState<string>("");
  const [editTechDate, setEditTechDate] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("available");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchGarageData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/garage?search=${encodeURIComponent(search)}&filter=${filter}`);
      const data = await res.json();
      if (data.success) {
        setVehicles(data.vehicles);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Error loading garage data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchGarageData();
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, filter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openEditModal = (v: GarageVehicle) => {
    setEditingVehicle(v);
    setEditMileage(v.mileage);
    setEditLastVidange(v.lastVidangeMileage);
    setEditNextVidange(v.nextVidangeMileage);
    setEditInterval(v.vidangeInterval || 10000);
    setEditNotes(v.garageNotes || "");
    setEditTechDate(v.technicalInspectionDate ? v.technicalInspectionDate.split("T")[0] : "");
    setEditStatus(v.status);
  };

  const handleQuickVidangeDone = (v: GarageVehicle) => {
    setEditingVehicle(v);
    setEditMileage(v.mileage);
    setEditLastVidange(v.mileage); // Vidange done at current mileage
    setEditNextVidange(v.mileage + (v.vidangeInterval || 10000));
    setEditInterval(v.vidangeInterval || 10000);
    setEditNotes(v.garageNotes ? `${v.garageNotes}\n[${new Date().toLocaleDateString("fr-FR")}] Vidange effectuée à ${v.mileage.toLocaleString()} km.` : `[${new Date().toLocaleDateString("fr-FR")}] Vidange effectuée à ${v.mileage.toLocaleString()} km.`);
    setEditTechDate(v.technicalInspectionDate ? v.technicalInspectionDate.split("T")[0] : "");
    setEditStatus(v.status);
  };

  const handleSave = async () => {
    if (!editingVehicle) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/garage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: editingVehicle._id,
          mileage: editMileage,
          lastVidangeMileage: editLastVidange,
          nextVidangeMileage: editNextVidange,
          vidangeInterval: editInterval,
          garageNotes: editNotes,
          technicalInspectionDate: editTechDate || null,
          status: editStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(isEn ? "Vehicle maintenance details updated!" : "Détails garage enregistrés avec succès !");
        setEditingVehicle(null);
        fetchGarageData();
      } else {
        alert(data.error || "Erreur de sauvegarde");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Erreur réseau");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold"
          >
            <CheckCircle2 className="w-5 h-5" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-xl">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isEn ? "Garage & Maintenance Fleet" : "Garage & Entretien Flotte"}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isEn
                  ? "Track vehicle mileages, oil changes (vidange alerts ≤ 2,000 km) and internal mechanic notes."
                  : "Suivi des kilométrages, alertes vidanges (seuil ≤ 2 000 km) et notes d'intervention du garage."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchGarageData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isEn ? "Refresh" : "Actualiser"}</span>
          </button>

          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              title={isEn ? "Grid View" : "Vue Grille"}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              title={isEn ? "Table View" : "Vue Tableau"}
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Urgent Vidanges Alert Card */}
        <div
          onClick={() => setFilter("alert")}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            filter === "alert"
              ? "ring-2 ring-orange-500 bg-orange-50/70 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-orange-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              {isEn ? "Vidange Alert (≤ 2,000 km)" : "Alerte Vidange (≤ 2 000 km)"}
            </span>
            <div className="p-2 bg-orange-500/10 text-orange-600 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">
              {stats.alertsCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isEn ? "vehicles" : "véhicules"}
            </span>
          </div>
          <p className="text-xs text-orange-700/80 dark:text-orange-400/80 mt-1">
            {isEn ? "Oil change needed soon" : "Vidange à programmer"}
          </p>
        </div>

        {/* Overdue Card */}
        <div
          onClick={() => setFilter("overdue")}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            filter === "overdue"
              ? "ring-2 ring-red-500 bg-red-50/70 dark:bg-red-950/30 border-red-200 dark:border-red-800"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-red-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
              {isEn ? "Overdue Vidange" : "Vidange Dépassée"}
            </span>
            <div className="p-2 bg-red-500/10 text-red-600 rounded-xl">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">
              {stats.overdueCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isEn ? "vehicles" : "véhicules"}
            </span>
          </div>
          <p className="text-xs text-red-700/80 dark:text-red-400/80 mt-1">
            {isEn ? "Immediate maintenance required" : "Entretien immédiat requis"}
          </p>
        </div>

        {/* OK / Up to date */}
        <div
          onClick={() => setFilter("ok")}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            filter === "ok"
              ? "ring-2 ring-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {isEn ? "Vidange OK (> 2,000 km)" : "Vidange À Jour"}
            </span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.okCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isEn ? "vehicles" : "véhicules"}
            </span>
          </div>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1">
            {isEn ? "In good condition" : "En parfait état"}
          </p>
        </div>

        {/* Total Fleet */}
        <div
          onClick={() => setFilter("all")}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            filter === "all"
              ? "ring-2 ring-blue-500 bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {isEn ? "Total Fleet" : "Flotte Totale"}
            </span>
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {stats.total}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isEn ? "vehicles" : "véhicules"}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isEn ? "All vehicles monitored" : "Tous les véhicules suivis"}
          </p>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isEn
                ? "Search by brand, model, license plate..."
                : "Rechercher par marque, modèle, immatriculation..."
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "all", label: isEn ? "All" : "Tous", count: stats.total },
            {
              id: "alert",
              label: isEn ? "Alert (≤ 2,000 km)" : "Alerte (≤ 2 000 km)",
              count: stats.alertsCount,
              badgeClass: "bg-orange-500 text-white",
            },
            {
              id: "overdue",
              label: isEn ? "Overdue" : "Dépassé",
              count: stats.overdueCount,
              badgeClass: "bg-red-500 text-white",
            },
            {
              id: "ok",
              label: isEn ? "Up to date" : "À jour",
              count: stats.okCount,
              badgeClass: "bg-emerald-500 text-white",
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as typeof filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filter === item.id
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                  item.badgeClass || (filter === item.id ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300")
                }`}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <CarSpinner
            size="lg"
            label={isEn ? "Loading garage fleet data..." : "Vérification des kilométrages & vidanges..."}
          />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Wrench className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {isEn ? "No vehicles found" : "Aucun véhicule correspondant"}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {isEn
              ? "Try adjusting your search or filter."
              : "Essayez de modifier votre recherche ou le filtre sélectionné."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {vehicles.map((v) => {
            const primaryImg = v.images?.find((img) => img.isPrimary)?.url || v.images?.[0]?.url || "/placeholder-car.jpg";

            return (
              <div
                key={v._id}
                className={`group rounded-2xl border bg-white dark:bg-slate-900 overflow-hidden flex flex-col transition-all hover:shadow-lg charging-card ${
                  v.isOverdue
                    ? "border-red-300 dark:border-red-900/60 shadow-red-500/5"
                    : v.isUrgent
                    ? "border-orange-300 dark:border-orange-900/60 shadow-orange-500/5"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                {/* Image & Header */}
                <div className="relative h-44 bg-slate-100 dark:bg-slate-800/60 overflow-hidden">
                  <Image
                    src={primaryImg}
                    alt={`${v.brand} ${v.model}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                  {/* Status & Plate pill */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/95 dark:bg-slate-900/95 backdrop-blur text-slate-800 dark:text-slate-100 shadow border border-slate-200/50 dark:border-slate-700/50 tracking-wider font-mono">
                      {v.licensePlate}
                    </span>

                    {v.isOverdue ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600 text-white shadow flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {isEn ? "OVERDUE" : "DÉPASSÉ"}
                      </span>
                    ) : v.isUrgent ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-500 text-white shadow flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {isEn ? "ALERT ≤ 2,000 KM" : "ALERTE ≤ 2 000 KM"}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/90 text-white shadow">
                        {isEn ? "VIDANGE OK" : "VIDANGE OK"}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2 left-3">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur">
                      {v.category}
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                          {v.brand} {v.model}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {v.year} • {v.fuelType || "Essence"} • {v.transmission || "Manuelle"}
                        </p>
                      </div>

                      <button
                        onClick={() => openEditModal(v)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                        title={isEn ? "Edit garage details" : "Modifier fiche garage"}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Mileage & Oil Progress */}
                    <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Gauge className="w-3.5 h-3.5" />
                          {isEn ? "Current Mileage" : "Kilométrage actuel"}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {v.mileage.toLocaleString()} km
                        </span>
                      </div>

                      {/* Progress bar of vidange */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-slate-500">
                            {isEn ? "Last:" : "Dernière :"} {v.lastVidangeMileage.toLocaleString()} km
                          </span>
                          <span className="text-slate-500">
                            {isEn ? "Next:" : "Prochaine :"} {v.nextVidangeMileage.toLocaleString()} km
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all rounded-full ${
                              v.isOverdue
                                ? "bg-red-500"
                                : v.isUrgent
                                ? "bg-orange-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, v.percentUsed)}%` }}
                          />
                        </div>
                      </div>

                      {/* Remaining KM Banner */}
                      <div className="pt-1 flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">
                          {isEn ? "Remaining before vidange:" : "Reste avant vidange :"}
                        </span>
                        <span
                          className={`font-bold ${
                            v.isOverdue
                              ? "text-red-600 dark:text-red-400"
                              : v.isUrgent
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {v.remainingKm <= 0
                            ? isEn
                              ? `Exceeded by ${Math.abs(v.remainingKm).toLocaleString()} km!`
                              : `Dépassé de ${Math.abs(v.remainingKm).toLocaleString()} km !`
                            : `${v.remainingKm.toLocaleString()} km`}
                        </span>
                      </div>
                    </div>

                    {/* Admin Garage Notes preview */}
                    {v.garageNotes && (
                      <div className="mt-3 p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-xs text-amber-900 dark:text-amber-200">
                        <div className="flex items-center gap-1 font-semibold text-[11px] mb-0.5 text-amber-800 dark:text-amber-400">
                          <FileText className="w-3 h-3" />
                          {isEn ? "Garage Note" : "Note Atelier / Admin"}
                        </div>
                        <p className="line-clamp-2 italic text-[11px]">{v.garageNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => handleQuickVidangeDone(v)}
                      className="flex-1 py-2 px-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isEn ? "Vidange Done" : "Vidange Effectuée"}
                    </button>

                    <button
                      onClick={() => openEditModal(v)}
                      className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                    >
                      {isEn ? "Details & Notes" : "Détails & Notes"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW - 100% RESPONSIVE */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">{isEn ? "Vehicle" : "Véhicule"}</th>
                  <th className="py-3 px-4">{isEn ? "Plate" : "Matricule"}</th>
                  <th className="py-3 px-4">{isEn ? "Mileage" : "Kilométrage"}</th>
                  <th className="py-3 px-4">{isEn ? "Last Vidange" : "Dernière Vidange"}</th>
                  <th className="py-3 px-4">{isEn ? "Next Vidange" : "Prochaine Vidange"}</th>
                  <th className="py-3 px-4">{isEn ? "Status Vidange" : "État Vidange"}</th>
                  <th className="py-3 px-4">{isEn ? "Garage Notes" : "Notes Garage"}</th>
                  <th className="py-3 px-4 text-right">{isEn ? "Actions" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {vehicles.map((v) => (
                  <tr
                    key={v._id}
                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                      v.isOverdue
                        ? "bg-red-50/30 dark:bg-red-950/10"
                        : v.isUrgent
                        ? "bg-orange-50/30 dark:bg-orange-950/10"
                        : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {v.brand} {v.model}
                      </div>
                      <div className="text-xs text-slate-500">{v.year} • {v.category}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {v.licensePlate}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {v.mileage.toLocaleString()} km
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {v.lastVidangeMileage.toLocaleString()} km
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {v.nextVidangeMileage.toLocaleString()} km
                    </td>
                    <td className="py-3 px-4">
                      {v.isOverdue ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {isEn ? `Overdue (-${Math.abs(v.remainingKm)} km)` : `Dépassé (-${Math.abs(v.remainingKm)} km)`}
                        </span>
                      ) : v.isUrgent ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {isEn ? `Alert (${v.remainingKm} km)` : `Alerte (${v.remainingKm} km)`}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isEn ? `OK (${v.remainingKm} km)` : `OK (${v.remainingKm} km)`}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-xs text-slate-500 italic">
                      {v.garageNotes || "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleQuickVidangeDone(v)}
                          className="px-2.5 py-1 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 rounded-lg text-xs font-semibold"
                          title={isEn ? "Record oil change done" : "Enregistrer vidange effectuée"}
                        >
                          {isEn ? "Vidange" : "Vidange"}
                        </button>
                        <button
                          onClick={() => openEditModal(v)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT MODAL / DRAWER */}
      <AnimatePresence>
        {editingVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {editingVehicle.brand} {editingVehicle.model} ({editingVehicle.year})
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isEn ? "License plate:" : "Immatriculation :"} <span className="font-mono font-bold">{editingVehicle.licensePlate}</span>
                  </p>
                </div>
                <button
                  onClick={() => setEditingVehicle(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Fields */}
              <div className="py-4 space-y-4">
                {/* Current Mileage */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
                    {isEn ? "Current Mileage (km) *" : "Kilométrage actuel (km) *"}
                  </label>
                  <input
                    type="number"
                    value={editMileage}
                    onChange={(e) => setEditMileage(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Vidange Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {isEn ? "Last Vidange (km)" : "Dernière vidange (km)"}
                    </label>
                    <input
                      type="number"
                      value={editLastVidange}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEditLastVidange(val);
                        setEditNextVidange(val + editInterval);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {isEn ? "Next Vidange (km)" : "Prochaine vidange (km)"}
                    </label>
                    <input
                      type="number"
                      value={editNextVidange}
                      onChange={(e) => setEditNextVidange(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-orange-600 dark:text-orange-400 outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {isEn ? "Vidange Interval (km)" : "Intervalle de vidange (km)"}
                    </label>
                    <input
                      type="number"
                      value={editInterval}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEditInterval(val);
                        setEditNextVidange(editLastVidange + val);
                      }}
                      step={1000}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {isEn ? "Technical Inspection (Visite)" : "Prochaine Visite Technique"}
                    </label>
                    <input
                      type="date"
                      value={editTechDate}
                      onChange={(e) => setEditTechDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Status selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {isEn ? "Vehicle Fleet Status" : "Statut du véhicule"}
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="available">{isEn ? "Available" : "Disponible"}</option>
                    <option value="rented">{isEn ? "Rented" : "En location"}</option>
                    <option value="maintenance">{isEn ? "In Maintenance / Garage" : "En maintenance / Garage"}</option>
                    <option value="reserved">{isEn ? "Reserved" : "Réservé"}</option>
                  </select>
                </div>

                {/* Garage Notes */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-orange-500" />
                      {isEn ? "Garage & Maintenance Notes (Admin Only)" : "Notes Garage & Détails Réparations (Admin)"}
                    </label>
                  </div>
                  <textarea
                    rows={4}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder={
                      isEn
                        ? "Enter notes regarding engine, brakes, tires, defects, scratch reports, or past garage interventions..."
                        : "Indiquer les réparations effectuées, état des freins, pneus, rayures, pièces changées ou observations mécaniques..."
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none font-sans"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition-colors"
                >
                  {isEn ? "Cancel" : "Annuler"}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold shadow-lg shadow-orange-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isEn ? "Save Changes" : "Enregistrer"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

