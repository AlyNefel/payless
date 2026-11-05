"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, User, Phone, Mail, Flag, BookOpen, DollarSign, Ban, RefreshCw, CheckCircle2 } from "lucide-react";
import { useAdminLang } from "@/contexts/AdminLangContext";

interface CustomerItem {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country?: string;
  city?: string;
  totalBookings: number;
  totalSpent: number;
  preferredLanguage?: string;
  isBlacklisted: boolean;
  notes?: string;
  tags?: string[];
}

export default function CustomersPage() {
  const { lang } = useAdminLang();
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/customers?limit=100");
      const json = await res.json();
      if (json.success && Array.isArray(json.customers) && json.customers.length > 0) {
        setCustomers(json.customers);
      }
    } catch (e) {
      console.error("Failed to load customers from API:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return `${c.firstName} ${c.lastName} ${c.email} ${c.phone} ${c.city || ""}`.toLowerCase().includes(q);
  });

  const fmt = (n: number | undefined) => {
    if (n === undefined || isNaN(n)) return "0 TND";
    const val = n >= 1000 ? Math.round(n / 100) : Math.round(n);
    return `${val.toLocaleString("fr-FR")} TND`;
  };

  const handleSaveNotes = async () => {
    if (!selectedCustomer) return;
    try {
      await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedCustomer._id, notes: noteText }),
      });
      setCustomers((prev) =>
        prev.map((c) => (c._id === selectedCustomer._id ? { ...c, notes: noteText } : c))
      );
      setSelectedCustomer((prev) => (prev ? { ...prev, notes: noteText } : null));
      setFeedback(lang === "fr" ? "Notes enregistrées !" : "Notes saved!");
      setTimeout(() => setFeedback(null), 3000);
    } catch (e) {
      console.error("Failed to update notes:", e);
    }
  };

  const handleToggleBlacklist = async () => {
    if (!selectedCustomer) return;
    const newStatus = !selectedCustomer.isBlacklisted;
    try {
      await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedCustomer._id, isBlacklisted: newStatus }),
      });
      setCustomers((prev) =>
        prev.map((c) => (c._id === selectedCustomer._id ? { ...c, isBlacklisted: newStatus } : c))
      );
      setSelectedCustomer((prev) => (prev ? { ...prev, isBlacklisted: newStatus } : null));
      setFeedback(
        newStatus
          ? (lang === "fr" ? "Client ajouté à la liste noire" : "Customer blacklisted")
          : (lang === "fr" ? "Client retiré de la liste noire" : "Customer unblocked")
      );
      setTimeout(() => setFeedback(null), 3000);
    } catch (e) {
      console.error("Failed to toggle blacklist:", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {lang === "fr" ? "Gestion des Clients (CRM)" : "Customer Management (CRM)"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            {customers.length} {lang === "fr" ? "clients enregistrés dans la base de données" : "customers registered in database"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {feedback && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{feedback}</span>
            </div>
          )}

          <button
            onClick={fetchCustomers}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{lang === "fr" ? "Actualiser" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder={lang === "fr" ? "Rechercher par nom, prénom, email, téléphone ou ville…" : "Search by name, email, phone, or city…"}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer list */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.map((c) => (
            <motion.button
              key={c._id || c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => {
                setSelectedCustomer(c);
                setNoteText(c.notes || "");
              }}
              className={`w-full text-left bg-white dark:bg-[#0f141f] rounded-2xl border-2 p-5 transition-all hover:shadow-md ${
                selectedCustomer?._id === c._id
                  ? "border-blue-500 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${
                    c.isBlacklisted ? "bg-red-500" : "bg-blue-600"
                  }`}
                >
                  {(c.firstName || "C")[0]}
                  {(c.lastName || "")[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base text-slate-900 dark:text-white">
                      {c.firstName} {c.lastName}
                    </span>
                    {c.isBlacklisted && (
                      <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Ban className="w-3 h-3" />
                        {lang === "fr" ? "Blacklisté" : "Blacklisted"}
                      </span>
                    )}
                    {(c.tags || [])
                      .filter((t) => t !== "Blacklisté")
                      .map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      {c.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      {c.phone}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Flag className="w-3.5 h-3.5" />
                      {c.city || "Tunis"}, {c.country || "Tunisie"}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {c.totalBookings || 1} {lang === "fr" ? "résa" : "bookings"}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {fmt(c.totalSpent)}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
              {lang === "fr" ? "Aucun client trouvé" : "No customers found"}
            </div>
          )}
        </div>

        {/* Customer detail panel */}
        {selectedCustomer ? (
          <div className="bg-white dark:bg-[#0f141f] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5 h-fit sticky top-20">
            <div className="flex items-center gap-3">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                  selectedCustomer.isBlacklisted ? "bg-red-500" : "bg-blue-600"
                }`}
              >
                {(selectedCustomer.firstName || "C")[0]}
                {(selectedCustomer.lastName || "")[0]}
              </div>
              <div>
                <div className="font-bold text-lg text-slate-900 dark:text-white">
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-sm">
                  {selectedCustomer.city || "Tunis"}, {selectedCustomer.country || "Tunisie"}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-800 dark:text-slate-200">{selectedCustomer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-800 dark:text-slate-200">{selectedCustomer.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 text-center border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 mb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="text-xs">{lang === "fr" ? "Réservations" : "Bookings"}</span>
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedCustomer.totalBookings || 1}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 text-center border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 mb-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span className="text-xs">{lang === "fr" ? "Total dépensé" : "Total spent"}</span>
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  {fmt(selectedCustomer.totalSpent)}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                {lang === "fr" ? "Notes internes" : "Internal Notes"}
              </label>
              <textarea
                rows={4}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={lang === "fr" ? "Ajouter une note sur ce client…" : "Add note about this customer…"}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-xs resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveNotes}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                {lang === "fr" ? "Enregistrer" : "Save"}
              </button>
              <button
                onClick={handleToggleBlacklist}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                  selectedCustomer.isBlacklisted
                    ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400"
                    : "border-red-300 text-red-600 hover:bg-red-50 dark:text-red-400"
                }`}
              >
                {selectedCustomer.isBlacklisted
                  ? (lang === "fr" ? "Débloquer" : "Unblock")
                  : (lang === "fr" ? "Blacklister" : "Blacklist")}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0f141f] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500 dark:text-slate-400 text-sm h-fit">
            <User className="w-10 h-10 mx-auto mb-3 opacity-20" />
            {lang === "fr" ? "Sélectionnez un client pour afficher son profil" : "Select a customer to view profile"}
          </div>
        )}
      </div>
    </div>
  );
}
