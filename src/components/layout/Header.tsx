"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Globe,
  Menu,
  X,
  ChevronDown,
  Calendar,
  Sparkles,
  Car,
  Phone,
  Info,
  Check,
  FileText,
  MessageCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Search,
} from "lucide-react";

interface NavItem {
  key: string;
  href: string;
  icon: React.ElementType;
  label: {
    en: string;
    fr: string;
    ar: string;
  };
}

const navItems: NavItem[] = [
  {
    key: "home",
    href: "/",
    icon: Sparkles,
    label: {
      en: "Home",
      fr: "Accueil",
      ar: "الرئيسية",
    },
  },
  {
    key: "vehicles",
    href: "/vehicles",
    icon: Car,
    label: {
      en: "Our Cars",
      fr: "Nos Voitures",
      ar: "سياراتنا",
    },
  },
  {
    key: "promotions",
    href: "/promotions",
    icon: Sparkles,
    label: {
      en: "Promotions",
      fr: "Promotions",
      ar: "العروض",
    },
  },
  {
    key: "about",
    href: "/about",
    icon: Info,
    label: {
      en: "About",
      fr: "À Propos",
      ar: "من نحن",
    },
  },
  {
    key: "terms",
    href: "/terms",
    icon: FileText,
    label: {
      en: "Terms & Conditions",
      fr: "Conditions",
      ar: "الشروط والأحكام",
    },
  },
  {
    key: "status",
    href: "/booking/status",
    icon: Search,
    label: {
      en: "Track Booking",
      fr: "Suivi Réservation",
      ar: "متابعة الحجز",
    },
  },
  {
    key: "contact",
    href: "/contact",
    icon: Phone,
    label: {
      en: "Contact",
      fr: "Contact",
      ar: "اتصل بنا",
    },
  },
];

interface LanguageOption {
  code: "fr" | "en" | "ar";
  name: string;
  nativeName: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: "fr", name: "Français", nativeName: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇹🇳" },
];

