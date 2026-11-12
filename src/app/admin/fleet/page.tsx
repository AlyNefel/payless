"use client";

import React, { useState, useEffect } from "react";
import { useAdminLang } from "@/contexts/AdminLangContext";
import {
  Car,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Fuel,
  Users,
  Edit,
  Trash2,
  MapPin,
  X,
  Gauge,
  ChevronDown,
  Upload,
  Image as ImageIcon,
  Layers,
  DoorOpen,
  Package,
  AlertCircle,
  Save,
} from "lucide-react";
import { INITIAL_VEHICLES, VehicleItem, MOCK_LOCATIONS } from "../mockData";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const MANUFACTURERS = [
  "--- Select ---",
  "Dacia",
  "Renault",
  "Volkswagen",
  "BMW",
  "Porsche",
  "Mercedes-Benz",
  "Range Rover",
  "Hyundai",
  "Toyota",
  "Audi",
  "Kia",
  "Peugeot",
  "Fiat",
  "Skoda",
  "Citroën",
  "Opel",
  "Ford",
  "Seat",
  "Mazda",
  "Nissan",
  "Honda",
  "Volvo",
  "Lexus",
  "Tesla",
  "Chevrolet",
  "Jeep",
];

const CLASSES = [
  "--- Select ---",
  "Economy",
  "Compact",
  "SUV",
  "Luxury",
  "Sedan",
  "Minivan",
  "Electric",
  "Convertible",
];

const FUEL_TYPES = [
  "--- Select ---",
  "Diesel",
  "Gasoline",
  "Electric",
  "Hybrid",
  "Plug-in Hybrid",
  "LPG",
];

const GEARBOX_TYPES = ["--- Select ---", "Manual", "Automatic", "CVT", "Semi-Automatic"];

const MIN_DRIVER_AGES = [0, 18, 21, 23, 25, 30];

const PRICE_GROUPS = [
  "--- Select ---",
  "Economy",
  "Standard",
  "Comfort",
  "Executive",
  "Premium",
  "Luxury",
  "Sport",
];

// ─── INTERFACES ───────────────────────────────────────────────────────────────

interface CarFeatures {
  ac: boolean;
  airBags: boolean;
  cruiseControl: boolean;
  hdAudio: boolean;
  abs: boolean;
  centralLocking: boolean;
  electricWindows: boolean;
  powerSteering: boolean;
}

interface FullVehicleFormData {
  // Section 1 — Model Info
  modelName: string;
  partner: string;
  manufacturer: string;
  vehicleClass: string;
  fuelType: string;
  gearboxType: string;
  fuelConsumption: string;
  passengerSeats: number;
  engineCapacity: string;
  maximumLuggage: number;
  doors: number;
  dailyMileageLimit: string;

  // Section 2 — Fleet & Logistics
  totalCarsInGarage: number;
  maxCarsPerReservation: number;
  pickupLocationIds: string[];
  returnLocationIds: string[];
  minDriverAge: number;
  mainImageUrl: string;
  interiorImageUrl: string;
  bootImageUrl: string;
  carFeatures: CarFeatures;
  priceGroup: string;
  fixedDeposit: number;

  // Pricing & extra
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  licensePlate: string;
  color: string;
  year: number;
  mileage: number;
}

const DEFAULT_FORM: FullVehicleFormData = {
  modelName: "",
  partner: "--- Select ---",
  manufacturer: "--- Select ---",
  vehicleClass: "--- Select ---",
  fuelType: "--- Select ---",
  gearboxType: "--- Select ---",
  fuelConsumption: "",
  passengerSeats: 5,
  engineCapacity: "",
  maximumLuggage: 2,
  doors: 4,
  dailyMileageLimit: "",
  totalCarsInGarage: 1,
  maxCarsPerReservation: 1,
  pickupLocationIds: [],
  returnLocationIds: [],
  minDriverAge: 0,
  mainImageUrl: "",
  interiorImageUrl: "",
  bootImageUrl: "",
  carFeatures: {
    ac: false,
    airBags: false,
    cruiseControl: false,
    hdAudio: false,
    abs: false,
    centralLocking: false,
    electricWindows: false,
    powerSteering: false,
  },
  priceGroup: "--- Select ---",
  fixedDeposit: 5000,
  dailyPrice: 350,
  weeklyPrice: 2200,
  monthlyPrice: 7500,
  licensePlate: "",
  color: "",
  year: 2024,
  mileage: 0,
};

// ─── MULTI-SELECT LISTBOX COMPONENT ──────────────────────────────────────────

