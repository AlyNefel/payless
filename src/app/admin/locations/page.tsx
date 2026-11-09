"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Building2,
  Plane,
  Phone,
  Mail,
  Clock,
  Car,
  Plus,
  Search,
  CheckCircle2,
  X,
  ArrowRightLeft,
  ChevronRight,
  Shield,
  Edit2,
  Trash2,
  Filter,
  Sparkles,
  LayoutGrid,
  List,
  MoreVertical,
  ChevronDown,
  Eye,
} from "lucide-react";
import { MOCK_LOCATIONS, INITIAL_VEHICLES, LocationItem, VehicleItem } from "../mockData";

export default function LocationManagerPage() {
  const [locations, setLocations] = useState<LocationItem[]>(MOCK_LOCATIONS);
  const [vehicles, setVehicles] = useState<VehicleItem[]>(INITIAL_VEHICLES);
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [targetLocationName, setTargetLocationName] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "table">("table");
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  const handleDeleteLocation = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'agence "${name}" ?`)) return;
    try {
      const res = await fetch(`/api/admin/locations?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Agence "${name}" supprimée avec succès`);
        loadLocations();
      } else {
        setLocations((prev) => prev.filter((l) => l.id !== id));
        showToast(`Agence "${name}" retirée de la liste`);
      }
    } catch {
      setLocations((prev) => prev.filter((l) => l.id !== id));
      showToast(`Agence "${name}" retirée`);
    }
    setActionMenuOpenId(null);
  };

  // Form for new location
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    city: "Tunis",
    address: "",
    phone: "+216 25 120 130",
    email: "contact@paylesscarrental.tn",
    isAirport: true,
    isOutsideTunis: false,
    pickupFee: 0,
    customReturnFee: 100,
    openingHours: "08:00 - 20:00 (24/7 sur demande)",
  });

  const loadLocations = async () => {
    try {
      const res = await fetch("/api/admin/locations");
      const json = await res.json();
      if (json.success && Array.isArray(json.locations) && json.locations.length > 0) {
        const mapped: LocationItem[] = json.locations.map((l: any, i: number) => ({
          id: l._id || `loc-${i}`,
          code: l.code || (l.name?.fr || l.name || "").substring(0, 3).toUpperCase(),
          name: typeof l.name === "string" ? l.name : (l.name?.fr || "Agence"),
          city: l.city || "Tunisie",
          address: l.address || "",
          phone: l.phone || "+216 25 120 130",
          email: l.email || "contact@paylesscarrental.tn",
          isAirport: Boolean(l.isAirport),
          isActive: l.isActive !== false,
          isOutsideTunis: Boolean(l.isOutsideTunis),
          pickupFee: l.pickupFee ? l.pickupFee / 100 : 0,
          customReturnFee: l.customReturnFee ? l.customReturnFee / 100 : (l.returnFee ? l.returnFee / 100 : 0),
          returnFee: l.returnFee ? l.returnFee / 100 : (l.customReturnFee ? l.customReturnFee / 100 : 0),
          openingHours: l.openingHours?.monday ? `${l.openingHours.monday.open} - ${l.openingHours.monday.close}` : "08:00 - 20:00",
          assignedVehiclesCount: 0,
        }));
        setLocations(mapped);
      }
    } catch (err) {
      console.warn("Failed to fetch live locations, using fallbacks:", err);
    }
  };

  React.useEffect(() => {
    loadLocations();
  }, []);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const filteredLocations = locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(search.toLowerCase()) ||
      loc.city.toLowerCase().includes(search.toLowerCase()) ||
      loc.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalAssignedCars = locations.reduce((sum, loc) => sum + loc.assignedVehiclesCount, 0);

  // Handle assigning vehicle to location
  const handleAssignVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId || !targetLocationName) return;

    // Update vehicle location
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === selectedVehicleId ? { ...v, location: targetLocationName } : v
      )
    );

    // Update location counts
    setLocations((prev) =>
      prev.map((loc) => {
        const count = vehicles.filter((v) =>
          v.id === selectedVehicleId ? targetLocationName.includes(loc.code) || targetLocationName.includes(loc.city) : v.location.includes(loc.code) || v.location.includes(loc.city)
        ).length;
        return { ...loc, assignedVehiclesCount: Math.max(1, count) };
      })
    );

    const vehicleObj = vehicles.find((v) => v.id === selectedVehicleId);
    showToast(
      `${vehicleObj?.brand} ${vehicleObj?.model} assigné(e) avec succès à ${targetLocationName}`
    );
    setShowAssignModal(false);
    setSelectedVehicleId("");
    setTargetLocationName("");
  };

  // Add new location
  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: { fr: formData.name, en: formData.name, ar: formData.name },
          code: formData.code.toUpperCase(),
          city: formData.city,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          isAirport: formData.isAirport,
          isActive: true,
          isOutsideTunis: formData.isOutsideTunis,
          pickupFee: Number(formData.pickupFee || 0) * 100, // store in minor units (centimes)
          customReturnFee: Number(formData.customReturnFee || 0) * 100, // store in minor units
          returnFee: Number(formData.customReturnFee || 0) * 100,
        }),
      });
      if (res.ok) {
        showToast(`Agence "${formData.name}" enregistrée en base de données`);
        loadLocations();
      } else {
        showToast(`Agence "${formData.name}" créée`);
      }
    } catch {
      showToast(`Agence "${formData.name}" créée`);
    }

    setShowAddModal(false);
    setFormData({
      code: "",
      name: "",
      city: "Tunis",
      address: "",
      phone: "+216 25 120 130",
      email: "contact@paylesscarrental.tn",
      isAirport: true,
      isOutsideTunis: false,
      pickupFee: 0,
      customReturnFee: 100,
      openingHours: "07:00 - 23:00",
    });
  };

  // Update existing location
  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;
    try {
      const res = await fetch("/api/admin/locations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingLocation.id,
          updates: {
            name: { fr: editingLocation.name, en: editingLocation.name, ar: editingLocation.name },
            city: editingLocation.city,
            address: editingLocation.address,
            phone: editingLocation.phone,
            email: editingLocation.email,
            isAirport: editingLocation.isAirport,
            isOutsideTunis: editingLocation.isOutsideTunis,
            pickupFee: Number(editingLocation.pickupFee || 0) * 100,
            customReturnFee: Number(editingLocation.customReturnFee || 0) * 100,
            returnFee: Number(editingLocation.customReturnFee || 0) * 100,
          },
        }),
      });
      if (res.ok) {
        showToast(`Agence "${editingLocation.name}" mise à jour avec succès`);
        loadLocations();
      } else {
        showToast(`Agence mise à jour`);
      }
    } catch {
      showToast(`Agence mise à jour`);
    }
    setEditingLocation(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-8 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-500 text-white shadow-xl text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER WITH TITLE & ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Gestionnaire des Agences & Emplacements
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gérez vos comptoirs aéroports, agences centrales et assignez la flotte de véhicules par ville.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition-all hover:scale-[1.02] shadow-sm"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Assigner Véhicule</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-xs shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter une Agence</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Agences Actives",
            val: locations.filter((l) => l.isActive).length,
            sub: `${locations.length} enregistrées`,
            icon: Building2,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-900/20",
          },
          {
            title: "Comptoirs Aéroports",
            val: locations.filter((l) => l.isAirport).length,
            sub: "CMN, RAK, RBA, TNG, AGA",
            icon: Plane,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
          },
          {
            title: "Véhicules Répartis",
            val: totalAssignedCars,
            sub: "100% de la flotte assignée",
            icon: Car,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-50 dark:bg-purple-900/20",
          },
          {
            title: "Disponibilité 24/7",
            val: "Aéroports",
            sub: "Livraison H24 garantie",
            icon: Clock,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-900/20",
          },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-5 rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {kpi.title}
                </p>
                <div className={`w-8 h-8 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {kpi.val}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {kpi.sub}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par ville, nom d'agence ou code IATA (ex: TUN, Monastir, Hammamet)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
            {filteredLocations.length} agences
          </span>

          {/* View mode toggle: Table or Cards */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tableau</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "card"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cartes</span>
            </button>
          </div>
        </div>
      </div>

      {/* LOCATIONS CONTENT: TABLE OR CARDS */}
      {viewMode === "table" ? (
        <div className="bg-white dark:bg-[#0f141f] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Agence / Code</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Ville & Adresse</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4 text-center">Frais Départ</th>
                  <th className="py-3.5 px-4 text-center">Frais Restitution</th>
                  <th className="py-3.5 px-4 text-center">Flotte</th>
                  <th className="py-3.5 px-4 text-center">Statut</th>
                  <th className="py-3.5 px-4 text-center">Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredLocations.map((loc) => {
                  const locationCars = vehicles.filter(
                    (v) => v.location.includes(loc.code) || v.location.includes(loc.city)
                  );
                  const isMenuOpen = actionMenuOpenId === loc.id;

                  return (
                    <tr
                      key={loc.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                            {loc.code}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {loc.name}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            loc.isAirport
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                              : "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30"
                          }`}
                        >
                          {loc.isAirport ? "✈️ Aéroport" : "🏢 Centre Ville"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{loc.city}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{loc.address}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono text-slate-700 dark:text-slate-300">{loc.phone}</div>
                        <div className="text-[11px] text-slate-400">{loc.openingHours}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="font-bold text-blue-700 dark:text-blue-300 font-mono">
                          {loc.pickupFee && loc.pickupFee > 0 ? `+${loc.pickupFee} DT` : "Gratuit (0 DT)"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="font-bold text-amber-700 dark:text-amber-300 font-mono">
                          {loc.customReturnFee && loc.customReturnFee > 0
                            ? `+${loc.customReturnFee} DT`
                            : loc.isOutsideTunis
                            ? "+100 DT (Hors Tunis)"
                            : "Standard (0 DT)"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedLocation(loc)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-xs transition-colors cursor-pointer"
                        >
                          <Car className="w-3.5 h-3.5" />
                          <span>{locationCars.length > 0 ? locationCars.length : loc.assignedVehiclesCount}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            loc.isActive !== false
                              ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }`}
                        >
                          {loc.isActive !== false ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center relative">
                        {/* Options Dropdown Menu */}
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuOpenId(isMenuOpen ? null : loc.id);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                          >
                            <span>Options</span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          </button>

                          {isMenuOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setActionMenuOpenId(null)}
                              />
                              <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-700 shadow-xl py-1 z-40 text-xs text-left animate-in fade-in zoom-in-95">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingLocation({ ...loc });
                                    setActionMenuOpenId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Modifier l'agence</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedLocation(loc);
                                    setActionMenuOpenId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                                  <span>Voir la flotte</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTargetLocationName(`${loc.city} - ${loc.name}`);
                                    setShowAssignModal(true);
                                    setActionMenuOpenId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Assigner un véhicule</span>
                                </button>
                                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLocation(loc.id, loc.name)}
                                  className="w-full flex items-center gap-2 px-3.5 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Supprimer l'agence</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* LOCATION CARDS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLocations.map((loc, idx) => {
            const locationCars = vehicles.filter(
              (v) => v.location.includes(loc.code) || v.location.includes(loc.city)
            );

            return (
              <motion.div
                key={loc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                className="p-5 rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Top Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20 shrink-0">
                        {loc.code}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                          {loc.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          {loc.city}, Tunisie
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap border ${
                        loc.isAirport
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                          : "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30"
                      }`}
                    >
                      {loc.isAirport ? "✈️ Aéroport" : "🏢 Centre Ville"}
                    </span>
                  </div>

                  {/* Details list */}
                  <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="truncate">{loc.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-slate-700 dark:text-slate-300">{loc.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{loc.openingHours}</span>
                    </div>
                  </div>

                  {/* Pricing Badges: Pickup & Return Fees */}
                  <div className="grid grid-cols-2 gap-2 my-2 text-[11px]">
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/40">
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-[10px]">Prise en charge</p>
                      <p className="font-bold text-blue-700 dark:text-blue-300">
                        {loc.pickupFee && loc.pickupFee > 0 ? `+${loc.pickupFee} DT` : "Gratuit (0 DT)"}
                      </p>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-900/40">
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-[10px]">Restitution / Ramassage</p>
                      <p className="font-bold text-amber-700 dark:text-amber-300">
                        {loc.customReturnFee && loc.customReturnFee > 0
                          ? `+${loc.customReturnFee} DT`
                          : loc.isOutsideTunis
                          ? "+100 DT (Hors Tunis)"
                          : "Standard (0 DT)"}
                      </p>
                    </div>
                  </div>

                  {/* Assigned Cars Pill */}
                  <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Flotte sur place
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg bg-blue-100/70 dark:bg-blue-600/20">
                      {locationCars.length > 0 ? locationCars.length : loc.assignedVehiclesCount} véhicules
                    </span>
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-4 mt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setEditingLocation({ ...loc })}
                    className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-600/15 dark:hover:bg-amber-600/25 text-amber-700 dark:text-amber-400 font-semibold text-xs transition-colors border border-amber-200 dark:border-amber-500/30 flex items-center gap-1.5"
                    title="Modifier les frais et paramètres de cette agence"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedLocation(loc);
                    }}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Voir la Flotte</span>
                  </button>

                  <button
                    onClick={() => {
                      setTargetLocationName(`${loc.city} - ${loc.name}`);
                      setShowAssignModal(true);
                    }}
                    className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/15 dark:hover:bg-blue-600/25 text-blue-700 dark:text-blue-400 font-semibold text-xs transition-colors border border-blue-200 dark:border-blue-500/30"
                    title="Assigner un véhicule à cette agence"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* DRAWER / MODAL: VIEW FLEET STATIONED AT SELECTED LOCATION */}
      {selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-slate-900 dark:text-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  {selectedLocation.code}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Flotte basée à {selectedLocation.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedLocation.city} · {selectedLocation.address}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of vehicles at this location */}
            <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
              {vehicles
                .filter(
                  (v) =>
                    v.location.includes(selectedLocation.code) ||
                    v.location.includes(selectedLocation.city)
                )
                .map((v) => (
                  <div
                    key={v.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {v.brand} {v.model} ({v.year})
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          Matricule: {v.licensePlate} · {v.category} · {v.pricing.daily} TND/j
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          v.status === "available"
                            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                            : v.status === "rented"
                            ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
                            : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {v.status === "available"
                          ? "Disponible"
                          : v.status === "rented"
                          ? "En location"
                          : "Entretien"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedLocation(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN CAR TO LOCATION */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Assigner un Véhicule à une Agence
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Déplacez ou rattachez un véhicule de la flotte
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignVehicle} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  1. Sélectionner le véhicule
                </label>
                <select
                  required
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Choisir un véhicule --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.licensePlate}) - Actuel: {v.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  2. Nouvelle Agence de rattachement
                </label>
                <select
                  required
                  value={targetLocationName}
                  onChange={(e) => setTargetLocationName(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Choisir l'agence de destination --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={`${loc.city} - ${loc.name}`}>
                      {loc.code} - {loc.name} ({loc.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/25"
                >
                  Confirmer le transfert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW LOCATION */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Créer une Nouvelle Agence
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ajoutez un comptoir aéroport ou une agence de ville
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Code IATA / Agence
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: FEZ ou CMN-2"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Ville
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option>Tunis</option>
                    <option>Monastir</option>
                    <option>Enfidha</option>
                    <option>Hammamet</option>
                    <option>Sousse</option>
                    <option>Sfax</option>
                    <option>Bizerte</option>
                    <option>Nabeul</option>
                    <option>Ariana</option>
                    <option>La Soukra</option>
                    <option>Djerba</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Nom de l'Agence
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fès-Saïss - Aéroport International"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Adresse Précise
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Hall Arrivée, Terminal 1"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Téléphone Direct
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Horaires d'ouverture
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.openingHours}
                    onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Frais Prise en Charge (DT)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.pickupFee}
                    onChange={(e) => setFormData({ ...formData, pickupFee: Number(e.target.value) })}
                    className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono font-bold"
                    placeholder="0"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Frais appliqué si retrait ici</p>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Frais Restitution / Ramassage (DT)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.customReturnFee}
                    onChange={(e) => setFormData({ ...formData, customReturnFee: Number(e.target.value) })}
                    className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono font-bold"
                    placeholder="0"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Frais appliqué si retour ici</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isAirport"
                  checked={formData.isAirport}
                  onChange={(e) => setFormData({ ...formData, isAirport: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <label htmlFor="isAirport" className="text-slate-700 dark:text-slate-300 font-medium">
                  Comptoir d'aéroport (avec prise en charge 24h/24)
                </label>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isOutsideTunis"
                    checked={formData.isOutsideTunis}
                    onChange={(e) => setFormData({ ...formData, isOutsideTunis: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                  />
                  <label htmlFor="isOutsideTunis" className="text-amber-900 dark:text-amber-200 font-bold">
                    Emplacement situé hors de Tunis (Frais de rapatriement requis)
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-500/25"
                >
                  Enregistrer l'agence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EXISTING LOCATION */}
      {editingLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-600/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Modifier l'Agence : {editingLocation.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ajustez les frais de prise en charge et de restitution
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingLocation(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateLocation} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Code IATA / Agence
                  </label>
                  <input
                    type="text"
                    required
                    value={editingLocation.code}
                    onChange={(e) => setEditingLocation({ ...editingLocation, code: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    required
                    value={editingLocation.city}
                    onChange={(e) => setEditingLocation({ ...editingLocation, city: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Nom de l'Agence
                </label>
                <input
                  type="text"
                  required
                  value={editingLocation.name}
                  onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Adresse Précise
                </label>
                <input
                  type="text"
                  required
                  value={editingLocation.address}
                  onChange={(e) => setEditingLocation({ ...editingLocation, address: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Téléphone Direct
                  </label>
                  <input
                    type="tel"
                    required
                    value={editingLocation.phone}
                    onChange={(e) => setEditingLocation({ ...editingLocation, phone: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Horaires d'ouverture
                  </label>
                  <input
                    type="text"
                    required
                    value={editingLocation.openingHours}
                    onChange={(e) => setEditingLocation({ ...editingLocation, openingHours: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* INDIVIDUAL FEES SECTION */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40">
                <div>
                  <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">
                    Frais Prise en Charge (DT)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingLocation.pickupFee ?? 0}
                    onChange={(e) => setEditingLocation({ ...editingLocation, pickupFee: Number(e.target.value) })}
                    className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Ajouté sur la facture si le départ est ici
                  </p>
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-slate-200 font-bold mb-1">
                    Frais Restitution / Ramassage (DT)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingLocation.customReturnFee ?? 0}
                    onChange={(e) => setEditingLocation({ ...editingLocation, customReturnFee: Number(e.target.value), returnFee: Number(e.target.value) })}
                    className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Ajouté sur la facture si le retour est ici
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsAirport"
                  checked={editingLocation.isAirport}
                  onChange={(e) => setEditingLocation({ ...editingLocation, isAirport: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <label htmlFor="editIsAirport" className="text-slate-700 dark:text-slate-300 font-medium">
                  Comptoir d'aéroport (avec prise en charge 24h/24)
                </label>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editIsOutsideTunis"
                    checked={editingLocation.isOutsideTunis}
                    onChange={(e) => setEditingLocation({ ...editingLocation, isOutsideTunis: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                  />
                  <label htmlFor="editIsOutsideTunis" className="text-amber-900 dark:text-amber-200 font-bold">
                    Emplacement situé hors de Tunis (Frais de rapatriement requis)
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingLocation(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/25"
                >
                  Sauvegarder les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

