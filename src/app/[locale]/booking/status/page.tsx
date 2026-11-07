"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Search,
  Calendar,
  Clock,
  Car,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Printer,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  FileText,
  HelpCircle,
  Phone,
} from "lucide-react";

interface TrackedBooking {
  _id: string;
  bookingReference: string;
  bookingStatus: "pending" | "confirmed" | "awaiting_payment" | "paid" | "active" | "completed" | "cancelled" | "rejected";
  paymentStatus: "unpaid" | "partial" | "paid" | "refunded";
  pickupDate: string;
  returnDate: string;
  rentalDuration: number;
  pickupTime?: string;
  returnTime?: string;
  createdAt: string;
  vehicleId?: {
    brand: string;
    model: string;
    year: number;
    category?: string;
    image?: string;
    images?: string[];
  };
  customerId?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  pickupLocationId?: {
    name?: { fr?: string; en?: string; ar?: string };
    city?: string;
  };
  returnLocationId?: {
    name?: { fr?: string; en?: string; ar?: string };
    city?: string;
  };
  pricingBreakdown?: {
    totalAmount?: number;
    subtotal?: number;
    depositAmount?: number;
    currency?: string;
  };
}

function BookingStatusContent() {
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [reference, setReference] = useState(searchParams.get("ref") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [booking, setBooking] = useState<TrackedBooking | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const t = {
    fr: {
      title: "Suivi & Gestion de Réservation",
      subtitle: "Consultez en temps réel le statut de votre véhicule, téléchargez votre bon ou contactez votre concierge.",
      refLabel: "Référence de réservation",
      refPlaceholder: "Ex: PAY-2026-ABCD",
      emailLabel: "Adresse email utilisée",
      emailPlaceholder: "votre.email@exemple.com",
      searchBtn: "Rechercher mon dossier",
      searching: "Recherche en cours...",
      notFound: "Aucune réservation trouvée correspondant à ces identifiants. Vérifiez votre référence.",
      statusTitle: "Statut actuel :",
      step1: "Demande reçue",
      step2: "Confirmée par l'agence",
      step3: "Véhicule prêt (En cours)",
      step4: "Restituée & Terminée",
      vehTitle: "Véhicule Réservé",
      routeTitle: "Itinéraire & Prise en Charge",
      pickup: "Prise en charge",
      return: "Restitution",
      total: "Montant Total TTC",
      deposit: "Caution bancaire (Restituée au retour)",
      printVoucher: "Imprimer mon Bon de Réservation",
      whatsappBtn: "Assistance WhatsApp 24/7",
      cancelPolicy: "Annulation gratuite jusqu'à 48h avant la prise en charge.",
      modifyBtn: "Demande de modification",
      faqPrompt: "Une question concernant la remise des clés ?",
      callHotline: "Appeler l'assistance aéroport",
    },
    en: {
      title: "Reservation Tracking & Self-Service",
      subtitle: "Track your vehicle in real-time, print your voucher, or connect directly with your curbside concierge.",
      refLabel: "Booking Reference",
      refPlaceholder: "e.g. PAY-2026-ABCD",
      emailLabel: "Email Address Used",
      emailPlaceholder: "your.email@example.com",
      searchBtn: "Track My Reservation",
      searching: "Searching...",
      notFound: "No booking found matching these credentials. Please check your reference.",
      statusTitle: "Current Status:",
      step1: "Request Received",
      step2: "Confirmed by Agency",
      step3: "Curbside Ready (Active)",
      step4: "Returned & Completed",
      vehTitle: "Reserved Vehicle",
      routeTitle: "Schedule & Curbside Pickup",
      pickup: "Pick-up",
      return: "Drop-off",
      total: "Total Amount (Taxes included)",
      deposit: "Deposit hold (Released upon return)",
      printVoucher: "Print Official Voucher",
      whatsappBtn: "24/7 WhatsApp Concierge",
      cancelPolicy: "Free cancellation up to 48 hours before pickup.",
      modifyBtn: "Request Modification",
      faqPrompt: "Need help with key hand-off?",
      callHotline: "Call Airport Support",
    },
    ar: {
      title: "متابعة وإدارة الحجز",
      subtitle: "تابع حالة سيارتك في الوقت الفعلي، اطبع وصل الحجز أو تواصل مباشرة مع مسؤول الاستقبال في المطار.",
      refLabel: "مرجع الحجز",
      refPlaceholder: "مثال: PAY-2026-ABCD",
      emailLabel: "البريد الإلكتروني المستخدم",
      emailPlaceholder: "بريدك@مثال.com",
      searchBtn: "البحث عن الحجز",
      searching: "جاري البحث...",
      notFound: "لم يتم العثور على أي حجز بهذه البيانات. يرجى التأكد من المرجع.",
      statusTitle: "الحالة الحالية:",
      step1: "تم استلام الطلب",
      step2: "تم التأكيد من الوكالة",
      step3: "السيارة جاهزة (ساري)",
      step4: "تم الإرجاع والاكتمال",
      vehTitle: "السيارة المحجوزة",
      routeTitle: "المسار ومواعيد الاستلام",
      pickup: "الاستلام",
      return: "التسليم",
      total: "المبلغ الإجمالي باحتساب الأداءات",
      deposit: "الضمان المالي (يُسترجع عند التسليم)",
      printVoucher: "طباعة وصل الحجز",
      whatsappBtn: "واتساب مباشر 24/7",
      cancelPolicy: "إلغاء مجاني حتى 48 ساعة قبل موعد الاستلام.",
      modifyBtn: "طلب تعديل الموعد",
      faqPrompt: "هل لديك استفسار حول استلام المفاتيح؟",
      callHotline: "الاتصال بمكتب المطار",
    },
  }[locale as "fr" | "en" | "ar"] || {
    title: "Reservation Tracking",
    subtitle: "Track your vehicle in real-time.",
    refLabel: "Booking Reference",
    refPlaceholder: "e.g. PAY-2026-ABCD",
    emailLabel: "Email Address",
    emailPlaceholder: "email@example.com",
    searchBtn: "Track Reservation",
    searching: "Searching...",
    notFound: "No booking found.",
    statusTitle: "Current Status:",
    step1: "Pending",
    step2: "Confirmed",
    step3: "Active",
    step4: "Completed",
    vehTitle: "Reserved Vehicle",
    routeTitle: "Curbside Pickup",
    pickup: "Pick-up",
    return: "Return",
    total: "Total Amount",
    deposit: "Security Deposit",
    printVoucher: "Print Voucher",
    whatsappBtn: "WhatsApp Concierge",
    cancelPolicy: "Free cancellation up to 48h.",
    modifyBtn: "Request Modification",
    faqPrompt: "Need help?",
    callHotline: "Call Hotline",
  };

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!reference.trim()) return;

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const params = new URLSearchParams({ reference: reference.trim().toUpperCase() });
      if (email.trim()) {
        params.append("email", email.trim().toLowerCase());
      }
      const res = await fetch(`/api/bookings?${params.toString()}`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setBooking(json.data[0]);
      } else {
        setBooking(null);
        setError(t.notFound);
      }
    } catch {
      setError(t.notFound);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if ref provided in query string
  useEffect(() => {
    if (searchParams.get("ref")) {
      handleLookup();
    }
  }, []);

  const fmt = (n?: number) => {
    if (n === undefined || isNaN(n)) return "0";
    const val = n >= 1000 ? Math.round(n / 100) : Math.round(n);
    return val.toLocaleString("fr-FR");
  };

  const getStatusStepIndex = (st: string) => {
    if (st === "pending") return 1;
    if (st === "confirmed" || st === "awaiting_payment" || st === "paid") return 2;
    if (st === "active") return 3;
    if (st === "completed") return 4;
    return 1;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Payless Concierge Care</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display">
            {t.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Lookup Search Form */}
        <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xl">
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t.refLabel}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={reference}
                    onChange={(e) => setReference(e.target.value.toUpperCase())}
                    placeholder={t.refPlaceholder}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm font-mono font-bold text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <FileText className="w-4 h-4 text-slate-400 absolute right-3.5 rtl:right-auto rtl:left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-[#1D4ED8] hover:bg-[#1e40af] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.searching}</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>{t.searchBtn}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {error && searched && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Booking Details Display */}
        {booking && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Reference Card & Stepper */}
            <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-neutral-800">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    {t.refLabel}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-wider">
                    {booking.bookingReference}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    type="button"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{t.printVoucher}</span>
                  </button>

                  <a
                    href={`https://wa.me/21625120130?text=${encodeURIComponent(
                      `Bonjour Payless, je vous contacte au sujet de ma réservation ${booking.bookingReference}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>WhatsApp 24/7</span>
                  </a>
                </div>
              </div>

              {/* Visual 4-Step Interactive Timeline */}
              <div className="pt-2">
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: t.step1, step: 1 },
                    { label: t.step2, step: 2 },
                    { label: t.step3, step: 3 },
                    { label: t.step4, step: 4 },
                  ].map((s) => {
                    const currentIdx = getStatusStepIndex(booking.bookingStatus);
                    const isReached = currentIdx >= s.step;
                    const isCurrent = currentIdx === s.step;

                    return (
                      <div key={s.step} className="space-y-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isReached
                              ? "bg-blue-600 shadow-xs shadow-blue-500/50"
                              : "bg-slate-200 dark:bg-neutral-800"
                          }`}
                        />
                        <p
                          className={`text-[11px] sm:text-xs font-bold leading-tight ${
                            isCurrent
                              ? "text-blue-600 dark:text-blue-400 font-extrabold"
                              : isReached
                              ? "text-slate-800 dark:text-slate-200"
                              : "text-slate-400 dark:text-slate-600"
                          }`}
                        >
                          {s.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Vehicle & Schedule Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Car className="w-4 h-4 text-amber-500" />
                  <span>{t.vehTitle}</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
                    <Car className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {booking.vehicleId?.brand} {booking.vehicleId?.model}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Modèle officiel {booking.vehicleId?.year || 2024} • État neuf showroom garanti
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-neutral-700/60 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.total} :</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400 font-mono text-sm">
                      {fmt(booking.pricingBreakdown?.totalAmount)} TND
                    </span>
                  </div>
                  {booking.pricingBreakdown?.depositAmount !== undefined && (
                    <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200 dark:border-neutral-700">
                      <span>{t.deposit} :</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {fmt(booking.pricingBreakdown.depositAmount)} TND
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span>{t.routeTitle}</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-neutral-700/60">
                    <p className="text-blue-600 font-bold">{t.pickup} :</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white mt-0.5">
                      {booking.pickupLocationId?.name?.[locale as "fr" | "en" | "ar"] ||
                        booking.pickupLocationId?.name?.fr ||
                        booking.pickupLocationId?.city ||
                        "Aéroport Tunis-Carthage (TUN 24/7)"}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(booking.pickupDate).toLocaleDateString("fr-FR")} à {booking.pickupTime || "10:00"}</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-neutral-700/60">
                    <p className="text-amber-600 font-bold">{t.return} :</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white mt-0.5">
                      {booking.returnLocationId?.name?.[locale as "fr" | "en" | "ar"] ||
                        booking.returnLocationId?.name?.fr ||
                        booking.returnLocationId?.city ||
                        "Aéroport Tunis-Carthage (TUN 24/7)"}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(booking.returnDate).toLocaleDateString("fr-FR")} à {booking.returnTime || "10:00"}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Assistance Banner & Guarantee */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-slate-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left rtl:sm:text-right">
                <p className="text-sm font-bold flex items-center justify-center sm:justify-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{t.cancelPolicy}</span>
                </p>
                <p className="text-xs text-slate-300">
                  {t.faqPrompt} Notre équipe de conciergerie est joignable 24/7 par téléphone et WhatsApp.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="tel:+21625120130"
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>+216 25 120 130</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <BookingStatusContent />
    </Suspense>
  );
}