export function Header() {
  const currentLocale = useLocale() as "fr" | "en" | "ar";
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [langMenuOpen, setLangMenuOpen] = React.useState(false);
  const langMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll listener for elevation styling
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync RTL / LTR document direction
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = currentLocale === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = currentLocale;
    }
  }, [currentLocale]);

  // Click outside to close desktop language menu
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(event.target as Node)
      ) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent background scrolling when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [mobileMenuOpen]);

  const handleLanguageChange = (newLocale: "fr" | "en" | "ar") => {
    setLangMenuOpen(false);
    setMobileMenuOpen(false);
    router.replace(pathname, { locale: newLocale });
  };

  const currentLanguage =
    languages.find((l) => l.code === currentLocale) || languages[0];

  const ctaText = {
    fr: "Réserver",
    en: "Book Now",
    ar: "احجز الآن",
  }[currentLocale];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          "backdrop-blur-md bg-white/85 dark:bg-[#07090e]/85 border-b border-border/40",
          isScrolled
            ? "shadow-md bg-white/95 dark:bg-[#07090e]/95 border-border/70"
            : "bg-white/85 dark:bg-[#07090e]/85"
        )}
      >
        <div className="mx-auto flex h-16 sm:h-20 lg:h-22 max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2 focus:outline-none rounded-lg py-1"
            onClick={() => setMobileMenuOpen(false)}
          >
            <img
              src="https://hmlrentcar.tn/wp-content/uploads/2025/08/IMG_9268.png"
              alt="Payless Car Rental Tunisia"
              className="h-10 sm:h-14 lg:h-16 w-auto object-contain transition-transform group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fb = document.getElementById("brand-text-fallback");
                if (fb) fb.style.display = "flex";
              }}
            />
            <div id="brand-text-fallback" className="hidden flex-col justify-center items-start">
              <div className="flex items-center tracking-wider font-black text-xl sm:text-2xl text-foreground font-sans">
                <span>PAYLESS</span>
                <span className="inline-block w-2 h-2 rounded-full bg-[#1D4ED8] ml-1 mb-0.5" />
              </div>
              <span className="text-[8px] font-bold tracking-[0.25em] text-muted-foreground uppercase -mt-0.5">
                Car Rental Tunisia
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:text-primary hover:bg-muted/50",
                    isActive
                      ? "text-primary font-semibold bg-muted/60"
                      : "text-foreground/80 hover:text-foreground"
                  )}
                >
                  {item.label[currentLocale]}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Actions: Currency, Language Switcher, CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Currency Display */}
            <div
              title="Devise de facturation: Dinar Tunisien (TND / DT) ou Euro (€)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 border border-border/60 text-xs font-semibold text-foreground/80 tracking-wide select-none"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]" />
              <span>TND</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                (د.ت)
              </span>
              <span className="text-muted-foreground/60">/</span>
              <span className="text-amber-500 font-bold">€</span>
            </div>

            {/* Language Switcher Dropdown */}
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => setLangMenuOpen((prev) => !prev)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/60 bg-background/50 hover:bg-muted text-xs font-medium text-foreground transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  langMenuOpen && "border-primary/50 ring-2 ring-primary/20"
                )}
                aria-expanded={langMenuOpen}
                aria-label="Sélectionner la langue"
              >
                <span className="text-base leading-none">
                  {currentLanguage.flag}
                </span>
                <span className="font-semibold uppercase tracking-wider">
                  {currentLanguage.code}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                    langMenuOpen && "rotate-180"
                  )}
                />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-44 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-xl p-1.5 shadow-xl shadow-black/10 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-2 py-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase border-b border-border/50 mb-1">
                    {currentLocale === "ar"
                      ? "اختر اللغة"
                      : currentLocale === "fr"
                      ? "Langue du site"
                      : "Select Language"}
                  </div>
                  {languages.map((lang) => {
                    const isSelected = lang.code === currentLocale;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLanguageChange(lang.code)}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left rtl:text-right",
                          isSelected
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-foreground hover:bg-muted/70"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{lang.flag}</span>
                          <span>{lang.nativeName}</span>
                        </div>
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 text-primary stroke-[2.5]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CTA Book Now Button */}
            <Link
              href="/booking"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "rounded-lg shadow-md hover:shadow-primary/20 bg-[#1D4ED8] hover:bg-[#1e40af] text-white font-semibold px-4 py-2 flex items-center gap-1.5"
              )}
            >
              <Calendar className="h-4 w-4" />
              <span>{ctaText}</span>
            </Link>
          </div>

          {/* Mobile Right Bar: Language pill & Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Quick Language Toggle */}
            <button
              type="button"
              onClick={() => {
                const next =
                  currentLocale === "fr"
                    ? "en"
                    : currentLocale === "en"
                    ? "ar"
                    : "fr";
                handleLanguageChange(next);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border/70 bg-muted/50 active:bg-muted text-xs font-bold text-foreground transition-transform active:scale-95"
              aria-label="Toggle language"
            >
              <span className="text-sm">{currentLanguage.flag}</span>
              <span className="uppercase text-[11px] font-bold">{currentLanguage.code}</span>
            </button>

            {/* Direct Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Ouvrir le menu"
              className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-slate-100 flex items-center justify-center border border-border/80 shadow-xs active:scale-95 transition-all"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* BULLETPROOF FULLSCREEN MOBILE MENU (Rendered via React Portal directly into body) */}
      {mounted &&
        mobileMenuOpen &&
        createPortal(
          <div
            id="mobile-drawer-portal"
            className="fixed inset-0 z-[999999] flex flex-col bg-white dark:bg-[#07090e] text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
            style={{ width: "100vw", height: "100vh" }}
          >
            {/* Top Bar inside Drawer */}
            <div className="flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6 border-b border-slate-200 dark:border-neutral-800 bg-white/95 dark:bg-[#07090e]/95 backdrop-blur-md shrink-0">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2"
              >
                <img
                  src="https://hmlrentcar.tn/wp-content/uploads/2025/08/IMG_9268.png"
                  alt="Payless Car Rental"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fermer le menu"
                className="h-11 w-11 rounded-2xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 flex items-center justify-center text-slate-700 dark:text-slate-200 active:scale-90 transition-all border border-slate-200 dark:border-neutral-700"
              >
                <X className="h-6 w-6 stroke-[2.2]" />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-6">
              {/* Navigation Links */}
              <nav className="flex flex-col space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3.5 rounded-2xl text-base font-semibold transition-all active:scale-[0.98]",
                        isActive
                          ? "bg-[#1D4ED8] text-white shadow-md shadow-blue-500/25"
                          : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800/80 bg-slate-50 dark:bg-neutral-900/40 border border-slate-200/60 dark:border-neutral-800"
                      )}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-bold tracking-tight">
                          {item.label[currentLocale]}
                        </span>
                      </div>

                      {currentLocale === "ar" ? (
                        <ArrowLeft className={cn("h-4 w-4", isActive ? "text-white/80" : "text-slate-400")} />
                      ) : (
                        <ArrowRight className={cn("h-4 w-4", isActive ? "text-white/80" : "text-slate-400")} />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Language Switcher Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <Globe className="h-3.5 w-3.5 text-blue-600" />
                  <span>
                    {currentLocale === "ar"
                      ? "اختر اللغة"
                      : currentLocale === "fr"
                      ? "Langue du site"
                      : "Language"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {languages.map((lang) => {
                    const isSelected = lang.code === currentLocale;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLanguageChange(lang.code)}
                        className={cn(
                          "flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all border active:scale-95",
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white dark:bg-neutral-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-neutral-700"
                        )}
                      >
                        <span className="text-xl mb-1">{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 24/7 Assistance Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100/60 dark:from-blue-950/40 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-200">
                    <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>
                      {currentLocale === "ar"
                        ? "المساعدة والحجوزات 24/7"
                        : currentLocale === "fr"
                        ? "Service Client & Dépannage 24/7"
                        : "24/7 Support & Bookings"}
                    </span>
                  </div>
                  <a
                    href="tel:+21625120130"
                    className="text-xs text-blue-700 dark:text-blue-300 font-mono font-bold mt-0.5 block hover:underline"
                  >
                    +216 25 120 130
                  </a>
                </div>

                <a
                  href="https://wa.me/21625120130"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 active:scale-95 transition-transform"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Primary Call to Action Button */}
              <div className="pt-2 pb-6">
                <Link
                  href="/booking"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full h-13 rounded-2xl bg-[#1D4ED8] hover:bg-[#1e40af] text-white font-extrabold text-base flex items-center justify-center gap-2.5 shadow-xl shadow-blue-600/30 active:scale-[0.98] transition-all"
                >
                  <Calendar className="h-5 w-5" />
                  <span>{ctaText}</span>
                </Link>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default Header;