"use client";

import React, { useState, useEffect } from "react";
import {
  Tag,
  Search,
  Calendar,
  Percent,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Car,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  TrendingDown,
} from "lucide-react";
import Image from "next/image";

interface SeasonalPeriod {
  name: string;
  startMonth?: number;
  endMonth?: number;
  startDate?: string;
  endDate?: string;
  dailyRate: number;
  discountPercent?: number;
}

interface VehiclePricing {
  daily: number;
  weekly: number;
  monthly: number;
  deposit: number;
  seasonalPrices: SeasonalPeriod[];
}

interface VehicleItem {
  _id: string;
  brand: string;
  model: string;
  licensePlate: string;
  category: string;
  imageUrl: string;
  status: string;
  pricing: VehiclePricing;
}

const MONTHS = [
  { value: 1, label: "01 - Janvier" },
  { value: 2, label: "02 - Février" },
  { value: 3, label: "03 - Mars" },
  { value: 4, label: "04 - Avril" },
  { value: 5, label: "05 - Mai" },
  { value: 6, label: "06 - Juin" },
  { value: 7, label: "07 - Juillet" },
  { value: 8, label: "08 - Août" },
  { value: 9, label: "09 - Septembre" },
  { value: 10, label: "10 - Octobre" },
  { value: 11, label: "11 - Novembre" },
  { value: 12, label: "12 - Décembre" },
];

