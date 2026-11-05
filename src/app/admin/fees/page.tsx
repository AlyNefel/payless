"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Tag,
  Shield,
  Zap,
  Settings,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  ChevronDown,
  X,
  Save,
  AlertCircle,
  Layers,
  Package,
  Globe,
  Briefcase,
} from "lucide-react";
import { MOCK_FEES, FeeItem } from "../mockData";

const TABS = [
  { id: "overview", label: "Overview", icon: Zap },
  { id: "extras", label: "Extras", icon: Plus },
  { id: "options", label: "Options", icon: Globe },
  { id: "duration", label: "Duration Discounts", icon: Clock },
  { id: "advance", label: "Discounts in Advance", icon: Zap },
  { id: "blocks", label: "Blocks", icon: Briefcase },
];

const CATEGORY_COLORS: Record<string, string> = {
  extra: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  fee: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  option: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  insurance: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  extra: Tag,
  fee: DollarSign,
  option: Settings,
  insurance: Shield,
};

const PRICING_TYPE_LABELS: Record<string, string> = {
  per_day: "Par Jour",
  fixed: "Fixe",
  percentage: "Pourcentage",
};

interface FeeFormData {
  code: string;
  name: string;
  category: FeeItem["category"];
  dayPrice: number;
  pricingType: FeeItem["pricingType"];
  depositRequired: boolean;
  depositAmount: number;
  description: string;
  isActive: boolean;
}

const DEFAULT_FORM: FeeFormData = {
  code: "",
  name: "",
  category: "extra",
  dayPrice: 0,
  pricingType: "per_day",
  depositRequired: false,
  depositAmount: 0,
  description: "",
  isActive: true,
};

