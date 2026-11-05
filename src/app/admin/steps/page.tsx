"use client";

import React, { useState, useEffect } from "react";
import {
  ListOrdered,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  Eye,
  Save,
  RotateCcw,
  Sliders,
  Info,
  Layers,
  Settings2,
  Sparkles,
  Smartphone,
  Laptop,
  Check,
  X,
  FileText,
  Calendar,
  Car,
  Shield,
  UserCheck,
  CreditCard,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
} from "lucide-react";
import { useAdminLang } from "@/contexts/AdminLangContext";

export interface StepField {
  id: string;
  key: string;
  labelFr: string;
  labelEn: string;
  type: "text" | "number" | "date" | "select" | "textarea" | "checkbox" | "file";
  placeholderFr?: string;
  placeholderEn?: string;
  required: boolean;
  enabled: boolean;
  options?: string[]; // For select type
  helpTextFr?: string;
  helpTextEn?: string;
}

export interface ReservationStep {
  id: string;
  stepNumber: number;
  slug: string;
  titleFr: string;
  titleEn: string;
  subtitleFr: string;
  subtitleEn: string;
  iconName: "Calendar" | "Car" | "Shield" | "UserCheck" | "CreditCard" | "Layers" | "FileText";
  enabled: boolean;
  isMandatory: boolean;
  infoBannerFr?: string;
  infoBannerEn?: string;
  fields: StepField[];
}

