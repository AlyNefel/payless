"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Car,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Printer,
  Save,
  MessageCircle,
  ShieldCheck,
  History,
  Tag,
  Loader2,
  ChevronRight,
  RefreshCw,
  Trash2,
} from "lucide-react";

interface PopulatedBooking {
  _id: string;
  bookingReference: string;
  bookingStatus: "pending" | "confirmed" | "awaiting_payment" | "paid" | "active" | "completed" | "cancelled" | "rejected";
  paymentStatus: "unpaid" | "partial" | "paid" | "refunded";
  pickupDate: string;
  returnDate: string;
  rentalDuration: number;
  pickupTime?: string;
  returnTime?: string;
  customerNotes?: string;
  internalNotes?: string;
  createdAt: string;
  vehicleId?: {
    _id: string;
    brand: string;
    model: string;
    year: number;
    category?: string;
    images?: string[];
    licensePlate?: string;
    pricing?: { daily?: number; deposit?: number; currency?: string };
  };
  customerId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country?: string;
    passportNumber?: string;
    drivingLicence?: { number?: string; country?: string; issueYear?: string | number };
  };
  pickupLocationId?: {
    _id: string;
    name?: { fr?: string; en?: string; ar?: string };
    city?: string;
    address?: string;
  };
  returnLocationId?: {
    _id: string;
    name?: { fr?: string; en?: string; ar?: string };
    city?: string;
    address?: string;
  };
  pricingBreakdown?: {
    dailyRate?: number;
    subtotal?: number;
    extrasTotal?: number;
    discountAmount?: number;
    timbreFiscal?: number;
    contributionLF2026?: number;
    outOfTownFee?: number;
    pickupLocationFee?: number;
    returnLocationFee?: number;
    differentLocationFee?: number;
    depositAmount?: number;
    totalAmount?: number;
    currency?: string;
  };
  extras?: Array<{ name: string; price: number; quantity: number }>;
  modificationRequest?: {
    status: "pending" | "approved" | "rejected";
    requestedAt: string;
    pickupDate?: string;
    returnDate?: string;
    pickupTime?: string;
    returnTime?: string;
    customerNotes?: string;
    reason?: string;
    decisionNotes?: string;
    processedBy?: string;
    processedAt?: string;
  };
  auditHistory?: Array<{
    timestamp: string;
    action: string;
    performedBy?: string;
    notes?: string;
  }>;
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [booking, setBooking] = useState<PopulatedBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [status, setStatus] = useState<string>("pending");
  const [paymentStatus, setPaymentStatus] = useState<string>("unpaid");
  const [internalNotes, setInternalNotes] = useState("");
  const [availableVehicles, setAvailableVehicles] = useState<Array<{ _id: string; brand: string; model: string; year: number }>>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [modDecisionLoading, setModDecisionLoading] = useState(false);
  const [modDecisionNotes, setModDecisionNotes] = useState("");

  const fetchBooking = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/bookings/${id}`);
      const data = await res.json();
      if (data.booking) {
        setBooking(data.booking);
        setStatus(data.booking.bookingStatus || "pending");
        setPaymentStatus(data.booking.paymentStatus || "unpaid");
        setInternalNotes(data.booking.internalNotes || "");
        setSelectedVehicleId(data.booking.vehicleId?._id || "");
      } else {
        setError(data.error || "Réservation introuvable");
      }
    } catch {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    // Fetch fleet list for vehicle reassignment
    fetch("/api/vehicles?limit=50")
      .then((r) => r.json())
      .then((res) => {
        if (res.vehicles) {
          setAvailableVehicles(res.vehicles);
        }
      })
      .catch(() => {});
  }, [id]);

  const handleUpdate = async () => {
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          paymentStatus,
          internalNotes,
          vehicleId: selectedVehicleId || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.booking) {
        setBooking(data.booking);
        setSuccessMsg("Mise à jour effectuée avec succès !");
        setTimeout(() => setSuccessMsg(""), 3500);
      } else {
        setError(data.error || "Erreur de mise à jour.");
      }
    } catch {
      setError("Erreur de communication avec le serveur.");
    } finally {
      setSaving(false);
    }
  };

  const handleModificationDecision = async (decision: "approve" | "reject") => {
    if (!confirm(decision === "approve" ? "Confirmez-vous l'ACCEPTATION de cette modification de dates ?" : "Confirmez-vous le REFUS de cette modification ?")) {
      return;
    }
    setModDecisionLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modificationDecision: decision,
          decisionNotes: modDecisionNotes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.booking) {
        setBooking(data.booking);
        setSuccessMsg(
          decision === "approve"
            ? "Demande de modification acceptée ! Les dates et le prix ont été ajustés."
            : "Demande de modification refusée. Le client a été notifié."
        );
        setModDecisionNotes("");
      } else {
        setError(data.error || "Erreur lors du traitement de la demande");
      }
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setModDecisionLoading(false);
    }
  };

  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!booking) return;
    const ref = booking.bookingReference || id;
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer définitivement la réservation ${ref} ?\n\nCette action supprimera toutes les données de la base de données et libérera immédiatement le véhicule assigné.`
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Réservation ${ref} supprimée avec succès.`);
        router.push("/admin/bookings");
      } else {
        alert(data.error || "Erreur lors de la suppression.");
      }
    } catch {
      alert("Erreur de connexion avec le serveur.");
    } finally {
      setDeleting(false);
    }
  };

  const fmt = (n?: number) => {
    if (n === undefined || isNaN(n)) return "0";
    const val = n >= 1000 ? Math.round(n / 100) : Math.round(n);
    return val.toLocaleString("fr-FR");
  };

  const getStatusBadge = (st: string) => {
    const config: Record<string, { label: string; color: string; icon: React.ElementType }> = {
      pending: { label: "En Attente", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300", icon: Clock },
      confirmed: { label: "Confirmée", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300", icon: CheckCircle2 },
      active: { label: "En Cours", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-300", icon: Car },
      completed: { label: "Terminée", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-300", icon: ShieldCheck },
      cancelled: { label: "Annulée", color: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-300", icon: XCircle },
      rejected: { label: "Rejetée", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300", icon: XCircle },
    };
    const c = config[st] || config.pending;
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${c.color}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{c.label}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm text-slate-500 font-medium">Chargement des détails de la réservation...</p>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 rounded-2xl bg-white dark:bg-[#0f141f] border border-red-200 dark:border-red-900 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Réservation Introuvable</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux réservations</span>
        </Link>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/bookings"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Retour à la liste"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-wider">
                {booking.bookingReference}
              </h1>
              {getStatusBadge(booking.bookingStatus)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Créée le {new Date(booking.createdAt).toLocaleString("fr-FR")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <a
            href={`/api/bookings/pdf?ref=${booking.bookingReference}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-900 bg-slate-900 text-white hover:bg-black text-xs font-semibold shadow-xs transition-colors"
            title="Télécharger la facture officielle en noir & blanc"
          >
            <FileText className="w-4 h-4" />
            <span>Facture PDF (N&B)</span>
          </a>

          <button
            onClick={() => window.print()}
            type="button"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer</span>
          </button>

          <button
            onClick={handleUpdate}
            disabled={saving}
            type="button"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Sauvegarde..." : "Enregistrer"}</span>
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            type="button"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 text-xs font-bold transition-all disabled:opacity-50"
            title="Supprimer définitivement cette réservation"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span className="hidden sm:inline">Supprimer</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Pending Customer Modification Request Banner */}
      {booking.modificationRequest && booking.modificationRequest.status === "pending" && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-950 dark:text-amber-100 space-y-4 animate-in fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
                <AlertCircle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-amber-900 dark:text-amber-200">
                  ⚠️ Demande de modification soumise par le client
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Cette réservation confirmée a fait l'objet d'une demande de modification le{" "}
                  {new Date(booking.modificationRequest.requestedAt).toLocaleString("fr-FR")}. Votre accord est requis.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[11px] font-black uppercase tracking-wider">
              En attente d'approbation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white/70 dark:bg-neutral-900/70 border border-amber-300/50 dark:border-amber-700/50 text-xs">
            <div>
              <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">Dates Actuelles :</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                Du {new Date(booking.pickupDate).toLocaleDateString("fr-FR")} au {new Date(booking.returnDate).toLocaleDateString("fr-FR")} ({booking.rentalDuration} jours)
              </p>
            </div>

            <div>
              <span className="font-bold text-amber-600 dark:text-amber-400 uppercase text-[10px] tracking-wider">Nouvelles Dates Demandées :</span>
              <p className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                Du {booking.modificationRequest.pickupDate ? new Date(booking.modificationRequest.pickupDate).toLocaleDateString("fr-FR") : "--"} au{" "}
                {booking.modificationRequest.returnDate ? new Date(booking.modificationRequest.returnDate).toLocaleDateString("fr-FR") : "--"}
                {booking.modificationRequest.pickupTime && ` (${booking.modificationRequest.pickupTime} - ${booking.modificationRequest.returnTime || ""})`}
              </p>
            </div>

            {booking.modificationRequest.reason && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-neutral-800">
                <span className="font-bold text-slate-500 text-[11px]">Motif invoqué par le client :</span>
                <p className="text-slate-700 dark:text-slate-300 italic mt-0.5">
                  &ldquo;{booking.modificationRequest.reason}&rdquo;
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Note ou motif de votre décision (optionnel, envoyé au client) :
            </label>
            <input
              type="text"
              value={modDecisionNotes}
              onChange={(e) => setModDecisionNotes(e.target.value)}
              placeholder="Ex: Véhicule disponible, modification validée / Désolé, indisponible sur ces dates..."
              className="w-full h-10 px-3.5 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => handleModificationDecision("approve")}
              disabled={modDecisionLoading}
              type="button"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{modDecisionLoading ? "Traitement..." : "Accepter la modification"}</span>
            </button>

            <button
              onClick={() => handleModificationDecision("reject")}
              disabled={modDecisionLoading}
              type="button"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>{modDecisionLoading ? "Traitement..." : "Refuser la modification"}</span>
            </button>
          </div>
        </div>
      )}

      {/* History of approved / rejected modification request */}
      {booking.modificationRequest && booking.modificationRequest.status !== "pending" && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-4 ${
          booking.modificationRequest.status === "approved"
            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-900 dark:text-emerald-300"
            : "bg-slate-100 dark:bg-neutral-900 border-slate-200 text-slate-700 dark:text-slate-300"
        }`}>
          <div className="flex items-center gap-2">
            {booking.modificationRequest.status === "approved" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>
              Dernière demande de modification : <strong>{booking.modificationRequest.status === "approved" ? "Acceptée" : "Refusée"}</strong>
              {booking.modificationRequest.processedAt && ` le ${new Date(booking.modificationRequest.processedAt).toLocaleDateString("fr-FR")}`}
              {booking.modificationRequest.decisionNotes && ` (${booking.modificationRequest.decisionNotes})`}
            </span>
          </div>
        </div>
      )}

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Vehicle */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reservation Status & Lifecycle Manager */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Gestion du Statut & Paiement</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Statut de la réservation
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">⏳ En Attente (Validation)</option>
                  <option value="confirmed">✅ Confirmée (Par l'agence)</option>
                  <option value="active">🚗 En Cours (Véhicule livré)</option>
                  <option value="completed">🎉 Terminée (Véhicule restitué)</option>
                  <option value="cancelled">❌ Annulée</option>
                  <option value="rejected">🚫 Rejetée</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Statut du paiement
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="unpaid">🔴 Non payé (Paiement à la livraison)</option>
                  <option value="partial">🟡 Acompte reçu</option>
                  <option value="paid">🟢 Payé intégralement</option>
                  <option value="refunded">🔵 Remboursé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vehicle Assignment Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-500" />
                <span>Véhicule Assigné</span>
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {booking.vehicleId?.brand} {booking.vehicleId?.model} ({booking.vehicleId?.year || 2024})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Matricule: <span className="font-mono font-semibold">{booking.vehicleId?.licensePlate || "À assigner au comptoir"}</span>
                  </p>
                </div>
              </div>

              {/* Reassign Vehicle Dropdown */}
              <div className="w-full sm:w-auto">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Changer de véhicule :
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full sm:w-56 h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value={booking.vehicleId?._id || ""}>
                    {booking.vehicleId ? `${booking.vehicleId.brand} ${booking.vehicleId.model}` : "Sélectionner..."}
                  </option>
                  {availableVehicles
                    .filter((v) => v._id !== booking.vehicleId?._id)
                    .map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.brand} {v.model} ({v.year})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dates & Locations Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>Itinéraire & Dates</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Prise en charge</span>
                </div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">
                  {booking.pickupLocationId?.name?.fr || booking.pickupLocationId?.city || "Aéroport Tunis-Carthage"}
                </p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(booking.pickupDate).toLocaleDateString("fr-FR")} à {booking.pickupTime || "10:00"}</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Restitution</span>
                </div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">
                  {booking.returnLocationId?.name?.fr || booking.returnLocationId?.city || "Aéroport Tunis-Carthage"}
                </p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(booking.returnDate).toLocaleDateString("fr-FR")} à {booking.returnTime || "10:00"}</span>
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
              <span className="font-semibold">Durée totale de location :</span>
              <span className="font-extrabold text-sm font-mono">{booking.rentalDuration || 1} Jour(s)</span>
            </div>
          </div>

          {/* Internal Notes & Customer Remarks */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />
              <span>Notes & Remarques</span>
            </h2>

            {booking.customerNotes && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                <div className="text-[11px] font-bold uppercase text-amber-700 dark:text-amber-400 mb-1">
                  Remarques du client (Vol, instructions) :
                </div>
                <p className="text-xs text-amber-950 dark:text-amber-200 font-medium">
                  {booking.customerNotes}
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Notes internes agence (Visibles uniquement par le personnel) :
              </label>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={3}
                placeholder="Ex: Acompte de 100 DT reçu en espèces, client VIP, siège bébé installé..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Audit History Timeline */}
          {booking.auditHistory && booking.auditHistory.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                <span>Journal d'Audit & Activités</span>
              </h2>

              <div className="space-y-2 border-l-2 border-blue-500/40 pl-3 ml-1 text-xs">
                {booking.auditHistory.map((item, idx) => (
                  <div key={idx} className="relative pb-2">
                    <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{item.action}</p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(item.timestamp).toLocaleString("fr-FR")} {item.performedBy && `• par ${item.performedBy}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Customer & Financials */}
        <div className="space-y-6">
          {/* Customer CRM Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Fiche Client</span>
            </h2>

            <div className="space-y-2.5 text-xs">
              <div>
                <p className="text-slate-400 text-[11px]">Nom & Prénom</p>
                <p className="font-bold text-sm text-slate-900 dark:text-white">
                  {booking.customerId?.firstName} {booking.customerId?.lastName}
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-[11px]">Téléphone / WhatsApp</p>
                <div className="flex items-center justify-between pt-0.5">
                  <a
                    href={`tel:${booking.customerId?.phone}`}
                    className="font-mono font-bold text-slate-900 dark:text-white hover:underline flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-500" />
                    <span>{booking.customerId?.phone}</span>
                  </a>
                  {booking.customerId?.phone && (
                    <a
                      href={`https://wa.me/${booking.customerId.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3 fill-white" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>

              <div>
                <p className="text-slate-400 text-[11px]">Email</p>
                <a
                  href={`mailto:${booking.customerId?.email}`}
                  className="font-semibold text-slate-900 dark:text-white hover:underline flex items-center gap-1.5 pt-0.5"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{booking.customerId?.email}</span>
                </a>
              </div>

              {booking.customerId?.drivingLicence && (
                <div>
                  <p className="text-slate-400 text-[11px]">Permis de conduire</p>
                  <p className="font-mono font-bold text-slate-900 dark:text-white">
                    {booking.customerId.drivingLicence.number || "Présentation au comptoir"} ({booking.customerId.drivingLicence.country || "Tunisie"})
                  </p>
                  {booking.customerId.drivingLicence.issueYear && (
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                      Année d'obtention : {booking.customerId.drivingLicence.issueYear}
                    </p>
                  )}
                </div>
              )}

              {booking.customerId?.country && (
                <div>
                  <p className="text-slate-400 text-[11px]">Pays de résidence</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{booking.customerId.country}</p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Fiscal Breakdown */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              <span>Détails Financiers (TND)</span>
            </h2>

            <div className="space-y-2 text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Sous-total location</span>
                <span className="font-medium">{fmt(booking.pricingBreakdown?.subtotal)} TND</span>
              </div>

              {(booking.pricingBreakdown?.extrasTotal || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Options & Extras</span>
                  <span className="font-medium">+{fmt(booking.pricingBreakdown?.extrasTotal)} TND</span>
                </div>
              )}

              {(booking.pricingBreakdown?.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Remise Promo</span>
                  <span>-{fmt(booking.pricingBreakdown?.discountAmount)} TND</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500">
                <span>Timbre fiscal (Fixe)</span>
                <span>1 TND</span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>Contribution LF 2026</span>
                <span>{fmt(booking.pricingBreakdown?.contributionLF2026 ?? (200 * (booking.rentalDuration || 1)))} TND</span>
              </div>

              {(booking.pricingBreakdown?.pickupLocationFee || 0) > 0 && (
                <div className="flex justify-between text-blue-600 dark:text-blue-400 font-semibold">
                  <span>Frais prise en charge ({booking.pickupLocationId?.name?.fr || booking.pickupLocationId?.city || "Point de retrait"})</span>
                  <span>+{fmt(booking.pricingBreakdown?.pickupLocationFee)} TND</span>
                </div>
              )}

              {(booking.pricingBreakdown?.differentLocationFee || 0) > 0 && (
                <div className="flex justify-between text-indigo-600 dark:text-indigo-400 font-semibold">
                  <span>Restitution agence différente (Aller-simple)</span>
                  <span>+{fmt(booking.pricingBreakdown?.differentLocationFee)} TND</span>
                </div>
              )}

              {(booking.pricingBreakdown?.outOfTownFee || 0) > 0 && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400 font-semibold">
                  <span>Frais restitution hors Tunis / Ramassage</span>
                  <span>+{fmt(booking.pricingBreakdown?.outOfTownFee)} TND</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-1">
              <div>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">Total Facturé TTC</span>
                <p className="text-[10px] text-slate-400">Toutes taxes & frais inclus</p>
              </div>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
                {fmt(booking.pricingBreakdown?.totalAmount)} TND
              </span>
            </div>

            {booking.pricingBreakdown?.depositAmount !== undefined && (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-[11px] text-slate-500 flex justify-between">
                <span>Caution par carte bancaire :</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {fmt(booking.pricingBreakdown.depositAmount)} TND
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
