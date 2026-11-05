"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import NextLink from "next/link";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Globe,
  Lock,
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
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇲🇦" },
];

export function Header() {
  const currentLocale = useLocale() as "fr" | "en" | "ar";
  const pathname = usePathname();
  const router = useRouter();

  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [langMenuOpen, setLangMenuOpen] = React.useState(false);
  const langMenuRef = React.useRef<HTMLDivElement>(null);

  // Scroll listener for enhanced elevation styling
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

  // Click outside to close language menu
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

  // Lock body scroll when mobile menu is active
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
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

  const adminText = {
    fr: "Espace Admin",
    en: "Admin Portal",
    ar: "لوحة التحكم",
  }[currentLocale];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        "backdrop-blur-md bg-white/80 dark:bg-black/80 border-b border-border/40",
        isScrolled
          ? "shadow-md bg-white/95 dark:bg-black/95 border-border/70"
          : "bg-white/80 dark:bg-black/80"
      )}
    >
      <div className="mx-auto flex h-20 sm:h-24 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo - Replaced with official Payless / HML Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg py-1"
          onClick={() => setMobileMenuOpen(false)}
        >
          <img
            src="https://hmlrentcar.tn/wp-content/uploads/2025/08/IMG_9268.png"
            alt="Payless Car Rental Tunisia"
            className="h-12 sm:h-16 md:h-18 w-auto object-contain transition-transform group-hover:scale-105"
            onError={(e) => {
              // Graceful fallback if offline
              e.currentTarget.style.display = "none";
              const fb = document.getElementById("brand-text-fallback");
              if (fb) fb.style.display = "flex";
            }}
          />
          <div id="brand-text-fallback" className="hidden flex-col justify-center items-start">
            <div className="flex items-center tracking-wider font-black text-2xl sm:text-3xl text-foreground font-sans">
              <span>PAYLESS</span>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#1D4ED8] ml-1 mb-0.5 shadow-sm shadow-blue-500/50" />
            </div>
            <span className="text-[8.5px] sm:text-[9.5px] font-bold tracking-[0.3em] text-muted-foreground uppercase -mt-1 group-hover:text-primary transition-colors">
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

        {/* Desktop Right Actions: Currency, Language Switcher, Admin, CTA */}
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

        {/* Mobile Hamburger Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Quick Language Toggle on Mobile Header */}
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
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/60 bg-muted/40 text-xs font-bold"
            aria-label="Toggle language"
          >
            <span>{currentLanguage.flag}</span>
            <span className="uppercase">{currentLanguage.code}</span>
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Menu"
            className="relative h-10 w-10 rounded-lg text-foreground"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 z-50 bg-background/95 backdrop-blur-2xl border-t border-border/50 overflow-y-auto animate-in fade-in-20 duration-200">
          <div className="flex flex-col p-6 space-y-6 max-w-md mx-auto min-h-[calc(100vh-5rem)] justify-between">
            <div className="space-y-4">
              {/* Nav links */}
              <div className="flex flex-col space-y-1">
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
                        "flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-150",
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label[currentLocale]}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Language Switcher Section */}
              <div className="pt-4 border-t border-border/60">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
                  <Globe className="h-3.5 w-3.5" />
                  <span>
                    {currentLocale === "ar"
                      ? "اللغة"
                      : currentLocale === "fr"
                      ? "Langue"
                      : "Language"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageChange(lang.code)}
                      className={cn(
                        "flex flex-col items-center justify-center py-2.5 px-3 rounded-xl border text-xs font-medium transition-all",
                        lang.code === currentLocale
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                          : "border-border/60 hover:bg-muted text-foreground"
                      )}
                    >
                      <span className="text-xl mb-1">{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency Display Bar */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-xs text-foreground/80">
                <span className="text-muted-foreground">
                  {currentLocale === "ar"
                    ? "العملة الرسمية"
                    : currentLocale === "fr"
                    ? "Devise standard"
                    : "Standard Currency"}
                </span>
                <span className="font-bold flex items-center gap-1.5 text-foreground">
                  <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
                  TND (DT / د.ت) · EUR (€)
                </span>
              </div>
            </div>

            {/* Bottom Actions: CTA */}
            <div className="pt-6 border-t border-border/60 pb-8">
              <Link
                href="/booking"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "w-full h-12 text-base font-semibold bg-[#1D4ED8] hover:bg-[#1e40af] text-white shadow-lg shadow-blue-500/20 rounded-xl flex items-center justify-center gap-2"
                )}
              >
                <Calendar className="h-5 w-5" />
                <span>{ctaText}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