const DEFAULT_STEPS: ReservationStep[] = [
  {
    id: "step-1",
    stepNumber: 1,
    slug: "locations-dates",
    titleFr: "Dates & Lieux de Prise",
    titleEn: "Pickup Dates & Locations",
    subtitleFr: "Sélection des agences et période de réservation",
    subtitleEn: "Select agencies, pickup & return times",
    iconName: "Calendar",
    enabled: true,
    isMandatory: true,
    infoBannerFr: "Disponibilité garantie avec assistance 24/7 sur tous les aéroports de Tunisie (Tunis-Carthage, Monastir, Enfidha, Djerba).",
    infoBannerEn: "Guaranteed availability with 24/7 assistance across all airports in Tunisia.",
    fields: [
      {
        id: "f-1-1",
        key: "pickupLocation",
        labelFr: "Lieu de Prise en Charge",
        labelEn: "Pickup Location",
        type: "select",
        required: true,
        enabled: true,
        options: ["Aéroport Tunis-Carthage", "Aéroport Monastir", "Agence La Soukra", "Hammamet Ville", "Sousse Port El Kantaoui"],
        helpTextFr: "Point de remise du véhicule",
        helpTextEn: "Vehicle delivery point",
      },
      {
        id: "f-1-2",
        key: "returnLocation",
        labelFr: "Lieu de Restitution",
        labelEn: "Drop-off Location",
        type: "select",
        required: true,
        enabled: true,
        options: ["Identique au départ", "Aéroport Tunis-Carthage", "Aéroport Monastir", "Agence La Soukra", "Hammamet", "Sousse"],
        helpTextFr: "Possibilité de retour dans une agence différente",
        helpTextEn: "Option to drop off at a different branch",
      },
      {
        id: "f-1-3",
        key: "pickupDate",
        labelFr: "Date & Heure de Prise",
        labelEn: "Pickup Date & Time",
        type: "date",
        required: true,
        enabled: true,
      },
      {
        id: "f-1-4",
        key: "returnDate",
        labelFr: "Date & Heure de Retour",
        labelEn: "Return Date & Time",
        type: "date",
        required: true,
        enabled: true,
      },
      {
        id: "f-1-5",
        key: "flightNumber",
        labelFr: "Numéro de Vol (Optionnel)",
        labelEn: "Flight Number (Optional)",
        type: "text",
        placeholderFr: "Ex: TU 722 ou AF 1234",
        placeholderEn: "E.g. TU 722 or AF 1234",
        required: false,
        enabled: true,
        helpTextFr: "Permet de surveiller les retards de vol gratuitement",
        helpTextEn: "Allows us to track flight delays free of charge",
      },
    ],
  },
  {
    id: "step-2",
    stepNumber: 2,
    slug: "vehicle-selection",
    titleFr: "Sélection du Véhicule",
    titleEn: "Vehicle Selection",
    subtitleFr: "Choix de la catégorie, transmission et motorisation",
    subtitleEn: "Choose category, transmission and fuel type",
    iconName: "Car",
    enabled: true,
    isMandatory: true,
    infoBannerFr: "Kilométrage illimité inclus pour toute location supérieure ou égale à 3 jours.",
    infoBannerEn: "Unlimited mileage included for rentals of 3 days or more.",
    fields: [
      {
        id: "f-2-1",
        key: "categoryFilter",
        labelFr: "Filtre par Catégorie",
        labelEn: "Category Filter",
        type: "select",
        required: false,
        enabled: true,
        options: ["Toutes", "Économique", "Compacte", "Berline", "SUV", "Prestige"],
      },
      {
        id: "f-2-2",
        key: "transmissionFilter",
        labelFr: "Boîte de Vitesse",
        labelEn: "Transmission",
        type: "select",
        required: false,
        enabled: true,
        options: ["Toutes", "Manuelle", "Automatique"],
      },
      {
        id: "f-2-3",
        key: "driverAgeConfirm",
        labelFr: "Confirmation Âge Conducteur (21+ ans)",
        labelEn: "Driver Age Confirmation (21+)",
        type: "checkbox",
        required: true,
        enabled: true,
        helpTextFr: "Le conducteur principal doit être âgé d'au moins 21 ans et titulaire d'un permis depuis 2 ans",
        helpTextEn: "Primary driver must be 21+ and hold valid license for at least 2 years",
      },
    ],
  },
  {
    id: "step-3",
    stepNumber: 3,
    slug: "extras-insurances",
    titleFr: "Assurances & Extras",
    titleEn: "Insurances & Extras",
    subtitleFr: "Packs de protection, franchise et options de confort",
    subtitleEn: "Protection packages, deductible waivers and travel extras",
    iconName: "Shield",
    enabled: true,
    isMandatory: false,
    infoBannerFr: "Protection collision (CDW) de base incluse. Réduisez votre caution avec l'assurance Tous Risques Zéro Franchise.",
    infoBannerEn: "Basic CDW collision coverage included. Minimize your deposit with Zero Excess insurance.",
    fields: [
      {
        id: "f-3-1",
        key: "insurancePackage",
        labelFr: "Pack Assurance & Protection",
        labelEn: "Insurance Protection Package",
        type: "select",
        required: true,
        enabled: true,
        options: ["Formule Standard (Franchise 2000 TND)", "Pack Sérénité (Franchise réduite 600 TND)", "Zéro Franchise Premium (0 TND)"],
      },
      {
        id: "f-3-2",
        key: "babySeatCount",
        labelFr: "Siège Bébé / Enfant",
        labelEn: "Baby / Booster Seat",
        type: "number",
        required: false,
        enabled: true,
        helpTextFr: "15 TND / jour (conforme normes européennes ECE R44)",
        helpTextEn: "15 TND / day (ECE R44 compliant)",
      },
      {
        id: "f-3-3",
        key: "additionalDriver",
        labelFr: "Conducteur Additionnel",
        labelEn: "Additional Driver",
        type: "checkbox",
        required: false,
        enabled: true,
        helpTextFr: "Ajoutez un 2ème conducteur assuré sur le contrat",
        helpTextEn: "Add a secondary insured driver to the contract",
      },
      {
        id: "f-3-4",
        key: "gpsOption",
        labelFr: "Boîtier GPS / WiFi 4G",
        labelEn: "GPS / Mobile 4G WiFi Hotspot",
        type: "checkbox",
        required: false,
        enabled: true,
      },
    ],
  },
  {
    id: "step-4",
    stepNumber: 4,
    slug: "customer-kyc",
    titleFr: "Informations Conducteur & KYC",
    titleEn: "Driver Information & KYC",
    subtitleFr: "Coordonnées, permis de conduire et justificatifs",
    subtitleEn: "Contact details, driver license and identity documents",
    iconName: "UserCheck",
    enabled: true,
    isMandatory: true,
    infoBannerFr: "Vos données personnelles sont strictement confidentielles et utilisées uniquement pour l'établissement du contrat officiel de location.",
    infoBannerEn: "Your personal data is strictly confidential and used solely to prepare the official rental agreement.",
    fields: [
      {
        id: "f-4-1",
        key: "fullName",
        labelFr: "Nom & Prénom Complet",
        labelEn: "Full Name",
        type: "text",
        placeholderFr: "Ex: Mohamed Ben Salem",
        placeholderEn: "E.g. John Doe",
        required: true,
        enabled: true,
      },
      {
        id: "f-4-2",
        key: "email",
        labelFr: "Adresse Email",
        labelEn: "Email Address",
        type: "text",
        placeholderFr: "contact@exemple.tn",
        placeholderEn: "john@example.com",
        required: true,
        enabled: true,
      },
      {
        id: "f-4-3",
        key: "phone",
        labelFr: "Numéro de Téléphone (WhatsApp)",
        labelEn: "Phone Number (WhatsApp)",
        type: "text",
        placeholderFr: "+216 22 123 456",
        placeholderEn: "+1 555 123 4567",
        required: true,
        enabled: true,
        helpTextFr: "Pour vous envoyer la confirmation instantanée et localisation de remise",
        helpTextEn: "For instant booking voucher & handover location pin",
      },
      {
        id: "f-4-4",
        key: "licenseNumber",
        labelFr: "Numéro du Permis de Conduire",
        labelEn: "Driver's License Number",
        type: "text",
        placeholderFr: "Ex: 12/345678",
        placeholderEn: "E.g. DL-987654321",
        required: true,
        enabled: true,
      },
      {
        id: "f-4-5",
        key: "licenseDate",
        labelFr: "Date de Délivrance du Permis",
        labelEn: "License Issue Date",
        type: "date",
        required: false,
        enabled: true,
      },
      {
        id: "f-4-6",
        key: "specialRequests",
        labelFr: "Notes / Demandes Particulières",
        labelEn: "Special Requests / Notes",
        type: "textarea",
        placeholderFr: "Précisez toute information utile (horaire de train, livraison hôtel...)",
        placeholderEn: "Any instructions regarding hotel delivery or train arrivals...",
        required: false,
        enabled: true,
      },
    ],
  },
  {
    id: "step-5",
    stepNumber: 5,
    slug: "summary-payment",
    titleFr: "Récapitulatif & Règlements",
    titleEn: "Summary & Checkout",
    subtitleFr: "Validation des montants, conditions et mode de paiement",
    subtitleEn: "Review pricing, terms and payment method",
    iconName: "CreditCard",
    enabled: true,
    isMandatory: true,
    infoBannerFr: "Paiement sécurisé en ligne ou règlement sur place à la prise en charge (Espèces, Carte Bancaire, TPE).",
    infoBannerEn: "Secure online payment or pay at counter upon pickup (Cash, Credit Card, POS).",
    fields: [
      {
        id: "f-5-1",
        key: "paymentMethod",
        labelFr: "Mode de Règlement",
        labelEn: "Payment Option",
        type: "select",
        required: true,
        enabled: true,
        options: ["Paiement total sur place à la livraison", "Acompte en ligne de 20% (Carte Bancaire)", "Paiement 100% en ligne (Remise -5%)"],
      },
      {
        id: "f-5-2",
        key: "promoCode",
        labelFr: "Code Promo / Coupon de Réduction",
        labelEn: "Promo Code / Discount Coupon",
        type: "text",
        placeholderFr: "Ex: PROMO2026 ou SUMMER",
        placeholderEn: "E.g. PROMO2026 or SUMMER",
        required: false,
        enabled: true,
      },
      {
        id: "f-5-tva",
        key: "tvaRate",
        labelFr: "TVA Légale (%)",
        labelEn: "Legal VAT Rate (%)",
        type: "number",
        placeholderFr: "0",
        placeholderEn: "0",
        required: false,
        enabled: true,
        helpTextFr: "Taux TVA applicable (0% tarif TTC en vigueur)",
        helpTextEn: "Applicable VAT rate (0% inclusive in Tunisia)",
      },
      {
        id: "f-5-lf2026",
        key: "contributionLF2026",
        labelFr: "Contribution LF 2026 (DT / jour)",
        labelEn: "Finance Law 2026 Tax (TND / day)",
        type: "number",
        placeholderFr: "2",
        placeholderEn: "2",
        required: true,
        enabled: true,
        helpTextFr: "Contribution obligatoire Loi de Finances 2026 (2 DT / jour par véhicule loué)",
        helpTextEn: "Mandatory Finance Law 2026 contribution (2 TND / day per rental car)",
      },
      {
        id: "f-5-timbre",
        key: "timbreFiscal",
        labelFr: "Timbre Fiscal Quittance (DT)",
        labelEn: "Fiscal Stamp Duty (TND)",
        type: "number",
        placeholderFr: "1",
        placeholderEn: "1",
        required: true,
        enabled: true,
        helpTextFr: "Droit de timbre fiscal légal (1 DT par contrat)",
        helpTextEn: "Legal fiscal stamp duty (1 TND per contract)",
      },
      {
        id: "f-5-3",
        key: "acceptTerms",
        labelFr: "J'accepte les Conditions Générales de Location",
        labelEn: "I accept the Terms and Conditions",
        type: "checkbox",
        required: true,
        enabled: true,
        helpTextFr: "Contrat conforme à la réglementation du transport et de location en Tunisie",
        helpTextEn: "Compliant with Tunisian transport and car rental regulations",
      },
    ],
  },
];

