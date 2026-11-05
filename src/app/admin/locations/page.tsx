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

  // Form for new location
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    city: "Tunis",
    address: "",
    phone: "+216 ",
    email: "Reservations@hmlrentcar.tn",
    isAirport: true,
    openingHours: "08:00 - 20:00 (24/7 sur demande)",
  });

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
  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const newLoc: LocationItem = {
      id: `loc-${Date.now()}`,
      code: formData.code.toUpperCase(),
      name: formData.name,
      city: formData.city,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      isAirport: formData.isAirport,
      isActive: true,
      openingHours: formData.openingHours,
      assignedVehiclesCount: 0,
    };
    setLocations([newLoc, ...locations]);
    setShowAddModal(false);
    showToast(`Agence "${formData.name}" créée avec succès`);
    setFormData({
      code: "",
      name: "",
      city: "Tunis",
      address: "",
      phone: "+216 ",
      email: "@payless.tn",
      isAirport: true,
      openingHours: "07:00 - 23:00",
    });
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
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
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
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
          {filteredLocations.length} agences trouvées
        </span>
      </div>

      {/* LOCATION CARDS GRID */}
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

                {/* Assigned Cars Pill */}
                <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
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
    </div>
  );
}

