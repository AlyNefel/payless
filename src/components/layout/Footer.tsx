"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Clock,
  Sparkles,
  Car,
  Headphones,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

// Crisp SVG social icons for editorial footer
function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function LinkedinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function TwitterIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 4l11.733 16h4.267l-11.733-16z" />
      <path d="M4 20l6.768-6.768m2.464-2.464L20 4" />
    </svg>
  );
}

const translations = {
  fr: {
    brandTagline:
      "Vivez l'excellence de la liberté automobile. Payless Car Rental vous propose des véhicules neufs et économiques à travers toute la Tunisie, sans frais cachés et avec une assistance 24/7.",
    hotlineLabel: "Service Client & Réservations 24/7",
    fleetTitle: "Nos Voitures",
    branchesTitle: "Nos 11 Agences en Tunisie",
    newsletterTitle: "Restez Informé",
    newsletterDesc:
      "Recevez nos offres exclusives, privilèges VIP et nouveautés en avant-première.",
    emailPlaceholder: "Votre adresse email professionnelle...",
    subscribeBtn: "S'inscrire",
    subscribingBtn: "Envoi en cours...",
    subscribeSuccess: "Merci ! Vous êtes bien inscrit(e) à nos privilèges.",
    subscribeError: "Veuillez entrer une adresse email valide.",
    rights: "Tous droits réservés.",
    terms: "Conditions Générales",
    privacy: "Politique de Confidentialité",
    legal: "Mentions Légales",
    cookies: "Gestion des Cookies",
    badges: {
      roadside: {
        title: "Assistance 24/7",
        desc: "Dépannage immédiat partout en Tunisie",
      },
      noHiddenFees: {
        title: "Zéro Frais Cachés",
        desc: "Tarifs transparents en Dinars Tunisiens",
      },
      freeCancellation: {
        title: "Annulation Sans Frais",
        desc: "Modifiable ou annulable jusqu'à 48h",
      },
      securePayment: {
        title: "Paiement 100% Sécurisé",
        desc: "Cartes bancaires & espèces à la livraison",
      },
    },
    categories: {
      luxury: "Véhicules de Prestige",
      suv: "SUV & Tout-Terrain",
      sedan: "Berlines Exécutives",
      sport: "Coupés & Sportives",
      compact: "Citadines Économiques",
    },
    locations: {
      tunis: "Aéroport Tunis-Carthage (TUN 24/7)",
      monastir: "Aéroport Monastir Habib Bourguiba (MIR)",
      enfidha: "Aéroport Enfidha-Hammamet (NBE)",
      soukra: "Agence La Soukra (Siège Social Ariana)",
      regions: "Hammamet, Sousse, Sfax, Bizerte & Nabeul",
    },
  },
  en: {
    brandTagline:
      "Experience the pinnacle of automotive freedom. Payless Car Rental delivers premium vehicle hire across Tunisia with zero hidden fees and unparalleled 24/7 concierge support.",
    hotlineLabel: "24/7 Customer Care & Reservations",
    fleetTitle: "Our Fleet",
    branchesTitle: "Airport Branches",
    newsletterTitle: "Stay Informed",
    newsletterDesc:
      "Receive exclusive privileges, seasonal discounts, and first looks at new fleet arrivals.",
    emailPlaceholder: "Enter your email address...",
    subscribeBtn: "Subscribe",
    subscribingBtn: "Subscribing...",
    subscribeSuccess: "Thank you! You are now subscribed to Payless Privileges.",
    subscribeError: "Please enter a valid email address.",
    rights: "All rights reserved.",
    terms: "Terms & Conditions",
    privacy: "Privacy Policy",
    legal: "Legal Notices",
    cookies: "Cookie Preferences",
    badges: {
      roadside: {
        title: "24/7 Roadside Assistance",
        desc: "Immediate support anywhere in Tunisia",
      },
      noHiddenFees: {
        title: "Zero Hidden Fees",
        desc: "Transparent all-inclusive rates",
      },
      freeCancellation: {
        title: "Free Cancellation",
        desc: "Flexible changes up to 48 hours prior",
      },
      securePayment: {
        title: "100% Secure Payment",
        desc: "Encrypted transactions & international cards",
      },
    },
    categories: {
      luxury: "Luxury & Prestige",
      suv: "Premium SUVs",
      sedan: "Executive Sedans",
      sport: "Sports & Convertibles",
      compact: "Compact & City Cars",
    },
    locations: {
      tunis: "Tunis-Carthage Airport (TUN 24/7)",
      monastir: "Monastir Habib Bourguiba Airport (MIR)",
      enfidha: "Enfidha-Hammamet Airport (NBE)",
      soukra: "La Soukra Agency (Headquarters Ariana)",
      regions: "Hammamet, Sousse, Sfax, Bizerte & Nabeul",
    },
  },
  ar: {
    brandTagline:
      "عش تجربة لا تضاهى من الحرية والراحة. توفر بايليس لتأجير السيارات أسطولاً فاخراً ومتنوعاً في جميع مدن ومطارات تونس، بأسعار شفافة وخدمة راقية على مدار 24 ساعة.",
    hotlineLabel: "خدمة العملاء والحجوزات 24/7",
    fleetTitle: "أسطول السيارات",
    branchesTitle: "فروعنا في تونس",
    newsletterTitle: "النشرة البريدية",
    newsletterDesc:
      "اشترك لتصلك أحدث العروض الحصرية وخصومات المواسم ومستجدات أسطولنا الفاخر.",
    emailPlaceholder: "أدخل بريدك الإلكتروني...",
    subscribeBtn: "اشتراك",
    subscribingBtn: "جاري الإرسال...",
    subscribeSuccess: "شكراً لك! تم تسجيل اشتراكك في نادي الامتيازات بنجاح.",
    subscribeError: "يرجى إدخال عنوان بريد إلكتروني صحيح.",
    rights: "جميع الحقوق محفوظة.",
    terms: "الشروط والأحكام",
    privacy: "سياسة الخصوصية",
    legal: "الإشعار القانوني",
    cookies: "إعدادات الكوكيز",
    badges: {
      roadside: {
        title: "مساعدة على الطريق 24/7",
        desc: "دعم فوري في كافة أرجاء الجمهورية التونسية",
      },
      noHiddenFees: {
        title: "بدون أي رسوم خفية",
        desc: "أسعار واضحة وشاملة لكافة التكاليف",
      },
      freeCancellation: {
        title: "إلغاء مجاني للموعد",
        desc: "إلغاء أو تعديل مرن حتى 48 ساعة قبل الموعد",
      },
      securePayment: {
        title: "دفع آمن ومحمي 100%",
        desc: "معاملات مصرفية مشفرة بكافة البطاقات",
      },
    },
    categories: {
      luxury: "سيارات فارهة وفخمة",
      suv: "سيارات الدفع الرباعي SUV",
      sedan: "سيدان تنفيذية",
      sport: "سيارات رياضية",
      compact: "سيارات اقتصادية وصغيرة",
    },
    locations: {
      tunis: "مطار تونس قرطاج الدولي (24/7)",
      monastir: "مطار الحبيب بورقيبة المنستير",
      enfidha: "مطار النفيضة الحمامات الدولي",
      soukra: "وكالة سكرة (المقر الرئيسي أريانة)",
      regions: "الحمامات، سوسة، صفاقس، بنزرت ونابل",
    },
  },
};

