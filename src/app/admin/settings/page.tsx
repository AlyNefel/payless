"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Phone,
  Mail,
  Globe,
  Clock,
  CreditCard,
  Percent,
  Bell,
  Shield,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Share2,
} from "lucide-react";

const SETTINGS_TABS = [
  { id: "agency", label: "Agence", icon: Building2 },
  { id: "financial", label: "Financier", icon: CreditCard },
  { id: "hours", label: "Horaires", icon: Clock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Sécurité", icon: Shield },
];

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("agency");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [agencySettings, setAgencySettings] = useState({
    agencyName: "Payless Car Rental Tunisie",
    legalName: "Houimli Rent a Car SARL",
    registration: "RC Ariana B0123452020 - MF 1234567/A/M/000",
    address: "60, Avenue de l'UMA, Chotrana 1, La Soukra",
    city: "Ariana 2036, Tunisie",
    postalCode: "2036",
    country: "Tunisie",
    phone: "80808080",
    whatsapp: "80808080",
    email: "contact@paylesscarrental.tn",
    supportEmail: "test@paylesscarrental.tn",
    website: "https://hmlrentcar.tn",
    defaultLanguage: "fr",
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
  });

  const [financialSettings, setFinancialSettings] = useState({
    currency: "TND",
    currencySymbol: "DT",
    taxRate: "0",
    timbreFiscal: "1",
    contributionLF2026: "2",
    differentLocationFee: "50",
    outOfTownReturnFee: "100",
    depositMultiplier: "1",
    minRentalAge: "21",
    minLuxuryAge: "25",
    cancellationHours: "48",
    cancellationFeeRate: "20",
  });

  const [openingHours, setOpeningHours] = useState(
    DAYS.map((day, i) => ({
      day,
      isOpen: i < 6,
      open: "08:00",
      close: i < 5 ? "19:00" : "14:00",
    }))
  );

  const [notifications, setNotifications] = useState({
    newBooking: true,
    bookingCancelled: true,
    paymentReceived: true,
    vehicleUnavailable: true,
    maintenanceDue: true,
    overdueReturn: true,
    dailyReport: false,
    weeklyReport: true,
    emailAlerts: true,
  });

  // Load live settings from database on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/settings?t=" + Date.now(), {
          cache: "no-store",
          headers: { Pragma: "no-cache", "Cache-Control": "no-cache" },
        });
        const json = await res.json();
        if (json.success && json.settings) {
          const s = json.settings;

          setAgencySettings((prev) => ({
            ...prev,
            agencyName: (s.agencyName as string) || (s.agency_name as string) || prev.agencyName,
            legalName: (s.legalName as string) || (s.legal_name as string) || prev.legalName,
            registration: (s.registration as string) || (s.immatriculation as string) || prev.registration,
            address: (s.address as string) || (s.siege_social as string) || prev.address,
            city: (s.city as string) || (s.ville as string) || prev.city,
            postalCode: (s.postalCode as string) || (s.postal_code as string) || prev.postalCode,
            country: (s.country as string) || (s.pays as string) || prev.country,
            phone: (s.phone as string) || (s.phone_primary as string) || prev.phone,
            whatsapp: (s.whatsapp as string) || (s.phone_secondary as string) || prev.whatsapp,
            email: (s.email as string) || (s.contact_email as string) || prev.email,
            supportEmail: (s.supportEmail as string) || (s.support_email as string) || prev.supportEmail,
            website: (s.website as string) || (s.site_web as string) || prev.website,
            defaultLanguage: (s.defaultLanguage as string) || (s.default_language as string) || prev.defaultLanguage,
            facebook: (s.facebook as string) || prev.facebook,
            instagram: (s.instagram as string) || prev.instagram,
            linkedin: (s.linkedin as string) || prev.linkedin,
            twitter: (s.twitter as string) || prev.twitter,
          }));

          setFinancialSettings((prev) => ({
            ...prev,
            currency: (s.currency as string) || prev.currency,
            currencySymbol: (s.currencySymbol as string) || prev.currencySymbol,
            taxRate: s.taxRate !== undefined ? String(s.taxRate) : prev.taxRate,
            timbreFiscal: s.timbreFiscal !== undefined ? String(s.timbreFiscal) : prev.timbreFiscal,
            contributionLF2026: s.contributionLF2026 !== undefined ? String(s.contributionLF2026) : prev.contributionLF2026,
            differentLocationFee: s.differentLocationFee !== undefined ? String(s.differentLocationFee) : prev.differentLocationFee,
            outOfTownReturnFee: s.outOfTownReturnFee !== undefined ? String(s.outOfTownReturnFee) : prev.outOfTownReturnFee,
            minRentalAge: s.minRentalAge !== undefined ? String(s.minRentalAge) : prev.minRentalAge,
            minLuxuryAge: s.minLuxuryAge !== undefined ? String(s.minLuxuryAge) : prev.minLuxuryAge,
            cancellationHours: s.cancellationHours !== undefined ? String(s.cancellationHours) : prev.cancellationHours,
            cancellationFeeRate: s.cancellationFeeRate !== undefined ? String(s.cancellationFeeRate) : prev.cancellationFeeRate,
          }));

          if (s.openingHours && Array.isArray(s.openingHours)) {
            setOpeningHours(s.openingHours as any);
          }
          if (s.notifications && typeof s.notifications === "object") {
            setNotifications((prev) => ({ ...prev, ...(s.notifications as any) }));
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const save = async () => {
    setSaving(true);
    setErrorMsg("");
    setSaved(false);

    try {
      const payload = {
        ...agencySettings,
        ...financialSettings,
        openingHours,
        notifications,
      };

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: payload }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSaved(true);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("company_settings_cache", JSON.stringify(payload));
            localStorage.setItem("company-settings-updated", Date.now().toString());
          } catch {}
          window.dispatchEvent(new CustomEvent("company-settings-updated", { detail: payload }));
        }
        setTimeout(() => setSaved(false), 3500);
      } else {
        setErrorMsg(json.error || "Erreur lors de l'enregistrement des paramètres");
      }
    } catch {
      setErrorMsg("Erreur de connexion au serveur.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Paramètres de l'agence</h1>
          <p className="text-slate-500 text-sm mt-0.5">Configuration globale persistée en base de données et synchronisée sur tout le site</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 ${
            saved
              ? "bg-emerald-600 text-white shadow-emerald-500/20"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
          }`}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enregistrement...</span>
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Enregistré en Base & Synchronisé ✓</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Enregistrer</span>
            </>
          )}
        </button>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Toutes les configurations (Nom, Emails, Téléphones, Footer, Tarifs) ont été persistées en base de données et synchronisées en temps réel sur le site.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span>Chargement des paramètres depuis la base de données...</span>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-56 flex-shrink-0">
            <div className="bg-white dark:bg-[#0f141f] rounded-2xl border border-slate-200 dark:border-slate-800 p-2 space-y-1">
              {SETTINGS_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-white dark:bg-[#0f141f] rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            {/* Agency Info */}
            {activeTab === "agency" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-bold text-lg text-slate-900 dark:text-white">Informations de l'agence & Contact</h2>
                  <p className="text-xs text-slate-500">Ces informations sont synchronisées dynamiquement dans le Footer, le Header, les formulaires et les e-mails.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Nom commercial", key: "agencyName", icon: Building2, placeholder: "Payless Car Rental Tunisie" },
                    { label: "Raison sociale", key: "legalName", icon: Building2, placeholder: "Houimli Rent a Car SARL" },
                    { label: "Immatriculation (RC / MF)", key: "registration", icon: Shield, placeholder: "RC Ariana B0123452020 - MF 1234567/A/M/000" },
                    { label: "Adresse du siège", key: "address", icon: Globe, placeholder: "60, Avenue de l'UMA, Chotrana 1, La Soukra" },
                    { label: "Ville", key: "city", icon: Globe, placeholder: "Ariana 2036, Tunisie" },
                    { label: "Code Postal", key: "postalCode", icon: Globe, placeholder: "2036" },
                    { label: "Pays", key: "country", icon: Globe, placeholder: "Tunisie" },
                    { label: "Téléphone principal", key: "phone", icon: Phone, placeholder: "80808080" },
                    { label: "WhatsApp Assistance", key: "whatsapp", icon: Phone, placeholder: "80808080" },
                    { label: "Email contact", key: "email", icon: Mail, placeholder: "contact@paylesscarrental.tn" },
                    { label: "Email support / alertes", key: "supportEmail", icon: Mail, placeholder: "test@paylesscarrental.tn" },
                    { label: "Site web officiel", key: "website", icon: Globe, placeholder: "https://hmlrentcar.tn" },
                  ].map((f) => {
                    const Icon = f.icon;
                    return (
                      <div key={f.key}>
                        <label className="block text-xs font-semibold mb-1.5 text-slate-500">{f.label}</label>
                        <div className="relative">
                          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            value={(agencySettings as Record<string, string>)[f.key] || ""}
                            onChange={(e) =>
                              setAgencySettings((s) => ({ ...s, [f.key]: e.target.value }))
                            }
                            placeholder={f.placeholder}
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    );
                  })}

                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-slate-500">
                      Langue principale par défaut
                    </label>
                    <select
                      value={agencySettings.defaultLanguage}
                      onChange={(e) =>
                        setAgencySettings((s) => ({ ...s, defaultLanguage: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold text-slate-900 dark:text-white"
                    >
                      <option value="fr">🇫🇷 Français (Standard)</option>
                      <option value="en">🇬🇧 English</option>
                      <option value="ar">🇹🇳 العربية</option>
                    </select>
                  </div>
                </div>

                {/* Social media links */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-blue-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Réseaux Sociaux (Footer)</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Facebook", key: "facebook", placeholder: "https://facebook.com/payless" },
                      { label: "Instagram", key: "instagram", placeholder: "https://instagram.com/payless" },
                      { label: "LinkedIn", key: "linkedin", placeholder: "https://linkedin.com/company/payless" },
                      { label: "X / Twitter", key: "twitter", placeholder: "https://twitter.com/payless" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-xs font-semibold mb-1.5 text-slate-500">{f.label}</label>
                        <input
                          value={(agencySettings as Record<string, string>)[f.key] || ""}
                          onChange={(e) =>
                            setAgencySettings((s) => ({ ...s, [f.key]: e.target.value }))
                          }
                          placeholder={f.placeholder}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold text-slate-900 dark:text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Financial Settings */}
            {activeTab === "financial" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-lg text-slate-900 dark:text-white">Configuration financière & Frais</h2>
                    <p className="text-xs text-slate-500">Paramètres de facturation, taxes et frais de rapatriement</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Devise principale", key: "currency", placeholder: "TND" },
                    { label: "Symbole devise", key: "currencySymbol", placeholder: "DT" },
                    { label: "Taux TVA (%) [0% inclus TTC]", key: "taxRate", placeholder: "0" },
                    { label: "Timbre fiscal (DT)", key: "timbreFiscal", placeholder: "1" },
                    { label: "Contribution LF 2026 (DT / jour / voiture)", key: "contributionLF2026", placeholder: "2" },
                    { label: "Frais restitution agence différente / Aller-simple (DT)", key: "differentLocationFee", placeholder: "50" },
                    { label: "Frais standard restitution hors Tunis (DT)", key: "outOfTownReturnFee", placeholder: "100" },
                    { label: "Âge minimum conducteur (ans)", key: "minRentalAge", placeholder: "21" },
                    { label: "Âge minimum (Luxe / Sport)", key: "minLuxuryAge", placeholder: "25" },
                    { label: "Annulation gratuite jusqu'à (heures)", key: "cancellationHours", placeholder: "48" },
                    { label: "Frais d'annulation tardive (%)", key: "cancellationFeeRate", placeholder: "20" },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold mb-1.5 text-slate-500">{f.label}</label>
                      <div className="relative">
                        {f.key === "outOfTownReturnFee" ? (
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                        ) : (
                          <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        )}
                        <input
                          type="text"
                          value={(financialSettings as Record<string, string>)[f.key]}
                          onChange={(e) =>
                            setFinancialSettings((s) => ({ ...s, [f.key]: e.target.value }))
                          }
                          placeholder={f.placeholder}
                          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span>Règles de Rapatriement & Restitution :</span>
                  </div>
                  <p>
                    • <strong>Restitution hors Grand Tunis :</strong> Lorsqu'un client sélectionne une agence de retour en dehors du Grand Tunis (Monastir, Enfidha, Sfax, Sousse, Bizerte, Nabeul, Tabarka...), un supplément configurable (actuellement <strong>{financialSettings.outOfTownReturnFee || "100"} DT</strong>) est automatiquement ajouté au total facturé.
                  </p>
                  <p>
                    • <strong>Restitution agence différente (Aller-simple) :</strong> Lorsque le lieu de retour est différent du lieu de départ, un frais d'aller-simple (actuellement <strong>{financialSettings.differentLocationFee || "50"} DT</strong>) peut être facturé. De plus, chaque agence dans <em>Gestion des Agences</em> peut avoir son propre frais spécifique de prise en charge et de restitution.
                  </p>
                </div>
              </div>
            )}

            {/* Opening Hours */}
            {activeTab === "hours" && (
              <div className="space-y-5">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">Horaires d'ouverture des agences</h2>
                <div className="space-y-3">
                  {openingHours.map((h, i) => (
                    <div
                      key={h.day}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
                    >
                      <div className="w-24 text-xs font-bold text-slate-900 dark:text-white">{h.day}</div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={h.isOpen}
                          onChange={() =>
                            setOpeningHours((hs) =>
                              hs.map((x, j) => (j === i ? { ...x, isOpen: !x.isOpen } : x))
                            )
                          }
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {h.isOpen ? "Ouvert" : "Fermé"}
                        </span>
                      </label>
                      {h.isOpen && (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={h.open}
                            onChange={(e) =>
                              setOpeningHours((hs) =>
                                hs.map((x, j) => (j === i ? { ...x, open: e.target.value } : x))
                              )
                            }
                            className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <span className="text-slate-400 text-xs">→</span>
                          <input
                            type="time"
                            value={h.close}
                            onChange={(e) =>
                              setOpeningHours((hs) =>
                                hs.map((x, j) => (j === i ? { ...x, close: e.target.value } : x))
                              )
                            }
                            className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <div className="space-y-5">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">Alertes & Notifications Agence</h2>
                <div className="space-y-3">
                  {[
                    { key: "newBooking", label: "Nouvelle réservation effectuée en ligne" },
                    { key: "bookingCancelled", label: "Réservation annulée par un client" },
                    { key: "paymentReceived", label: "Paiement en ligne ou acompte validé" },
                    { key: "vehicleUnavailable", label: "Alerte de sur-réservation ou flotte indisponible" },
                    { key: "maintenanceDue", label: "Vidange ou révision mécanique à effectuer" },
                    { key: "overdueReturn", label: "Retard de restitution du véhicule" },
                    { key: "dailyReport", label: "Rapport d'activité journalier (08:00)" },
                    { key: "weeklyReport", label: "Rapport comptable hebdomadaire le lundi" },
                  ].map((notif) => (
                    <label
                      key={notif.key}
                      className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer"
                    >
                      <span className="text-xs font-medium text-slate-900 dark:text-white">{notif.label}</span>
                      <input
                        type="checkbox"
                        checked={(notifications as Record<string, boolean>)[notif.key]}
                        onChange={(e) =>
                          setNotifications((prev) => ({ ...prev, [notif.key]: e.target.checked }))
                        }
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === "security" && (
              <div className="space-y-5">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">Sécurité & Contrôle d'Accès</h2>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span>Politique d'accès au portail d'administration</span>
                  </div>
                  <p className="text-slate-500">
                    Les mots de passe administrateurs sont hachés de manière sécurisée (bcrypt 12 rounds). Les sessions administrateur expirent après 30 jours d'inactivité.
                  </p>
                  <div className="pt-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold">
                      ✓ Authentification NextAuth Sécurisée Active
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
