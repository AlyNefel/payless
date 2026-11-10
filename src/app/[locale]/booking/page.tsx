"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  MapPin, Calendar, Clock, ChevronRight, Car, Users, Fuel,
  Gauge, Plus, Minus, Check, AlertCircle, Loader2, Copy, Tag,
  ShieldCheck, Phone, Mail, UserCheck, Search, FileText, MessageSquare,
  Download, CheckCircle2, Shield, Sparkles, Send, ExternalLink
} from "lucide-react";
import { CarSpinner } from "@/components/ui/CarSpinner";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { DEFAULT_ZONES, matchZone, type ZoneFeeConfig } from "@/lib/locationFees";

interface LocationItem {
  _id: string;
  name: { fr: string; en: string; ar: string } | string;
  city: string;
  isAirport?: boolean;
  isOutsideTunis?: boolean;
  customReturnFee?: number;
  pickupFee?: number;
  returnFee?: number;
}

interface ExtraItem {
  _id: string;
  name: { fr: string; en: string; ar: string } | string;
  price: number;
  pricingType?: "per_day" | "per_rental" | "per_unit";
  icon?: string;
  unit?: string;
  maxQuantity?: number;
}

const DEFAULT_LOCATIONS: LocationItem[] = [
  { _id: "tun-airport", name: { fr: "1. Aéroport de Tunis-Carthage (TUN)", en: "1. Tunis-Carthage Airport (TUN)", ar: "1. مطار تونس قرطاج الدولي (TUN)" }, city: "Tunis", isAirport: true },
  { _id: "mir-airport", name: { fr: "2. Aéroport de Monastir Habib Bourguiba (MIR)", en: "2. Monastir Airport (MIR)", ar: "2. مطار الحبيب بورقيبة المنستير (MIR)" }, city: "Monastir", isAirport: true },
  { _id: "soukra-agency", name: { fr: "3. Agence La Soukra (Siège Social)", en: "3. La Soukra Agency (HQ)", ar: "3. وكالة سكرة (المقر الرئيسي)" }, city: "Ariana", isAirport: false },
  { _id: "bizerte-city", name: { fr: "4. Bizerte Ville", en: "4. Bizerte City", ar: "4. مدينة بنزرت" }, city: "Bizerte", isAirport: false },
  { _id: "nabeul-city", name: { fr: "5. Nabeul Ville", en: "5. Nabeul City", ar: "5. مدينة نابل" }, city: "Nabeul", isAirport: false },
  { _id: "grand-tunis", name: { fr: "6. Grand Tunis (Livraison Hôtels & Domicile)", en: "6. Greater Tunis (Delivery)", ar: "6. تونس الكبرى (تسليم الفنادق والمنازل)" }, city: "Tunis", isAirport: false },
  { _id: "nbe-airport", name: { fr: "7. Aéroport Enfidha-Hammamet (NBE)", en: "7. Enfidha Airport (NBE)", ar: "7. مطار النفيضة الحمامات (NBE)" }, city: "Enfidha", isAirport: true },
  { _id: "hammamet-city", name: { fr: "8. Hammamet Ville & Yasmine Hammamet", en: "8. Hammamet & Yasmine Resort", ar: "8. مدينة الحمامات وياسمين الحمامات" }, city: "Hammamet", isAirport: false },
  { _id: "sfax-city", name: { fr: "9. Sfax Ville", en: "9. Sfax City", ar: "9. مدينة صفاقس" }, city: "Sfax", isAirport: false },
  { _id: "sousse-city", name: { fr: "10. Sousse Ville & Port El Kantaoui", en: "10. Sousse & Port El Kantaoui", ar: "10. مدينة سوسة وميناء القنطاوي" }, city: "Sousse", isAirport: false },
  { _id: "jendouba-city", name: { fr: "11. Jendouba Ville & Tabarka", en: "11. Jendouba & Tabarka", ar: "11. مدينة جندوبة وطبرقة" }, city: "Jendouba", isAirport: false },
];

const DEFAULT_EXTRAS: ExtraItem[] = [
  { _id: "extra-driver", name: { fr: "2ème Conducteur Additionnel (Offert)", en: "2nd Additional Driver (Free)", ar: "سائق إضافي ثانٍ (مجاناً)" }, price: 0, pricingType: "per_rental", icon: "👤", unit: "inclus", maxQuantity: 1 },
  { _id: "baby-seat", name: { fr: "Siège Bébé Homologué (0-13 kg)", en: "Infant Baby Seat (0-13 kg)", ar: "مقعد أطفال معتمد" }, price: 1500, pricingType: "per_day", icon: "👶", unit: "/ jour", maxQuantity: 2 },
  { _id: "child-seat", name: { fr: "Rehausseur Enfant (Child Seat)", en: "Child Booster Seat", ar: "كرسي رفع للأطفال" }, price: 1000, pricingType: "per_day", icon: "🧒", unit: "/ jour", maxQuantity: 2 },
  { _id: "fuel-70", name: { fr: "Option Plein Carburant (70 TND)", en: "Prepaid Fuel Tank (70 TND)", ar: "خيار خزان وقود كامل (70 د.ت)" }, price: 7000, pricingType: "per_rental", icon: "⛽", unit: "forfait", maxQuantity: 1 },
  { _id: "fuel-90", name: { fr: "Option Plein Carburant (90 TND)", en: "Prepaid Fuel Tank (90 TND)", ar: "خيار خزان وقود كامل (90 د.ت)" }, price: 9000, pricingType: "per_rental", icon: "⛽", unit: "forfait", maxQuantity: 1 },
  { _id: "gps", name: { fr: "GPS Tactile Cartographie Tunisie 2026", en: "Touchscreen GPS Tunisia 2026", ar: "جهاز ملاحة خرائط تونس 2026" }, price: 1000, pricingType: "per_day", icon: "🗺️", unit: "/ jour", maxQuantity: 1 },
];

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface BookingData {
  pickupLocationId: string;
  returnLocationId: string;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
  vehicleId: string;
  extras: { id: string; quantity: number }[];
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  licenceNumber: string;
  licenceYear: string;
  notes: string;
  couponCode: string;
}

interface Vehicle {
  _id: string;
  brand: string;
  model: string;
  year: number;
  images: { url: string; isPrimary: boolean }[];
  pricing: { daily: number; deposit: number; currency?: string };
  transmission: string;
  fuelType: string;
  seats: number;
  availableUnits?: number;
  totalUnits?: number;
}

function getLocalizedName(name: { fr: string; en: string; ar: string } | string | undefined, locale: string): string {
  if (!name) return "";
  if (typeof name === "string") return name;
  return name[locale as "fr" | "en" | "ar"] || name.fr || name.en || "";
}