export default function AdminFeesPage() {
  const [fees, setFees] = useState<FeeItem[]>(MOCK_FEES);
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeItem | null>(null);
  const [form, setForm] = useState<FeeFormData>(DEFAULT_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Stats
  const activeCount = fees.filter((f) => f.isActive).length;
  const totalRevenue = fees.reduce((s, f) => s + (f.isActive ? f.dayPrice : 0), 0);
  const categoryBreakdown = fees.reduce<Record<string, number>>((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {});

  const filteredFees = fees.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.code.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingFee(null);
    setForm(DEFAULT_FORM);
    setShowModal(true);
  };

  const openEdit = (fee: FeeItem) => {
    setEditingFee(fee);
    setForm({
      code: fee.code,
      name: fee.name,
      category: fee.category,
      dayPrice: fee.dayPrice,
      pricingType: fee.pricingType,
      depositRequired: fee.depositRequired,
      depositAmount: fee.depositAmount,
      description: fee.description,
      isActive: fee.isActive,
    });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFee) {
      setFees(
        fees.map((f) =>
          f.id === editingFee.id ? { ...f, ...form } : f
        )
      );
    } else {
      const newFee: FeeItem = {
        id: `fee-${Date.now()}`,
        ...form,
      };
      setFees([newFee, ...fees]);
    }
    setShowModal(false);
    setEditingFee(null);
    setForm(DEFAULT_FORM);
  };

  const handleDelete = (id: string) => {
    setFees(fees.filter((f) => f.id !== id));
    setDeleteConfirm(null);
  };

  const handleToggleActive = (id: string) => {
    setFees(fees.map((f) => (f.id === id ? { ...f, isActive: !f.isActive } : f)));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Gestionnaire des Frais & Extras
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configurez les options supplémentaires, frais et assurances proposés à vos clients.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Frais / Extra</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Frais
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{fees.length}</span>
            <span className="text-xs text-blue-500 font-medium">Configurés</span>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Actifs
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-500">{activeCount}</span>
            <span className="text-xs text-emerald-500 font-medium">En ligne</span>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Extras
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-blue-500">{categoryBreakdown.extra || 0}</span>
            <span className="text-xs text-blue-400 font-medium">Options client</span>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Assurances
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-violet-400">{categoryBreakdown.insurance || 0}</span>
            <span className="text-xs text-violet-400 font-medium">Couvertures</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation (Matches Screenshot 1) */}
      <div className="rounded-xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="flex items-center overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3.5 text-xs font-semibold whitespace-nowrap border-r border-slate-200 dark:border-slate-800 transition-all ${
                  isActive
                    ? "bg-[#28a9e0] text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT */}
        <div className="p-6">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div>
              <h1 className="text-3xl font-light text-slate-700 dark:text-slate-200 mb-6">
                Extra Prices for Today
              </h1>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#28a9e0] text-white">
                      <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider">
                        RENTAL OPTION / DAY PRICE
                      </th>
                      <th className="text-center px-5 py-3 text-xs font-bold uppercase tracking-wider border-l border-white/20">
                        1 DAY
                      </th>
                      <th className="text-center px-5 py-3 text-xs font-bold uppercase tracking-wider border-l border-white/20">
                        DEPOSIT
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {fees
                      .filter((f) => f.isActive)
                      .map((fee, idx) => {
                        return (
                          <tr
                            key={fee.id}
                            className={`${
                              idx % 2 === 0
                                ? "bg-white dark:bg-[#0f141f]"
                                : "bg-slate-50/60 dark:bg-[#111827]"
                            } hover:bg-sky-50/40 dark:hover:bg-blue-900/10 transition-colors`}
                          >
                            <td className="px-5 py-3.5">
                              <span className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wide">
                                {fee.code.replace(/_STD|_SUV/, "").replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-center border-l border-slate-200 dark:border-slate-800">
                              <span className="font-semibold text-slate-700 dark:text-slate-200 text-xs">
                                {fee.dayPrice > 0 ? `${fee.dayPrice} TND` : "0 TND"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-center border-l border-slate-200 dark:border-slate-800">
                              {fee.depositRequired ? (
                                <span className="font-semibold text-amber-500 text-xs">{fee.depositAmount} TND</span>
                              ) : (
                                <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Not required</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EXTRAS TAB */}
          {activeTab === "extras" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Extras & Options Client
                </h2>
                {/* Search */}
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un frais..."
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Nom & Code
                      </th>
                      <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Catégorie
                      </th>
                      <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Prix / Jour
                      </th>
                      <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Type Tarif
                      </th>
                      <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Caution
                      </th>
                      <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Statut
                      </th>
                      <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredFees.map((fee) => {
                      const CatIcon = CATEGORY_ICONS[fee.category];
                      return (
                        <tr
                          key={fee.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                                <CatIcon className="w-4 h-4 text-blue-500" />
                              </div>
                              <div>
                                <div className="font-semibold text-slate-800 dark:text-white text-xs">
                                  {fee.name}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400">
                                  {fee.code}
                                </div>
                                {fee.description && (
                                  <div className="text-[10px] text-slate-400 mt-0.5 max-w-xs truncate">
                                    {fee.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                                CATEGORY_COLORS[fee.category]
                              }`}
                            >
                              {fee.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-bold text-slate-800 dark:text-white text-sm">
                              {fee.dayPrice > 0 ? `${fee.dayPrice} TND` : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {PRICING_TYPE_LABELS[fee.pricingType]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {fee.depositRequired ? (
                              <div className="text-center">
                                <span className="text-xs font-semibold text-amber-500">
                                  {fee.depositAmount} TND
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Aucune</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleToggleActive(fee.id)}
                              className="transition-colors"
                              title={fee.isActive ? "Désactiver" : "Activer"}
                            >
                              {fee.isActive ? (
                                <div className="flex items-center justify-center gap-1">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  <span className="text-[10px] text-emerald-500 font-bold">Actif</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1">
                                  <XCircle className="w-4 h-4 text-slate-400" />
                                  <span className="text-[10px] text-slate-400">Inactif</span>
                                </div>
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openEdit(fee)}
                                className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-400 dark:text-slate-500 hover:text-blue-500 transition-colors"
                                title="Modifier"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              {deleteConfirm === fee.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDelete(fee.id)}
                                    className="p-1 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 text-[10px] font-bold"
                                  >
                                    Confirmer
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirm(fee.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleToggleActive(fee.id)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                title={fee.isActive ? "Désactiver" : "Activer"}
                              >
                                {fee.isActive ? (
                                  <ToggleRight className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <ToggleLeft className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* OPTIONS / DURATION / ADVANCE / BLOCKS TABS — Placeholder */}
          {(activeTab === "options" ||
            activeTab === "duration" ||
            activeTab === "advance" ||
            activeTab === "blocks") && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Settings className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-2">
                Module en cours de développement
              </h3>
              <p className="text-sm text-slate-400 max-w-md">
                {activeTab === "options" &&
                  "Les options de location (carburant prépayé, assurances complémentaires) seront configurables ici."}
                {activeTab === "duration" &&
                  "Définissez des remises automatiques selon la durée de location (ex: -10% pour 7 jours)."}
                {activeTab === "advance" &&
                  "Proposez des tarifs préférentiels pour les réservations effectuées à l'avance."}
                {activeTab === "blocks" &&
                  "Configurez des périodes de blocage pour tout ou partie de votre flotte."}
              </p>
              <button
                onClick={openAdd}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all"
              >
                <Plus className="w-4 h-4" />
                Configurer maintenant
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-[#0f141f] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                  {editingFee ? (
                    <Edit className="w-4 h-4 text-white" />
                  ) : (
                    <Plus className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingFee ? "Modifier le Frais / Extra" : "Ajouter un Nouveau Frais / Extra"}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {editingFee ? `Code: ${editingFee.code}` : "Configurez les tarifs et conditions"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingFee(null);
                }}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                {/* Code */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Code *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.code}
                    onChange={(e) =>
                      setForm({ ...form, code: e.target.value.toUpperCase() })
                    }
                    placeholder="EX: GPS_NAV"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Catégorie *
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={form.category}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          category: e.target.value as FeeItem["category"],
                        })
                      }
                      className="w-full appearance-none rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 pr-8"
                    >
                      <option value="extra">Extra (Équipement)</option>
                      <option value="fee">Frais Supplémentaire</option>
                      <option value="option">Option Service</option>
                      <option value="insurance">Assurance / Couverture</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Nom Complet (FR/EN) *
                </label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: GPS NAVIGATION / Système GPS Tunisie"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Day Price */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Prix (TND)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={form.dayPrice}
                      onChange={(e) =>
                        setForm({ ...form, dayPrice: Number(e.target.value) })
                      }
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 pr-14"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                      TND
                    </span>
                  </div>
                </div>

                {/* Pricing Type */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Type Tarification
                  </label>
                  <div className="relative">
                    <select
                      value={form.pricingType}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          pricingType: e.target.value as FeeItem["pricingType"],
                        })
                      }
                      className="w-full appearance-none rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 pr-8"
                    >
                      <option value="per_day">Par Jour de Location</option>
                      <option value="fixed">Montant Fixe (par réservation)</option>
                      <option value="percentage">Pourcentage du Total</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Deposit Toggle */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-white">
                      Caution / Dépôt de Garantie
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Une caution remboursable sera exigée pour ce service
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, depositRequired: !form.depositRequired })
                    }
                    className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${
                      form.depositRequired
                        ? "bg-blue-600"
                        : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 mt-0.5 ${
                        form.depositRequired ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {form.depositRequired && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Montant de la Caution (TND)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        value={form.depositAmount}
                        onChange={(e) =>
                          setForm({ ...form, depositAmount: Number(e.target.value) })
                        }
                        className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 pr-14"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                        TND
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Description (facultatif)
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Description affichée au client lors de la réservation..."
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-white">
                    Statut d&apos;Activation
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {form.isActive
                      ? "Visible et proposé aux clients"
                      : "Désactivé — masqué sur la plateforme"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${
                    form.isActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 mt-0.5 ${
                      form.isActive ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingFee(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  {editingFee ? "Enregistrer les modifications" : "Créer le Frais / Extra"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