function MultiSelectListbox({
  options,
  selected,
  onChange,
  placeholder,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
}) {
  const handleClick = (val: string, e: React.MouseEvent<HTMLOptionElement>) => {
    const opt = val;
    if (e.ctrlKey || e.metaKey) {
      if (selected.includes(opt)) {
        onChange(selected.filter((v) => v !== opt));
      } else {
        onChange([...selected, opt]);
      }
    } else if (e.shiftKey && selected.length > 0) {
      const lastIdx = options.findIndex((o) => o.value === selected[selected.length - 1]);
      const currIdx = options.findIndex((o) => o.value === opt);
      const [start, end] = [Math.min(lastIdx, currIdx), Math.max(lastIdx, currIdx)];
      const range = options.slice(start, end + 1).map((o) => o.value);
      const merged = Array.from(new Set([...selected, ...range]));
      onChange(merged);
    } else {
      if (selected.length === 1 && selected[0] === opt) {
        onChange([]);
      } else {
        onChange([opt]);
      }
    }
  };

  return (
    <select
      multiple
      size={5}
      className="w-full rounded-xl bg-slate-800 border border-slate-700 text-white text-xs p-1 focus:outline-none focus:border-blue-500 [&>option]:py-1.5 [&>option]:px-2 [&>option:checked]:bg-blue-600 [&>option:checked]:text-white cursor-pointer"
      value={selected}
      onChange={() => {}} // controlled via click
    >
      {options.map((opt) => (
        <option
          key={opt.value}
          value={opt.value}
          onClick={(e) => handleClick(opt.value, e)}
          className="rounded px-2 py-1"
        >
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ─── FORM TABS ────────────────────────────────────────────────────────────────

const FORM_TABS = [
  { id: "model", label: "Car Model Info", icon: Car },
  { id: "fleet", label: "Fleet & Locations", icon: MapPin },
  { id: "pricing", label: "Pricing", icon: Gauge },
];

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function AdminFleetPage() {
  const { lang } = useAdminLang();
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTransmission, setSelectedTransmission] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});

  const fetchVehicles = () => {
    setLoadingVehicles(true);
    fetch("/api/admin/vehicles?limit=100")
      .then((res) => res.json())
      .then((json) => {
        const list = json.vehicles || [];
        setVehicles(
          list.map((v: any) => ({
            id: v._id,
            brand: v.brand,
            model: v.model,
            year: v.year,
            category: v.categoryId?.name?.fr || v.category || "Berline",
            transmission: v.transmission,
            fuelType: v.fuelType,
            seats: v.seats,
            doors: v.doors,
            pricing: {
              daily: v.pricing?.daily >= 1000 ? Math.round(v.pricing.daily / 100) : (v.pricing?.daily ?? 0),
              weekly: v.pricing?.weekly >= 1000 ? Math.round(v.pricing.weekly / 100) : (v.pricing?.weekly ?? 0),
              monthly: v.pricing?.monthly >= 1000 ? Math.round(v.pricing.monthly / 100) : (v.pricing?.monthly ?? 0),
              deposit: v.pricing?.deposit >= 1000 ? Math.round(v.pricing.deposit / 100) : (v.pricing?.deposit ?? 0),
            },
            status: v.status || "available",
            mileage: v.mileage || 0,
            licensePlate: v.licensePlate || "",
            color: v.color || "",
            imageUrl: v.images?.find((i: any) => i.isPrimary)?.url || v.images?.[0]?.url || "",
            rating: v.rating || 4.9,
            totalTrips: v.tripsCount || 0,
            location: v.locationId?.name?.fr || "Aéroport Tunis-Carthage",
            features: v.features || [],
          }))
        );
      })
      .catch(() => {})
      .finally(() => setLoadingVehicles(false));
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Cloudinary image upload helper
  const handleImageUpload = async (
    file: File,
    key: "mainImageUrl" | "interiorImageUrl" | "bootImageUrl"
  ) => {
    setUploadingImages((prev) => ({ ...prev, [key]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.url) {
        setFormData((prev) => ({ ...prev, [key]: json.url }));
      } else {
        alert("Upload failed: " + (json.error || "Unknown error"));
      }
    } catch {
      alert("Image upload failed. Please check your connection.");
    } finally {
      setUploadingImages((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleItem | null>(null);
  const [formTab, setFormTab] = useState("model");
  const [formData, setFormData] = useState<FullVehicleFormData>(DEFAULT_FORM);

  // Stats
  const totalCount = vehicles.length;
  const availableCount = vehicles.filter((v) => v.status === "available").length;
  const rentedCount = vehicles.filter((v) => v.status === "rented").length;
  const maintenanceCount = vehicles.filter((v) => v.status === "maintenance").length;

  // Filter
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.brand.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
      v.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || v.category === selectedCategory;
    const matchesTransmission =
      selectedTransmission === "All" || v.transmission === selectedTransmission;
    const matchesStatus = selectedStatus === "All" || v.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesTransmission && matchesStatus;
  });

  const handleToggleStatus = async (id: string, newStatus: VehicleItem["status"]) => {
    // Optimistic update
    setVehicles(vehicles.map((v) => (v.id === id ? { ...v, status: newStatus } : v)));
    try {
      await fetch("/api/admin/vehicles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch {
      // revert on error
      fetchVehicles();
    }
  };

  const handleArchive = async (id: string) => {
    if (confirm("Confirmer la mise en archive de ce véhicule ?")) {
      setVehicles(vehicles.filter((v) => v.id !== id));
      try {
        await fetch(`/api/admin/vehicles?id=${id}`, { method: "DELETE" });
      } catch {
        fetchVehicles();
      }
    }
  };

  const openAddModal = () => {
    setEditingVehicle(null);
    setFormData(DEFAULT_FORM);
    setFormTab("model");
    setShowAddModal(true);
  };

  const openEditModal = (car: VehicleItem) => {
    setEditingVehicle(car);
    setFormData({
      ...DEFAULT_FORM,
      modelName: `${car.brand} ${car.model}`,
      manufacturer: car.brand,
      vehicleClass: car.category,
      fuelType: car.fuelType,
      gearboxType: car.transmission === "automatic" ? "Automatic" : "Manual",
      passengerSeats: car.seats,
      doors: car.doors,
      dailyPrice: car.pricing.daily,
      weeklyPrice: car.pricing.weekly,
      monthlyPrice: car.pricing.monthly,
      fixedDeposit: car.pricing.deposit,
      licensePlate: car.licensePlate,
      color: car.color,
      year: car.year,
      mileage: car.mileage,
      mainImageUrl: car.imageUrl,
    });
    setFormTab("model");
    setShowAddModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingVehicle(true);

    const manufacturerParts = formData.modelName.trim().split(" ");
    const brand =
      formData.manufacturer !== "--- Select ---"
        ? formData.manufacturer
        : manufacturerParts[0] || "Unknown";
    const model =
      manufacturerParts.slice(1).join(" ") || formData.modelName || "Model";

    const featuresList = Object.entries(formData.carFeatures)
      .filter(([, v]) => v)
      .map(([k]) => {
        const map: Record<string, string> = {
          ac: "A/C",
          airBags: "Air Bags",
          cruiseControl: "Cruise Control",
          hdAudio: "HD Audio System",
          abs: "ABS",
          centralLocking: "Central Locking",
          electricWindows: "Electric Windows",
          powerSteering: "Power Steering",
        };
        return map[k];
      });

    const images: { url: string; isPrimary: boolean; alt: string }[] = [];
    if (formData.mainImageUrl)
      images.push({ url: formData.mainImageUrl, isPrimary: true, alt: `${brand} ${model}` });
    if (formData.interiorImageUrl)
      images.push({ url: formData.interiorImageUrl, isPrimary: false, alt: "Interior" });
    if (formData.bootImageUrl)
      images.push({ url: formData.bootImageUrl, isPrimary: false, alt: "Boot" });

    const payload = {
      brand,
      model,
      year: formData.year,
      category:
        formData.vehicleClass !== "--- Select ---" ? formData.vehicleClass : "Economy",
      transmission: formData.gearboxType.toLowerCase().includes("auto")
        ? "Automatic"
        : "Manual",
      fuelType:
        formData.fuelType !== "--- Select ---" ? formData.fuelType : "Gasoline",
      seats: formData.passengerSeats,
      doors: formData.doors,
      licensePlate:
        formData.licensePlate ||
        `${Math.floor(10000 + Math.random() * 90000)}-TN-26`,
      mileage: formData.mileage,
      color: formData.color || "Inconnu",
      status: "available" as const,
      pricing: {
        daily: formData.dailyPrice,
        weekly: formData.weeklyPrice,
        monthly: formData.monthlyPrice,
        deposit: formData.fixedDeposit,
      },
      features: featuresList,
      images: images.length > 0 ? images : undefined,
    };

    try {
      let res: Response;
      if (editingVehicle) {
        res = await fetch("/api/admin/vehicles", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingVehicle.id, ...payload }),
        });
      } else {
        res = await fetch("/api/admin/vehicles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        alert("Erreur: " + (err.error || "Sauvegarde échouée"));
        return;
      }

      // Refresh vehicle list from DB
      fetchVehicles();
      setShowAddModal(false);
      setEditingVehicle(null);
    } catch {
      alert("Erreur réseau. Réessayez.");
    } finally {
      setSavingVehicle(false);
    }
  };

  const locationOptions = MOCK_LOCATIONS.map((l) => ({
    value: l.id,
    label: `${l.code} — ${l.name}`,
  }));

  const setFeature = (key: keyof CarFeatures, value: boolean) => {
    setFormData({
      ...formData,
      carFeatures: { ...formData.carFeatures, [key]: value },
    });
  };

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Gestion du Parc Automobile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Supervisez les disponibilités, fiches techniques, tarifs et statut de maintenance.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Véhicule</span>
        </button>
      </div>

      {/* 4 STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Flotte",
            value: totalCount,
            color: "text-slate-900 dark:text-white",
            badge: "100% Parc",
            badgeColor: "text-blue-500",
          },
          {
            label: "Disponibles",
            value: availableCount,
            color: "text-emerald-500",
            badge: "Prêt à louer",
            badgeColor: "text-emerald-500",
          },
          {
            label: "En Location",
            value: rentedCount,
            color: "text-blue-500",
            badge: "Sur contrat",
            badgeColor: "text-blue-500",
          },
          {
            label: "En Atelier",
            value: maintenanceCount,
            color: "text-amber-500",
            badge: "Maintenance",
            badgeColor: "text-amber-500",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 p-4 shadow-sm"
          >
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {stat.label}
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
              <span className={`text-xs font-medium ${stat.badgeColor}`}>{stat.badge}</span>
            </div>
          </div>
        ))}
      </div>

      {/* FILTERS & SEARCH */}
      <div className="rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par marque, modèle, matricule ou ville..."
            className="w-full rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {[
            {
              value: selectedCategory,
              setter: setSelectedCategory,
              options: [
                "All",
                "Economy",
                "Compact",
                "SUV",
                "Luxury",
                "Sedan",
              ],
              labels: [
                "Toutes Catégories",
                "Économique",
                "Compacte",
                "SUV & 4x4",
                "Prestige & Luxe",
                "Berline",
              ],
            },
            {
              value: selectedTransmission,
              setter: setSelectedTransmission,
              options: ["All", "automatic", "manual"],
              labels: ["Toutes Boîtes", "Automatique", "Manuelle"],
            },
            {
              value: selectedStatus,
              setter: setSelectedStatus,
              options: ["All", "available", "rented", "maintenance"],
              labels: ["Tous Statuts", "Disponible", "En Location", "Maintenance"],
            },
          ].map((filter, idx) => (
            <div key={idx} className="relative">
              <select
                value={filter.value}
                onChange={(e) => filter.setter(e.target.value)}
                className="rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 pr-7 appearance-none"
              >
                {filter.options.map((opt, i) => (
                  <option key={opt} value={opt}>
                    {filter.labels[i]}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          ))}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1">
            {(["grid", "table"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === mode
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {mode === "grid" ? "Grille" : "Tableau"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VEHICLES DISPLAY */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredVehicles.map((car) => (
            <div
              key={car.id}
              className="rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between group hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div>
                <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <img
                    src={car.imageUrl}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3">
                    {car.status === "available" && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white backdrop-blur-md shadow-md">
                        Disponible
                      </span>
                    )}
                    {car.status === "rented" && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-600/90 text-white backdrop-blur-md shadow-md">
                        En Location
                      </span>
                    )}
                    {car.status === "maintenance" && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/90 text-slate-950 backdrop-blur-md shadow-md">
                        Atelier
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 border border-white/20 font-mono text-[11px] text-amber-300 font-bold backdrop-blur-md">
                    {car.licensePlate}
                  </div>
                  <div className="absolute bottom-2 left-3 text-xs font-semibold">
                    <span className="px-2 py-0.5 rounded-md bg-blue-600/30 text-blue-200 border border-blue-500/20 text-[10px] uppercase font-bold backdrop-blur-md">
                      {car.category}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {car.brand} {car.model}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {car.year} • {car.color}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-blue-500" />
                      <span className="capitalize">{car.transmission.slice(0, 4)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Fuel className="w-3.5 h-3.5 text-amber-500" />
                      <span className="capitalize">{car.fuelType}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{car.seats} pl.</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{car.location}</span>
                  </p>
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        {car.pricing.daily} TND
                      </span>
                      <span className="text-xs text-slate-400"> / jour</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Caution: {car.pricing.deposit} TND
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      handleToggleStatus(
                        car.id,
                        car.status === "available"
                          ? "maintenance"
                          : car.status === "maintenance"
                          ? "available"
                          : "available"
                      )
                    }
                    title="Basculer Statut Atelier/Dispo"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleArchive(car.id)}
                    title="Supprimer / Archiver"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-500/20 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => openEditModal(car)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 dark:hover:bg-blue-600/30 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-xs font-semibold transition-colors"
                >
                  Modifier
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Véhicule</th>
                  <th className="px-5 py-3 font-semibold">Immatriculation</th>
                  <th className="px-5 py-3 font-semibold">Catégorie</th>
                  <th className="px-5 py-3 font-semibold">Boîte / Carburant</th>
                  <th className="px-5 py-3 font-semibold">Tarif / Jour</th>
                  <th className="px-5 py-3 font-semibold">Statut</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredVehicles.map((car) => (
                  <tr
                    key={car.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={car.imageUrl}
                          alt=""
                          className="w-12 h-9 rounded-lg object-cover bg-slate-100 dark:bg-slate-900 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {car.brand} {car.model}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {car.year} • {car.color}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono font-medium text-amber-500 dark:text-amber-300">
                      {car.licensePlate}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {car.category}
                    </td>
                    <td className="px-5 py-3.5 capitalize text-slate-600 dark:text-slate-300">
                      {car.transmission} / {car.fuelType}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {car.pricing.daily} TND
                    </td>
                    <td className="px-5 py-3.5">
                      {car.status === "available" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                          Disponible
                        </span>
                      )}
                      {car.status === "rented" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                          En Location
                        </span>
                      )}
                      {car.status === "maintenance" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                          Atelier
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => openEditModal(car)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                      >
                        Éditer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          ADD / EDIT VEHICLE MODAL — Full Car Model Add/Edit (Screenshots Match)
      ═══════════════════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-700 shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/30">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Car Model Add/Edit
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {editingVehicle
                      ? `Modification: ${editingVehicle.brand} ${editingVehicle.model}`
                      : "Nouveau modèle de véhicule"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingVehicle(null);
                }}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 px-4">
              {FORM_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFormTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all -mb-px ${
                      formTab === tab.id
                        ? "border-blue-500 text-blue-500"
                        : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-5 text-xs max-h-[65vh] overflow-y-auto">
                {/* ── TAB 1: Car Model Info ─────────────────────────────── */}
                {formTab === "model" && (
                  <div className="space-y-4">
                    {/* Model Name */}
                    <div className="flex items-start gap-4">
                      <label className="w-44 shrink-0 font-semibold text-slate-700 dark:text-slate-300 pt-2.5">
                        Model Name:<span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.modelName}
                        onChange={(e) =>
                          setFormData({ ...formData, modelName: e.target.value })
                        }
                        placeholder="Ex: Dacia Logan 2024"
                        className="flex-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 placeholder-slate-400"
                      />
                    </div>

                    {/* Partner */}
                    <div className="flex items-center gap-4">
                      <label className="w-44 shrink-0 font-semibold text-slate-700 dark:text-slate-300">
                        Partner:
                      </label>
                      <div className="relative flex-1">
                        <select
                          value={formData.partner}
                          onChange={(e) =>
                            setFormData({ ...formData, partner: e.target.value })
                          }
                          className="w-full appearance-none rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 pr-8"
                        >
                          <option>--- Select ---</option>
                          <option>Partenaire A</option>
                          <option>Partenaire B</option>
                          <option>Partenaire C</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Manufacturer */}
                    <div className="flex items-center gap-4">
                      <label className="w-44 shrink-0 font-semibold text-slate-700 dark:text-slate-300">
                        Manufacturer:
                      </label>
                      <div className="relative flex-1">
                        <select
                          value={formData.manufacturer}
                          onChange={(e) =>
                            setFormData({ ...formData, manufacturer: e.target.value })
                          }
                          className="w-full appearance-none rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 pr-8"
                        >
                          {MANUFACTURERS.map((m) => (
                            <option key={m}>{m}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Class */}
                    <div className="flex items-center gap-4">
                      <label className="w-44 shrink-0 font-semibold text-slate-700 dark:text-slate-300">
                        Class:
                      </label>
                      <div className="relative flex-1">
                        <select
                          value={formData.vehicleClass}
                          onChange={(e) =>
                            setFormData({ ...formData, vehicleClass: e.target.value })
                          }
                          className="w-full appearance-none rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 pr-8"
                        >
                          {CLASSES.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Fuel Type */}
                    <div className="flex items-center gap-4">
                      <label className="w-44 shrink-0 font-semibold text-slate-700 dark:text-slate-300">
                        Fuel Type:
                      </label>
                      <div className="relative flex-1">
                        <select
                          value={formData.fuelType}
                          onChange={(e) =>
                            setFormData({ ...formData, fuelType: e.target.value })
                          }
                          className="w-full appearance-none rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 pr-8"
                        >
                          {FUEL_TYPES.map((f) => (
                            <option key={f}>{f}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Gearbox Type */}
                    <div className="flex items-center gap-4">
                      <label className="w-44 shrink-0 font-semibold text-slate-700 dark:text-slate-300">
                        Gearbox Type:
                      </label>
                      <div className="relative flex-1">
                        <select
                          value={formData.gearboxType}
                          onChange={(e) =>
                            setFormData({ ...formData, gearboxType: e.target.value })
                          }
                          className="w-full appearance-none rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 pr-8"
                        >
                          {GEARBOX_TYPES.map((g) => (
                            <option key={g}>{g}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Fuel Consumption */}
                    <div className="flex items-center gap-4">
                      <label className="w-44 shrink-0 font-semibold text-slate-700 dark:text-slate-300">
                        Fuel Consumption:
                      </label>
                      <input
                        type="text"
                        value={formData.fuelConsumption}
                        onChange={(e) =>
                          setFormData({ ...formData, fuelConsumption: e.target.value })
                        }
                        placeholder=""
                        className="w-48 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-400 italic">(Leave blank to hide the field from displaying)</span>
                    </div>

                    {/* Passenger Seats */}
                    <div className="flex items-center gap-4">
                      <label className="w-44 shrink-0 font-semibold text-slate-700 dark:text-slate-300">
                        Passenger seats (incl. driver):
                      </label>
                      <div className="relative">
                        <select
                          value={formData.passengerSeats}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              passengerSeats: Number(e.target.value),
                            })
                          }
                          className="w-24 appearance-none rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 pr-8"
                        >
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Engine Capacity */}
                    <div className="flex items-center gap-4">
                      <label className="w-44 shrink-0 font-semibold text-slate-700 dark:text-slate-300">
                        Engine capacity:
                      </label>
                      <input
                        type="text"
                        value={formData.engineCapacity}
                        onChange={(e) =>
                          setFormData({ ...formData, engineCapacity: e.target.value })
                        }
                        placeholder=""
                        className="w-48 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-400 italic">(Leave blank to hide the field from displaying)</span>
                    </div>

                    {/* Maximum Luggage */}
                    <div className="flex items-center gap-4">
                      <label className="w-44 shrink-0 font-semibold text-slate-700 dark:text-slate-300">
                        Maximum Luggage:
                      </label>
                      <div className="relative">
                        <select
                          value={formData.maximumLuggage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maximumLuggage: Number(e.target.value),
                            })
                          }
                          className="w-24 appearance-none rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 pr-8"
                        >
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Doors */}
                    <div className="flex items-center gap-4">
                      <label className="w-44 shrink-0 font-semibold text-slate-700 dark:text-slate-300">
                        Doors:
                      </label>
                      <div className="relative">
                        <select
                          value={formData.doors}
                          onChange={(e) =>
                            setFormData({ ...formData, doors: Number(e.target.value) })
                          }
                          className="w-24 appearance-none rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 pr-8"
                        >
                          {[0, 1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Daily Mileage Limit */}
                    <div className="flex items-center gap-4">
                      <label className="w-44 shrink-0 font-semibold text-slate-700 dark:text-slate-300">
                        Daily Mileage Limit:
                      </label>
                      <input
                        type="text"
                        value={formData.dailyMileageLimit}
                        onChange={(e) =>
                          setFormData({ ...formData, dailyMileageLimit: e.target.value })
                        }
                        placeholder=""
                        className="w-32 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                      <span className="font-bold text-slate-700 dark:text-slate-300">KM</span>
                      <span className="text-slate-400 italic text-[11px]">
                        (Leave blank for Unlimited, or enter 0 to hide the field from displaying)
                      </span>
                    </div>

                    {/* License Plate & Color & Year */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                        Informations Matricule & Couleur
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                            Immatriculation
                          </label>
                          <input
                            type="text"
                            value={formData.licensePlate}
                            onChange={(e) =>
                              setFormData({ ...formData, licensePlate: e.target.value })
                            }
                            placeholder="12345-A-26"
                            className="w-full rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-800 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                            Couleur
                          </label>
                          <input
                            type="text"
                            value={formData.color}
                            onChange={(e) =>
                              setFormData({ ...formData, color: e.target.value })
                            }
                            placeholder="Ex: Blanc Glacier"
                            className="w-full rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                            Année
                          </label>
                          <input
                            type="number"
                            value={formData.year}
                            onChange={(e) =>
                              setFormData({ ...formData, year: Number(e.target.value) })
                            }
                            className="w-full rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 2: Fleet & Locations ──────────────────────────── */}
                {formTab === "fleet" && (
                  <div className="space-y-5">
                    {/* Total Cars in Garage */}
                    <div className="flex items-center gap-4">
                      <label className="w-52 shrink-0 font-semibold text-slate-700 dark:text-slate-300">
                        Total Cars in Garage:<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={formData.totalCarsInGarage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              totalCarsInGarage: Number(e.target.value),
                            })
                          }
                          className="w-24 appearance-none rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 pr-8"
                        >
                          {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Max Cars per Reservation */}
                    <div className="flex items-center gap-4">
                      <label className="w-52 shrink-0 font-semibold text-slate-700 dark:text-slate-300">
                        Max. Cars per Reservation:<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={formData.maxCarsPerReservation}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxCarsPerReservation: Number(e.target.value),
                            })
                          }
                          className="w-24 appearance-none rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 pr-8"
                        >
                          {Array.from(
                            { length: formData.totalCarsInGarage },
                            (_, i) => i + 1
                          ).map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <span className="text-slate-400 italic text-[11px]">
                        (Can&apos;t be more than total car units in garage)
                      </span>
                    </div>

                    {/* Pick-up Locations */}
                    <div className="flex items-start gap-4">
                      <div className="w-52 shrink-0 pt-1">
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                          Pick-up Locations:<span className="text-red-500">*</span>
                        </label>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          (hold SHIFT or CTRL button to select multiple locations)
                        </p>
                      </div>
                      <div className="flex-1">
                        <MultiSelectListbox
                          options={locationOptions}
                          selected={formData.pickupLocationIds}
                          onChange={(vals) =>
                            setFormData({ ...formData, pickupLocationIds: vals })
                          }
                        />
                        {formData.pickupLocationIds.length > 0 && (
                          <p className="text-[10px] text-blue-500 mt-1">
                            {formData.pickupLocationIds.length} agence(s) sélectionnée(s)
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Return Locations */}
                    <div className="flex items-start gap-4">
                      <div className="w-52 shrink-0 pt-1">
                        <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                          Return Locations:<span className="text-red-500">*</span>
                        </label>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          (hold SHIFT or CTRL button to select multiple locations)
                        </p>
                      </div>
                      <div className="flex-1">
                        <MultiSelectListbox
                          options={locationOptions}
                          selected={formData.returnLocationIds}
                          onChange={(vals) =>
                            setFormData({ ...formData, returnLocationIds: vals })
                          }
                        />
                        {formData.returnLocationIds.length > 0 && (
                          <p className="text-[10px] text-blue-500 mt-1">
                            {formData.returnLocationIds.length} agence(s) sélectionnée(s)
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Minimal Driver Age */}
                    <div className="flex items-center gap-4">
                      <label className="w-52 shrink-0 font-semibold text-slate-700 dark:text-slate-300">
                        Minimal driver age:
                      </label>
                      <div className="relative">
                        <select
                          value={formData.minDriverAge}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              minDriverAge: Number(e.target.value),
                            })
                          }
                          className="w-24 appearance-none rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 pr-8"
                        >
                          {MIN_DRIVER_AGES.map((age) => (
                            <option key={age} value={age}>
                              {age}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Image Uploads */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Images du Vehicule</p>
                      {[
                        { label: "Image Principale:", key: "mainImageUrl" as const },
                        { label: "Image Interieur:", key: "interiorImageUrl" as const },
                        { label: "Image Coffre:", key: "bootImageUrl" as const },
                      ].map(({ label, key }) => (
                        <div key={key} className="flex items-start gap-4 flex-wrap">
                          <label className="w-52 shrink-0 font-semibold text-slate-700 dark:text-slate-300 pt-2">{label}</label>
                          <div className="flex flex-col gap-2 flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap">
                                {uploadingImages[key] ? (<><svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg><span>Upload...</span></>) : (<><Upload className="w-3.5 h-3.5"/><span>Choisir fichier</span></>)}
                                <input type="file" accept="image/*" className="hidden" disabled={uploadingImages[key]} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, key); }} />
                              </label>
                              {formData[key] ? (<img src={formData[key]} alt="" className="w-16 h-10 rounded-lg object-cover border border-slate-300 dark:border-slate-600 shrink-0" />) : (<div className="flex items-center gap-1 text-slate-400 text-[11px]"><ImageIcon className="w-4 h-4" /><span>No Image</span></div>)}
                            </div>
                            <input type="url" value={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} placeholder="ou coller une URL..." className="w-full rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 font-mono text-[11px]" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Car Model Features */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-start gap-4">
                        <label className="w-52 shrink-0 font-semibold text-slate-700 dark:text-slate-300 pt-1">
                          Car Model Features:
                        </label>
                        <div className="flex-1 grid grid-cols-2 gap-y-3 gap-x-8">
                          {(
                            [
                              ["ac", "A/C"],
                              ["abs", "ABS"],
                              ["airBags", "Air Bags"],
                              ["centralLocking", "Central Locking"],
                              ["cruiseControl", "Cruise Control"],
                              ["electricWindows", "Electric Windows"],
                              ["hdAudio", "HD Audio System"],
                              ["powerSteering", "Power Steering"],
                            ] as [keyof CarFeatures, string][]
                          ).map(([key, label]) => (
                            <label
                              key={key}
                              className="flex items-center gap-2 cursor-pointer group"
                            >
                              <input
                                type="checkbox"
                                checked={formData.carFeatures[key]}
                                onChange={(e) => setFeature(key, e.target.checked)}
                                className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                              />
                              <span
                                className={`text-xs transition-colors ${
                                  formData.carFeatures[key]
                                    ? "text-blue-600 dark:text-blue-400 font-semibold"
                                    : "text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                                }`}
                              >
                                {label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 3: Pricing ───────────────────────────────────── */}
                {formTab === "pricing" && (
                  <div className="space-y-5">
                    {/* Price Group */}
                    <div className="flex items-center gap-4">
                      <label className="w-44 shrink-0 font-semibold text-slate-700 dark:text-slate-300">
                        Price Group:
                      </label>
                      <div className="relative w-48">
                        <select
                          value={formData.priceGroup}
                          onChange={(e) =>
                            setFormData({ ...formData, priceGroup: e.target.value })
                          }
                          className="w-full appearance-none rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 pr-8"
                        >
                          {PRICE_GROUPS.map((p) => (
                            <option key={p}>{p}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <span className="text-slate-400 italic text-[11px]">
                        (optional, leave blank to show &apos;Get a quote&apos; phrase instead of price)
                      </span>
                    </div>

                    {/* Pricing Grid */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Grille Tarifaire (TND)
                        </p>
                      </div>
                      <div className="p-4 grid grid-cols-3 gap-4">
                        {[
                          { label: "Prix par Jour *", key: "dailyPrice" as const, required: true },
                          { label: "Prix par Semaine", key: "weeklyPrice" as const },
                          { label: "Prix par Mois", key: "monthlyPrice" as const },
                        ].map(({ label, key, required }) => (
                          <div key={key}>
                            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1.5">
                              {label}
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                required={required}
                                min={0}
                                value={formData[key]}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    [key]: Number(e.target.value),
                                  })
                                }
                                className="w-full rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2.5 text-slate-800 dark:text-white font-bold focus:outline-none focus:border-blue-500 pr-14"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                                TND
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Fixed Deposit */}
                    <div className="flex items-center gap-4">
                      <label className="w-44 shrink-0 font-semibold text-slate-700 dark:text-slate-300">
                        Fixed Deposit:<span className="text-red-500">*</span>
                      </label>
                      <div className="relative w-40">
                        <input
                          type="number"
                          required
                          min={0}
                          value={formData.fixedDeposit}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              fixedDeposit: Number(e.target.value),
                            })
                          }
                          className="w-full rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-800 dark:text-white font-bold focus:outline-none focus:border-blue-500 pr-14"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-500">
                          TND
                        </span>
                      </div>
                      <span className="text-slate-400 italic text-[11px]">
                        (taxes are not applicable for deposit - it is a refundable amount without taxes)
                      </span>
                    </div>

                    {/* Mileage info */}
                    <div className="flex items-center gap-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <label className="w-44 shrink-0 font-semibold text-slate-700 dark:text-slate-300">
                        Kilométrage actuel:
                      </label>
                      <div className="relative w-40">
                        <input
                          type="number"
                          min={0}
                          value={formData.mileage}
                          onChange={(e) =>
                            setFormData({ ...formData, mileage: Number(e.target.value) })
                          }
                          className="w-full rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 pr-10"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                          KM
                        </span>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 p-4 space-y-2">
                      <p className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Récapitulatif Tarifaire
                      </p>
                      <div className="grid grid-cols-3 gap-3 mt-2">
                        <div className="text-center">
                          <p className="text-[10px] text-blue-500 font-semibold uppercase">Jour</p>
                          <p className="text-lg font-black text-blue-700 dark:text-blue-200">
                            {formData.dailyPrice}
                          </p>
                          <p className="text-[10px] text-blue-400">TND</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-blue-500 font-semibold uppercase">Semaine</p>
                          <p className="text-lg font-black text-blue-700 dark:text-blue-200">
                            {formData.weeklyPrice}
                          </p>
                          <p className="text-[10px] text-blue-400">TND</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-blue-500 font-semibold uppercase">Mois</p>
                          <p className="text-lg font-black text-blue-700 dark:text-blue-200">
                            {formData.monthlyPrice}
                          </p>
                          <p className="text-[10px] text-blue-400">TND</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
                {/* Tab navigator */}
                <div className="flex items-center gap-2">
                  {FORM_TABS.map((tab, i) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFormTab(tab.id)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        formTab === tab.id
                          ? "bg-blue-600 scale-125"
                          : "bg-slate-300 dark:bg-slate-600 hover:bg-slate-400"
                      }`}
                      title={tab.label}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingVehicle(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Annuler
                  </button>
                  {formTab !== "pricing" ? (
                    <button
                      type="button"
                      onClick={() => {
                        const idx = FORM_TABS.findIndex((t) => t.id === formTab);
                        if (idx < FORM_TABS.length - 1) setFormTab(FORM_TABS[idx + 1].id);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
                    >
                      Suivant
                      <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={savingVehicle}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {savingVehicle ? (
                        <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      {savingVehicle ? "Sauvegarde..." : editingVehicle ? "Sauvegarder Modifications" : "Enregistrer le Véhicule"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