function BookingContent() {
  const locale = useLocale();
  const searchParams = useSearchParams();

  // Tomorrow as default pickup
  const defaultPickup = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  // 4 days from now as default return (3-day rental)
  const defaultReturn = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split("T")[0];
  }, []);

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<LocationItem[]>(DEFAULT_LOCATIONS);
  const [availableExtras, setAvailableExtras] = useState<ExtraItem[]>(DEFAULT_EXTRAS);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [couponStatus, setCouponStatus] = useState<{ valid: boolean; discountAmount?: number; discount?: number; message: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [error, setError] = useState("");

  // Post-booking dispatch actions: Download, Email, WhatsApp
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailError, setEmailError] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [showEmailEdit, setShowEmailEdit] = useState(false);
  const [customPhone, setCustomPhone] = useState("");
  const [showPhoneEdit, setShowPhoneEdit] = useState(false);
  const [copiedWaLink, setCopiedWaLink] = useState(false);

  const [data, setData] = useState<BookingData>({
    pickupLocationId: searchParams.get("pickupLocation") || "tun-airport",
    returnLocationId: searchParams.get("returnLocation") || "tun-airport",
    pickupDate: searchParams.get("pickupDate") || defaultPickup,
    returnDate: searchParams.get("returnDate") || defaultReturn,
    pickupTime: searchParams.get("pickupTime") || "10:00",
    returnTime: searchParams.get("returnTime") || "10:00",
    vehicleId: searchParams.get("vehicleId") || "",
    extras: [],
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "Tunisie",
    licenceNumber: "",
    licenceYear: "",
    notes: "",
    couponCode: searchParams.get("coupon") || "",
  });

  const [accountOption, setAccountOption] = useState<"guest" | "existing" | "create">("guest");
  const [accountPassword, setAccountPassword] = useState("");
  const { settings } = useCompanySettings();

  // Currency string
  const currencySymbol = locale === "ar" ? "د.ت" : "TND";

  // Helper to format minor or major units consistently in TND
  const fmt = (n: number | undefined) => {
    if (n === undefined || isNaN(n)) return "0";
    const val = n >= 1000 ? Math.round(n / 100) : Math.round(n);
    return val.toLocaleString(locale === "ar" ? "ar-TN" : "fr-FR");
  };

  // Fetch live locations & extras
  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.locations && res.locations.length > 0) {
          setLocations(res.locations);
          // Set default pickup if current is tun-airport
          if (data.pickupLocationId === "tun-airport") {
            setData((d) => ({
              ...d,
              pickupLocationId: res.locations[0]._id,
              returnLocationId: res.locations[0]._id,
            }));
          }
        }
      })
      .catch(() => {});

    fetch("/api/extras")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.extras && res.extras.length > 0) {
          setAvailableExtras(res.extras);
        }
      })
      .catch(() => {});
  }, []);

  async function fetchVehicles() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        pickupDate: data.pickupDate,
        returnDate: data.returnDate,
        limit: "50",
      });
      const res = await fetch(`/api/vehicles?${params}`);
      const json = await res.json();
      setVehicles(json.vehicles || []);
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSingleVehicle(id: string) {
    try {
      const res = await fetch(`/api/vehicles?vehicleId=${id}`);
      const json = await res.json();
      if (json.vehicles && json.vehicles.length > 0) {
        const found = json.vehicles.find((v: Vehicle) => v._id === id) || json.vehicles[0];
        setSelectedVehicle(found);
        setData((d) => ({ ...d, vehicleId: found._id }));
      }
    } catch (e) {
      console.error("Failed to fetch vehicle", e);
    }
  }

  // Fetch initial single vehicle if vehicleId was passed
  useEffect(() => {
    const urlVehicleId = searchParams.get("vehicleId");
    if (urlVehicleId) {
      fetchSingleVehicle(urlVehicleId);
    }
  }, [searchParams]);

  // Fetch vehicles whenever Step 2 is active
  useEffect(() => {
    if (step === 2 && data.pickupDate && data.returnDate) {
      fetchVehicles();
    }
  }, [step, data.pickupDate, data.returnDate]);

  const rentalDays = useMemo(() => {
    if (!data.pickupDate || !data.returnDate) return 1;
    const p = new Date(`${data.pickupDate}T${data.pickupTime}`);
    const r = new Date(`${data.returnDate}T${data.returnTime}`);
    const diffMs = r.getTime() - p.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  }, [data.pickupDate, data.pickupTime, data.returnDate, data.returnTime]);

  const subtotal = useMemo(() => {
    if (!selectedVehicle) return 0;
    return selectedVehicle.pricing.daily * rentalDays;
  }, [selectedVehicle, rentalDays]);

  const extrasTotal = useMemo(() => {
    return data.extras.reduce((sum, ex) => {
      const extra = availableExtras.find((e) => e._id === ex.id);
      if (!extra) return sum;
      const cost = extra.pricingType === "per_rental" ? extra.price * ex.quantity : extra.price * ex.quantity * rentalDays;
      return sum + cost;
    }, 0);
  }, [data.extras, availableExtras, rentalDays]);

  const discountAmount = useMemo(() => {
    if (!couponStatus || !couponStatus.valid) return 0;
    return couponStatus.discountAmount || couponStatus.discount || 0;
  }, [couponStatus]);

  const depositAmount = selectedVehicle?.pricing?.deposit || 0;

  // Zone configuration state (configurable by Admin)
  const [zoneConfig, setZoneConfig] = useState<{
    enabled: boolean;
    zones: ZoneFeeConfig[];
    differentLocationFee: number;
  }>({
    enabled: true,
    zones: DEFAULT_ZONES,
    differentLocationFee: 50,
  });

  useEffect(() => {
    fetch("/api/locations/fees")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.zones)) {
          setZoneConfig({
            enabled: json.enabled !== false,
            zones: json.zones,
            differentLocationFee: Number(json.differentLocationFee ?? 50),
          });
        }
      })
      .catch(() => {});
  }, []);

  const selectedPickupLoc = locations.find((l) => l._id === data.pickupLocationId);
  const selectedReturnLoc = locations.find((l) => l._id === data.returnLocationId);

  const selectedPickupLocName = selectedPickupLoc
    ? typeof selectedPickupLoc.name === "string"
      ? selectedPickupLoc.name
      : selectedPickupLoc.name[locale as "fr" | "en" | "ar"] || selectedPickupLoc.name.fr
    : "";

  const selectedReturnLocName = selectedReturnLoc
    ? typeof selectedReturnLoc.name === "string"
      ? selectedReturnLoc.name
      : selectedReturnLoc.name[locale as "fr" | "en" | "ar"] || selectedReturnLoc.name.fr
    : "";

  const matchedPickupZone = useMemo(() => {
    return matchZone(selectedPickupLoc || null, zoneConfig.zones);
  }, [selectedPickupLoc, zoneConfig.zones]);

  const matchedReturnZone = useMemo(() => {
    return matchZone(selectedReturnLoc || null, zoneConfig.zones);
  }, [selectedReturnLoc, zoneConfig.zones]);

  const deliveryFee = useMemo(() => {
    if (selectedPickupLoc?.pickupFee && Number(selectedPickupLoc.pickupFee) > 0) {
      return Number(selectedPickupLoc.pickupFee);
    }
    return (matchedPickupZone?.deliveryFee ?? 0) * 100;
  }, [selectedPickupLoc, matchedPickupZone]);

  const ramassageFee = useMemo(() => {
    if (selectedReturnLoc?.returnFee && Number(selectedReturnLoc.returnFee) > 0) {
      return Number(selectedReturnLoc.returnFee);
    }
    if (selectedReturnLoc?.customReturnFee && Number(selectedReturnLoc.customReturnFee) > 0) {
      return Number(selectedReturnLoc.customReturnFee);
    }
    return (matchedReturnZone?.returnFee ?? 0) * 100;
  }, [selectedReturnLoc, matchedReturnZone]);

  const isDifferentLocation = Boolean(data.pickupLocationId && data.returnLocationId && data.pickupLocationId !== data.returnLocationId);
  const differentLocationFee = isDifferentLocation
    ? (zoneConfig.differentLocationFee || settings.differentLocationFee || 50) * 100
    : 0;

  const timbreFiscal = (settings.timbreFiscal !== undefined ? settings.timbreFiscal : 1) * 100;
  const contributionLF2026 = (settings.contributionLF2026 !== undefined ? settings.contributionLF2026 : 2) * 100 * rentalDays;

  const totalAmount = Math.max(
    0,
    subtotal +
      extrasTotal -
      discountAmount +
      timbreFiscal +
      contributionLF2026 +
      deliveryFee +
      ramassageFee +
      differentLocationFee
  );

  async function validateCoupon() {
    if (!data.couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: data.couponCode.trim().toUpperCase(),
          rentalDays,
          subtotal,
        }),
      });
      const json = await res.json();
      if (json.valid) {
        setCouponStatus({
          valid: true,
          discountAmount: json.discountAmount || Math.round((subtotal * 10) / 100),
          message: json.message || "Code promo validé avec succès (-10%)",
        });
      } else {
        setCouponStatus({
          valid: false,
          message: json.message || "Code promo non applicable ou expiré.",
        });
      }
    } catch {
      setCouponStatus({
        valid: false,
        message: "Erreur lors de la validation du coupon.",
      });
    } finally {
      setCouponLoading(false);
    }
  }

  async function submitBooking() {
    if (!selectedVehicle) {
      setError("Veuillez sélectionner un véhicule avant de confirmer.");
      setStep(2);
      return;
    }
    if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.licenceYear.trim()) {
      setError("Veuillez renseigner vos informations obligatoires (Nom, Prénom, Email, Téléphone et Année de permis).");
      setStep(4);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        vehicleId: selectedVehicle._id,
        pickupLocationId: data.pickupLocationId || (locations[0]?._id ?? "soukra-agency"),
        returnLocationId: data.returnLocationId || data.pickupLocationId || (locations[0]?._id ?? "soukra-agency"),
        pickupDate: data.pickupDate,
        returnDate: data.returnDate,
        pickupTime: data.pickupTime,
        returnTime: data.returnTime,
        extras: data.extras.map((ex) => ({
          extraId: ex.id,
          quantity: ex.quantity,
        })),
        couponCode: couponStatus?.valid ? data.couponCode.trim().toUpperCase() : undefined,
        customer: {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone.trim(),
          country: data.country || "Tunisie",
          drivingLicence: {
            number: data.licenceNumber ? data.licenceNumber.trim() : "À vérifier à la livraison",
            country: data.country || "Tunisie",
            issueYear: data.licenceYear ? Number(data.licenceYear) : undefined,
          },
          preferredLanguage: locale || "fr",
        },
        customerNotes: data.notes || "",
        customerLanguage: locale || "fr",
        accountOption,
        accountPassword: accountOption !== "guest" ? accountPassword.trim() : undefined,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Une erreur est survenue lors de l'enregistrement de votre réservation.");
      }

      const createdRef = json.booking?.bookingReference || json.bookingReference || "PAY-2026";
      setBookingRef(createdRef);
      setCustomEmail(data.email.trim());
      setCustomPhone(data.phone.trim());
      setStep(6);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de communication avec le serveur.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendEmail(targetEmail?: string) {
    const toEmail = (targetEmail || customEmail || data.email).trim().toLowerCase();
    if (!toEmail || !toEmail.includes("@")) {
      setEmailError(
        locale === "ar"
          ? "الرجاء إدخال بريد إلكتروني صحيح."
          : locale === "en"
          ? "Please enter a valid email address."
          : "Veuillez renseigner une adresse email valide."
      );
      return;
    }
    setSendingEmail(true);
    setEmailSuccess("");
    setEmailError("");
    try {
      const res = await fetch("/api/bookings/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingReference: bookingRef,
          email: toEmail,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setEmailSuccess(
          json.message ||
            (locale === "ar"
              ? `تم إرسال وصل الحجز والفاكتورة الرسمية إلى ${toEmail} بنجاح!`
              : locale === "en"
              ? `Official voucher & invoice sent successfully to ${toEmail}!`
              : `Bon de réservation officiel et facture PDF envoyés avec succès à ${toEmail} !`)
        );
      } else {
        setEmailError(
          json.error ||
            (locale === "ar"
              ? "تعذر إرسال البريد حالياً. الرجاء المحاولة لاحقاً."
              : locale === "en"
              ? "Failed to dispatch confirmation email."
              : "Impossible d'envoyer l'email pour le moment.")
        );
      }
    } catch {
      setEmailError(
        locale === "ar"
          ? "خطأ في الاتصال بالخادم."
          : locale === "en"
          ? "Network error while sending email."
          : "Erreur réseau lors de l'envoi de l'email."
      );
    } finally {
      setSendingEmail(false);
    }
  }

  function getWhatsAppUrl() {
    const cleanPhone = (customPhone || data.phone || "").replace(/[^0-9]/g, "");
    const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://payless.tn";
    const pdfUrl = `${siteUrl}/api/bookings/pdf?ref=${bookingRef}&email=${encodeURIComponent(data.email)}`;
    const msg = encodeURIComponent(
      `🚗 *Payless Car Rental Tunisie — Confirmation de Réservation*\n\n` +
      `Bonjour *${data.firstName} ${data.lastName}*,\n` +
      `Votre réservation *${bookingRef}* est ✅ *Confirmée Immédiatement* !\n\n` +
      `• *Véhicule* : ${selectedVehicle?.brand} ${selectedVehicle?.model}\n` +
      `• *Prise en charge* : ${data.pickupDate} à ${data.pickupTime} (${selectedPickupLocName})\n` +
      `• *Restitution* : ${data.returnDate} à ${data.returnTime} (${selectedReturnLocName})\n` +
      `• *Durée* : ${rentalDays} jour(s)\n` +
      `• *Montant Total TTC* : ${fmt(totalAmount)} TND\n\n` +
      `📄 *Télécharger votre Facture & Bon de Réservation officiel (PDF)* :\n${pdfUrl}\n\n` +
      `Assistance Payless Tunisie 24/7 au : +216 80 80 80 80.`
    );
    return `https://api.whatsapp.com/send?phone=${encodeURIComponent(cleanPhone)}&text=${msg}`;
  }

  function handleCopyPdfLink() {
    const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
    const pdfUrl = `${siteUrl}/api/bookings/pdf?ref=${bookingRef}&email=${encodeURIComponent(data.email)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pdfUrl);
      setCopiedWaLink(true);
      setTimeout(() => setCopiedWaLink(false), 3000);
    }
  }

  const steps = [
    { n: 1, label: locale === "ar" ? "الموقع والتواريخ" : locale === "en" ? "Location & Dates" : "Lieu & Dates" },
    { n: 2, label: locale === "ar" ? "السيارة" : locale === "en" ? "Vehicle" : "Véhicule" },
    { n: 3, label: locale === "ar" ? "الخيارات" : locale === "en" ? "Extras" : "Options" },
    { n: 4, label: locale === "ar" ? "معلوماتك" : locale === "en" ? "Your Details" : "Vos infos" },
    { n: 5, label: locale === "ar" ? "الملخص" : locale === "en" ? "Summary" : "Récapitulatif" },
    { n: 6, label: locale === "ar" ? "التأكيد" : locale === "en" ? "Confirmation" : "Confirmation" },
  ];

  const canProceed = (s: Step) => {
    if (s === 1) return data.pickupDate && data.returnDate && data.pickupLocationId;
    if (s === 2) return !!selectedVehicle;
    if (s === 4) return Boolean(data.firstName.trim() && data.lastName.trim() && data.email.trim() && data.phone.trim() && data.licenceYear.trim());
    return true;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Progress Stepper */}
        {step < 6 && (
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-border dark:bg-neutral-800" />
              <div
                className="absolute top-4 left-0 h-0.5 bg-blue-600 transition-all duration-500"
                style={{ width: `${((step - 1) / 5) * 100}%` }}
              />
              {steps.map((s) => (
                <div key={s.n} className="relative z-10 flex flex-col items-center gap-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm ${
                      s.n < step
                        ? "bg-emerald-600 text-white"
                        : s.n === step
                        ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/40"
                        : "bg-white dark:bg-neutral-800 border-2 border-border dark:border-neutral-700 text-muted-foreground"
                    }`}
                  >
                    {s.n < step ? <Check className="w-4 h-4" /> : s.n}
                  </div>
                  <span
                    className={`text-xs hidden sm:block font-medium ${
                      s.n === step ? "text-blue-600 dark:text-blue-400 font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-border dark:border-neutral-800 shadow-md p-6 md:p-8"
          >
            {/* STEP 1: Location & Dates */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {locale === "ar" ? "حدد موقع وتواريخ الإيجار" : locale === "en" ? "Pick-up & Drop-off Details" : "Lieu & Dates de location"}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {locale === "ar"
                      ? "تسليم فوري 24/7 في جميع مطارات ومدن تونس (تونس قرطاج، المنستير، النفيضة، سوسة...)"
                      : locale === "en"
                      ? "24/7 VIP curbside delivery across all Tunisian airports & downtown locations"
                      : "Livraison VIP 24/7 dans tous les aéroports et agences de Tunisie"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      {locale === "ar" ? "مكان الاستلام" : locale === "en" ? "Pick-up Location" : "Lieu de prise en charge"}
                    </label>
                    <select
                      value={data.pickupLocationId}
                      onChange={(e) => setData((d) => ({ ...d, pickupLocationId: e.target.value }))}
                      className="w-full min-w-0 px-4 py-3 rounded-xl border border-border dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-neutral-800 truncate"
                    >
                      {locations.map((l) => (
                        <option key={l._id} value={l._id}>
                          {getLocalizedName(l.name, locale)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      {locale === "ar" ? "مكان الإرجاع" : locale === "en" ? "Return Location" : "Lieu de restitution"}
                    </label>
                    <select
                      value={data.returnLocationId}
                      onChange={(e) => setData((d) => ({ ...d, returnLocationId: e.target.value }))}
                      className="w-full min-w-0 px-4 py-3 rounded-xl border border-border dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-neutral-800 truncate"
                    >
                      {locations.map((l) => (
                        <option key={l._id} value={l._id}>
                          {getLocalizedName(l.name, locale)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      {locale === "ar" ? "تاريخ البدء" : locale === "en" ? "Pick-up Date" : "Date de départ"}
                    </label>
                    <input
                      type="date"
                      value={data.pickupDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setData((d) => ({ ...d, pickupDate: e.target.value }))}
                      className="w-full min-w-0 px-4 py-3 rounded-xl border border-border dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-neutral-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      {locale === "ar" ? "تاريخ الإرجاع" : locale === "en" ? "Return Date" : "Date de retour"}
                    </label>
                    <input
                      type="date"
                      value={data.returnDate}
                      min={data.pickupDate || new Date().toISOString().split("T")[0]}
                      onChange={(e) => setData((d) => ({ ...d, returnDate: e.target.value }))}
                      className="w-full min-w-0 px-4 py-3 rounded-xl border border-border dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-neutral-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {locale === "ar" ? "ساعة البدء" : locale === "en" ? "Pick-up Time" : "Heure de prise"}
                    </label>
                    <input
                      type="time"
                      value={data.pickupTime}
                      onChange={(e) => setData((d) => ({ ...d, pickupTime: e.target.value }))}
                      className="w-full min-w-0 px-4 py-3 rounded-xl border border-border dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-neutral-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {locale === "ar" ? "ساعة الإرجاع" : locale === "en" ? "Return Time" : "Heure de restitution"}
                    </label>
                    <input
                      type="time"
                      value={data.returnTime}
                      onChange={(e) => setData((d) => ({ ...d, returnTime: e.target.value }))}
                      className="w-full min-w-0 px-4 py-3 rounded-xl border border-border dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-neutral-800"
                    />
                  </div>
                </div>

                {deliveryFee > 0 && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        {locale === "ar"
                          ? `معلوم تسليم السيارة (${selectedPickupLocName}) :`
                          : locale === "en"
                          ? `Delivery fee (${selectedPickupLocName}) :`
                          : `Frais de livraison (${selectedPickupLocName}) :`}
                      </span>
                    </div>
                    <span className="font-bold font-mono">+{deliveryFee / 100} TND</span>
                  </div>
                )}

                {ramassageFee > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        {locale === "ar"
                          ? `معلوم استرجاع / رَمَس السيارة (${selectedReturnLocName}) :`
                          : locale === "en"
                          ? `Collection / Recovery fee (${selectedReturnLocName}) :`
                          : `Frais de ramassage (${selectedReturnLocName}) :`}
                      </span>
                    </div>
                    <span className="font-bold font-mono">+{ramassageFee / 100} TND</span>
                  </div>
                )}

                {isDifferentLocation && differentLocationFee > 0 && (
                  <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>
                        {locale === "ar"
                          ? "تسليم في وكالة مختلفة (ذهاب فقط) : معلوم تغيير الوكالة مطبق"
                          : locale === "en"
                          ? "Drop-off at different branch: One-way inter-agency fee applies"
                          : "Restitution dans une agence différente : Frais d'aller-simple appliqués"}
                      </span>
                    </div>
                    <span className="font-bold font-mono">+{differentLocationFee / 100} TND</span>
                  </div>
                )}

                {data.pickupDate && data.returnDate && (
                  <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl p-4 text-sm text-blue-900 dark:text-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      {locale === "ar" ? "مدة الإيجار:" : locale === "en" ? "Rental duration:" : "Durée de location :"}{" "}
                      <strong>
                        {rentalDays} {locale === "ar" ? "أيام" : rentalDays > 1 ? "jours" : "jour"}
                      </strong>
                    </div>
                    <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      {locale === "ar"
                        ? "✓ مسافة غير محدودة والتأمين مشمول"
                        : locale === "en"
                        ? "✓ Unlimited mileage & Insurance included"
                        : "✓ Kilométrage illimité & Assurance incluse"}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Choose Vehicle */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {locale === "ar" ? "اختر سيارتك" : locale === "en" ? "Select Your Car" : "Choisissez votre voiture"}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {locale === "ar"
                      ? "موديلات تونس 2026 مضمونة بحالة الوكالة"
                      : locale === "en"
                      ? "Guaranteed 2026 exact models, showroom condition"
                      : "Flotte officielle Payless Tunisie en état neuf"}
                  </p>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <CarSpinner
                      size="lg"
                      label={
                        locale === "ar"
                          ? "جارٍ البحث عن السيارات المتاحة في تونس..."
                          : locale === "en"
                          ? "Searching available fleet in Tunisia..."
                          : "Recherche des véhicules disponibles en Tunisie..."
                      }
                    />
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                    {vehicles.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        {locale === "ar"
                          ? "لم يتم العثور على سيارات متاحة لهذه التواريخ. يرجى تعديل التواريخ أو الأوقات."
                          : locale === "en"
                          ? "No vehicles available for these dates. Please try adjusting your schedule."
                          : "Aucun véhicule trouvé pour ces dates. Veuillez modifier vos critères de recherche."}
                      </div>
                    ) : (
                      vehicles.map((v) => {
                        const img =
                          v.images?.find((i) => i.isPrimary)?.url ||
                          v.images?.[0]?.url ||
                          "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&q=80";
                        const isSelected = selectedVehicle?._id === v._id;

                        return (
                          <button
                            key={v._id}
                            type="button"
                            onClick={() => {
                              setSelectedVehicle(v);
                              setData((d) => ({ ...d, vehicleId: v._id }));
                            }}
                            className={`w-full flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl border-2 transition-all text-left ${
                              isSelected
                                ? "border-blue-600 bg-blue-50/80 dark:bg-blue-950/30 shadow-md"
                                : "border-border dark:border-neutral-800 hover:border-blue-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-800/60"
                            }`}
                          >
                            <div className="relative w-full sm:w-28 h-36 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800">
                              <img
                                src={img}
                                alt={`${v.brand} ${v.model}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-base text-foreground">
                                {v.brand} {v.model}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Gauge className="w-3.5 h-3.5" />
                                  {v.transmission === "automatic"
                                    ? locale === "fr"
                                      ? "Automatique"
                                      : locale === "ar"
                                      ? "أوتوماتيك"
                                      : "Automatic"
                                    : locale === "fr"
                                    ? "Manuelle"
                                    : locale === "ar"
                                    ? "يدوي"
                                    : "Manual"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5" />
                                  {v.seats} {locale === "ar" ? "مقاعد" : locale === "en" ? "seats" : "places"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Fuel className="w-3.5 h-3.5" />
                                  {v.fuelType}
                                </span>
                              </div>
                              {v.availableUnits !== undefined && (
                                <div className="flex items-center gap-1.5 mt-2">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                      v.availableUnits <= 1
                                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse"
                                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                                    }`}
                                  >
                                    {v.availableUnits <= 1 ? "🔥 " : "✓ "}
                                    {v.availableUnits <= 1
                                      ? (locale === "ar" ? "آخر سيارة متوفرة !" : locale === "en" ? "Only 1 vehicle left!" : "Dernier véhicule disponible !")
                                      : (locale === "ar" ? `${v.availableUnits} متوفرة من أصل ${v.totalUnits || v.availableUnits}` : locale === "en" ? `${v.availableUnits} available out of ${v.totalUnits || v.availableUnits}` : `${v.availableUnits} disponibles sur ${v.totalUnits || v.availableUnits} en flotte`)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="w-full sm:w-auto flex items-center justify-between sm:flex-col sm:items-end gap-1 border-t sm:border-t-0 border-border/50 pt-2 sm:pt-0 shrink-0">
                              <div className="text-lg sm:text-xl font-bold text-blue-700 dark:text-blue-400">
                                {fmt(v.pricing?.daily)} {currencySymbol}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                {locale === "ar" ? "/ يوم شامل" : locale === "en" ? "/ day incl. tax" : "/ jour TTC"}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="hidden sm:flex w-7 h-7 rounded-full bg-blue-600 text-white items-center justify-center shrink-0">
                                <Check className="w-4 h-4" />
                              </div>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Extras */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {locale === "ar" ? "خيارات إضافية" : locale === "en" ? "Optional Add-ons" : "Options & Services"}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {locale === "ar"
                      ? "أضف راحة وأماناً لرحلتك في تونس"
                      : locale === "en"
                      ? "Customise your trip with optional equipment & services"
                      : "Personnalisez votre location avec nos options certifiées"}
                  </p>
                </div>

                <div className="space-y-3">
                  {availableExtras.map((extra) => {
                    const current = data.extras.find((e) => e.id === extra._id);
                    const qty = current?.quantity || 0;
                    const max = extra.maxQuantity || 2;
                    const priceFormatted = extra.price === 0 ? "Offert (0 TND)" : `${fmt(extra.price)} ${currencySymbol}`;

                    return (
                      <div
                        key={extra._id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                          qty > 0
                            ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/20"
                            : "border-border dark:border-neutral-800 bg-white dark:bg-neutral-800/40"
                        }`}
                      >
                        <span className="text-2xl">{extra.icon || "✨"}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-foreground">
                            {getLocalizedName(extra.name, locale)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {priceFormatted}{" "}
                            {extra.pricingType === "per_rental"
                              ? locale === "ar"
                                ? "(لكل إيجار)"
                                : locale === "en"
                                ? "(flat fee)"
                                : "(forfait location)"
                              : locale === "ar"
                              ? "/ يوم"
                              : locale === "en"
                              ? "/ day"
                              : "/ jour"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setData((d) => ({
                                ...d,
                                extras:
                                  qty <= 1
                                    ? d.extras.filter((e) => e.id !== extra._id)
                                    : d.extras.map((e) =>
                                        e.id === extra._id ? { ...e, quantity: e.quantity - 1 } : e
                                      ),
                              }));
                            }}
                            disabled={qty === 0}
                            className="w-8 h-8 rounded-full border border-border dark:border-neutral-700 flex items-center justify-center disabled:opacity-30 hover:bg-muted transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-bold text-sm">{qty}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setData((d) => ({
                                ...d,
                                extras:
                                  qty === 0
                                    ? [...d.extras, { id: extra._id, quantity: 1 }]
                                    : d.extras.map((e) =>
                                        e.id === extra._id ? { ...e, quantity: Math.min(max, e.quantity + 1) } : e
                                      ),
                              }));
                            }}
                            disabled={qty >= max}
                            className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-30 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: Driver Information */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    {locale === "ar" ? "معلومات السائق الرئيسي" : locale === "en" ? "Main Driver Information" : "Informations du conducteur"}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {locale === "ar"
                      ? "المعلومات المطلوبة لعقد الإيجار الرسمي والتأمين"
                      : locale === "en"
                      ? "Required details for the official Tunisian rental agreement"
                      : "Informations requises pour le contrat officiel de location"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">
                      {locale === "ar" ? "الاسم *" : locale === "en" ? "First Name *" : "Prénom *"}
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Mohamed"
                      value={data.firstName}
                      onChange={(e) => setData((d) => ({ ...d, firstName: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-border dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-neutral-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5">
                      {locale === "ar" ? "اللقب *" : locale === "en" ? "Last Name *" : "Nom *"}
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Ben Ali"
                      value={data.lastName}
                      onChange={(e) => setData((d) => ({ ...d, lastName: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-border dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-neutral-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5">
                      {locale === "ar" ? "البريد الإلكتروني *" : locale === "en" ? "Email Address *" : "Email *"}
                    </label>
                    <input
                      type="email"
                      placeholder="mohamed@example.com"
                      value={data.email}
                      onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-border dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-neutral-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5">
                      {locale === "ar" ? "رقم الهاتف *" : locale === "en" ? "Phone Number *" : "Téléphone (WhatsApp) *"}
                    </label>
                    <input
                      type="tel"
                      placeholder="+216 22 123 456"
                      value={data.phone}
                      onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-border dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-neutral-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5">
                      {locale === "ar" ? "البلد" : locale === "en" ? "Country" : "Pays de résidence"}
                    </label>
                    <input
                      type="text"
                      placeholder="Tunisie, France, etc."
                      value={data.country}
                      onChange={(e) => setData((d) => ({ ...d, country: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-border dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-neutral-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5 flex items-center justify-between">
                      <span>{locale === "ar" ? "سنة الحصول على رخصة القيادة *" : locale === "en" ? "Driving Licence Year *" : "Année d'obtention du permis *"}</span>
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">Obligatoire</span>
                    </label>
                    <input
                      type="number"
                      min="1950"
                      max={new Date().getFullYear()}
                      placeholder="Ex: 2018"
                      value={data.licenceYear}
                      onChange={(e) => setData((d) => ({ ...d, licenceYear: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-border dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-neutral-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1.5">
                      {locale === "ar" ? "رقم رخصة القيادة" : locale === "en" ? "Driving Licence Number" : "N° Permis de conduire"}
                    </label>
                    <input
                      type="text"
                      placeholder="01/123456"
                      value={data.licenceNumber}
                      onChange={(e) => setData((d) => ({ ...d, licenceNumber: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-border dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-neutral-800"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-1.5">
                      {locale === "ar" ? "ملاحظات أو رقم الرحلة" : locale === "en" ? "Flight number & Special requests" : "Remarques particulières (N° de vol, etc.)"}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={
                        locale === "ar"
                          ? "يرجى تحديد رقم رحلتك الجوية للاستقبال المباشر بلافتة في المطار..."
                          : locale === "en"
                          ? "Provide your flight number for airport curbside greeting with name board..."
                          : "Précisez votre numéro de vol pour un accueil personnalisé avec pancarte à l'aéroport..."
                      }
                      value={data.notes}
                      onChange={(e) => setData((d) => ({ ...d, notes: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-border dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none bg-white dark:bg-neutral-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Summary & Payment */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirmation Automatique & Immédiate (Sans attente d'agence)</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-1">
                    {locale === "ar" ? "ملخص الحجز والتكلفة" : locale === "en" ? "Booking & Pricing Summary" : "Résumé de votre réservation"}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {locale === "ar"
                      ? "تحقق من جميع التفاصيل المالية والتعاقدية قبل التأكيد النهائي المباشر"
                      : locale === "en"
                      ? "Review complete vehicle, itinerary, and itemised costs before instant confirmation"
                      : "Vérifiez le détail complet des coûts et de votre itinéraire avant validation finale"}
                  </p>
                </div>

                {/* 1. Selected Vehicle card */}
                {selectedVehicle && (
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-border dark:border-neutral-700 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-blue-600" />
                      <span>1. Véhicule Sélectionné</span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <img
                        src={
                          selectedVehicle.images?.find((i) => i.isPrimary)?.url ||
                          selectedVehicle.images?.[0]?.url ||
                          "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&q=80"
                        }
                        alt=""
                        className="w-full sm:w-32 h-24 object-cover rounded-xl bg-neutral-200 dark:bg-neutral-700"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="font-extrabold text-lg text-foreground">
                          {selectedVehicle.brand} {selectedVehicle.model}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="px-2 py-0.5 rounded-md bg-neutral-200/70 dark:bg-neutral-700/70">
                            {selectedVehicle.transmission === "automatic" ? "Boîte Automatique" : "Boîte Manuelle"}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-neutral-200/70 dark:bg-neutral-700/70">
                            {selectedVehicle.seats} Places
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-neutral-200/70 dark:bg-neutral-700/70">
                            Carburant: {selectedVehicle.fuelType}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold">
                            ✓ Kilométrage Illimité
                          </span>
                        </div>
                      </div>
                      <div className="text-right sm:border-l sm:border-border sm:dark:border-neutral-700 sm:pl-4">
                        <div className="text-xs text-muted-foreground">Prix journalier</div>
                        <div className="text-xl font-bold text-blue-700 dark:text-blue-400">
                          {fmt(selectedVehicle.pricing?.daily)} {currencySymbol}
                        </div>
                        <div className="text-[11px] text-muted-foreground">/ jour TTC</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Dates & Itinerary card */}
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-border dark:border-neutral-700 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>2. Dates & Itinéraire de Location</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-border dark:border-neutral-800">
                      <div className="text-muted-foreground font-medium mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" /> Prise en charge (Livraison)
                      </div>
                      <div className="font-bold text-sm text-foreground">{data.pickupDate} à {data.pickupTime}</div>
                      <div className="text-muted-foreground truncate mt-0.5">{selectedPickupLocName}</div>
                    </div>
                    <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-border dark:border-neutral-800">
                      <div className="text-muted-foreground font-medium mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" /> Restitution (Ramassage)
                      </div>
                      <div className="font-bold text-sm text-foreground">{data.returnDate} à {data.returnTime}</div>
                      <div className="text-muted-foreground truncate mt-0.5">{selectedReturnLocName}</div>
                    </div>
                    <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-border dark:border-neutral-800">
                      <div className="text-muted-foreground font-medium mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" /> Durée Totale Facturée
                      </div>
                      <div className="font-bold text-lg text-blue-600 dark:text-blue-400">{rentalDays} Jour{rentalDays > 1 ? "s" : ""}</div>
                      <div className="text-muted-foreground text-[11px]">Tarif dégressif appliqué</div>
                    </div>
                  </div>
                </div>

                {/* 3. Itemized Cost Breakdown (Table View - Strict > 0 DT only) */}
                <div className="p-5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-border dark:border-neutral-700 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-blue-600" />
                      <span>3. Détail Complet des Coûts & Taxes Facturés (TTC)</span>
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Vue simple & lisible • Aucun frais caché
                    </span>
                  </div>

                  {/* Clean Structured Financial Table */}
                  <div className="overflow-x-auto rounded-xl border border-border dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-neutral-100 dark:bg-neutral-800 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border dark:border-neutral-700">
                          <th className="py-2.5 px-3.5 sm:px-4">Désignation</th>
                          <th className="py-2.5 px-3.5 sm:px-4 hidden sm:table-cell text-center">Détail</th>
                          <th className="py-2.5 px-3.5 sm:px-4 text-right">Montant ({currencySymbol})</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 dark:divide-neutral-800 text-foreground">
                        {/* Base Rental Subtotal */}
                        {subtotal > 0 && (
                          <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                            <td className="py-2.5 px-3.5 sm:px-4">
                              <span className="font-semibold">Location {selectedVehicle?.brand} {selectedVehicle?.model}</span>
                              <div className="text-[11px] text-muted-foreground">Tarif de base journalier garanti</div>
                            </td>
                            <td className="py-2.5 px-3.5 sm:px-4 hidden sm:table-cell text-center font-mono text-muted-foreground">
                              {rentalDays} j × {fmt(selectedVehicle?.pricing?.daily)} {currencySymbol}
                            </td>
                            <td className="py-2.5 px-3.5 sm:px-4 text-right font-bold font-mono">
                              {fmt(subtotal)} {currencySymbol}
                            </td>
                          </tr>
                        )}

                        {/* Paid Extras only */}
                        {extrasTotal > 0 && (
                          <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                            <td className="py-2.5 px-3.5 sm:px-4">
                              <span className="font-semibold">Options & équipements additionnels</span>
                              <div className="text-[11px] text-muted-foreground truncate max-w-[240px]">
                                {data.extras.map((ex) => {
                                  const item = availableExtras.find((e) => e._id === ex.id);
                                  return `${getLocalizedName(item?.name, locale)} (x${ex.quantity})`;
                                }).join(", ")}
                              </div>
                            </td>
                            <td className="py-2.5 px-3.5 sm:px-4 hidden sm:table-cell text-center font-mono text-muted-foreground">
                              {data.extras.length} option(s)
                            </td>
                            <td className="py-2.5 px-3.5 sm:px-4 text-right font-bold font-mono">
                              +{fmt(extrasTotal)} {currencySymbol}
                            </td>
                          </tr>
                        )}

                        {/* Delivery fee only if > 0 */}
                        {deliveryFee > 0 && (
                          <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                            <td className="py-2.5 px-3.5 sm:px-4">
                              <span className="font-semibold">Frais de livraison ({selectedPickupLocName})</span>
                              <div className="text-[11px] text-muted-foreground">Mise à disposition VIP</div>
                            </td>
                            <td className="py-2.5 px-3.5 sm:px-4 hidden sm:table-cell text-center font-mono text-muted-foreground">
                              1 service
                            </td>
                            <td className="py-2.5 px-3.5 sm:px-4 text-right font-bold font-mono">
                              +{fmt(deliveryFee)} {currencySymbol}
                            </td>
                          </tr>
                        )}

                        {/* Ramassage fee only if > 0 */}
                        {ramassageFee > 0 && (
                          <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                            <td className="py-2.5 px-3.5 sm:px-4">
                              <span className="font-semibold">Frais de restitution ({selectedReturnLocName})</span>
                              <div className="text-[11px] text-muted-foreground">Rapatriement véhicule</div>
                            </td>
                            <td className="py-2.5 px-3.5 sm:px-4 hidden sm:table-cell text-center font-mono text-muted-foreground">
                              1 service
                            </td>
                            <td className="py-2.5 px-3.5 sm:px-4 text-right font-bold font-mono">
                              +{fmt(ramassageFee)} {currencySymbol}
                            </td>
                          </tr>
                        )}

                        {/* Inter-agency fee only if > 0 */}
                        {isDifferentLocation && differentLocationFee > 0 && (
                          <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                            <td className="py-2.5 px-3.5 sm:px-4">
                              <span className="font-semibold">Frais retour agence différente (Aller-simple)</span>
                              <div className="text-[11px] text-muted-foreground">Inter-agences</div>
                            </td>
                            <td className="py-2.5 px-3.5 sm:px-4 hidden sm:table-cell text-center font-mono text-muted-foreground">
                              1 trajet
                            </td>
                            <td className="py-2.5 px-3.5 sm:px-4 text-right font-bold font-mono">
                              +{fmt(differentLocationFee)} {currencySymbol}
                            </td>
                          </tr>
                        )}

                        {/* Contribution LF 2026 only if > 0 */}
                        {contributionLF2026 > 0 && (
                          <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                            <td className="py-2.5 px-3.5 sm:px-4">
                              <span className="font-semibold">Contribution fiscale LF 2026</span>
                              <div className="text-[11px] text-muted-foreground">Taxe légale de 2 DT / jour × {rentalDays} j</div>
                            </td>
                            <td className="py-2.5 px-3.5 sm:px-4 hidden sm:table-cell text-center font-mono text-muted-foreground">
                              {rentalDays} j × 2 TND
                            </td>
                            <td className="py-2.5 px-3.5 sm:px-4 text-right font-bold font-mono">
                              +{fmt(contributionLF2026)} {currencySymbol}
                            </td>
                          </tr>
                        )}

                        {/* Timbre fiscal only if > 0 */}
                        {timbreFiscal > 0 && (
                          <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                            <td className="py-2.5 px-3.5 sm:px-4">
                              <span className="font-semibold">Timbre fiscal de quittance</span>
                              <div className="text-[11px] text-muted-foreground">Droit de timbre légal obligatoire</div>
                            </td>
                            <td className="py-2.5 px-3.5 sm:px-4 hidden sm:table-cell text-center font-mono text-muted-foreground">
                              1 contrat
                            </td>
                            <td className="py-2.5 px-3.5 sm:px-4 text-right font-bold font-mono">
                              +{fmt(timbreFiscal)} {currencySymbol}
                            </td>
                          </tr>
                        )}

                        {/* Promo discount only if > 0 */}
                        {discountAmount > 0 && (
                          <tr className="bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300">
                            <td className="py-2.5 px-3.5 sm:px-4">
                              <span className="font-semibold">Remise Code Promo ({data.couponCode})</span>
                              <div className="text-[11px]">Déduction commerciale appliquée</div>
                            </td>
                            <td className="py-2.5 px-3.5 sm:px-4 hidden sm:table-cell text-center font-mono">
                              Remise
                            </td>
                            <td className="py-2.5 px-3.5 sm:px-4 text-right font-bold font-mono">
                              -{fmt(discountAmount)} {currencySymbol}
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-900 dark:border-neutral-600 bg-neutral-100/80 dark:bg-neutral-800/90 text-foreground font-bold">
                          <td className="py-3 px-3.5 sm:px-4 text-sm sm:text-base">
                            TOTAL RÈGLEMENT T.T.C
                            <div className="text-[11px] font-normal text-muted-foreground hidden sm:block">
                              Paiement à la remise des clés • Assurance Tous Risques & Assistance 24/7 incluses
                            </div>
                          </td>
                          <td className="py-3 px-3.5 sm:px-4 hidden sm:table-cell text-center text-xs font-mono text-muted-foreground">
                            ≈ {Math.round(totalAmount / 335)} EUR
                          </td>
                          <td className="py-3 px-3.5 sm:px-4 text-right text-base sm:text-xl font-black font-mono text-blue-700 dark:text-blue-400">
                            {fmt(totalAmount)} {currencySymbol}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Caution de garantie (only if > 0) */}
                  {depositAmount > 0 && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/50 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Caution de garantie (Empreinte CB bloquée & restituée au retour sans débit) :</span>
                      </div>
                      <span className="font-bold font-mono text-sm">{fmt(depositAmount)} {currencySymbol}</span>
                    </div>
                  )}
                </div>

                {/* 4. Driver Details & Special Notes Recap */}
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-border dark:border-neutral-700 space-y-2 text-xs">
                  <div className="font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>4. Informations Conducteur & Facturation</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                    <div>
                      <span className="text-muted-foreground">Conducteur :</span>
                      <p className="font-semibold text-foreground">{data.firstName} {data.lastName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email :</span>
                      <p className="font-semibold text-foreground truncate">{data.email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Téléphone (WhatsApp) :</span>
                      <p className="font-semibold text-foreground">{data.phone}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Permis de conduire :</span>
                      <p className="font-semibold text-foreground">
                        {data.licenceNumber ? `N° ${data.licenceNumber}` : "À présenter à l'arrivée"}{" "}
                        {data.licenceYear ? `(Délivré en ${data.licenceYear})` : ""}
                      </p>
                    </div>
                  </div>
                  {data.notes && (
                    <div className="pt-2 border-t border-border/50 dark:border-neutral-700/50">
                      <span className="text-muted-foreground">Remarques / Vol :</span>
                      <p className="font-medium text-foreground">{data.notes}</p>
                    </div>
                  )}
                </div>

                {/* Promo Code section */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <span>
                      {locale === "ar" ? "رمز الخصم" : locale === "en" ? "Promo Code" : "Code promotionnel"}
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={data.couponCode}
                      onChange={(e) => {
                        setData((d) => ({ ...d, couponCode: e.target.value.toUpperCase() }));
                        setCouponStatus(null);
                      }}
                      placeholder="Ex: PAYLESS2026"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-border dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm uppercase bg-white dark:bg-neutral-800"
                    />
                    <button
                      type="button"
                      onClick={validateCoupon}
                      disabled={couponLoading || !data.couponCode.trim()}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {couponLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : locale === "ar" ? (
                        "تطبيق"
                      ) : locale === "en" ? (
                        "Apply"
                      ) : (
                        "Appliquer"
                      )}
                    </button>
                  </div>

                  {couponStatus && (
                    <div
                      className={`mt-2 text-xs px-3 py-2 rounded-lg flex items-center gap-2 ${
                        couponStatus.valid
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800"
                          : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800"
                      }`}
                    >
                      {couponStatus.valid ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {couponStatus.message}
                    </div>
                  )}
                </div>

                {/* Account Options (3 choices) */}
                <div className="bg-muted/30 dark:bg-neutral-800/50 p-4 rounded-xl border border-border dark:border-neutral-700 space-y-3">
                  <div className="font-semibold text-sm">
                    {locale === "ar"
                      ? "خيارات الحساب"
                      : locale === "en"
                      ? "Account Options"
                      : "Option de compte pour votre réservation"}
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {/* Option 1: Existing account */}
                    <label
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        accountOption === "existing"
                          ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20"
                          : "border-border dark:border-neutral-700 hover:bg-muted/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="accountOption"
                        checked={accountOption === "existing"}
                        onChange={() => setAccountOption("existing")}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {locale === "ar"
                            ? "لدي حساب بالفعل (الحجز عبر حسابي)"
                            : locale === "en"
                            ? "I already have an account (Book with my account)"
                            : "J'ai déjà un compte (Passer la réservation avec mon compte)"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {locale === "ar"
                            ? "سيتم ربط الحجز بملفك الشخصي المسجل"
                            : locale === "en"
                            ? "Booking will be linked to your existing profile"
                            : "La réservation sera liée à votre espace client existant"}
                        </div>
                      </div>
                    </label>

                    {/* Option 2: Create account */}
                    <label
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        accountOption === "create"
                          ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20"
                          : "border-border dark:border-neutral-700 hover:bg-muted/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="accountOption"
                        checked={accountOption === "create"}
                        onChange={() => setAccountOption("create")}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {locale === "ar"
                            ? "إنشاء حساب جديد وتأكيد الحجز"
                            : locale === "en"
                            ? "Create an account and complete reservation"
                            : "Créer un compte et réserver"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {locale === "ar"
                            ? "تتبع حجوزاتك وإدارتها بسهولة في المستقبل"
                            : locale === "en"
                            ? "Track and manage your bookings anytime"
                            : "Crée un espace client avec votre email pour suivre vos réservations"}
                        </div>
                      </div>
                    </label>

                    {/* Option 3: Guest */}
                    <label
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        accountOption === "guest"
                          ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20"
                          : "border-border dark:border-neutral-700 hover:bg-muted/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="accountOption"
                        checked={accountOption === "guest"}
                        onChange={() => setAccountOption("guest")}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {locale === "ar"
                            ? "متابعة كزائر فقط بدون حساب"
                            : locale === "en"
                            ? "Continue as guest (Reservation only)"
                            : "Continuer en tant qu'invité (Réservation uniquement)"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {locale === "ar"
                            ? "حجز سريع ومباشر دون إنشاء كلمة سر"
                            : locale === "en"
                            ? "Fast booking without creating a password"
                            : "Réservation directe et confirmation rapide par email"}
                        </div>
                      </div>
                    </label>
                  </div>

                  {accountOption !== "guest" && (
                    <div className="pt-2">
                      <label className="block text-xs font-semibold mb-1">
                        {accountOption === "create"
                          ? (locale === "ar" ? "اختر كلمة مرور للحساب الجديد *" : locale === "en" ? "Choose a password (min. 6 characters) *" : "Choisissez un mot de passe (min. 6 car.) *")
                          : (locale === "ar" ? "كلمة المرور الخاصة بحسابك" : locale === "en" ? "Account password" : "Mot de passe de votre compte")}
                      </label>
                      <input
                        type="password"
                        value={accountPassword}
                        onChange={(e) => setAccountPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-lg border border-border dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-neutral-800"
                      />
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            )}

            {/* STEP 6: Confirmation Screen */}
            {step === 6 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 max-w-2xl mx-auto space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-50 dark:ring-emerald-950/20">
                  <Check className="w-10 h-10" />
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Statut : Confirmée Immédiatement (Sans attente)</span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                    {locale === "ar" ? "تم تأكيد حجزك بنجاح!" : locale === "en" ? "Booking Confirmed Immediately!" : "Réservation Confirmée Immédiatement !"}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto">
                    {locale === "ar"
                      ? `تم قفل السيارة بنجاح في أسطولنا وإرسال تأكيد الحجز إلى ${data.email}`
                      : locale === "en"
                      ? `Your vehicle has been locked in our fleet and confirmation sent to ${data.email}`
                      : `Votre véhicule a été validé et verrouillé dans notre flotte en temps réel. Le bon officiel avec QR code a été envoyé à ${data.email}`}
                  </p>
                </div>

                {/* Booking reference badge */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl p-6 shadow-sm">
                  <div className="text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold mb-1">
                    Référence Officielle de Réservation
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-blue-700 dark:text-blue-300 tracking-wider font-mono">
                    {bookingRef}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Présentez cette référence ou votre bon PDF lors de la remise des clés.
                  </p>
                </div>

                {/* Quick recap details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left text-xs">
                  <div className="bg-muted/40 dark:bg-neutral-800 p-3 rounded-xl border border-border/50">
                    <div className="text-muted-foreground mb-0.5">Véhicule</div>
                    <div className="font-bold text-foreground truncate">{selectedVehicle?.brand} {selectedVehicle?.model}</div>
                  </div>
                  <div className="bg-muted/40 dark:bg-neutral-800 p-3 rounded-xl border border-border/50">
                    <div className="text-muted-foreground mb-0.5">Durée</div>
                    <div className="font-bold text-foreground">{rentalDays} jour{rentalDays > 1 ? "s" : ""}</div>
                  </div>
                  <div className="bg-muted/40 dark:bg-neutral-800 p-3 rounded-xl border border-border/50">
                    <div className="text-muted-foreground mb-0.5">Total TTC</div>
                    <div className="font-bold text-blue-700 dark:text-blue-400 font-mono">{fmt(totalAmount)} {currencySymbol}</div>
                  </div>
                  <div className="bg-muted/40 dark:bg-neutral-800 p-3 rounded-xl border border-border/50">
                    <div className="text-muted-foreground mb-0.5">Prise en charge</div>
                    <div className="font-bold text-foreground truncate">{data.pickupDate}</div>
                  </div>
                </div>

                {/* 3 Interactive Automated Actions: Download PDF, Send Email, Send WhatsApp */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {locale === "ar"
                        ? "خيارات استلام وثائق الحجز"
                        : locale === "en"
                        ? "Reservation Document Options"
                        : "Recevoir et Enregistrer vos Documents"}
                    </span>
                  </div>

                  {/* Feedback alerts */}
                  {emailSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{emailSuccess}</span>
                    </div>
                  )}

                  {emailError && (
                    <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{emailError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                    {/* Action 1: Download PDF */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 shadow-xs flex flex-col justify-between space-y-3">
                      <div>
                        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                          <Download className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {locale === "ar" ? "تحميل وصل الحجز (PDF)" : locale === "en" ? "Download PDF Voucher" : "Télécharger Bon & Facture"}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          {locale === "ar"
                            ? "وثيقة رسمية بالأبيض والأسود مع كافة التفاصيل"
                            : locale === "en"
                            ? "Official black & white voucher ready to print"
                            : "Document officiel A4 avec QR Code et grille comptable"}
                        </p>
                      </div>
                      <a
                        href={`/api/bookings/pdf?ref=${bookingRef}&email=${encodeURIComponent(data.email)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-xs active:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        <span>{locale === "ar" ? "تحميل PDF" : locale === "en" ? "Download PDF" : "Télécharger PDF"}</span>
                      </a>
                    </div>

                    {/* Action 2: Send Email */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 shadow-xs flex flex-col justify-between space-y-3">
                      <div>
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                          <Mail className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {locale === "ar" ? "إرسال إلى بريدي الإلكتروني" : locale === "en" ? "Send to My Email" : "Envoyer par Email"}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate" title={customEmail || data.email}>
                          À : <strong className="text-slate-700 dark:text-slate-200">{customEmail || data.email}</strong>
                        </p>
                      </div>

                      {showEmailEdit && (
                        <input
                          type="email"
                          value={customEmail}
                          onChange={(e) => setCustomEmail(e.target.value)}
                          placeholder="votre-email@example.com"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900"
                        />
                      )}

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSendEmail()}
                          disabled={sendingEmail}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 active:scale-95"
                        >
                          {sendingEmail ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Envoi...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>{locale === "ar" ? "إرسال" : locale === "en" ? "Send Email" : "Envoyer par Email"}</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowEmailEdit(!showEmailEdit)}
                          title="Modifier l'email destinataire"
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-600 dark:text-slate-300 text-xs"
                        >
                          ✎
                        </button>
                      </div>
                    </div>

                    {/* Action 3: Send to WhatsApp */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 shadow-xs flex flex-col justify-between space-y-3">
                      <div>
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {locale === "ar" ? "إرسال إلى واتساب" : locale === "en" ? "Send to WhatsApp" : "Envoyer sur WhatsApp"}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                          N° : <strong className="text-slate-700 dark:text-slate-200">{customPhone || data.phone}</strong>
                        </p>
                      </div>

                      {showPhoneEdit && (
                        <input
                          type="tel"
                          value={customPhone}
                          onChange={(e) => setCustomPhone(e.target.value)}
                          placeholder="+216 00 000 000"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900"
                        />
                      )}

                      <div className="flex items-center gap-1.5">
                        <a
                          href={getWhatsAppUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{locale === "ar" ? "فتح واتساب" : locale === "en" ? "Open WhatsApp" : "Ouvrir WhatsApp"}</span>
                        </a>
                        <button
                          type="button"
                          onClick={handleCopyPdfLink}
                          title="Copier le lien direct vers le PDF"
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-600 dark:text-slate-300 text-xs flex items-center justify-center"
                        >
                          {copiedWaLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPhoneEdit(!showPhoneEdit)}
                          title="Modifier le numéro WhatsApp"
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-600 dark:text-slate-300 text-xs"
                        >
                          ✎
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional navigation links */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 border-t border-border/50">
                  <Link
                    href={`/booking/status?ref=${bookingRef}&email=${encodeURIComponent(data.email)}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-800 dark:text-slate-200 rounded-xl font-semibold text-xs transition-colors w-full sm:w-auto"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Suivre ma réservation en ligne</span>
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-border dark:border-neutral-700 rounded-xl font-semibold text-xs hover:bg-muted transition-colors w-full sm:w-auto"
                  >
                    Retour à l'accueil
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Wizard Navigation */}
        {step < 6 && (
          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
              disabled={step === 1}
              className="px-5 py-2.5 border border-border dark:border-neutral-700 rounded-xl text-sm font-medium hover:bg-muted/50 disabled:opacity-30 transition-colors"
            >
              ← {locale === "ar" ? "رجوع" : locale === "en" ? "Back" : "Retour"}
            </button>

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as Step)}
                disabled={!canProceed(step)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center gap-2 shadow-sm"
              >
                {locale === "ar" ? "متابعة" : locale === "en" ? "Continue" : "Continuer"}{" "}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submitBooking}
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Traitement en cours…
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />{" "}
                    {locale === "ar" ? "تأكيد الحجز" : locale === "en" ? "Confirm Reservation" : "Confirmer la réservation"}
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center">
          <CarSpinner size="xl" label="Chargement du système de réservation..." />
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