const LOCAL_STORAGE_KEY = "payless_reservation_workflow_steps_v1";

export default function ReservationStepsAdminPage() {
  const { lang } = useAdminLang();
  const [steps, setSteps] = useState<ReservationStep[]>(DEFAULT_STEPS);
  const [selectedStepId, setSelectedStepId] = useState<string>("step-1");
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  // Edit / Add Step Modal
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<ReservationStep | null>(null);

  // Edit / Add Field Modal
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<StepField | null>(null);
  const [targetStepForField, setTargetStepForField] = useState<string>("step-1");

  // Live client preview modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewActiveIndex, setPreviewActiveIndex] = useState(0);

  // Load from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure step-5 has fiscal fields (TVA, Timbre fiscal, Contribution LF 2026)
          const merged = parsed.map((s: ReservationStep) => {
            if (s.id === "step-5" || s.slug === "summary-payment") {
              const hasTimbre = s.fields.some((f) => f.key === "timbreFiscal");
              if (!hasTimbre) {
                const defaultStep5 = DEFAULT_STEPS.find((ds) => ds.id === "step-5");
                if (defaultStep5) {
                  return { ...s, fields: defaultStep5.fields };
                }
              }
            }
            return s;
          });
          setSteps(merged);
          setSelectedStepId(merged[0].id);
          return;
        }
      }
    } catch {
      // Fallback to default steps
    }
  }, []);

  const showSaveToast = (msg: string) => {
    setSavedNotification(msg);
    setTimeout(() => {
      setSavedNotification(null);
    }, 3500);
  };

  const handleSaveAll = (updatedSteps: ReservationStep[]) => {
    setSteps(updatedSteps);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSteps));
    showSaveToast(lang === "fr" ? "Configuration des étapes enregistrée avec succès !" : "Workflow steps successfully saved!");
  };

  const handleResetDefaults = () => {
    if (confirm(lang === "fr" ? "Voulez-vous réinitialiser toutes les étapes aux paramètres recommandés ?" : "Reset all steps to recommended defaults?")) {
      setSteps(DEFAULT_STEPS);
      setSelectedStepId("step-1");
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_STEPS));
      showSaveToast(lang === "fr" ? "Étapes réinitialisées aux valeurs d'usine." : "Steps reset to defaults.");
    }
  };

  // Reordering steps
  const moveStep = (index: number, direction: "up" | "down") => {
    const newSteps = [...steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;

    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;

    // Recalculate step numbers
    const updated = newSteps.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    handleSaveAll(updated);
  };

  const toggleStepEnabled = (id: string) => {
    const updated = steps.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    handleSaveAll(updated);
  };

  const deleteStep = (id: string) => {
    if (steps.length <= 1) {
      alert(lang === "fr" ? "Vous devez conserver au moins une étape de réservation." : "You must keep at least one booking step.");
      return;
    }
    if (confirm(lang === "fr" ? "Supprimer définitivement cette étape et tous ses champs ?" : "Permanently delete this step and its fields?")) {
      const updated = steps.filter((s) => s.id !== id).map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
      handleSaveAll(updated);
      setSelectedStepId(updated[0]?.id || "");
    }
  };

  // Field Operations
  const toggleFieldEnabled = (stepId: string, fieldId: string) => {
    const updated = steps.map((s) => {
      if (s.id !== stepId) return s;
      return {
        ...s,
        fields: s.fields.map((f) => (f.id === fieldId ? { ...f, enabled: !f.enabled } : f)),
      };
    });
    handleSaveAll(updated);
  };

  const toggleFieldRequired = (stepId: string, fieldId: string) => {
    const updated = steps.map((s) => {
      if (s.id !== stepId) return s;
      return {
        ...s,
        fields: s.fields.map((f) => (f.id === fieldId ? { ...f, required: !f.required } : f)),
      };
    });
    handleSaveAll(updated);
  };

  const deleteField = (stepId: string, fieldId: string) => {
    if (confirm(lang === "fr" ? "Supprimer ce champ ?" : "Delete this field?")) {
      const updated = steps.map((s) => {
        if (s.id !== stepId) return s;
        return {
          ...s,
          fields: s.fields.filter((f) => f.id !== fieldId),
        };
      });
      handleSaveAll(updated);
    }
  };

  const currentStep = steps.find((s) => s.id === selectedStepId) || steps[0];

  const getStepIcon = (name: string) => {
    switch (name) {
      case "Calendar":
        return <Calendar className="w-4 h-4" />;
      case "Car":
        return <Car className="w-4 h-4" />;
      case "Shield":
        return <Shield className="w-4 h-4" />;
      case "UserCheck":
        return <UserCheck className="w-4 h-4" />;
      case "CreditCard":
        return <CreditCard className="w-4 h-4" />;
      case "FileText":
        return <FileText className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* TOAST NOTIFICATION */}
      {savedNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white font-medium text-xs shadow-2xl shadow-emerald-600/30 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedNotification}</span>
        </div>
      )}

      {/* HEADER WITH TITLE & ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {lang === "fr" ? "Gestion des Étapes de Réservation" : "Reservation Workflow & Steps Manager"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === "fr"
              ? "Contrôlez l'ensemble du tunnel de réservation client : étapes, champs personnalisés, exigences et textes d'aide."
              : "Complete control over the client booking funnel: steps, custom fields, validations, and guidance texts."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Reset to defaults */}
          <button
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
            title="Réinitialiser par défaut"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === "fr" ? "Réinitialiser" : "Reset"}</span>
          </button>

          {/* Live Preview Button */}
          <button
            onClick={() => {
              setPreviewActiveIndex(0);
              setPreviewModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs shadow-sm transition-all hover:scale-[1.02]"
          >
            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{lang === "fr" ? "Aperçu Client" : "Client Preview"}</span>
          </button>

          {/* Add Step Button */}
          <button
            onClick={() => {
              setEditingStep({
                id: `step-${Date.now()}`,
                stepNumber: steps.length + 1,
                slug: `step-${steps.length + 1}`,
                titleFr: "",
                titleEn: "",
                subtitleFr: "",
                subtitleEn: "",
                iconName: "Layers",
                enabled: true,
                isMandatory: false,
                infoBannerFr: "",
                infoBannerEn: "",
                fields: [],
              });
              setStepModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-xs shadow-md shadow-blue-600/25 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === "fr" ? "Nouvelle Étape" : "Add Step"}</span>
          </button>
        </div>
      </div>

      {/* PIPELINE OVERVIEW PROGRESS BAR */}
      <div className="rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 p-5 shadow-sm dark:shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === "fr" ? "Pipeline du Tunnel de Réservation Client" : "Customer Booking Funnel Pipeline"}
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {steps.filter((s) => s.enabled).length} / {steps.length} {lang === "fr" ? "étapes actives" : "active steps"}
          </span>
        </div>

        {/* Stepper Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mt-4">
          {steps.map((step, idx) => {
            const isSelected = step.id === selectedStepId;
            return (
              <div
                key={step.id}
                onClick={() => setSelectedStepId(step.id)}
                className={`cursor-pointer rounded-xl p-3 border transition-all text-left relative overflow-hidden ${
                  isSelected
                    ? "bg-blue-50/80 dark:bg-blue-600/10 border-blue-500 ring-2 ring-blue-500/20 shadow-md"
                    : step.enabled
                    ? "bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    : "bg-slate-100/50 dark:bg-slate-950/40 border-dashed border-slate-300 dark:border-slate-800 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {step.stepNumber}
                    </span>
                    <div className="text-slate-500 dark:text-slate-400">
                      {getStepIcon(step.iconName)}
                    </div>
                  </div>

                  <span
                    className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded ${
                      step.enabled
                        ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    {step.enabled ? (lang === "fr" ? "Actif" : "Active") : (lang === "fr" ? "Inactif" : "Disabled")}
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {lang === "fr" ? step.titleFr : step.titleEn}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {step.fields.length} {lang === "fr" ? "champs configurés" : "fields configured"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN TWO-COLUMN MANAGEMENT INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: LIST OF STEPS (ORDER, EDIT, REORDER) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 p-5 shadow-sm dark:shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{lang === "fr" ? "Ordre des Étapes" : "Steps Ordering"}</span>
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {lang === "fr" ? "Réorganiser" : "Reorder"}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 mt-2">
              {steps.map((step, idx) => {
                const isSelected = step.id === selectedStepId;
                return (
                  <div
                    key={step.id}
                    className={`py-3 px-2 rounded-xl transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-blue-50/70 dark:bg-blue-600/15"
                        : "hover:bg-slate-50 dark:hover:bg-slate-900/60"
                    }`}
                  >
                    <div
                      onClick={() => setSelectedStepId(step.id)}
                      className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 font-bold text-xs">
                        {step.stepNumber}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {lang === "fr" ? step.titleFr : step.titleEn}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {step.fields.length} {lang === "fr" ? "champs" : "fields"} • {step.enabled ? (lang === "fr" ? "Activé" : "Enabled") : (lang === "fr" ? "Désactivé" : "Disabled")}
                        </p>
                      </div>
                    </div>

                    {/* Quick Step Actions: Up, Down, Edit, Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => moveStep(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500"
                        title="Monter"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveStep(idx, "down")}
                        disabled={idx === steps.length - 1}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500"
                        title="Descendre"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingStep(step);
                          setStepModalOpen(true);
                        }}
                        className="p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        title="Modifier l'étape"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {!step.isMandatory && (
                        <button
                          onClick={() => deleteStep(step.id)}
                          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500"
                          title="Supprimer l'étape"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL OF SELECTED STEP & ITS CUSTOM FIELDS */}
        <div className="lg:col-span-2 space-y-4">
          {currentStep && (
            <div className="rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-xl">
              {/* Selected Step Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    {getStepIcon(currentStep.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Étape {currentStep.stepNumber}
                      </span>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        {lang === "fr" ? currentStep.titleFr : currentStep.titleEn}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {lang === "fr" ? currentStep.subtitleFr : currentStep.subtitleEn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Step status switch */}
                  <button
                    onClick={() => toggleStepEnabled(currentStep.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      currentStep.enabled
                        ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                        : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                    }`}
                  >
                    {currentStep.enabled ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                    <span>{currentStep.enabled ? (lang === "fr" ? "Étape Active" : "Step Enabled") : (lang === "fr" ? "Étape Inactive" : "Step Disabled")}</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingStep(currentStep);
                      setStepModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                    title="Paramètres de l'étape"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Informational Guidance Banner */}
              {currentStep.infoBannerFr && (
                <div className="mt-4 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-900/15 border border-blue-200/80 dark:border-blue-800/40 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-300">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">
                      {lang === "fr" ? "Message informatif affiché au client :" : "Client info notice :"}
                    </span>
                    <p className="mt-0.5 text-slate-700 dark:text-slate-300">
                      {lang === "fr" ? currentStep.infoBannerFr : currentStep.infoBannerEn || currentStep.infoBannerFr}
                    </p>
                  </div>
                </div>
              )}

              {/* FIELDS SECTION */}
              <div className="mt-6">
                <div className="flex items-center justify-between pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {lang === "fr" ? "Champs du Formulaire & Entrées Client" : "Form Fields & Customer Inputs"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {lang === "fr"
                        ? "Activez, rendez obligatoire ou configurez de nouveaux champs d'information."
                        : "Enable, mark required or configure custom dynamic input fields."}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingField({
                        id: `f-${Date.now()}`,
                        key: "",
                        labelFr: "",
                        labelEn: "",
                        type: "text",
                        required: false,
                        enabled: true,
                        placeholderFr: "",
                        placeholderEn: "",
                        helpTextFr: "",
                        helpTextEn: "",
                      });
                      setTargetStepForField(currentStep.id);
                      setFieldModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === "fr" ? "Ajouter un Champ" : "Add Field"}</span>
                  </button>
                </div>

                {currentStep.fields.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500">
                    <p className="text-xs">{lang === "fr" ? "Aucun champ pour cette étape." : "No fields in this step."}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mt-3">
                    {currentStep.fields.map((field) => (
                      <div
                        key={field.id}
                        className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                          field.enabled
                            ? "bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-850/40"
                            : "bg-slate-50/60 dark:bg-slate-950/40 opacity-60"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {lang === "fr" ? field.labelFr : field.labelEn}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                              {field.type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              key: {field.key}
                            </span>
                            {field.required && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold">
                                {lang === "fr" ? "Obligatoire" : "Required"}
                              </span>
                            )}
                          </div>
                          {(field.helpTextFr || field.helpTextEn) && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {lang === "fr" ? field.helpTextFr : field.helpTextEn}
                            </p>
                          )}
                          {field.options && field.options.length > 0 && (
                            <p className="text-[10px] text-slate-400">
                              {lang === "fr" ? "Options :" : "Options :"} {field.options.join(" • ")}
                            </p>
                          )}
                        </div>

                        {/* Field Controls */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Required toggle */}
                          <button
                            onClick={() => toggleFieldRequired(currentStep.id, field.id)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors ${
                              field.required
                                ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
                                : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                            }`}
                            title="Changer statut obligatoire"
                          >
                            {field.required ? (lang === "fr" ? "Requis" : "Req.") : (lang === "fr" ? "Optionnel" : "Opt.")}
                          </button>

                          {/* Enabled / Disabled toggle */}
                          <button
                            onClick={() => toggleFieldEnabled(currentStep.id, field.id)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              field.enabled
                                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
                                : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
                            }`}
                            title={field.enabled ? "Désactiver le champ" : "Activer le champ"}
                          >
                            {field.enabled ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                          </button>

                          {/* Edit field button */}
                          <button
                            onClick={() => {
                              setEditingField(field);
                              setTargetStepForField(currentStep.id);
                              setFieldModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            title="Modifier ce champ"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete field */}
                          <button
                            onClick={() => deleteField(currentStep.id, field.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500"
                            title="Supprimer ce champ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD / EDIT STEP */}
      {stepModalOpen && editingStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingStep.id && steps.some((s) => s.id === editingStep.id)
                  ? (lang === "fr" ? "Modifier l'Étape de Réservation" : "Edit Booking Step")
                  : (lang === "fr" ? "Nouvelle Étape de Réservation" : "Create Booking Step")}
              </h3>
              <button
                onClick={() => setStepModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const exists = steps.some((s) => s.id === editingStep.id);
                let updated: ReservationStep[];
                if (exists) {
                  updated = steps.map((s) => (s.id === editingStep.id ? editingStep : s));
                } else {
                  updated = [...steps, editingStep].map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
                }
                handleSaveAll(updated);
                setSelectedStepId(editingStep.id);
                setStepModalOpen(false);
              }}
              className="mt-4 space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Titre (Français) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStep.titleFr}
                    onChange={(e) => setEditingStep({ ...editingStep, titleFr: e.target.value })}
                    placeholder="Ex: Choix des Assurances"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStep.titleEn}
                    onChange={(e) => setEditingStep({ ...editingStep, titleEn: e.target.value })}
                    placeholder="Ex: Protection Packages"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Sous-titre (Français)
                  </label>
                  <input
                    type="text"
                    value={editingStep.subtitleFr}
                    onChange={(e) => setEditingStep({ ...editingStep, subtitleFr: e.target.value })}
                    placeholder="Description courte de l'étape"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Subtitle (English)
                  </label>
                  <input
                    type="text"
                    value={editingStep.subtitleEn}
                    onChange={(e) => setEditingStep({ ...editingStep, subtitleEn: e.target.value })}
                    placeholder="Short description"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Icône
                  </label>
                  <select
                    value={editingStep.iconName}
                    onChange={(e) => setEditingStep({ ...editingStep, iconName: e.target.value as any })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Calendar">Calendrier (Calendar)</option>
                    <option value="Car">Voiture (Car)</option>
                    <option value="Shield">Assurance (Shield)</option>
                    <option value="UserCheck">Client / KYC (UserCheck)</option>
                    <option value="CreditCard">Paiement (CreditCard)</option>
                    <option value="Layers">Générique (Layers)</option>
                    <option value="FileText">Contrat / Document (FileText)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Slug / Identifiant URL
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStep.slug}
                    onChange={(e) => setEditingStep({ ...editingStep, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    placeholder="ex: options-supplementaires"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Bandeau d'information / Assistance client (Français)
                </label>
                <textarea
                  rows={2}
                  value={editingStep.infoBannerFr || ""}
                  onChange={(e) => setEditingStep({ ...editingStep, infoBannerFr: e.target.value })}
                  placeholder="Texte explicatif affiché en haut de cette étape..."
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingStep.enabled}
                    onChange={(e) => setEditingStep({ ...editingStep, enabled: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Étape Activée</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingStep.isMandatory}
                    onChange={(e) => setEditingStep({ ...editingStep, isMandatory: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Étape Obligatoire (Insupprimable)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStepModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 transition-all"
                >
                  Enregistrer l'étape
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT FIELD */}
      {fieldModalOpen && editingField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {lang === "fr" ? "Configurer un Champ Client" : "Configure Custom Input Field"}
              </h3>
              <button
                onClick={() => setFieldModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const keyFormatted = editingField.key || editingField.labelEn.toLowerCase().replace(/\s+/g, "_") || `field_${Date.now()}`;
                const finalField = { ...editingField, key: keyFormatted };

                const updated = steps.map((s) => {
                  if (s.id !== targetStepForField) return s;
                  const fieldExists = s.fields.some((f) => f.id === finalField.id);
                  return {
                    ...s,
                    fields: fieldExists
                      ? s.fields.map((f) => (f.id === finalField.id ? finalField : f))
                      : [...s.fields, finalField],
                  };
                });

                handleSaveAll(updated);
                setFieldModalOpen(false);
              }}
              className="mt-4 space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Label (Français) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingField.labelFr}
                    onChange={(e) => setEditingField({ ...editingField, labelFr: e.target.value })}
                    placeholder="Ex: Numéro Passeport / CIN"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Label (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingField.labelEn}
                    onChange={(e) => setEditingField({ ...editingField, labelEn: e.target.value })}
                    placeholder="Ex: Passport / National ID"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Clé de variable (Key) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingField.key}
                    onChange={(e) => setEditingField({ ...editingField, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                    placeholder="ex: passport_id"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Type de Champ
                  </label>
                  <select
                    value={editingField.type}
                    onChange={(e) => setEditingField({ ...editingField, type: e.target.value as any })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="text">Texte court (text)</option>
                    <option value="number">Nombre / Quantité (number)</option>
                    <option value="date">Date (date)</option>
                    <option value="select">Menu déroulant (select)</option>
                    <option value="textarea">Zone de texte long (textarea)</option>
                    <option value="checkbox">Case à cocher (checkbox)</option>
                    <option value="file">Téléchargement Fichier / KYC (file)</option>
                  </select>
                </div>
              </div>

              {editingField.type === "select" && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Options du menu (séparées par une virgule)
                  </label>
                  <input
                    type="text"
                    value={editingField.options?.join(", ") || ""}
                    onChange={(e) =>
                      setEditingField({
                        ...editingField,
                        options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="Option 1, Option 2, Option 3"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Placeholder (Français)
                  </label>
                  <input
                    type="text"
                    value={editingField.placeholderFr || ""}
                    onChange={(e) => setEditingField({ ...editingField, placeholderFr: e.target.value })}
                    placeholder="Ex: Entrez votre numéro..."
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Texte d'aide (Français)
                  </label>
                  <input
                    type="text"
                    value={editingField.helpTextFr || ""}
                    onChange={(e) => setEditingField({ ...editingField, helpTextFr: e.target.value })}
                    placeholder="Ex: Requis pour les assurances"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingField.required}
                    onChange={(e) => setEditingField({ ...editingField, required: e.target.checked })}
                    className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Champ Obligatoire</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingField.enabled}
                    onChange={(e) => setEditingField({ ...editingField, enabled: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Actif dans le formulaire</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFieldModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 transition-all"
                >
                  Sauvegarder le champ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LIVE CLIENT PREVIEW SIMULATOR */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div
            className={`w-full rounded-2xl bg-white dark:bg-[#07090e] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-slate-900 dark:text-slate-100 max-h-[92vh] overflow-y-auto transition-all ${
              previewDevice === "mobile" ? "max-w-md" : "max-w-4xl"
            }`}
          >
            {/* Simulator Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Simulateur de Réservation Client en Direct
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Visualisez le rendu réel des étapes configurées
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Switch Device Mode */}
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                      previewDevice === "desktop" ? "bg-white dark:bg-slate-800 shadow-sm text-blue-600" : "text-slate-500"
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Desktop</span>
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                      previewDevice === "mobile" ? "bg-white dark:bg-slate-800 shadow-sm text-blue-600" : "text-slate-500"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mobile</span>
                  </button>
                </div>

                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stepper Wizard Bar inside Simulator */}
            {(() => {
              const activeSteps = steps.filter((s) => s.enabled);
              const activeStep = activeSteps[previewActiveIndex] || activeSteps[0];
              if (!activeStep) return <p className="p-6 text-center text-xs">Aucune étape activée.</p>;

              return (
                <div className="mt-4 space-y-5">
                  <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2">
                    {activeSteps.map((st, i) => (
                      <button
                        key={st.id}
                        onClick={() => setPreviewActiveIndex(i)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                          previewActiveIndex === i
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                            : i < previewActiveIndex
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-500/20"
                            : "bg-slate-100 dark:bg-slate-900 text-slate-500"
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px]">
                          {i < previewActiveIndex ? <Check className="w-3 h-3" /> : i + 1}
                        </span>
                        <span>{lang === "fr" ? st.titleFr : st.titleEn}</span>
                      </button>
                    ))}
                  </div>

                  {/* Active Step Container */}
                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {lang === "fr" ? activeStep.titleFr : activeStep.titleEn}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {lang === "fr" ? activeStep.subtitleFr : activeStep.subtitleEn}
                      </p>
                    </div>

                    {activeStep.infoBannerFr && (
                      <div className="p-3 rounded-xl bg-blue-100/60 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <span>{lang === "fr" ? activeStep.infoBannerFr : activeStep.infoBannerEn || activeStep.infoBannerFr}</span>
                      </div>
                    )}

                    {/* Client Total Summary Card for Step 5 */}
                    {(activeStep.id === "step-5" || activeStep.slug === "summary-payment") && (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-4 space-y-3 text-xs shadow-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
                          <span>Récapitulatif de votre réservation</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 font-mono">
                            Renault Clio 6 • 5 jours
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                          <div>
                            <span className="font-medium text-slate-900 dark:text-white">Montant Total de la location</span>
                            <span className="block text-[11px] text-slate-500 dark:text-slate-400">Kilométrage illimité, taxes & assurances incluses</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-blue-600 dark:text-blue-400">461 TND</span>
                            <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">TTC (Prix Final)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Simulated Form Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                      {activeStep.fields
                        .filter((f) => f.enabled)
                        .map((fld) => (
                          <div
                            key={fld.id}
                            className={fld.type === "textarea" ? "sm:col-span-2" : ""}
                          >
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              {lang === "fr" ? fld.labelFr : fld.labelEn}{" "}
                              {fld.required && <span className="text-red-500">*</span>}
                            </label>

                            {fld.type === "select" ? (
                              <select className="w-full rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                                <option value="">Sélectionner une option...</option>
                                {fld.options?.map((opt, oIdx) => (
                                  <option key={oIdx} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : fld.type === "textarea" ? (
                              <textarea
                                rows={2}
                                placeholder={lang === "fr" ? fld.placeholderFr : fld.placeholderEn}
                                className="w-full rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                              />
                            ) : fld.type === "checkbox" ? (
                              <label className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                                  {lang === "fr" ? fld.helpTextFr || fld.labelFr : fld.helpTextEn || fld.labelEn}
                                </span>
                              </label>
                            ) : (
                              <input
                                type={fld.type}
                                placeholder={lang === "fr" ? fld.placeholderFr : fld.placeholderEn}
                                className="w-full rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                              />
                            )}

                            {fld.type !== "checkbox" && (fld.helpTextFr || fld.helpTextEn) && (
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                                {lang === "fr" ? fld.helpTextFr : fld.helpTextEn}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>

                    {/* Stepper Navigation Buttons */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => setPreviewActiveIndex(Math.max(0, previewActiveIndex - 1))}
                        disabled={previewActiveIndex === 0}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40"
                      >
                        Précédent
                      </button>

                      <button
                        onClick={() =>
                          setPreviewActiveIndex(Math.min(activeSteps.length - 1, previewActiveIndex + 1))
                        }
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-600/25"
                      >
                        {previewActiveIndex === activeSteps.length - 1 ? "Terminer & Confirmer" : "Étape Suivante →"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

