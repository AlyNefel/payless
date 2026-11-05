"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  Filter,
  Plus,
  Trash2,
  Edit3,
  Code2,
  Save,
  Check,
  X,
  FileText,
  Search,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  Smartphone,
  Laptop,
  CheckCircle2,
  Copy,
  ChevronRight,
  ExternalLink,
  Blocks,
  LayoutTemplate,
  Layers,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { useAdminLang } from "@/contexts/AdminLangContext";

export interface CustomField {
  id: string;
  key: string;
  label: string;
  defaultValue?: string;
  type?: "text" | "number" | "date" | "select" | "textarea" | "boolean";
  required?: boolean;
}

export interface EmailTemplateItem {
  _id: string;
  name?: string;
  description?: string;
  type: string;
  language: "fr" | "en" | "ar";
  subject: string;
  preheader?: string;
  htmlBody: string;
  textBody?: string;
  variables: string[];
  customFields?: CustomField[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailLogItem {
  id: string;
  to: string;
  toName: string;
  subject: string;
  template: string;
  status: "sent" | "pending" | "failed" | "bounced";
  language: "fr" | "en" | "ar";
  date: string;
  messageId?: string;
  error?: string;
  retryCount: number;
}

const TEMPLATE_TYPE_LABELS: Record<string, { fr: string; en: string }> = {
  booking_confirmation: { fr: "Confirmation de Réservation", en: "Booking Confirmation" },
  booking_pending: { fr: "Réservation en Attente", en: "Booking Pending" },
  booking_cancelled: { fr: "Annulation de Réservation", en: "Booking Cancelled" },
  pickup_reminder: { fr: "Rappel Prise en Charge (J-1)", en: "Pickup Reminder" },
  return_reminder: { fr: "Rappel Restitution Véhicule", en: "Return Reminder" },
  payment_confirmation: { fr: "Confirmation de Paiement", en: "Payment Receipt" },
  custom_notification: { fr: "Notification Personnalisée", en: "Custom Notification" },
};

const STATUS_CONFIG = {
  sent: { icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800", label: "Envoyé" },
  pending: { icon: Clock, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800", label: "En attente" },
  failed: { icon: AlertCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800", label: "Échec" },
  bounced: { icon: AlertCircle, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800", label: "Rejeté" },
};

const LANG_FLAGS: Record<string, string> = { fr: "🇫🇷", en: "🇬🇧", ar: "🇹🇳" };

const STANDARD_VARIABLES = [
  { key: "customerName", label: "Nom du client", sample: "Mohamed Ben Salem" },
  { key: "bookingReference", label: "Référence réservation", sample: "PAY-TN-2026-104" },
  { key: "vehicleName", label: "Nom du véhicule", sample: "Renault Clio 6 (2025)" },
  { key: "pickupLocation", label: "Lieu de prise", sample: "Aéroport de Tunis-Carthage (TUN)" },
  { key: "returnLocation", label: "Lieu de restitution", sample: "Aéroport de Tunis-Carthage (TUN)" },
  { key: "pickupDate", label: "Date & heure prise", sample: "2026-11-15 à 10:00" },
  { key: "returnDate", label: "Date & heure retour", sample: "2026-11-20 à 18:00" },
  { key: "totalAmount", label: "Montant Total TTC", sample: "450" },
  { key: "depositAmount", label: "Acompte payé", sample: "90" },
  { key: "currency", label: "Devise", sample: "TND" },
  { key: "flightNumber", label: "Numéro de vol", sample: "TU 722" },
  { key: "licenseNumber", label: "Permis de conduire", sample: "12/987654" },
  { key: "insurancePackage", label: "Formule d'assurance", sample: "Pack Sérénité (Franchise Réduite)" },
  { key: "cautionBancaire", label: "Caution bancaire", sample: "1 500 TND (Empreinte CB)" },
  { key: "whatsappAssistance", label: "WhatsApp d'urgence", sample: "+216 22 123 456" },
  { key: "agencyPhone", label: "Téléphone agence", sample: "+216 71 123 456" },
  { key: "agencyEmail", label: "Email agence", sample: "contact@paylesscarrental.com" },
  { key: "specialRequests", label: "Demandes particulières", sample: "Siège bébé inclus au comptoir" },
];

// PRE-DESIGNED NO-CODE EMAIL BLOCKS
const PREBUILT_BLOCKS = [
  {
    id: "block-vehicle-details",
    name: "Détails du Véhicule & Dates",
    desc: "Tableau récapitulatif clair avec véhicule, lieux et dates",
    icon: "🚗",
    badge: "Essentiel Réservation",
    html: `
<!-- BLOC DÉTAILS VÉHICULE & DATES -->
<table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; font-size: 13px;">
  <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
    <td colspan="2" style="padding: 12px 16px; font-weight: bold; color: #1e293b; font-size: 14px;">📋 Détails de votre Réservation</td>
  </tr>
  <tr style="border-bottom: 1px solid #f1f5f9;">
    <td style="padding: 10px 16px; color: #64748b; width: 40%;">Véhicule Assigné</td>
    <td style="padding: 10px 16px; font-weight: bold; color: #0f172a; text-align: right;">{{vehicleName}}</td>
  </tr>
  <tr style="border-bottom: 1px solid #f1f5f9;">
    <td style="padding: 10px 16px; color: #64748b;">Prise en charge</td>
    <td style="padding: 10px 16px; font-weight: 600; text-align: right; color: #1d4ed8;">{{pickupDate}} — {{pickupLocation}}</td>
  </tr>
  <tr style="border-bottom: 1px solid #f1f5f9;">
    <td style="padding: 10px 16px; color: #64748b;">Restitution</td>
    <td style="padding: 10px 16px; font-weight: 600; text-align: right;">{{returnDate}} — {{returnLocation}}</td>
  </tr>
  <tr>
    <td style="padding: 10px 16px; color: #64748b;">Protection sélectionnée</td>
    <td style="padding: 10px 16px; font-weight: 600; text-align: right;">{{insurancePackage}}</td>
  </tr>
</table>`,
  },
  {
    id: "block-total-price",
    name: "Montant Total & Règlement",
    desc: "Encadré sombre haut de gamme avec montant final TTC sans calcul complexe",
    icon: "💰",
    badge: "Tarif & Paiement",
    html: `
<!-- BLOC MONTANT TOTAL NET TTC -->
<div style="background: #0f172a; color: #ffffff; padding: 20px 24px; border-radius: 14px; margin: 20px 0; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
  <div>
    <div style="font-size: 13px; color: #94a3b8; font-weight: 500;">Montant Total TTC de la Location</div>
    <div style="font-size: 11px; color: #38bdf8; margin-top: 2px;">✓ Kilométrage illimité, taxes & assurances incluses</div>
  </div>
  <div style="font-size: 24px; font-weight: 800; color: #60a5fa;">{{totalAmount}} {{currency}}</div>
</div>`,
  },
  {
    id: "block-flight-info",
    name: "Numéro de Vol & Accueil Aéroport",
    desc: "Suivi en direct du vol et accueil personnalisé au terminal",
    icon: "✈️",
    badge: "Aéroport",
    html: `
<!-- BLOC VOL & ACCUEIL TERMINAL -->
<div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px 20px; margin: 16px 0; font-size: 13px;">
  <div style="font-weight: bold; color: #1d4ed8; margin-bottom: 6px; font-size: 14px;">✈️ Accueil Personnalisé à l'Aéroport</div>
  <div style="color: #334155; line-height: 1.6;">
    • Numéro de vol communiqué : <strong>{{flightNumber}}</strong><br>
    • Notre agent surveille votre atterrissage en temps réel pour vous accueillir à la sortie de la douane avec une pancarte Payless sans frais d'attente en cas de retard.
  </div>
</div>`,
  },
  {
    id: "block-docs-deposit",
    name: "Documents Obligatoires & Caution",
    desc: "Rappel passeport, permis de conduire et caution bancaire",
    icon: "🪪",
    badge: "Formalités",
    html: `
<!-- BLOC DOCUMENTS OBLIGATOIRES & CAUTION -->
<div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px 20px; margin: 16px 0; font-size: 13px;">
  <div style="font-weight: bold; color: #b45309; margin-bottom: 6px; font-size: 14px;">📋 Documents à présenter lors de la prise en charge</div>
  <div style="color: #78350f; line-height: 1.6;">
    • <strong>Permis de conduire :</strong> Original valide depuis plus de 2 ans (Permis N° {{licenseNumber}})<br>
    • <strong>Pièce d'identité :</strong> Passeport valide ou Carte Nationale d'Identité<br>
    • <strong>Caution bancaire :</strong> <strong>{{cautionBancaire}}</strong> par pré-autorisation carte (restituée au retour)
  </div>
</div>`,
  },
  {
    id: "block-whatsapp-support",
    name: "Assistance WhatsApp 24/7",
    desc: "Bouton vert d'appel direct WhatsApp pour l'aéroport",
    icon: "💬",
    badge: "Support Client",
    html: `
<!-- BLOC WHATSAPP ASSISTANCE 24/7 -->
<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px 20px; margin: 16px 0; text-align: center;">
  <div style="font-size: 15px; font-weight: bold; color: #15803d; margin-bottom: 4px;">Besoin d'aide ou assistance à votre arrivée ?</div>
  <p style="font-size: 12px; color: #166534; margin: 0 0 14px;">Notre équipe d'assistance permanente est joignable 24h/24 et 7j/7 :</p>
  <a href="https://wa.me/21622123456" style="display: inline-block; background: #16a34a; color: #ffffff; text-decoration: none; padding: 10px 22px; border-radius: 8px; font-weight: bold; font-size: 13px; box-shadow: 0 2px 4px rgba(22,163,74,0.2);">
    💬 Contacter l'assistance WhatsApp ({{whatsappAssistance}})
  </a>
</div>`,
  },
  {
    id: "block-cta-button",
    name: "Bouton d'Action (Consulter ma Réservation)",
    desc: "Bouton bleu moderne vers l'espace de suivi en ligne",
    icon: "🔗",
    badge: "Call-to-Action",
    html: `
<!-- BLOC BOUTON SUIVI DE RÉSERVATION -->
<div style="text-align: center; margin: 24px 0;">
  <a href="https://paylesscarrental.com/bookings/{{bookingReference}}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(37,99,235,0.25);">
    Consulter & Gérer ma Réservation →
  </a>
</div>`,
  },
  {
    id: "block-fuel-policy",
    name: "Politique de Carburant & Kilométrage",
    desc: "Mention claire du plein/plein et kilométrage illimité",
    icon: "⛽",
    badge: "Conditions",
    html: `
<!-- BLOC POLITIQUE CARBURANT -->
<div style="background: #f8fafc; border-left: 4px solid #2563eb; border-radius: 0 8px 8px 0; padding: 14px 18px; margin: 16px 0; font-size: 12px; color: #334155; line-height: 1.6;">
  <strong>ℹ️ Politique de carburant & Kilométrage :</strong><br>
  Le véhicule vous est remis avec le réservoir plein (ou niveau noté au contrat) et doit être restitué au même niveau. Kilométrage 100% illimité inclus en Tunisie.
</div>`,
  },
];

export default function EmailsAdminPage() {
  const { lang } = useAdminLang();
  const [activeTab, setActiveTab] = useState<"templates" | "logs">("templates");

  // Templates state
  const [templates, setTemplates] = useState<EmailTemplateItem[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [filterLang, setFilterLang] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  // Template editor modal state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplateItem | null>(null);
  const [editorMode, setEditorMode] = useState<"visual" | "code" | "preview">("visual");
  const [savingTemplate, setSavingTemplate] = useState(false);

  // New custom field modal inside template editor
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldDefault, setNewFieldDefault] = useState("");
  const [showAddFieldForm, setShowAddFieldForm] = useState(false);

  // Logs state
  const [logs, setLogs] = useState<EmailLogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logFilterStatus, setLogFilterStatus] = useState("all");
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [logStats, setLogStats] = useState({ sent: 0, pending: 0, failed: 0, bounced: 0 });

  // Test email modal state
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState("admin@paylesscarrental.com");
  const [testTemplateTarget, setTestTemplateTarget] = useState<EmailTemplateItem | null>(null);
  const [sendingTest, setSendingTest] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch templates from database
  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const res = await fetch("/api/admin/emails/templates");
      const data = await res.json();
      if (data.success && Array.isArray(data.templates)) {
        setTemplates(data.templates);
      }
    } catch {
      showToast("Erreur de connexion lors du chargement des modèles.");
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Fetch logs from database
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const url = new URL("/api/admin/emails/logs", window.location.origin);
      if (logFilterStatus !== "all") url.searchParams.set("status", logFilterStatus);
      if (logSearchQuery) url.searchParams.set("search", logSearchQuery);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
        if (data.stats) setLogStats(data.stats);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (activeTab === "logs") {
      fetchLogs();
    }
  }, [activeTab, logFilterStatus, logSearchQuery]);

  // Save template (Create or Update)
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    setSavingTemplate(true);
    try {
      const isNew = !editingTemplate._id;
      const url = isNew
        ? "/api/admin/emails/templates"
        : `/api/admin/emails/templates/${editingTemplate._id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTemplate),
      });

      const data = await res.json();
      if (data.success) {
        showToast(isNew ? "Nouveau modèle d'email créé avec succès !" : "Modèle d'email mis à jour en base de données !");
        setEditorOpen(false);
        fetchTemplates();
      } else {
        alert(data.error || "Erreur lors de l'enregistrement du modèle.");
      }
    } catch {
      alert("Erreur de communication avec le serveur.");
    } finally {
      setSavingTemplate(false);
    }
  };

  // Delete template
  const handleDeleteTemplate = async (id: string, name?: string) => {
    if (!confirm(`Supprimer définitivement le modèle "${name || id}" de la base de données ?`)) return;

    try {
      const res = await fetch(`/api/admin/emails/templates/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Modèle d'email supprimé.");
        fetchTemplates();
      } else {
        alert(data.error || "Impossible de supprimer ce modèle.");
      }
    } catch {
      alert("Erreur lors de la suppression.");
    }
  };

  // Toggle active status
  const handleToggleActive = async (template: EmailTemplateItem) => {
    try {
      const res = await fetch(`/api/admin/emails/templates/${template._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !template.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setTemplates((prev) =>
          prev.map((t) => (t._id === template._id ? { ...t, isActive: !t.isActive } : t))
        );
        showToast(template.isActive ? "Modèle désactivé." : "Modèle activé.");
      }
    } catch {
      // Ignored
    }
  };

  // Insert variable into active editor
  const insertVariableIntoTemplate = (key: string) => {
    if (!editingTemplate) return;
    const placeholder = `{{${key}}}`;
    setEditingTemplate((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        htmlBody: `${prev.htmlBody}\n${placeholder}`,
      };
    });
    showToast(`Variable ${placeholder} insérée.`);
  };

  // Insert pre-designed block without coding!
  const insertPrebuiltBlock = (blockHtml: string, blockName: string) => {
    if (!editingTemplate) return;
    setEditingTemplate((prev) => {
      if (!prev) return null;
      // Try to insert before </div></body> or append
      let updated = prev.htmlBody;
      if (updated.includes("</body>")) {
        updated = updated.replace("</body>", `${blockHtml}\n</body>`);
      } else {
        updated = `${updated}\n${blockHtml}`;
      }
      return {
        ...prev,
        htmlBody: updated,
      };
    });
    showToast(`Bloc "${blockName}" inséré avec succès dans l'email !`);
  };

  // Add custom field to current template
  const handleAddCustomField = () => {
    if (!newFieldKey.trim() || !newFieldLabel.trim()) return;
    const formattedKey = newFieldKey.toLowerCase().replace(/[^a-z0-9_]/g, "");

    const newField: CustomField = {
      id: `cf-${Date.now()}`,
      key: formattedKey,
      label: newFieldLabel.trim(),
      defaultValue: newFieldDefault.trim() || "",
      type: "text",
      required: false,
    };

    setEditingTemplate((prev) => {
      if (!prev) return null;
      const currentFields = prev.customFields || [];
      return {
        ...prev,
        customFields: [...currentFields, newField],
      };
    });

    setNewFieldKey("");
    setNewFieldLabel("");
    setNewFieldDefault("");
    setShowAddFieldForm(false);
    showToast(`Champ personnalisé "${newField.label}" ajouté.`);
  };

  const handleRemoveCustomField = (fieldId: string) => {
    setEditingTemplate((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        customFields: (prev.customFields || []).filter((f) => f.id !== fieldId),
      };
    });
  };

  // Send real test email
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTemplateTarget || !testEmailRecipient) return;

    setSendingTest(true);
    try {
      const res = await fetch("/api/admin/emails/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmailRecipient,
          templateId: testTemplateTarget._id,
          subject: testTemplateTarget.subject,
          htmlBody: testTemplateTarget.htmlBody,
          templateType: testTemplateTarget.type,
          language: testTemplateTarget.language,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Email de test envoyé avec succès à ${testEmailRecipient} !`);
        setTestModalOpen(false);
      } else {
        alert(data.error || "Erreur lors de l'envoi de l'email.");
      }
    } catch {
      alert("Erreur de connexion.");
    } finally {
      setSendingTest(false);
    }
  };

  // Retry failed log
  const handleRetryLog = async (logId: string) => {
    try {
      const res = await fetch("/api/admin/emails/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Renvoi de l'email effectué !");
        fetchLogs();
      } else {
        alert(data.error || "Échec du renvoi.");
      }
    } catch {
      alert("Erreur serveur lors du renvoi.");
    }
  };

  // Generate simulated preview HTML
  const getRenderedPreviewHtml = (rawHtml: string, customFields?: CustomField[]) => {
    let output = rawHtml || "<p>Aucun contenu HTML</p>";
    STANDARD_VARIABLES.forEach((v) => {
      const regex = new RegExp(`{{\\s*${v.key}\\s*}}`, "g");
      output = output.replace(regex, v.sample);
    });

    if (customFields) {
      customFields.forEach((cf) => {
        const regex = new RegExp(`{{\\s*${cf.key}\\s*}}`, "g");
        output = output.replace(regex, cf.defaultValue || `[${cf.label}]`);
      });
    }

    return output;
  };

  const filteredTemplates = templates.filter((t) => {
    if (filterLang !== "all" && t.language !== filterLang) return false;
    if (filterType !== "all" && t.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white font-medium text-xs shadow-2xl shadow-emerald-600/30 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER WITHOUT BADGE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {lang === "fr" ? "Gestion des Emails & Modèles" : "Email & Template Management"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === "fr"
              ? "Constructeur visuel sans code : ajoutez des blocs prêts à l'emploi avec variables dynamiques, synchronisés avec MongoDB."
              : "No-code visual block builder: insert pre-designed sections with live variables, synced with MongoDB."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setTestTemplateTarget(templates[0] || null);
              setTestModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold bg-white dark:bg-[#0f141f] text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{lang === "fr" ? "Envoyer un Test" : "Send Test Email"}</span>
          </button>

          {activeTab === "templates" && (
            <button
              onClick={() => {
                setEditingTemplate({
                  _id: "",
                  name: "",
                  description: "",
                  type: "booking_confirmation",
                  language: "fr",
                  subject: "Confirmation de votre réservation - {{bookingReference}}",
                  preheader: "Détails de votre réservation chez Payless Car Rental",
                  htmlBody: `<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;padding:24px;margin:0;"><div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:14px;border:1px solid #e2e8f0;overflow:hidden;"><div style="background:#2563eb;color:#ffffff;padding:28px 20px;text-align:center;"><h1 style="margin:0;font-size:22px;font-weight:800;">PAYLESS CAR RENTAL</h1><p style="margin:4px 0 0;font-size:12px;opacity:0.9;">Tunisie — Réservation Confirmée</p></div><div style="padding:28px 24px;"><p style="font-size:16px;font-weight:bold;margin-top:0;">Bonjour {{customerName}},</p><p style="color:#475569;font-size:13px;line-height:1.6;">Nous vous confirmons l'enregistrement de votre réservation N° <strong>{{bookingReference}}</strong>.</p></div></div></body></html>`,
                  textBody: "",
                  variables: ["customerName", "bookingReference", "vehicleName", "totalAmount"],
                  customFields: [],
                  isActive: true,
                });
                setEditorMode("visual");
                setEditorOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/25 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === "fr" ? "Nouveau Modèle" : "Create Template"}</span>
            </button>
          )}
        </div>
      </div>

      {/* TOP TAB SWITCHER */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl w-fit border border-slate-200 dark:border-slate-800">
        {[
          { id: "templates", label: lang === "fr" ? "Modèles d'Emails (Générateur Visuel)" : "Email Templates" },
          { id: "logs", label: lang === "fr" ? "Historique des Envois" : "Delivery Logs" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "templates" | "logs")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: EMAIL TEMPLATES */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Langue :</span>
              {["all", "fr", "en", "ar"].map((l) => (
                <button
                  key={l}
                  onClick={() => setFilterLang(l)}
                  className={`px-2.5 py-1.5 rounded-lg font-bold border transition-colors ${
                    filterLang === l
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  {l === "all" ? (lang === "fr" ? "Toutes" : "All") : `${LANG_FLAGS[l]} ${l.toUpperCase()}`}
                </button>
              ))}
            </div>

            <button
              onClick={fetchTemplates}
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingTemplates ? "animate-spin" : ""}`} />
              <span>{lang === "fr" ? "Actualiser depuis la BDD" : "Sync with DB"}</span>
            </button>
          </div>

          {/* Templates Grid */}
          {loadingTemplates ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-xs">Chargement des modèles depuis MongoDB...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500">
              <Mail className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
              <p className="text-xs font-semibold">Aucun modèle d'email trouvé.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => {
                const typeInfo = TEMPLATE_TYPE_LABELS[template.type] || { fr: template.type, en: template.type };
                return (
                  <div
                    key={template._id}
                    className="charging-card bg-white dark:bg-[#0f141f] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between hover:shadow-lg transition-all relative overflow-hidden"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                            {typeInfo[lang === "fr" ? "fr" : "en"]}
                          </span>
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1.5 truncate">
                            {template.name || template.subject}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-base" title={template.language}>
                            {LANG_FLAGS[template.language]}
                          </span>
                          <button
                            onClick={() => handleToggleActive(template)}
                            className="text-slate-400 hover:text-slate-600"
                            title={template.isActive ? "Désactiver" : "Activer"}
                          >
                            {template.isActive ? (
                              <ToggleRight className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                        {template.description || template.subject}
                      </p>

                      {/* Variables & Custom Fields Count */}
                      <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-400 dark:text-slate-500 mb-4 font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {template.variables?.length || 0} variables
                        </span>
                        {template.customFields && template.customFields.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold">
                            +{template.customFields.length} champs perso
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingTemplate(template);
                            setEditorMode("preview");
                            setEditorOpen(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                          title="Aperçu du rendu réel"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setTestTemplateTarget(template);
                            setTestModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          title="Envoyer un email test"
                        >
                          <Send className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteTemplate(template._id, template.name)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500"
                          title="Supprimer ce modèle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setEditingTemplate(template);
                          setEditorMode("visual");
                          setEditorOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/15 dark:hover:bg-blue-600/25 text-blue-700 dark:text-blue-400 font-bold text-xs transition-colors"
                      >
                        <Blocks className="w-3.5 h-3.5" />
                        <span>{lang === "fr" ? "Éditeur Visuel" : "Visual Builder"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DELIVERY LOGS */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Envoyés avec succès", count: logStats.sent, color: "text-emerald-600 dark:text-emerald-400" },
              { label: "En attente d'envoi", count: logStats.pending, color: "text-yellow-600 dark:text-yellow-400" },
              { label: "Échoués (Erreurs)", count: logStats.failed, color: "text-red-600 dark:text-red-400" },
              { label: "Rejets (Bounced)", count: logStats.bounced, color: "text-orange-600 dark:text-orange-400" },
            ].map((s) => (
              <div key={s.label} className="charging-card bg-white dark:bg-[#0f141f] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-center">
                <div className={`text-2xl font-black ${s.color}`}>{s.count}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-500 dark:text-slate-400">Statut :</span>
              {["all", "sent", "pending", "failed", "bounced"].map((s) => (
                <button
                  key={s}
                  onClick={() => setLogFilterStatus(s)}
                  className={`px-2.5 py-1.5 rounded-lg font-bold border transition-colors ${
                    logFilterStatus === s
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  {s === "all" ? (lang === "fr" ? "Tous" : "All") : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label || s}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                placeholder="Chercher email, nom, objet..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 w-64"
              />
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white dark:bg-[#0f141f] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Statut</th>
                    <th className="px-4 py-3 font-semibold">Destinataire</th>
                    <th className="px-4 py-3 font-semibold">Objet de l'Email</th>
                    <th className="px-4 py-3 font-semibold">Modèle</th>
                    <th className="px-4 py-3 font-semibold">Langue</th>
                    <th className="px-4 py-3 font-semibold">Date d'envoi</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {loadingLogs ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">
                        Chargement de l'historique...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">
                        Aucun journal d'envoi enregistré.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const sc = STATUS_CONFIG[log.status] || STATUS_CONFIG.sent;
                      const Icon = sc.icon;
                      return (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${sc.bg}`}>
                              <Icon className={`w-3 h-3 ${sc.color}`} />
                              <span>{sc.label}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900 dark:text-white">{log.toName}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{log.to}</div>
                          </td>
                          <td className="px-4 py-3 max-w-xs truncate font-medium">{log.subject}</td>
                          <td className="px-4 py-3 text-[11px] text-slate-500 font-mono">{log.template}</td>
                          <td className="px-4 py-3 text-xs">
                            {LANG_FLAGS[log.language]} {log.language.toUpperCase()}
                          </td>
                          <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap">{log.date}</td>
                          <td className="px-4 py-3 text-right">
                            {(log.status === "failed" || log.status === "bounced") && (
                              <button
                                onClick={() => handleRetryLog(log.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold text-xs transition-colors"
                                title="Réessayer l'envoi"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Relancer</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRO VISUAL BLOCK BUILDER & HTML EDITOR */}
      {editorOpen && editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-5xl rounded-2xl bg-white dark:bg-[#0b0f17] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-slate-900 dark:text-slate-100 max-h-[94vh] flex flex-col">
            {/* Modal Header with Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {editingTemplate._id ? "Générateur & Éditeur de Modèle" : "Nouveau Modèle d'Email"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ajoutez facilement des blocs visuels prêts à l'emploi sans toucher au code
                  </p>
                </div>
              </div>

              {/* Tri-Mode switcher: Visual Builder, Code HTML, Live Preview */}
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setEditorMode("visual")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      editorMode === "visual"
                        ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    <Blocks className="w-3.5 h-3.5" />
                    <span>Blocs Visuels (No-Code)</span>
                  </button>

                  <button
                    onClick={() => setEditorMode("code")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      editorMode === "code"
                        ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Code HTML</span>
                  </button>

                  <button
                    onClick={() => setEditorMode("preview")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      editorMode === "preview"
                        ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Aperçu Réel</span>
                  </button>
                </div>

                <button
                  onClick={() => setEditorOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-4">
              <form id="templateForm" onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
                {/* Meta details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Nom du Modèle *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingTemplate.name || ""}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                      placeholder="Ex: Confirmation de Réservation"
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Type d'événement *
                    </label>
                    <select
                      value={editingTemplate.type}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, type: e.target.value })}
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="booking_confirmation">Confirmation de Réservation (booking_confirmation)</option>
                      <option value="booking_pending">Réservation en Attente (booking_pending)</option>
                      <option value="booking_cancelled">Annulation (booking_cancelled)</option>
                      <option value="pickup_reminder">Rappel Prise de Véhicule (pickup_reminder)</option>
                      <option value="return_reminder">Rappel Restitution Véhicule (return_reminder)</option>
                      <option value="payment_confirmation">Confirmation de Paiement (payment_confirmation)</option>
                      <option value="custom_notification">Notification Personnalisée (custom_notification)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Langue de l'email *
                    </label>
                    <select
                      value={editingTemplate.language}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, language: e.target.value as any })}
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="fr">🇫🇷 Français (fr)</option>
                      <option value="en">🇬🇧 English (en)</option>
                      <option value="ar">🇹🇳 العربية (ar)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Objet de l'email (Subject) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingTemplate.subject}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                      placeholder="Ex: Confirmation de réservation - {{bookingReference}}"
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Pré-en-tête (Aperçu dans l'inbox)
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.preheader || ""}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, preheader: e.target.value })}
                      placeholder="Ex: Retrouvez les détails de votre véhicule..."
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* MODE 1: VISUAL NO-CODE BLOCK BUILDER */}
                {editorMode === "visual" && (
                  <div className="space-y-4">
                    {/* Block Library Tray */}
                    <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Blocks className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <h4 className="text-xs font-extrabold text-blue-900 dark:text-blue-300">
                            Bibliothèque de Blocs Prêts à l'Emploi (1-Clic pour Insérer)
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Sans compétences techniques : cliquez pour ajouter une section
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {PREBUILT_BLOCKS.map((blk) => (
                          <div
                            key={blk.id}
                            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all flex flex-col justify-between shadow-2xs group"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-base">{blk.icon}</span>
                                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                  {blk.badge}
                                </span>
                              </div>
                              <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {blk.name}
                              </h5>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                {blk.desc}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => insertPrebuiltBlock(blk.html, blk.name)}
                              className="mt-3 w-full py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 dark:bg-blue-600/15 dark:hover:bg-blue-600 text-blue-600 hover:text-white dark:text-blue-400 dark:hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Insérer ce bloc</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Variable Chips Bar */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          Variables disponibles à insérer :
                        </span>
                        <span className="text-[10px] text-slate-400">Cliquer pour insérer</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {STANDARD_VARIABLES.map((v) => (
                          <button
                            key={v.key}
                            type="button"
                            onClick={() => insertVariableIntoTemplate(v.key)}
                            className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-blue-600 dark:text-blue-400 transition-colors shadow-2xs"
                            title={`Insérer {{${v.key}}}`}
                          >
                            +{`{{${v.key}}}`} ({v.label})
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Visual Live Preview Box */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white shadow-xs">
                      <div className="p-2.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          Rendu visuel en direct de l'email :
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Les blocs ajoutés s'affichent ci-dessous
                        </span>
                      </div>
                      <iframe
                        title="Visual Email Builder Preview"
                        srcDoc={getRenderedPreviewHtml(editingTemplate.htmlBody, editingTemplate.customFields)}
                        className="w-full h-[400px] border-0"
                      />
                    </div>
                  </div>
                )}

                {/* MODE 2: ADVANCED CODE HTML */}
                {editorMode === "code" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-700 dark:text-slate-300 font-semibold">
                        Code Source HTML Complet :
                      </label>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {STANDARD_VARIABLES.slice(0, 6).map((v) => (
                          <button
                            key={v.key}
                            type="button"
                            onClick={() => insertVariableIntoTemplate(v.key)}
                            className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-blue-600 dark:text-blue-400"
                          >
                            +{`{{${v.key}}}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      rows={14}
                      required
                      value={editingTemplate.htmlBody}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, htmlBody: e.target.value })}
                      placeholder="<html>...</html>"
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500 leading-relaxed"
                    />
                  </div>
                )}

                {/* MODE 3: FULL CLIENT PREVIEW */}
                {editorMode === "preview" && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
                      <div>
                        <strong>Objet simulé :</strong>{" "}
                        {editingTemplate.subject
                          .replace(/{{customerName}}/g, "Mohamed Ben Salem")
                          .replace(/{{bookingReference}}/g, "PAY-TN-2026-104")
                          .replace(/{{vehicleName}}/g, "Renault Clio 6")}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Rendu client réel (données fictives de test)
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white shadow-inner">
                      <iframe
                        title="Email Full Preview"
                        srcDoc={getRenderedPreviewHtml(editingTemplate.htmlBody, editingTemplate.customFields)}
                        className="w-full h-[520px] border-0"
                      />
                    </div>
                  </div>
                )}

                {/* Active Checkbox */}
                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTemplate.isActive}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, isActive: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Modèle actif (prêt à être envoyé par le système)
                    </span>
                  </label>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  setTestTemplateTarget(editingTemplate);
                  setTestModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Tester par email réel</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  form="templateForm"
                  disabled={savingTemplate}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 disabled:opacity-50 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingTemplate ? "Enregistrement..." : "Enregistrer dans MongoDB"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SEND TEST EMAIL */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Envoyer un Email de Test
                </h3>
              </div>
              <button
                onClick={() => setTestModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendTestEmail} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Modèle Sélectionné
                </label>
                <select
                  value={testTemplateTarget?._id || ""}
                  onChange={(e) => {
                    const found = templates.find((t) => t._id === e.target.value);
                    if (found) setTestTemplateTarget(found);
                  }}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-medium"
                >
                  {templates.map((tpl) => (
                    <option key={tpl._id} value={tpl._id}>
                      {LANG_FLAGS[tpl.language]} {tpl.name || tpl.type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Adresse Email Destinataire *
                </label>
                <input
                  type="email"
                  required
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  placeholder="votre.email@domaine.com"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                L'email sera généré avec des données de test tunisiennes (référence, montant en TND, taxes LF 2026, lieux d'aéroports) pour vérifier le rendu en conditions réelles.
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={sendingTest}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {sendingTest && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{sendingTest ? "Envoi en cours..." : "Envoyer le test"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