export default function AdminPricingPage() {
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ id: string; text: string; type: "success" | "error" } | null>(null);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/vehicles/pricing");
      const data = await res.json();
      if (data.success && Array.isArray(data.vehicles)) {
        setVehicles(data.vehicles);
      }
    } catch (err) {
      console.error("Failed to load vehicle pricing", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleBaseRateChange = (vehicleId: string, value: number) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v._id === vehicleId
          ? { ...v, pricing: { ...v.pricing, daily: Math.max(0, value) } }
          : v
      )
    );
  };

  const handleAddPeriod = (vehicleId: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v._id !== vehicleId) return v;
        const currentSeasons = v.pricing.seasonalPrices || [];
        const newSeason: SeasonalPeriod = {
          name: `Période ${currentSeasons.length + 1}`,
          startMonth: 11,
          endMonth: 5,
          dailyRate: v.pricing.daily || 90,
          discountPercent: 0,
        };
        return {
          ...v,
          pricing: {
            ...v.pricing,
            seasonalPrices: [...currentSeasons, newSeason],
          },
        };
      })
    );
  };

  const handlePeriodChange = (
    vehicleId: string,
    index: number,
    field: keyof SeasonalPeriod,
    value: any
  ) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v._id !== vehicleId) return v;
        const updated = [...(v.pricing.seasonalPrices || [])];
        updated[index] = { ...updated[index], [field]: value };
        return {
          ...v,
          pricing: { ...v.pricing, seasonalPrices: updated },
        };
      })
    );
  };

  const handleRemovePeriod = (vehicleId: string, index: number) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v._id !== vehicleId) return v;
        const updated = [...(v.pricing.seasonalPrices || [])];
        updated.splice(index, 1);
        return {
          ...v,
          pricing: { ...v.pricing, seasonalPrices: updated },
        };
      })
    );
  };

  const handleSavePricing = async (vehicle: VehicleItem) => {
    setSavingId(vehicle._id);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/vehicles/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehicle._id,
          dailyRate: vehicle.pricing.daily,
          seasonalPrices: vehicle.pricing.seasonalPrices,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          id: vehicle._id,
          text: "Tarifs et périodes enregistrés avec succès !",
          type: "success",
        });
      } else {
        setStatusMessage({
          id: vehicle._id,
          text: data.error || "Erreur lors de la sauvegarde.",
          type: "error",
        });
      }
    } catch (err) {
      setStatusMessage({
        id: vehicle._id,
        text: "Erreur réseau lors de la sauvegarde.",
        type: "error",
      });
    } finally {
      setSavingId(null);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.brand.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      (v.licensePlate && v.licensePlate.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-blue-500/10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
              <Tag className="w-5 h-5 text-amber-300" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-200">
              Gestion Tarifaire Intelligente
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Tarifs par Période & Saisons
          </h1>
          <p className="text-sm text-blue-100 max-w-2xl leading-relaxed">
            Configurez les prix par période pour chaque voiture (ex. Période Mois 11 → Mois 5 à 90 DT)
            avec réductions appliquées sur la période choisie.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
            <div className="text-2xl font-black">{vehicles.length}</div>
            <div className="text-[11px] uppercase font-bold text-blue-200">Véhicules Actifs</div>
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par marque, modèle ou matricule..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Info className="w-4 h-4 text-blue-500 shrink-0" />
          <span>Les prix saisonniers s'appliquent automatiquement lors des réservations.</span>
        </div>
      </div>

      {/* Vehicle Pricing Cards */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 dark:text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3" />
          <p className="text-sm font-semibold">Chargement des tarifs de la flotte...</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <Car className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Aucun véhicule trouvé</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Modifiez votre recherche ou vérifiez la flotte.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredVehicles.map((vehicle) => {
            const isSaving = savingId === vehicle._id;
            const message = statusMessage?.id === vehicle._id ? statusMessage : null;
            const seasons = vehicle.pricing.seasonalPrices || [];

            return (
              <div
                key={vehicle._id}
                className="bg-white dark:bg-[#0f141f] rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                {/* Vehicle Header Row */}
                <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                      {vehicle.imageUrl ? (
                        <Image
                          src={vehicle.imageUrl}
                          alt={vehicle.model}
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Car className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          {vehicle.brand} {vehicle.model}
                        </h2>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                          {vehicle.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                        {vehicle.licensePlate}
                      </p>
                    </div>
                  </div>

                  {/* Base Daily Rate Setting */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Tarif Standard (Jour) :
                      </span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          value={vehicle.pricing.daily || 0}
                          onChange={(e) =>
                            handleBaseRateChange(vehicle._id, Number(e.target.value))
                          }
                          className="w-18 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-sm font-bold text-center text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-xs font-bold text-amber-500">TND</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSavePricing(vehicle)}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Enregistrement...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Enregistrer</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Status Feedback Message */}
                {message && (
                  <div
                    className={`mx-5 mt-4 p-3 rounded-2xl flex items-center gap-2 text-xs font-medium ${
                      message.type === "success"
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50"
                        : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50"
                    }`}
                  >
                    {message.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    )}
                    <span>{message.text}</span>
                  </div>
                )}

                {/* Seasonal Periods List */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Périodes Spéciales & Tarifs Saisonniers
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-400">
                        ({seasons.length} configurée{seasons.length > 1 ? "s" : ""})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddPeriod(vehicle._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Ajouter Période</span>
                    </button>
                  </div>

                  {seasons.length === 0 ? (
                    <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-900/20">
                      <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Aucun tarif de période défini pour ce véhicule. Le tarif standard de{" "}
                        <strong className="text-slate-900 dark:text-white">{vehicle.pricing.daily} TND/jour</strong>{" "}
                        s'applique toute l'année.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleAddPeriod(vehicle._id)}
                        className="mt-3 text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Définir une période saisonnière (ex. Hiver / Été)
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {seasons.map((period, idx) => {
                        const effective = Math.round(
                          period.dailyRate * (1 - (period.discountPercent || 0) / 100)
                        );

                        return (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
                              {/* Period Name */}
                              <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                  Nom Période
                                </label>
                                <input
                                  type="text"
                                  value={period.name}
                                  onChange={(e) =>
                                    handlePeriodChange(vehicle._id, idx, "name", e.target.value)
                                  }
                                  placeholder="Ex: Basse Saison (Hiver)"
                                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              {/* Start Month */}
                              <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                  Du Mois
                                </label>
                                <select
                                  value={period.startMonth || 11}
                                  onChange={(e) =>
                                    handlePeriodChange(
                                      vehicle._id,
                                      idx,
                                      "startMonth",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  {MONTHS.map((m) => (
                                    <option key={m.value} value={m.value}>
                                      {m.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* End Month */}
                              <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                  Au Mois
                                </label>
                                <select
                                  value={period.endMonth || 5}
                                  onChange={(e) =>
                                    handlePeriodChange(
                                      vehicle._id,
                                      idx,
                                      "endMonth",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  {MONTHS.map((m) => (
                                    <option key={m.value} value={m.value}>
                                      {m.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Daily Rate & Discount */}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                    Tarif (TND)
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={period.dailyRate}
                                    onChange={(e) =>
                                      handlePeriodChange(
                                        vehicle._id,
                                        idx,
                                        "dailyRate",
                                        Number(e.target.value)
                                      )
                                    }
                                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                    Remise %
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="90"
                                    value={period.discountPercent || 0}
                                    onChange={(e) =>
                                      handlePeriodChange(
                                        vehicle._id,
                                        idx,
                                        "discountPercent",
                                        Number(e.target.value)
                                      )
                                    }
                                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Effective Rate Badge & Delete Button */}
                            <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-800 shrink-0">
                              <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-right">
                                <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 block">
                                  Tarif Effectif
                                </span>
                                <span className="text-sm font-black text-amber-600 dark:text-amber-300">
                                  {effective} TND{" "}
                                  <span className="text-[10px] font-normal text-slate-500">/ jour</span>
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemovePeriod(vehicle._id, idx)}
                                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                title="Supprimer cette période"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

