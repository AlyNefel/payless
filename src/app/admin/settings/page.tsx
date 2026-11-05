"use client";

import { useState } from "react";
import { Building2, Phone, Mail, Globe, Clock, CreditCard, Percent, Bell, Shield, Save, ChevronDown } from "lucide-react";

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
  const [saved, setSaved] = useState(false);

  const [agencySettings, setAgencySettings] = useState({
    agencyName: "PAYLESS CAR RENTAL TUNISIE",
    legalName: "Houimli Rent a Car SARL",
    registration: "RC Ariana B0123452020 - MF 1234567/A/M/000",
    address: "Agence La Soukra, Siège Social Ariana",
    city: "Tunis",
    postalCode: "2036",
    country: "Tunisie",
    phone: "+216 25 120 130",
    whatsapp: "+216 25 120 130",
    email: "contact@paylesscarrental.tn",
    supportEmail: "support@paylesscarrental.tn",
    website: "https://paylesscarrental.tn",
    defaultLanguage: "fr",
  });

  const [financialSettings, setFinancialSettings] = useState({
    currency: "TND",
    currencySymbol: "DT",
    taxRate: "0",
    timbreFiscal: "1",
    contributionLF2026: "2",
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
      is24h: [0, 6].includes(i) ? false : false,
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

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Paramètres de l'agence</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Configuration globale de la plateforme</p>
        </div>
        <button onClick={save}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${saved ? "bg-emerald-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
          <Save className="w-4 h-4" />
          {saved ? "Enregistré ✓" : "Enregistrer"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-52 flex-shrink-0">
          <div className="bg-white dark:bg-[#0f141f] rounded-2xl border border-border dark:border-slate-800 p-2 space-y-0.5">
            {SETTINGS_TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-blue-600 text-white" : "hover:bg-muted/40 dark:hover:bg-slate-800 text-muted-foreground"}`}>
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white dark:bg-[#0f141f] rounded-2xl border border-border dark:border-slate-800 p-6 text-slate-800 dark:text-slate-200">
          {/* Agency Settings */}
          {activeTab === "agency" && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg">Informations de l'agence</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Nom commercial", key: "agencyName", icon: Building2 },
                  { label: "Raison sociale", key: "legalName", icon: Building2 },
                  { label: "Immatriculation", key: "registration", icon: Shield },
                  { label: "Adresse", key: "address", icon: Globe },
                  { label: "Ville", key: "city", icon: Globe },
                  { label: "Code Postal", key: "postalCode", icon: Globe },
                  { label: "Pays", key: "country", icon: Globe },
                  { label: "Téléphone principal", key: "phone", icon: Phone },
                  { label: "WhatsApp", key: "whatsapp", icon: Phone },
                  { label: "Email contact", key: "email", icon: Mail },
                  { label: "Email support", key: "supportEmail", icon: Mail },
                  { label: "Site web", key: "website", icon: Globe },
                ].map(f => {
                  const Icon = f.icon;
                  return (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">{f.label}</label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          value={(agencySettings as Record<string, string>)[f.key]}
                          onChange={e => setAgencySettings(s => ({ ...s, [f.key]: e.target.value }))}
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                      </div>
                    </div>
                  );
                })}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">Langue par défaut</label>
                  <select value={agencySettings.defaultLanguage} onChange={e => setAgencySettings(s => ({ ...s, defaultLanguage: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                    <option value="fr">🇫🇷 Français</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="ar">🇲🇦 العربية</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Financial Settings */}
          {activeTab === "financial" && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg">Configuration financière</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Devise principale", key: "currency", placeholder: "TND" },
                  { label: "Symbole devise", key: "currencySymbol", placeholder: "DT" },
                  { label: "Taux TVA (%) [0% inclus TTC]", key: "taxRate", placeholder: "0" },
                  { label: "Timbre fiscal (DT)", key: "timbreFiscal", placeholder: "1" },
                  { label: "Contribution LF 2026 (DT / jour / voiture)", key: "contributionLF2026", placeholder: "2" },
                  { label: "Âge minimum (ans)", key: "minRentalAge", placeholder: "21" },
                  { label: "Âge minimum (Luxe/Sport)", key: "minLuxuryAge", placeholder: "25" },
                  { label: "Annulation gratuite (heures)", key: "cancellationHours", placeholder: "48" },
                  { label: "Frais d'annulation (%)", key: "cancellationFeeRate", placeholder: "20" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">{f.label}</label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input type="text"
                        value={(financialSettings as Record<string, string>)[f.key]}
                        onChange={e => setFinancialSettings(s => ({ ...s, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <strong>Note:</strong> Les modifications tarifaires s'appliquent uniquement aux nouvelles réservations.
              </div>
            </div>
          )}

          {/* Opening Hours */}
          {activeTab === "hours" && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg">Horaires d'ouverture</h2>
              <div className="space-y-3">
                {openingHours.map((h, i) => (
                  <div key={h.day} className="flex items-center gap-4 p-3 bg-muted/20 rounded-xl">
                    <div className="w-20 text-sm font-medium">{h.day}</div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div onClick={() => setOpeningHours(hs => hs.map((x, j) => j === i ? { ...x, isOpen: !x.isOpen } : x))}
                        className={`relative w-10 h-5 rounded-full transition-colors ${h.isOpen ? "bg-blue-600" : "bg-gray-300"}`}>
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${h.isOpen ? "translate-x-5" : ""}`} />
                      </div>
                      <span className="text-sm text-muted-foreground">{h.isOpen ? "Ouvert" : "Fermé"}</span>
                    </label>
                    {h.isOpen && (
                      <>
                        <input type="time" value={h.open} onChange={e => setOpeningHours(hs => hs.map((x, j) => j === i ? { ...x, open: e.target.value } : x))}
                          className="px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <span className="text-muted-foreground text-sm">→</span>
                        <input type="time" value={h.close} onChange={e => setOpeningHours(hs => hs.map((x, j) => j === i ? { ...x, close: e.target.value } : x))}
                          className="px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg">Préférences de notifications</h2>
              <div className="space-y-3">
                {[
                  { key: "newBooking", label: "Nouvelle réservation", desc: "Alerte dès qu'une réservation est créée" },
                  { key: "bookingCancelled", label: "Annulation de réservation", desc: "Alerte sur toute annulation client" },
                  { key: "paymentReceived", label: "Paiement reçu", desc: "Confirmation de chaque paiement" },
                  { key: "vehicleUnavailable", label: "Véhicule indisponible", desc: "Alerte si un véhicule passe en maintenance" },
                  { key: "maintenanceDue", label: "Maintenance à venir", desc: "Rappel 7 jours avant la date de maintenance" },
                  { key: "overdueReturn", label: "Retour en retard", desc: "Alerte si un véhicule n'est pas rendu à temps" },
                  { key: "dailyReport", label: "Rapport quotidien", desc: "Résumé envoyé chaque matin par email" },
                  { key: "weeklyReport", label: "Rapport hebdomadaire", desc: "Résumé envoyé chaque lundi" },
                ].map(n => (
                  <div key={n.key} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                    <div>
                      <div className="text-sm font-semibold">{n.label}</div>
                      <div className="text-xs text-muted-foreground">{n.desc}</div>
                    </div>
                    <button onClick={() => setNotifications(ns => ({ ...ns, [n.key]: !ns[n.key as keyof typeof notifications] }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${notifications[n.key as keyof typeof notifications] ? "bg-blue-600" : "bg-gray-300"}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications[n.key as keyof typeof notifications] ? "translate-x-5" : ""}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg">Sécurité & Accès</h2>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                  <Shield className="w-4 h-4 inline mr-2" />
                  L'accès admin est protégé par authentification JWT avec sessions de 24 heures.
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">Email administrateur</label>
                  <input type="email" defaultValue="admin@payless.tn"
                    className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">Nouveau mot de passe</label>
                  <input type="password" placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">Confirmer le mot de passe</label>
                  <input type="password" placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                </div>
                <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                  Mettre à jour le mot de passe
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

