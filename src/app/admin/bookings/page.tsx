"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarCheck2,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Eye,
  X,
  MapPin,
  Car,
  CreditCard,
  User,
  Phone,
  Mail,
  FileText,
  RefreshCw,
} from "lucide-react";
import { INITIAL_BOOKINGS } from "../mockData";
import { useAdminLang } from "@/contexts/AdminLangContext";

export interface BookingDisplayItem {
  id: string;
  _id?: string;
  reference: string;
  bookingReference?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleName: string;
  licensePlate: string;
  pickupDate: string;
  returnDate: string;
  rentalDuration?: number;
  rentalDays?: number;
  pickupLocation: string;
  returnLocation: string;
  totalPrice?: number;
  totalAmount?: number;
  timbreFiscal?: number;
  contributionLF2026?: number;
  depositAmount: number;
  paymentStatus: "paid" | "partial" | "unpaid" | "refunded";
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled" | "rejected";
  paymentMethod?: string;
  extras?: any[];
  createdAt: string;
}

export default function AdminBookingsPage() {
  const { lang } = useAdminLang();
  const [bookings, setBookings] = useState<BookingDisplayItem[]>(INITIAL_BOOKINGS as any);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<BookingDisplayItem | null>(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [statusChangeFeedback, setStatusChangeFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bookings?limit=100");
      const json = await res.json();
      if (json.success && Array.isArray(json.bookings)) {
        setBookings(
          json.bookings.map((b: any) => ({
            ...b,
            totalPrice: b.totalAmount >= 1000 ? Math.round(b.totalAmount / 100) : b.totalAmount,
            rentalDays: b.rentalDuration || 1,
            paymentMethod: b.paymentMethod || "Paiement à la livraison",
            depositAmount: b.depositAmount >= 1000 ? Math.round(b.depositAmount / 100) : b.depositAmount || 0,
            timbreFiscal: b.timbreFiscal ? (b.timbreFiscal >= 100 ? b.timbreFiscal / 100 : b.timbreFiscal) : 1,
            contributionLF2026: b.contributionLF2026 ? (b.contributionLF2026 >= 100 ? b.contributionLF2026 / 100 : b.contributionLF2026) : (b.rentalDuration || 1) * 2,
          }))
        );
      }
    } catch (e) {
      console.error("Failed to fetch bookings:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Tab counts
  const tabCounts = {
    All: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    active: bookings.filter((b) => b.status === "active").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled" || b.status === "rejected").length,
  };

  // Filtered list
  const filteredBookings = bookings.filter((b) => {
    const matchesTab =
      activeTab === "All" ||
      b.status?.toLowerCase() === activeTab.toLowerCase() ||
      (activeTab === "cancelled" && b.status === "rejected");

    const matchesSearch =
      (b.reference || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.customerPhone || "").includes(search) ||
      (b.vehicleName || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.licensePlate || "").toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Handle instant status change
  const handleStatusChange = async (id: string, newStatus: BookingDisplayItem["status"]) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id || b._id === id ? { ...b, status: newStatus } : b))
    );

    try {
      await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.warn("Could not sync status change with server:", e);
    }

    setStatusChangeFeedback(
      newStatus === "confirmed"
        ? (lang === "fr" ? "Réservation confirmée ! Email envoyé au client." : "Booking confirmed! Email sent to customer.")
        : (lang === "fr" ? `Statut mis à jour vers "${newStatus.toUpperCase()}" avec succès.` : `Status updated to "${newStatus.toUpperCase()}".`)
    );
    setTimeout(() => setStatusChangeFeedback(null), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {lang === "fr" ? "Gestion des Réservations" : "Reservation Management"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === "fr"
              ? "Suivi en temps réel des contrats, validation, statuts fiscaux (LF 2026, Timbre) et vouchers."
              : "Real-time contracts, confirmations, fiscal rules (LF 2026, stamp), and official vouchers."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {statusChangeFeedback && (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              <span>{statusChangeFeedback}</span>
            </div>
          )}

          <button
            onClick={fetchBookings}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{lang === "fr" ? "Actualiser" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* FILTER TABS & SEARCH */}
      <div className="rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3">
          {[
            { key: "All", label: lang === "fr" ? "Toutes" : "All", count: tabCounts.All },
            { key: "pending", label: lang === "fr" ? "En Attente" : "Pending", count: tabCounts.pending },
            { key: "confirmed", label: lang === "fr" ? "Confirmées" : "Confirmed", count: tabCounts.confirmed },
            { key: "active", label: lang === "fr" ? "En Cours" : "Active", count: tabCounts.active },
            { key: "completed", label: lang === "fr" ? "Clôturées" : "Completed", count: tabCounts.completed },
            { key: "cancelled", label: lang === "fr" ? "Annulées" : "Cancelled", count: tabCounts.cancelled },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-900/60 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.key
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === "fr" ? "Rechercher par référence (ex: PAY-2026), client, téléphone, véhicule, matricule..." : "Search by reference, customer name, phone, vehicle, license plate..."}
            className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* COMPREHENSIVE BOOKINGS TABLE */}
      <div className="rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">{lang === "fr" ? "Référence & Date" : "Ref & Date"}</th>
                <th className="px-5 py-3.5 font-semibold">{lang === "fr" ? "Client & Contact" : "Customer"}</th>
                <th className="px-5 py-3.5 font-semibold">{lang === "fr" ? "Véhicule" : "Vehicle"}</th>
                <th className="px-5 py-3.5 font-semibold">{lang === "fr" ? "Itinéraire & Dates" : "Dates & Location"}</th>
                <th className="px-5 py-3.5 font-semibold">{lang === "fr" ? "Montant Total (TND)" : "Total Amount (TND)"}</th>
                <th className="px-5 py-3.5 font-semibold">{lang === "fr" ? "Règlement" : "Payment"}</th>
                <th className="px-5 py-3.5 font-semibold">{lang === "fr" ? "Statut" : "Status"}</th>
                <th className="px-5 py-3.5 font-semibold text-right">{lang === "fr" ? "Actions" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {filteredBookings.map((b) => (
                <tr key={b.id || b._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                  {/* Reference & Creation Date */}
                  <td className="px-5 py-4">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{b.reference || b.bookingReference}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString("fr-FR") : "Récent"}
                    </p>
                  </td>

                  {/* Customer */}
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900 dark:text-white">{b.customerName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {b.customerPhone}
                    </p>
                  </td>

                  {/* Vehicle */}
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900 dark:text-white">{b.vehicleName}</p>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-300 font-mono text-[10px] font-bold">
                      {b.licensePlate || "TUN-2026"}
                    </span>
                  </td>

                  {/* Itinerary */}
                  <td className="px-5 py-4">
                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      {b.pickupDate} &rarr; {b.returnDate}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[200px] mt-0.5">
                      {b.pickupLocation} ({b.rentalDays} j)
                    </p>
                  </td>

                  {/* Price */}
                  <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                    {(b.totalPrice || 0).toLocaleString("fr-FR")} TND
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                      Caution: {(b.depositAmount || 0).toLocaleString("fr-FR")} TND
                    </p>
                  </td>

                  {/* Payment Status */}
                  <td className="px-5 py-4">
                    {b.paymentStatus === "paid" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                        {lang === "fr" ? "Payé" : "Paid"}
                      </span>
                    )}
                    {b.paymentStatus === "unpaid" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-600 dark:text-orange-300 border border-orange-500/30">
                        {lang === "fr" ? "À l'arrivée" : "On Arrival"}
                      </span>
                    )}
                    {b.paymentStatus === "partial" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                        {lang === "fr" ? "Acompte" : "Partial"}
                      </span>
                    )}
                    {b.paymentStatus === "refunded" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700/50 text-slate-300 border border-slate-600/30">
                        {lang === "fr" ? "Remboursé" : "Refunded"}
                      </span>
                    )}
                  </td>

                  {/* Booking Status Dropdown */}
                  <td className="px-5 py-4">
                    <select
                      value={b.status}
                      onChange={(e) =>
                        handleStatusChange(b.id || b._id || "", e.target.value as BookingDisplayItem["status"])
                      }
                      className={`text-[11px] font-bold rounded-lg px-2.5 py-1.5 focus:outline-none border cursor-pointer transition-colors ${
                        b.status === "active"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600/40"
                          : b.status === "confirmed"
                          ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600/40"
                          : b.status === "pending"
                          ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600/40"
                          : b.status === "completed"
                          ? "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                          : "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-300 dark:border-red-600/40"
                      }`}
                    >
                      <option value="pending">{lang === "fr" ? "En Attente" : "Pending"}</option>
                      <option value="confirmed">{lang === "fr" ? "Confirmée" : "Confirmed"}</option>
                      <option value="active">{lang === "fr" ? "Active (En cours)" : "Active"}</option>
                      <option value="completed">{lang === "fr" ? "Clôturée" : "Completed"}</option>
                      <option value="cancelled">{lang === "fr" ? "Annulée" : "Cancelled"}</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedBooking(b);
                          setShowVoucherModal(true);
                        }}
                        title={lang === "fr" ? "Imprimer Voucher Officiel" : "Print Official Voucher"}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBooking(b);
                          setShowVoucherModal(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-100 dark:hover:bg-blue-600/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-xs font-semibold transition-colors"
                      >
                        {lang === "fr" ? "Détails" : "Details"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OFFICIAL VOUCHER & BOOKING DETAILS MODAL */}
      {showVoucherModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-700 shadow-2xl p-6 sm:p-8 my-8 max-h-[95vh] overflow-y-auto">
            {/* Modal header with Print and Close buttons */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 no-print">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {lang === "fr" ? "Bon de Réservation / Voucher Officiel" : "Official Booking Voucher"}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{lang === "fr" ? "Imprimer le Voucher" : "Print Voucher"}</span>
                </button>
                <button
                  onClick={() => setShowVoucherModal(false)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Voucher Paper */}
            <div
              id="printable-voucher"
              className="mt-6 rounded-2xl bg-white text-slate-900 p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6"
            >
              {/* Voucher Brand & Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-blue-800">
                    PAYLESS CAR RENTAL
                  </h2>
                  <p className="text-xs text-slate-600 font-semibold tracking-wider uppercase">
                    Bon de Location Officiel • Voucher
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Houimli Rent a Car SARL • RC Ariana B0123452020 • MF 1234567/A/M/000
                  </p>
                </div>

                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-slate-100 rounded border border-slate-300 font-mono text-sm font-black text-slate-900">
                    {selectedBooking.reference || selectedBooking.bookingReference}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Émis le {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleDateString("fr-FR") : "Récent"}
                  </p>
                </div>
              </div>

              {/* Customer & Vehicle Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                {/* Client Section */}
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Informations Locataire
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {selectedBooking.customerName}
                  </p>
                  <p className="text-slate-600 mt-0.5">{selectedBooking.customerEmail}</p>
                  <p className="text-slate-600 font-medium">{selectedBooking.customerPhone}</p>
                  <p className="text-slate-500 text-[11px] mt-2">
                    Permis de conduire vérifié à la prise en charge
                  </p>
                </div>

                {/* Vehicle Section */}
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Véhicule Assigné
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {selectedBooking.vehicleName}
                  </p>
                  <p className="text-slate-600 font-mono font-bold mt-0.5">
                    Matricule: {selectedBooking.licensePlate || "TUN-2026"}
                  </p>
                  <p className="text-slate-600">Catégorie: Tourisme & Confort</p>
                  <p className="text-slate-500 text-[11px] mt-2">
                    Carburant: Niveau plein à plein
                  </p>
                </div>
              </div>

              {/* Itinerary Schedule */}
              <div className="rounded-xl border border-slate-300 overflow-hidden text-xs">
                <div className="grid grid-cols-2 bg-slate-100 font-bold p-3 border-b border-slate-300">
                  <span>Prise en charge (Départ)</span>
                  <span>Restitution (Retour)</span>
                </div>
                <div className="grid grid-cols-2 p-3 gap-2">
                  <div>
                    <p className="font-bold text-slate-900">{selectedBooking.pickupDate}</p>
                    <p className="text-slate-600 text-[11px]">{selectedBooking.pickupLocation}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{selectedBooking.returnDate}</p>
                    <p className="text-slate-600 text-[11px]">{selectedBooking.returnLocation}</p>
                  </div>
                </div>
              </div>

              {/* Pricing breakdown with Tunisian Legal Requirements */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Durée de location ({selectedBooking.rentalDays} jours)</span>
                  <span>{((selectedBooking.totalPrice || 0) - (selectedBooking.contributionLF2026 || (selectedBooking.rentalDays || 1) * 2) - 1).toLocaleString("fr-FR")} TND</span>
                </div>

                {/* Fiscal Stamp */}
                <div className="flex justify-between text-slate-600">
                  <span>Timbre fiscal (Fixe par contrat)</span>
                  <span className="font-medium text-slate-900">+1 TND</span>
                </div>

                {/* Contribution LF 2026 */}
                <div className="flex justify-between text-slate-600">
                  <span>Contribution LF 2026 (2 DT / jour / voiture louée × {selectedBooking.rentalDays} j)</span>
                  <span className="font-medium text-slate-900">+{(selectedBooking.contributionLF2026 || (selectedBooking.rentalDays || 1) * 2).toLocaleString("fr-FR")} TND</span>
                </div>

                {/* TVA 0% */}
                <div className="flex justify-between text-slate-600">
                  <span>TVA (0% - Toutes Taxes Comprises)</span>
                  <span className="text-emerald-700 font-semibold">0 DT (Inclus TTC)</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Caution de garantie (Pré-autorisation CB)</span>
                  <span>{(selectedBooking.depositAmount || 0).toLocaleString("fr-FR")} TND</span>
                </div>

                <div className="pt-2 border-t border-slate-300 flex justify-between text-sm font-black text-slate-900">
                  <span>TOTAL RÈGLEMENT T.T.C</span>
                  <span className="text-blue-800 text-base">
                    {(selectedBooking.totalPrice || 0).toLocaleString("fr-FR")} TND
                  </span>
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold text-right">
                  Mode: {selectedBooking.paymentMethod || "Paiement à l'arrivée"} • Statut: {selectedBooking.paymentStatus.toUpperCase()}
                </div>
              </div>

              {/* Signatures box */}
              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-xs">
                <div>
                  <p className="font-semibold text-slate-700">Signature du Client:</p>
                  <div className="h-14 border-b border-dashed border-slate-400 mt-2"></div>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Cachet & Signature Agence:</p>
                  <div className="h-14 border-b border-dashed border-slate-400 mt-2"></div>
                </div>
              </div>

              {/* Footer notes */}
              <div className="text-[10px] text-slate-500 text-center border-t border-slate-200 pt-3">
                Assistance dépannage 24h/7j en Tunisie: +216 25 120 130 • Houimli Rent a Car SARL.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
