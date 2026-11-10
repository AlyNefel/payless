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
  FileText,
  MessageSquare,
  Truck,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Send,
  Smartphone,
  Key,
  QrCode,
  RefreshCw,
  Power,
  Check,
} from "lucide-react";

const SETTINGS_TABS = [
  { id: "agency", label: "Agence & Contact", icon: Building2 },
  { id: "financial", label: "Financier & Fiscalité", icon: CreditCard },
  { id: "payment", label: "Modes de Paiement", icon: Percent },
  { id: "zones", label: "Livraison & Ramassage", icon: Truck },
  { id: "smtp", label: "Serveur SMTP & Envoi Email", icon: Mail },
  { id: "whatsapp", label: "Connexion WhatsApp", icon: MessageSquare },
  { id: "templates", label: "Modèles Email & PDF", icon: FileText },
  { id: "notifications", label: "Alertes Système", icon: Bell },
  { id: "hours", label: "Horaires", icon: Clock },
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

  // Payment Methods Configuration
  const [paymentMethodsConfig, setPaymentMethodsConfig] = useState({
    cash: {
      enabled: true,
      label: "Cash à la livraison",
      description: "Réglez en espèces ou en devises lors de la prise en charge du véhicule.",
    },
    bank_transfer: {
      enabled: true,
      label: "Virement bancaire professionnel",
      bankName: "BIAT Tunisie (Banque Internationale Arabe de Tunisie)",
      rib: "08 001 0001234567890 12",
      iban: "TN59 0800 1000 1234 5678 9012",
      bic: "BIATTNTT",
      accountHolder: "HOUIMLI RENT A CAR SARL (Payless Car Rental)",
      instructions: "Veuillez mentionner votre référence de réservation en objet du virement.",
    },
    credit_card: {
      enabled: true,
      label: "Carte Bancaire (TPE à la livraison / En ligne)",
      description: "Paiement sécurisé par carte bancaire nationale ou internationale (Visa, Mastercard, CIB).",
    },
  });

  // Zones & Fees (Delivery / Ramassage)
  const [zones, setZones] = useState<any[]>([]);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [zonesSaved, setZonesSaved] = useState(false);
  const [differentLocFee, setDifferentLocFee] = useState("50");

  // WhatsApp Gateway & Business configuration
  const [whatsAppSettings, setWhatsAppSettings] = useState({
    provider: "ultramsg" as "ultramsg" | "greenapi" | "meta" | "custom_webhook" | "direct_link",
    autoSendEnabled: true,
    apiUrl: "https://api.ultramsg.com/instance99999/messages/chat",
    instanceId: "instance99999",
    token: "",
    senderPhone: "+216 25 120 130",
    messageTemplate:
      "Bonjour {client},\n\n✅ Votre réservation chez Payless Car Rental Tunisie est CONFIRMÉE !\n\n📋 Référence : {ref}\n🚗 Véhicule : {vehicle}\n📅 Période : {dates}\n📍 Prise en charge : {pickup}\n💰 Total TTC à régler : {total} TND\n\n📄 Téléchargez votre Bon de Réservation & Facture (PDF) :\n{pdfUrl}\n\nAssistance VIP 24/7 : +216 25 120 130.\nMerci pour votre confiance !",
  });
  const [testingWhatsApp, setTestingWhatsApp] = useState(false);
  const [whatsAppTestResult, setWhatsAppTestResult] = useState<{ success: boolean; message: string; url?: string } | null>(null);
  const [whatsAppTestRecipient, setWhatsAppTestRecipient] = useState("+216 25 120 130");
  const [showWhatsAppToken, setShowWhatsAppToken] = useState(false);

  // WhatsApp QR connection state
  const [waQrCode, setWaQrCode] = useState<string | null>(null);
  const [waConnectionStatus, setWaConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [waConnectedPhone, setWaConnectedPhone] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [pollingWa, setPollingWa] = useState(false);

  // Email & PDF templates
  const [emailTemplate, setEmailTemplate] = useState({
    subject: "Confirmation officielle de réservation - Payless Car Rental Tunisie ({ref})",
    introText:
      "Nous avons le plaisir de vous confirmer que votre réservation est validée et verrouillée sans attente.",
    footerNotice:
      "Assistance client VIP 24/7 au +216 80 80 80 80. Agence La Soukra, Tunis. Bon de location officiel en pièce jointe.",
  });

  const [pdfTemplate, setPdfTemplate] = useState({
    companyHeader: "PAYLESS CAR RENTAL TUNISIE - HOUIMLI RENT A CAR SARL",
    legalNotice:
      "Contrat de location soumis au droit tunisien. Véhicule garanti en parfait état d'entretien.",
    franchiseClause:
      "Franchise et caution restituées à la fin de la période de location sous réserve de restitution conforme.",
    emergencyPhone: "+216 80 80 80 80",
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

  // SMTP Email Server Configuration
  const [smtpSettings, setSmtpSettings] = useState({
    host: "smtp.gmail.com",
    port: "465",
    secure: true,
    user: "ali.nefel2020@gmail.com",
    pass: "",
    fromName: "Payless Car Rental Tunisia",
    fromEmail: "ali.nefel2020@gmail.com",
  });
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [smtpTestRecipient, setSmtpTestRecipient] = useState("ali.nefel2020@gmail.com");

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
          if (s.whatsAppSettings && typeof s.whatsAppSettings === "object") {
            setWhatsAppSettings((prev) => ({ ...prev, ...(s.whatsAppSettings as any) }));
          } else if (s.whatsapp_config && typeof s.whatsapp_config === "object") {
            setWhatsAppSettings((prev) => ({ ...prev, ...(s.whatsapp_config as any) }));
          }
          if (s.emailTemplate && typeof s.emailTemplate === "object") {
            setEmailTemplate((prev) => ({ ...prev, ...(s.emailTemplate as any) }));
          }
          if (s.pdfTemplate && typeof s.pdfTemplate === "object") {
            setPdfTemplate((prev) => ({ ...prev, ...(s.pdfTemplate as any) }));
          }
          if (s.smtp_config && typeof s.smtp_config === "object") {
            setSmtpSettings((prev) => ({ ...prev, ...(s.smtp_config as any) }));
          }
          if (s.paymentMethods && typeof s.paymentMethods === "object") {
            setPaymentMethodsConfig((prev) => ({ ...prev, ...(s.paymentMethods as any) }));
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }

    async function loadZones() {
      try {
        setZonesLoading(true);
        const res = await fetch("/api/locations/fees?t=" + Date.now());
        const json = await res.json();
        if (json.success && Array.isArray(json.zones)) {
          setZones(json.zones);
          if (json.differentLocationFee !== undefined) {
            setDifferentLocFee(String(json.differentLocationFee));
          }
        }
      } catch (e) {
        console.error("Failed to load zones:", e);
      } finally {
        setZonesLoading(false);
      }
    }

    loadSettings();
    loadZones();
  }, []);

  const saveZones = async () => {
    setZonesLoading(true);
    setZonesSaved(false);
    try {
      const res = await fetch("/api/locations/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: true,
          zones,
          differentLocationFee: Number(differentLocFee || 50),
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setZonesSaved(true);
        setTimeout(() => setZonesSaved(false), 3500);
      } else {
        setErrorMsg("Erreur lors de l'enregistrement des frais de zone.");
      }
    } catch (err) {
      setErrorMsg("Erreur de communication avec le serveur.");
    } finally {
      setZonesLoading(false);
    }
  };

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
        whatsAppSettings,
        whatsapp_config: whatsAppSettings,
        emailTemplate,
        pdfTemplate,
        smtp_config: smtpSettings,
        paymentMethods: paymentMethodsConfig,
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

  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    setSmtpTestResult(null);
    try {
      const res = await fetch("/api/admin/settings/test-smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...smtpSettings,
          testRecipient: smtpTestRecipient,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSmtpTestResult({
          success: true,
          message: json.message || "Connexion SMTP validée avec succès !",
        });
      } else {
        setSmtpTestResult({
          success: false,
          message: json.error || "Échec de connexion SMTP.",
        });
      }
    } catch {
      setSmtpTestResult({
        success: false,
        message: "Erreur réseau lors de la tentative de test SMTP.",
      });
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleTestWhatsApp = async () => {
    setTestingWhatsApp(true);
    setWhatsAppTestResult(null);
    try {
      const res = await fetch("/api/admin/settings/test-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientPhone: whatsAppTestRecipient,
          config: whatsAppSettings,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setWhatsAppTestResult({
          success: true,
          message: json.message || "Message WhatsApp envoyé avec succès !",
          url: json.url,
        });
      } else {
        setWhatsAppTestResult({
          success: false,
          message: json.error || "Échec de l'envoi du message WhatsApp via la passerelle.",
          url: json.url,
        });
      }
    } catch {
      setWhatsAppTestResult({
        success: false,
        message: "Erreur de connexion réseau lors du test WhatsApp.",
      });
    } finally {
      setTestingWhatsApp(false);
    }
  };

  // WhatsApp QR Code and connection check
  const handleFetchQrCode = async () => {
    if (!whatsAppSettings.instanceId || !whatsAppSettings.token) {
      alert("Veuillez renseigner votre ID d'Instance et votre Clé API/Token avant de générer le QR Code.");
      return;
    }
    setLoadingQr(true);
    setWaQrCode(null);
    try {
      const params = new URLSearchParams({
        action: "qr",
        instanceId: whatsAppSettings.instanceId.trim(),
        token: whatsAppSettings.token.trim(),
        provider: whatsAppSettings.provider,
      });
      const res = await fetch(`/api/admin/settings/whatsapp-qr?${params}`);
      const data = await res.json();
      if (res.ok && data.qrCode) {
        setWaQrCode(data.qrCode);
        setWaConnectionStatus("connecting");
        setPollingWa(true);
      } else {
        alert(data.error || "Impossible de récupérer le QR code. Vérifiez vos identifiants UltraMsg/GreenAPI.");
      }
    } catch {
      alert("Erreur réseau lors de la récupération du QR Code.");
    } finally {
      setLoadingQr(false);
    }
  };

  const handleCheckWaStatus = async () => {
    if (!whatsAppSettings.instanceId || !whatsAppSettings.token) return;
    try {
      const params = new URLSearchParams({
        action: "status",
        instanceId: whatsAppSettings.instanceId.trim(),
        token: whatsAppSettings.token.trim(),
        provider: whatsAppSettings.provider,
      });
      const res = await fetch(`/api/admin/settings/whatsapp-qr?${params}`);
      const data = await res.json();
      if (res.ok && data.connected) {
        setWaConnectionStatus("connected");
        if (data.phone) setWaConnectedPhone(data.phone);
        setWaQrCode(null);
        setPollingWa(false);
      } else {
        if (waConnectionStatus !== "connecting") {
          setWaConnectionStatus("disconnected");
        }
      }
    } catch {
      // ignore background polling error
    }
  };

  // Poll connection status every 4 seconds while waiting for scan
  useEffect(() => {
    let interval: any = null;
    if (pollingWa) {
      interval = setInterval(() => {
        handleCheckWaStatus();
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pollingWa, whatsAppSettings.instanceId, whatsAppSettings.token, whatsAppSettings.provider]);

  // Initial check when tab is opened
  useEffect(() => {
    if (activeTab === "whatsapp" && whatsAppSettings.instanceId && whatsAppSettings.token) {
      handleCheckWaStatus();
    }
  }, [activeTab]);

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
            <div className="sticky top-4 bg-white dark:bg-[#0f141f] rounded-2xl border border-slate-200 dark:border-slate-800 p-2 space-y-1 max-h-[calc(100vh-120px)] overflow-y-auto">
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
                    <span>Règles de Fiscalité & Frais en Tunisie (LF 2026) :</span>
                  </div>
                  <p>
                    • <strong>TVA Régime Spécial :</strong> Le taux de TVA est configuré à <strong>0%</strong> car les tarifs grand public Payless Tunisie sont affichés en Toutes Taxes Comprises (TTC).
                  </p>
                  <p>
                    • <strong>Timbre Fiscal :</strong> Droit de timbre légal de quittance fixé à <strong>{financialSettings.timbreFiscal || "1"} DT</strong> par contrat de location.
                  </p>
                  <p>
                    • <strong>Contribution LF 2026 :</strong> Taxe légale de <strong>{financialSettings.contributionLF2026 || "2"} DT / jour / véhicule</strong> conformément aux dispositions de la Loi de Finances tunisienne.
                  </p>
                  <p>
                    • <strong>Aller-Simple (Agence différente) :</strong> Frais de <strong>{financialSettings.differentLocationFee || "50"} DT</strong> appliqués lorsqu'un véhicule est restitué dans une agence différente du point de départ.
                  </p>
                </div>
              </div>
            )}

            {/* Payment Methods Admin CRUD */}
            {activeTab === "payment" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span>Modes de Paiement</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Configurez les modes de paiement proposés aux clients lors de la réservation. Vous pouvez activer/désactiver chaque option et personnaliser les libellés et coordonnées.
                  </p>
                </div>

                {/* Cash */}
                <div className="p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-border dark:border-neutral-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💵</span>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-white">Cash à la livraison</div>
                        <div className="text-xs text-slate-500">Paiement en espèces ou devises lors de la prise en charge</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaymentMethodsConfig((p) => ({ ...p, cash: { ...p.cash, enabled: !p.cash.enabled } }))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        paymentMethodsConfig.cash.enabled
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-neutral-400"
                      }`}
                    >
                      {paymentMethodsConfig.cash.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {paymentMethodsConfig.cash.enabled ? "Visible" : "Masqué"}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Libellé affiché au client</label>
                      <input
                        value={paymentMethodsConfig.cash.label}
                        onChange={(e) => setPaymentMethodsConfig((p) => ({ ...p, cash: { ...p.cash, label: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-lg border border-border dark:border-neutral-700 text-sm bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Description courte</label>
                      <input
                        value={paymentMethodsConfig.cash.description}
                        onChange={(e) => setPaymentMethodsConfig((p) => ({ ...p, cash: { ...p.cash, description: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-lg border border-border dark:border-neutral-700 text-sm bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Transfer */}
                <div className="p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-border dark:border-neutral-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏦</span>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-white">Virement bancaire</div>
                        <div className="text-xs text-slate-500">Coordonnées RIB/IBAN affichées lors de la sélection</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaymentMethodsConfig((p) => ({ ...p, bank_transfer: { ...p.bank_transfer, enabled: !p.bank_transfer.enabled } }))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        paymentMethodsConfig.bank_transfer.enabled
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-neutral-400"
                      }`}
                    >
                      {paymentMethodsConfig.bank_transfer.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {paymentMethodsConfig.bank_transfer.enabled ? "Visible" : "Masqué"}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Libellé affiché au client</label>
                      <input
                        value={paymentMethodsConfig.bank_transfer.label}
                        onChange={(e) => setPaymentMethodsConfig((p) => ({ ...p, bank_transfer: { ...p.bank_transfer, label: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-lg border border-border dark:border-neutral-700 text-sm bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nom de la banque</label>
                      <input
                        value={paymentMethodsConfig.bank_transfer.bankName}
                        onChange={(e) => setPaymentMethodsConfig((p) => ({ ...p, bank_transfer: { ...p.bank_transfer, bankName: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-lg border border-border dark:border-neutral-700 text-sm bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Titulaire du compte</label>
                      <input
                        value={paymentMethodsConfig.bank_transfer.accountHolder}
                        onChange={(e) => setPaymentMethodsConfig((p) => ({ ...p, bank_transfer: { ...p.bank_transfer, accountHolder: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-lg border border-border dark:border-neutral-700 text-sm bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">RIB</label>
                      <input
                        value={paymentMethodsConfig.bank_transfer.rib}
                        onChange={(e) => setPaymentMethodsConfig((p) => ({ ...p, bank_transfer: { ...p.bank_transfer, rib: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-lg border border-border dark:border-neutral-700 text-sm font-mono bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="08 001 0001234567890 12"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">IBAN</label>
                      <input
                        value={paymentMethodsConfig.bank_transfer.iban}
                        onChange={(e) => setPaymentMethodsConfig((p) => ({ ...p, bank_transfer: { ...p.bank_transfer, iban: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-lg border border-border dark:border-neutral-700 text-sm font-mono bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="TN59 0800 1000 1234 5678 9012"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">BIC/SWIFT</label>
                      <input
                        value={paymentMethodsConfig.bank_transfer.bic}
                        onChange={(e) => setPaymentMethodsConfig((p) => ({ ...p, bank_transfer: { ...p.bank_transfer, bic: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-lg border border-border dark:border-neutral-700 text-sm font-mono bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="BIATTNTT"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Instructions spéciales (affichées au client)</label>
                      <textarea
                        value={paymentMethodsConfig.bank_transfer.instructions}
                        onChange={(e) => setPaymentMethodsConfig((p) => ({ ...p, bank_transfer: { ...p.bank_transfer, instructions: e.target.value } }))}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-border dark:border-neutral-700 text-sm bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        placeholder="Ex: Veuillez mentionner votre référence de réservation en objet du virement."
                      />
                    </div>
                  </div>
                </div>

                {/* Credit Card */}
                <div className="p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-border dark:border-neutral-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💳</span>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-white">Carte bancaire (TPE / En ligne)</div>
                        <div className="text-xs text-slate-500">Visa, Mastercard, CIB — TPE à la livraison ou paiement en ligne</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaymentMethodsConfig((p) => ({ ...p, credit_card: { ...p.credit_card, enabled: !p.credit_card.enabled } }))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        paymentMethodsConfig.credit_card.enabled
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-neutral-400"
                      }`}
                    >
                      {paymentMethodsConfig.credit_card.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {paymentMethodsConfig.credit_card.enabled ? "Visible" : "Masqué"}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Libellé affiché au client</label>
                      <input
                        value={paymentMethodsConfig.credit_card.label}
                        onChange={(e) => setPaymentMethodsConfig((p) => ({ ...p, credit_card: { ...p.credit_card, label: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-lg border border-border dark:border-neutral-700 text-sm bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Description courte</label>
                      <input
                        value={paymentMethodsConfig.credit_card.description}
                        onChange={(e) => setPaymentMethodsConfig((p) => ({ ...p, credit_card: { ...p.credit_card, description: e.target.value } }))}
                        className="w-full px-3 py-2 rounded-lg border border-border dark:border-neutral-700 text-sm bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800/50 text-xs text-blue-700 dark:text-blue-300">
                  💡 Les modifications sont enregistrées globalement via le bouton <strong>«&nbsp;Enregistrer les modifications&nbsp;»</strong> en haut de page.
                </div>
              </div>
            )}

            {/* Zones & Fees (Delivery / Ramassage) */}
            {activeTab === "zones" && (              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <span>Frais de Livraison et de Ramassage hors Tunis</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Configurez les frais de livraison et de ramassage par région. Le système calcule automatiquement les frais lors de la réservation.
                    </p>
                  </div>
                  <button
                    onClick={saveZones}
                    disabled={zonesLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                  >
                    {zonesLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : zonesSaved ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>Frais Enregistrés ✓</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Enregistrer les Frais de Zone</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-4 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Barème officiel appliqué aux réservations :</span>
                  </div>
                  <p>
                    • <strong>Grand Tunis :</strong> Livraison Gratuite (0 TND) — Ramassage Gratuit (0 TND).
                  </p>
                  <p>
                    • <strong>Hammamet / Nabeul :</strong> Livraison 20 TND — Ramassage 20 TND.
                  </p>
                  <p>
                    • <strong>Sousse / Monastir / Enfidha :</strong> Livraison 35 TND — Ramassage 35 TND.
                  </p>
                  <p>
                    • <strong>Bizerte :</strong> Livraison 30 TND — Ramassage 30 TND | <strong>Sfax :</strong> 50 TND | <strong>Tabarka :</strong> 60 TND.
                  </p>
                </div>

                {/* Aller-simple general setting */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white">
                      Frais d'aller-simple (Restitution dans une agence différente)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Montant appliqué lorsque l'agence de retour n'est pas identique à celle de départ
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={differentLocFee}
                      onChange={(e) => setDifferentLocFee(e.target.value)}
                      className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-center outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-500">TND</span>
                  </div>
                </div>

                {/* Zones table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Régions et Tarification par Zone ({zones.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        setZones((prev) => [
                          ...prev,
                          {
                            id: "zone-" + Date.now(),
                            name: "Nouvelle Région",
                            cities: ["ville"],
                            deliveryFee: 25,
                            returnFee: 25,
                            isActive: true,
                          },
                        ])
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter une région</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                        <tr>
                          <th className="py-2.5 px-3">Nom de la Région / Zone</th>
                          <th className="py-2.5 px-3">Villes associées (mots-clés)</th>
                          <th className="py-2.5 px-3 w-28 text-center">Livraison (TND)</th>
                          <th className="py-2.5 px-3 w-28 text-center">Ramassage (TND)</th>
                          <th className="py-2.5 px-3 w-20 text-center">Actif</th>
                          <th className="py-2.5 px-3 w-16 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {zones.map((zone, idx) => (
                          <tr key={zone.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={zone.name}
                                onChange={(e) =>
                                  setZones((prev) =>
                                    prev.map((z, i) => (i === idx ? { ...z, name: e.target.value } : z))
                                  )
                                }
                                className="w-full px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                value={Array.isArray(zone.cities) ? zone.cities.join(", ") : zone.cities || ""}
                                onChange={(e) =>
                                  setZones((prev) =>
                                    prev.map((z, i) =>
                                      i === idx
                                        ? {
                                            ...z,
                                            cities: e.target.value
                                              .split(",")
                                              .map((s) => s.trim().toLowerCase())
                                              .filter(Boolean),
                                          }
                                        : z
                                    )
                                  )
                                }
                                placeholder="ex: sousse, kantaoui"
                                className="w-full px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="number"
                                value={zone.deliveryFee}
                                onChange={(e) =>
                                  setZones((prev) =>
                                    prev.map((z, i) =>
                                      i === idx ? { ...z, deliveryFee: Number(e.target.value) } : z
                                    )
                                  )
                                }
                                className="w-20 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-center outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="number"
                                value={zone.returnFee}
                                onChange={(e) =>
                                  setZones((prev) =>
                                    prev.map((z, i) =>
                                      i === idx ? { ...z, returnFee: Number(e.target.value) } : z
                                    )
                                  )
                                }
                                className="w-20 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-center outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={zone.isActive !== false}
                                onChange={(e) =>
                                  setZones((prev) =>
                                    prev.map((z, i) =>
                                      i === idx ? { ...z, isActive: e.target.checked } : z
                                    )
                                  )
                                }
                                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => setZones((prev) => prev.filter((_, i) => i !== idx))}
                                className="p-1 text-red-500 hover:text-red-700 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SMTP Server Configuration */}
            {activeTab === "smtp" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span>Configuration Serveur SMTP (Envoi Réel des Emails & Factures PDF)</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Configurez et testez vos accès SMTP. Ces paramètres sont sauvegardés directement en base de données et prévalent en production.
                    </p>
                  </div>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Enregistrer la configuration SMTP</span>
                  </button>
                </div>

                {/* Google Gmail Special Helper Banner */}
                <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200 text-sm">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Important pour les comptes Gmail / Google Workspace :</span>
                  </div>
                  <p className="text-amber-800 dark:text-amber-300">
                    Google bloque les connexions SMTP directes avec votre mot de passe habituel. Vous devez obligatoirement utiliser un <strong>Mot de passe d'application Google (16 lettres)</strong> :
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-amber-900 dark:text-amber-200 pl-1 font-medium">
                    <li>Activez la « Validation en 2 étapes » sur votre compte Google.</li>
                    <li>Rendez-vous sur <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="underline font-bold text-amber-950 dark:text-white">myaccount.google.com/apppasswords</a>.</li>
                    <li>Créez un mot de passe d'application intitulé « Payless Car Rental » et copiez les 16 lettres générées.</li>
                    <li>Collez ce mot de passe de 16 lettres dans le champ ci-dessous, puis cliquez sur <strong>Tester la connexion</strong>.</li>
                  </ol>
                </div>

                {/* SMTP Credentials Form */}
                <div className="p-5 bg-white dark:bg-[#0f141f] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Identifiants et Hôte SMTP</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-500">Serveur Hôte SMTP</label>
                      <input
                        type="text"
                        value={smtpSettings.host}
                        onChange={(e) => setSmtpSettings({ ...smtpSettings, host: e.target.value })}
                        placeholder="smtp.gmail.com"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-500">Port SMTP</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={smtpSettings.port}
                          onChange={(e) => setSmtpSettings({ ...smtpSettings, port: e.target.value })}
                          placeholder="465 ou 587"
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setSmtpSettings({ ...smtpSettings, port: "465", secure: true })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${smtpSettings.port === "465" ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}
                        >
                          465 (SSL)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSmtpSettings({ ...smtpSettings, port: "587", secure: false })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${smtpSettings.port === "587" ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}
                        >
                          587 (TLS)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-500">Utilisateur / Adresse Email SMTP</label>
                      <input
                        type="email"
                        value={smtpSettings.user}
                        onChange={(e) => setSmtpSettings({ ...smtpSettings, user: e.target.value })}
                        placeholder="ali.nefel2020@gmail.com"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-500">
                        Mot de passe SMTP / Mot de passe d'application (16 lettres)
                      </label>
                      <input
                        type="password"
                        value={smtpSettings.pass}
                        onChange={(e) => setSmtpSettings({ ...smtpSettings, pass: e.target.value })}
                        placeholder="Ex: olah wzqs hujo usex"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-500">Nom affiché de l'expéditeur</label>
                      <input
                        type="text"
                        value={smtpSettings.fromName}
                        onChange={(e) => setSmtpSettings({ ...smtpSettings, fromName: e.target.value })}
                        placeholder="Payless Car Rental Tunisie"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-500">Adresse email d'expédition</label>
                      <input
                        type="email"
                        value={smtpSettings.fromEmail}
                        onChange={(e) => setSmtpSettings({ ...smtpSettings, fromEmail: e.target.value })}
                        placeholder="contact@paylesscarrental.tn"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Diagnostic & Test Section */}
                <div className="p-5 bg-slate-50 dark:bg-[#0f141f]/70 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Tester la Connexion SMTP & Envoyer un Email d'Essai</h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Vérifiez instantanément la validité de vos identifiants. Un email d'essai sera envoyé pour valider que le serveur distant accepte les connexions.
                  </p>

                  {smtpTestResult && (
                    <div
                      className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2.5 ${
                        smtpTestResult.success
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                          : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200"
                      }`}
                    >
                      {smtpTestResult.success ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                      )}
                      <span>{smtpTestResult.message}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input
                      type="email"
                      value={smtpTestRecipient}
                      onChange={(e) => setSmtpTestRecipient(e.target.value)}
                      placeholder="Entrez votre email pour recevoir le test"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleTestSmtp}
                      disabled={testingSmtp}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {testingSmtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      <span>{testingSmtp ? "Test en cours..." : "Lancer le test SMTP"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp Connection & Gateway */}
            {activeTab === "whatsapp" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    <span>Connexion WhatsApp & Passerelle d'Envoi</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Connectez votre compte ou passerelle WhatsApp (UltraMsg, GreenAPI, Meta Cloud API ou lien direct) pour envoyer automatiquement les confirmations et les bons PDF officiels sur le numéro WhatsApp du client.
                  </p>
                </div>

                {/* Connection Status Indicator */}
                <div className="p-4 rounded-2xl border bg-slate-50 dark:bg-[#0f141f] border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3.5 h-3.5 rounded-full ${waConnectionStatus === "connected" ? "bg-emerald-500 animate-pulse" : waConnectionStatus === "connecting" ? "bg-amber-500 animate-ping" : "bg-slate-400"}`} />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Statut de la Connexion WhatsApp :</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          waConnectionStatus === "connected"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : waConnectionStatus === "connecting"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}>
                          {waConnectionStatus === "connected"
                            ? "🟢 Connecté & Actif"
                            : waConnectionStatus === "connecting"
                            ? "🟡 En attente de scan QR..."
                            : "⚪ Non connecté"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {waConnectionStatus === "connected"
                          ? `Votre WhatsApp personnel/professionnel (${waConnectedPhone || whatsAppSettings.senderPhone}) est connecté et expédiera automatiquement les messages.`
                          : waConnectionStatus === "connecting"
                          ? "Scannez le QR Code affiché ci-dessous avec votre application WhatsApp mobile."
                          : "Générez le QR Code ci-dessous pour connecter votre propre compte WhatsApp expéditeur."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCheckWaStatus}
                      title="Vérifier le statut en temps réel"
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      <input
                        type="checkbox"
                        checked={whatsAppSettings.autoSendEnabled}
                        onChange={(e) =>
                          setWhatsAppSettings((prev) => ({ ...prev, autoSendEnabled: e.target.checked }))
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Envoi automatique client : {whatsAppSettings.autoSendEnabled ? "Activé" : "Désactivé"}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Mode Selector: 1-Clic Direct (Zero Clé) vs Passerelle API */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mode 1-Clic Recommandé */}
                  <div
                    onClick={() => {
                      setWhatsAppSettings((prev) => ({
                        ...prev,
                        provider: "direct_link",
                      }));
                    }}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      whatsAppSettings.provider === "direct_link"
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-600 text-white rounded-xl">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          Mode 1-Clic Direct (WhatsApp Web / Mobile)
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                        ⭐ Recommandé • 0 Clé requise
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      <strong>Aucun token, aucune clé d'API, 100% gratuit.</strong> Dans l'administration et pour les clients, un simple clic ouvre votre WhatsApp avec le numéro pré-rempli et le message complet (facture PDF incluse).
                    </p>
                  </div>

                  {/* Mode Passerelle Automatique */}
                  <div
                    onClick={() => {
                      setWhatsAppSettings((prev) => ({
                        ...prev,
                        provider: "ultramsg",
                      }));
                    }}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      whatsAppSettings.provider !== "direct_link"
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-600 text-white rounded-xl">
                          <QrCode className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          Mode Passerelle API (UltraMsg / GreenAPI)
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Scan QR Code
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Envois automatisés en tâche de fond dès qu'un client réserve. Nécessite une instance de passerelle pour connecter votre session WhatsApp.
                    </p>
                  </div>
                </div>

                {whatsAppSettings.provider !== "direct_link" ? (
                  <>
                    {/* QR Code Scanner Card (WhatsApp Web Connect) */}
                    <div className="p-6 bg-gradient-to-br from-emerald-50/50 via-white to-slate-50 dark:from-emerald-950/20 dark:via-[#0f141f] dark:to-slate-900 rounded-2xl border-2 border-emerald-500/30 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                            <QrCode className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                              <span>Lier un compte WhatsApp Expéditeur (Scan QR Code)</span>
                              {waConnectionStatus === "connected" && (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                                  <Check className="w-3 h-3" /> Appareil lié
                                </span>
                              )}
                            </h3>
                            <p className="text-xs text-slate-500">
                              Scannez ce QR Code avec WhatsApp sur votre téléphone pour faire de ce compte l'expéditeur officiel des confirmations clients.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleFetchQrCode}
                          disabled={loadingQr}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {loadingQr ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Génération du QR...</span>
                            </>
                          ) : (
                            <>
                              <QrCode className="w-4 h-4" />
                              <span>{waQrCode ? "Rafraîchir le QR Code" : "Générer le QR Code WhatsApp"}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* QR Code Display Frame */}
                      {waQrCode ? (
                        <div className="mt-4 p-5 bg-white dark:bg-slate-950 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 flex flex-col items-center justify-center gap-4 text-center">
                          <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                            {waQrCode.startsWith("data:") || waQrCode.startsWith("http") ? (
                              <img
                                src={waQrCode}
                                alt="WhatsApp Web QR Code"
                                className="w-56 h-56 object-contain"
                              />
                            ) : (
                              <img
                                src={`data:image/png;base64,${waQrCode}`}
                                alt="WhatsApp Web QR Code"
                                className="w-56 h-56 object-contain"
                              />
                            )}
                          </div>

                          <div className="space-y-1 max-w-md">
                            <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>En attente de scan... Vérification automatique toutes les 4s</span>
                            </div>
                            <ol className="text-[11px] text-slate-600 dark:text-slate-400 list-decimal list-inside text-left space-y-0.5 pt-1">
                              <li>Ouvrez WhatsApp sur votre smartphone</li>
                              <li>Allez dans <strong>Réglages / Menu (⋮)</strong> &gt; <strong>Appareils connectés</strong></li>
                              <li>Appuyez sur <strong>Connecter un appareil</strong> et pointez l'appareil photo vers ce QR</li>
                            </ol>
                          </div>
                        </div>
                      ) : waConnectionStatus === "connected" ? (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                            <div>
                              <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                                WhatsApp connecté avec succès !
                              </div>
                              <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                                Numéro actif : {waConnectedPhone || whatsAppSettings.senderPhone || "Connecté"}. Chaque réservation validée recevra une confirmation instantanée depuis ce numéro.
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleFetchQrCode}
                            className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
                          >
                            Changer de numéro (Nouveau QR)
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-100/60 dark:bg-slate-800/40 rounded-xl text-center text-xs text-slate-500">
                          Cliquez sur <strong>"Générer le QR Code WhatsApp"</strong> pour lier votre compte WhatsApp.
                        </div>
                      )}
                    </div>

                    {/* Gateway Credentials Form */}
                    <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        <span>Identifiants de la Passerelle WhatsApp</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-500">
                            Type de Passerelle
                          </label>
                          <select
                            value={whatsAppSettings.provider}
                            onChange={(e) => {
                              const prov = e.target.value as any;
                              let defaultUrl = whatsAppSettings.apiUrl;
                              if (prov === "ultramsg") {
                                defaultUrl = "https://api.ultramsg.com/instance99999/messages/chat";
                              } else if (prov === "greenapi") {
                                defaultUrl = "https://api.green-api.com/waInstance99999/sendMessage/TOKEN";
                              }
                              setWhatsAppSettings((prev) => ({
                                ...prev,
                                provider: prov,
                                apiUrl: defaultUrl,
                              }));
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="ultramsg">UltraMsg Gateway (Simple avec QR Code)</option>
                            <option value="greenapi">GreenAPI WhatsApp</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-500">
                            Numéro WhatsApp Agence Expéditeur
                          </label>
                          <input
                            type="text"
                            value={whatsAppSettings.senderPhone}
                            onChange={(e) =>
                              setWhatsAppSettings((prev) => ({ ...prev, senderPhone: e.target.value }))
                            }
                            placeholder="+216 25 120 130"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-500">
                            ID d'Instance
                          </label>
                          <input
                            type="text"
                            value={whatsAppSettings.instanceId || ""}
                            onChange={(e) =>
                              setWhatsAppSettings((prev) => ({ ...prev, instanceId: e.target.value }))
                            }
                            placeholder="Ex: instance12345"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-500">
                            Clé d'API Secrète / Token
                          </label>
                          <div className="relative">
                            <input
                              type={showWhatsAppToken ? "text" : "password"}
                              value={whatsAppSettings.token || ""}
                              onChange={(e) =>
                                setWhatsAppSettings((prev) => ({ ...prev, token: e.target.value }))
                              }
                              placeholder="Entrez votre token..."
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowWhatsAppToken(!showWhatsAppToken)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showWhatsAppToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Info Mode 1-Clic Direct sans Token */
                  <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-900 dark:text-emerald-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Mode 1-Clic Direct activé : Aucune configuration technique requise !</span>
                    </div>
                    <ul className="text-xs text-emerald-800 dark:text-emerald-300 space-y-1.5 list-disc list-inside">
                      <li><strong>Aucun identifiant, clé d'API ou token</strong> n'est demandé à l'administrateur.</li>
                      <li>Dans <strong>Réservations</strong> (`/admin/bookings`), un bouton dédié <strong>« Envoyer Confirmation WhatsApp (1-Clic) »</strong> ouvre directement votre WhatsApp Web ou application mobile.</li>
                      <li>Le message complet (Nom du client, Dates, Lieu, Montant, et lien de téléchargement direct de la facture PDF) est <strong>automatiquement pré-rédigé</strong>.</li>
                      <li>Le client peut également cliquer sur <strong>« Ouvrir WhatsApp »</strong> à la fin de sa réservation sur le site.</li>
                    </ul>
                  </div>
                )}

                {/* Message Template Editor */}
                <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 dark:text-white">
                      Modèle de Message WhatsApp Client
                    </label>
                    <span className="text-[11px] text-slate-500">Variables dynamiques prises en charge</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 py-1">
                    {[
                      { tag: "{client}", label: "Nom Client" },
                      { tag: "{ref}", label: "Référence" },
                      { tag: "{vehicle}", label: "Véhicule" },
                      { tag: "{dates}", label: "Dates" },
                      { tag: "{pickup}", label: "Prise en charge" },
                      { tag: "{total}", label: "Total TTC" },
                      { tag: "{pdfUrl}", label: "Lien Facture PDF" },
                    ].map((pill) => (
                      <button
                        key={pill.tag}
                        type="button"
                        onClick={() => {
                          setWhatsAppSettings((prev) => ({
                            ...prev,
                            messageTemplate: (prev.messageTemplate || "") + " " + pill.tag,
                          }));
                        }}
                        className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono font-bold"
                      >
                        + {pill.tag}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={6}
                    value={whatsAppSettings.messageTemplate}
                    onChange={(e) =>
                      setWhatsAppSettings((prev) => ({ ...prev, messageTemplate: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Live Diagnostic & Test Section */}
                <div className="p-5 bg-slate-50 dark:bg-[#0f141f]/70 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Tester la Connexion WhatsApp & Envoyer un Message d'Essai
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Vérifiez que vos identifiants permettent bien d'envoyer un message sur WhatsApp. Un message de confirmation officiel sera expédié immédiatement vers le numéro renseigné ci-dessous.
                  </p>

                  {whatsAppTestResult && (
                    <div
                      className={`p-4 rounded-xl border text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                        whatsAppTestResult.success
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                          : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {whatsAppTestResult.success ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                        )}
                        <span>{whatsAppTestResult.message}</span>
                      </div>
                      {whatsAppTestResult.url && (
                        <a
                          href={whatsAppTestResult.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold shrink-0 hover:bg-emerald-700"
                        >
                          <span>Ouvrir sur WhatsApp Web</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input
                      type="text"
                      value={whatsAppTestRecipient}
                      onChange={(e) => setWhatsAppTestRecipient(e.target.value)}
                      placeholder="Numéro destinataire (ex: +216 25 120 130)"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleTestWhatsApp}
                      disabled={testingWhatsApp}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {testingWhatsApp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>{testingWhatsApp ? "Envoi en cours..." : "Tester la connexion WhatsApp"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Email & PDF Templates */}
            {activeTab === "templates" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Gestion des Modèles Email & PDF</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Personnalisez le contenu de l'email de confirmation automatique et du bon de réservation PDF officiel (Voucher).
                  </p>
                </div>

                {/* Email template */}
                <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>Modèle d'Email de Confirmation Automatique</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-500">
                      Objet de l'Email de Confirmation
                    </label>
                    <input
                      type="text"
                      value={emailTemplate.subject}
                      onChange={(e) => setEmailTemplate((prev) => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-500">
                      Message d'Introduction
                    </label>
                    <textarea
                      rows={3}
                      value={emailTemplate.introText}
                      onChange={(e) => setEmailTemplate((prev) => ({ ...prev, introText: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-500">
                      Pied de page & Assistance client
                    </label>
                    <input
                      type="text"
                      value={emailTemplate.footerNotice}
                      onChange={(e) => setEmailTemplate((prev) => ({ ...prev, footerNotice: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Le bon de réservation officiel (PDF) est automatiquement généré avec QR code sécurisé et joint à chaque email.</span>
                  </div>
                </div>

                {/* PDF Voucher template */}
                <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Modèle de Bon de Réservation PDF (Voucher Officiel)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-500">
                        En-tête de la Société (PDF)
                      </label>
                      <input
                        type="text"
                        value={pdfTemplate.companyHeader}
                        onChange={(e) => setPdfTemplate((prev) => ({ ...prev, companyHeader: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-500">
                        Téléphone d'Urgence / Assistance 24/7 (PDF)
                      </label>
                      <input
                        type="text"
                        value={pdfTemplate.emergencyPhone}
                        onChange={(e) => setPdfTemplate((prev) => ({ ...prev, emergencyPhone: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-500">
                      Mentions Légales & Cadre Juridique (PDF)
                    </label>
                    <textarea
                      rows={2}
                      value={pdfTemplate.legalNotice}
                      onChange={(e) => setPdfTemplate((prev) => ({ ...prev, legalNotice: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-500">
                      Clause de Caution & Franchise Restituables (PDF)
                    </label>
                    <input
                      type="text"
                      value={pdfTemplate.franchiseClause}
                      onChange={(e) => setPdfTemplate((prev) => ({ ...prev, franchiseClause: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
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
              <div className="space-y-6">
                <div>
                  <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <span>Alertes Système & Notifications Internes</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Configurez les déclencheurs automatiques des alertes envoyées par email et dans le centre de notifications aux administrateurs.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Alertes système internes</h3>
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