export function Footer() {
  const locale = (useLocale() as "fr" | "en" | "ar") || "fr";
  const t = translations[locale] || translations.fr;
  const isRtl = locale === "ar";

  const [email, setEmail] = React.useState("");
  const [newsletterStatus, setNewsletterStatus] = React.useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@") || !email.includes(".")) {
      setNewsletterStatus("error");
      return;
    }

    setNewsletterStatus("loading");
    try {
      // Simulate real asynchronous submission with feedback
      await new Promise((resolve) => setTimeout(resolve, 800));
      setNewsletterStatus("success");
      setEmail("");
    } catch {
      setNewsletterStatus("error");
    }
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <footer className="w-full bg-[#0A0A0B] text-zinc-300 border-t border-zinc-800/80 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* SECTION 1: Trust & Value Proposition Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md">
          {/* Badge 1: 24/7 Roadside Assistance */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
              <Headphones className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">
                {t.badges.roadside.title}
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {t.badges.roadside.desc}
              </p>
            </div>
          </div>

          {/* Badge 2: Zero Hidden Fees */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">
                {t.badges.noHiddenFees.title}
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {t.badges.noHiddenFees.desc}
              </p>
            </div>
          </div>

          {/* Badge 3: Free Cancellation */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">
                {t.badges.freeCancellation.title}
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {t.badges.freeCancellation.desc}
              </p>
            </div>
          </div>

          {/* Badge 4: Secure Payment */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">
                {t.badges.securePayment.title}
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {t.badges.securePayment.desc}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: Main Footer Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand & Hotline Column (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
              <img
                src="https://hmlrentcar.tn/wp-content/uploads/2025/08/IMG_9268.png"
                alt="Payless Car Rental Tunisia"
                className="h-14 sm:h-16 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            <p className="text-sm text-zinc-400 leading-relaxed">
              {t.brandTagline}
            </p>

            {/* Hotline highlight */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                {t.hotlineLabel}
              </span>
              <a
                href="tel:+21625120130"
                className="inline-flex items-center gap-3 text-lg font-bold text-white hover:text-blue-400 transition-colors"
                dir="ltr"
              >
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                  <Phone className="h-4 w-4" />
                </div>
                <span>+216 25 120 130</span>
              </a>
              <div className="flex items-center gap-2 pt-1 text-xs text-zinc-400">
                <Mail className="h-3.5 w-3.5 text-zinc-400" />
                <a
                  href="mailto:Reservations@hmlrentcar.tn"
                  className="hover:underline hover:text-white"
                >
                  Reservations@hmlrentcar.tn
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
              >
                <TwitterIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links: Fleet Categories (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase flex items-center gap-2">
              <Car className="h-4 w-4 text-blue-500" />
              <span>{t.fleetTitle}</span>
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/vehicles?category=luxury"
                  className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ArrowIcon className="h-3 w-3 opacity-60" />
                  <span>{t.categories.luxury}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/vehicles?category=suv"
                  className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ArrowIcon className="h-3 w-3 opacity-60" />
                  <span>{t.categories.suv}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/vehicles?category=sedan"
                  className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ArrowIcon className="h-3 w-3 opacity-60" />
                  <span>{t.categories.sedan}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/vehicles?category=sport"
                  className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ArrowIcon className="h-3 w-3 opacity-60" />
                  <span>{t.categories.sport}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/vehicles?category=compact"
                  className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ArrowIcon className="h-3 w-3 opacity-60" />
                  <span>{t.categories.compact}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links: Branches (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-500" />
              <span>{t.branchesTitle}</span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>{t.locations.tunis}</span>
              </li>
              <li className="flex items-start gap-2 text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>{t.locations.monastir}</span>
              </li>
              <li className="flex items-start gap-2 text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>{t.locations.enfidha}</span>
              </li>
              <li className="flex items-start gap-2 text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>{t.locations.soukra}</span>
              </li>
              <li className="flex items-start gap-2 text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>{t.locations.regions}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup Box (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase">
              {t.newsletterTitle}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t.newsletterDesc}
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="space-y-1">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (newsletterStatus === "error") {
                      setNewsletterStatus("idle");
                    }
                  }}
                  placeholder={t.emailPlaceholder}
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-400 focus-visible:ring-blue-500 text-xs h-10"
                  disabled={newsletterStatus === "loading"}
                />
              </div>

              <Button
                type="submit"
                variant="default"
                size="sm"
                className="w-full bg-[#1D4ED8] hover:bg-[#1e40af] text-white font-medium text-xs h-10 rounded-lg shadow-sm"
                isLoading={newsletterStatus === "loading"}
                loadingText={t.subscribingBtn}
              >
                <span>{t.subscribeBtn}</span>
              </Button>

              {newsletterStatus === "success" && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs animate-in fade-in-50">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{t.subscribeSuccess}</span>
                </div>
              )}

              {newsletterStatus === "error" && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs animate-in fade-in-50">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{t.subscribeError}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* SECTION 3: Bottom Legal & Copyright Bar */}
        <div className="border-t border-zinc-800/80 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div>
            © {new Date().getFullYear()} PAYLESS CAR RENTAL. {t.rights}
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/terms"
              className="hover:text-zinc-200 transition-colors"
            >
              {t.terms}
            </Link>
            <Link
              href="/privacy"
              className="hover:text-zinc-200 transition-colors"
            >
              {t.privacy}
            </Link>
            <Link
              href="/legal"
              className="hover:text-zinc-200 transition-colors"
            >
              {t.legal}
            </Link>
            <Link
              href="/cookies"
              className="hover:text-zinc-200 transition-colors"
            >
              {t.cookies}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
