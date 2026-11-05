"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Car,
  CalendarDays,
  CalendarCheck2,
  Users,
  Tag,
  Receipt,
  Mail,
  Settings,
  Search,
  Bell,
  Plus,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  MapPin,
  SlidersHorizontal,
  Sun,
  Moon,
  Globe,
  Wrench,
  ListOrdered,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { AdminLangProvider, useAdminLang } from "@/contexts/AdminLangContext";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  {
    title: "Tableau de bord",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Car Model Manager",
    href: "/admin/fleet",
    icon: Car,
  },
  {
    title: "Reservation Manager",
    href: "/admin/bookings",
    icon: CalendarCheck2,
  },
  {
    title: "Étapes de Réservation",
    href: "/admin/steps",
    icon: ListOrdered,
  },
  {
    title: "Calendrier Flotte",
    href: "/admin/calendar",
    icon: CalendarDays,
  },
  {
    title: "Garage & Vidanges",
    href: "/admin/garage",
    icon: Wrench,
  },
  {
    title: "Location Manager",
    href: "/admin/locations",
    icon: MapPin,
  },
  {
    title: "Extras & Fee Manager",
    href: "/admin/fees",
    icon: SlidersHorizontal,
  },
  {
    title: "Customer Manager",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Payment & Finance Manager",
    href: "/admin/finance",
    icon: Receipt,
  },
  {
    title: "Promos & Coupons",
    href: "/admin/promotions",
    icon: Tag,
  },
  {
    title: "Notification Manager",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    title: "Notifications Email",
    href: "/admin/emails",
    icon: Mail,
  },
  {
    title: "Paramètres Agence",
    href: "/admin/settings",
    icon: Settings,
  },
];

const MANAGERS_MENU = [
  { label: "Car Model Manager", href: "/admin/fleet" },
  { label: "Garage & Vidanges", href: "/admin/garage" },
  { label: "Car Model Prices", href: "/admin/fleet" },
  { label: "Customer Manager", href: "/admin/customers" },
  { label: "Notification Manager", href: "/admin/notifications" },
  { label: "Extras Manager", href: "/admin/fees" },
  { label: "Location Manager", href: "/admin/locations" },
  { label: "Additional Fee Manager", href: "/admin/fees" },
  { label: "Tax Manager", href: "/admin/fees" },
  { label: "Payment Manager", href: "/admin/finance" },
  { label: "Reservation Manager", href: "/admin/bookings" },
  { label: "Étapes de Réservation", href: "/admin/steps" },
];

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "booking" | "maintenance" | "payment";
  unread: boolean;
}

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Nouvelle réservation en attente",
    message: "Sami Ben Salem a réservé Clio 6 pour 4 jours",
    time: "Il y a 10 min",
    type: "booking",
    unread: true,
  },
  {
    id: "notif-2",
    title: "Paiement en ligne validé",
    message: "420 TND reçus pour la réservation #PAY-TN-2026-104",
    time: "Il y a 1 heure",
    type: "payment",
    unread: true,
  },
  {
    id: "notif-3",
    title: "Entretien programmé",
    message: "Kia Sportage requiert révision des 20 000 km",
    time: "Il y a 3 heures",
    type: "maintenance",
    unread: true,
  },
  {
    id: "notif-4",
    title: "Retour véhicule effectué",
    message: "Youssef Gharbi a retourné la Seat Arona à Tunis-Carthage",
    time: "Hier à 18:00",
    type: "booking",
    unread: false,
  },
];

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { lang, setLang, t } = useAdminLang();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showQuickBookingModal, setShowQuickBookingModal] = useState(false);
  const [managersDropdownOpen, setManagersDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Live data for Quick Booking modal (direct reservation)
  const [adminLocations, setAdminLocations] = useState<any[]>([]);
  const [adminVehicles, setAdminVehicles] = useState<any[]>([]);
  const [quickForm, setQuickForm] = useState(() => {
    const pDate = new Date();
    pDate.setDate(pDate.getDate() + 1);
    const rDate = new Date();
    rDate.setDate(rDate.getDate() + 4);
    return {
      customerName: "",
      phone: "",
      email: "",
      vehicleId: "",
      pickupLocationId: "",
      returnLocationId: "",
      pickupDate: pDate.toISOString().split("T")[0],
      returnDate: rDate.toISOString().split("T")[0],
    };
  });
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);
  const [quickError, setQuickError] = useState("");

  useEffect(() => {
    fetch("/api/locations")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.locations) && res.locations.length > 0) {
          setAdminLocations(res.locations);
          setQuickForm((f) => ({
            ...f,
            pickupLocationId: f.pickupLocationId || res.locations[0]._id,
            returnLocationId: f.returnLocationId || res.locations[0]._id,
          }));
        }
      })
      .catch(() => {});

    fetch("/api/vehicles?limit=50")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.vehicles) && res.vehicles.length > 0) {
          setAdminVehicles(res.vehicles);
          setQuickForm((f) => ({
            ...f,
            vehicleId: f.vehicleId || res.vehicles[0]._id,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleQuickBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingQuick(true);
    setQuickError("");
    try {
      const nameParts = quickForm.customerName.trim().split(" ");
      const firstName = nameParts[0] || "Client";
      const lastName = nameParts.slice(1).join(" ") || "Direct";
      const email = quickForm.email.trim() || `client.${Date.now()}@payless.tn`;

      const selectedVeh = adminVehicles.find((v) => v._id === quickForm.vehicleId) || adminVehicles[0];
      const selectedPickup = adminLocations.find((l) => l._id === quickForm.pickupLocationId) || adminLocations[0];
      const selectedReturn = adminLocations.find((l) => l._id === quickForm.returnLocationId) || selectedPickup;

      if (!selectedVeh) {
        setQuickError("Veuillez sélectionner un véhicule.");
        setIsSubmittingQuick(false);
        return;
      }

      const payload = {
        vehicleId: selectedVeh._id,
        pickupLocationId: selectedPickup?._id || "tun-airport",
        returnLocationId: selectedReturn?._id || selectedPickup?._id || "tun-airport",
        pickupDate: quickForm.pickupDate,
        returnDate: quickForm.returnDate,
        customer: {
          firstName,
          lastName,
          email,
          phone: quickForm.phone.trim() || "+216 22 123 456",
          country: "Tunisie",
          preferredLanguage: lang,
        },
        customerNotes: "Réservation directe créée par l'administrateur (Comptoir / Téléphone)",
        customerLanguage: lang,
        accountOption: "guest",
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setShowQuickBookingModal(false);
        router.push("/admin/bookings");
      } else {
        setQuickError(data.error || "Erreur lors de la création de la réservation.");
      }
    } catch (err) {
      setQuickError("Erreur de connexion avec le serveur.");
    } finally {
      setIsSubmittingQuick(false);
    }
  };

  const getNavTitle = (href: string, fallback: string) => {
    if (href === "/admin") return lang === "fr" ? "Tableau de bord" : "Dashboard";
    if (href === "/admin/fleet") return lang === "fr" ? "Gestion Flotte" : "Fleet Manager";
    if (href === "/admin/bookings") return lang === "fr" ? "Réservations" : "Reservations";
    if (href === "/admin/steps") return lang === "fr" ? "Étapes de Réservation" : "Reservation Steps";
    if (href === "/admin/calendar") return lang === "fr" ? "Calendrier Flotte" : "Fleet Calendar";
    if (href === "/admin/garage") return lang === "fr" ? "Garage & Vidanges" : "Garage & Maintenance";
    if (href === "/admin/locations") return lang === "fr" ? "Agences & Villes" : "Agencies & Locations";
    if (href === "/admin/fees") return lang === "fr" ? "Tarifs & Extras" : "Rates & Extras";
    if (href === "/admin/customers") return lang === "fr" ? "Clients (CRM)" : "Customers (CRM)";
    if (href === "/admin/finance") return lang === "fr" ? "Finances & Règlements" : "Finance & Payments";
    if (href === "/admin/promotions") return lang === "fr" ? "Codes Promo" : "Promo Codes";
    if (href === "/admin/notifications") return lang === "fr" ? "Notifications" : "Notifications";
    if (href === "/admin/emails") return lang === "fr" ? "Journal Emails" : "Email Logs";
    if (href === "/admin/settings") return lang === "fr" ? "Paramètres" : "Settings";
    return fallback;
  };

  // Fetch real notifications from database
  useEffect(() => {
    fetch("/api/admin/notifications?limit=8")
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications && data.notifications.length > 0) {
          setNotifications(
            data.notifications.map((n: any) => ({
              id: n._id,
              title: typeof n.title === "object" ? n.title[lang] || n.title.fr || n.title.en : n.title,
              message: typeof n.message === "object" ? n.message[lang] || n.message.fr || n.message.en : n.message,
              time: new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              unread: !n.isRead,
            }))
          );
        }
      })
      .catch(() => {});
  }, [lang]);

  // Load and apply theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("payless-admin-theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("payless-admin-theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
    setManagersDropdownOpen(false);
  }, [pathname]);

  // If path is /admin/login, render children cleanly without the dashboard shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const handleSignOut = async () => {
    document.cookie =
      "authjs.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    await signOut({ redirect: false });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased transition-colors duration-300 selection:bg-blue-600 selection:text-white">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-72 shrink-0 bg-white/95 dark:bg-[#0b0f17]/95 border-r border-slate-200 dark:border-slate-800/80 backdrop-blur-xl sticky top-0 h-screen z-30 transition-colors duration-300">
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-wider text-slate-900 dark:text-white">
                  PAYLESS
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-600/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Car Rental Tunisia
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Gestion Principale
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-600/15 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                    }`}
                  />
                  <span>{getNavTitle(item.href, item.title)}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-600/20">
                A
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  Admin Principal
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  admin@paylesscarrental.com
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-[#0b0f17] border-r border-slate-200 dark:border-slate-800 flex flex-col h-full z-10 p-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Car className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  PAYLESS PRO
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                      isActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-600/20 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{getNavTitle(item.href, item.title)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP NAVIGATION BAR */}
        <header className="h-20 bg-white/80 dark:bg-[#0b0f17]/80 border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 transition-colors duration-300">
          {/* Mobile hamburger & search */}
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Search trigger */}
            <div
              onClick={() => router.push("/admin/bookings")}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs cursor-pointer transition-all hover:border-slate-300 dark:hover:border-slate-700 w-48 sm:w-72 md:w-80 shadow-sm"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="flex-1 truncate">Recherche matricule, client, réf...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                Ctrl+K
              </kbd>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* MANAGERS DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setManagersDropdownOpen(!managersDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#0c1017] text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold shadow-sm border border-slate-200 dark:border-slate-700/80 transition-colors"
                title="Accès direct aux Gestionnaires"
              >
                <span>Managers</span>
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    managersDropdownOpen ? "rotate-90" : ""
                  }`}
                />
              </button>

              {managersDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-50 divide-y divide-slate-100 dark:divide-slate-800/40 animate-in fade-in zoom-in-95 duration-150">
                  <div className="py-1">
                    {MANAGERS_MENU.map((m) => (
                      <Link
                        key={m.label}
                        href={m.href}
                        onClick={() => setManagersDropdownOpen(false)}
                        className="block px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                      >
                        {m.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* LANGUAGE SWITCHER (FR / EN) */}
            <button
              onClick={() => setLang(lang === "fr" ? "en" : "fr")}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all shadow-sm flex items-center gap-1.5 font-bold text-xs"
              title={lang === "fr" ? "Switch to English" : "Passer en Français"}
            >
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="uppercase">{lang}</span>
            </button>

            {/* THEME TOGGLE BUTTON (Dark / Light) */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all shadow-sm flex items-center gap-1.5"
              title={theme === "dark" ? "Passer en Mode Clair" : "Passer en Mode Sombre"}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span className="hidden sm:inline text-[11px] font-semibold text-slate-300">
                    Clair
                  </span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="hidden sm:inline text-[11px] font-semibold text-slate-700">
                    Sombre
                  </span>
                </>
              )}
            </button>

            {/* Quick New Booking Button */}
            <button
              onClick={() => setShowQuickBookingModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">+ Nouvelle Réservation</span>
              <span className="sm:hidden">Créer</span>
            </button>

            {/* Notifications Bell with Popover */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md shadow-red-500/50">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-40">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Notifications Récentes
                      </h4>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Tout marquer lu
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-80 overflow-y-auto py-1">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`py-3 px-2 rounded-xl transition-colors ${
                          n.unread
                            ? "bg-blue-50/50 dark:bg-blue-900/10"
                            : "hover:bg-slate-50 dark:hover:bg-slate-850/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                          {n.message}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-center">
                    <Link
                      href="/admin/notifications"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      Voir le centre de notifications →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Visit Public Site */}
            <Link
              href="/fr"
              target="_blank"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors shadow-sm"
              title="Ouvrir le site public"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Voir le site</span>
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto transition-colors duration-300">
          {children}
        </main>
      </div>

      {/* QUICK NEW BOOKING MODAL */}
      {showQuickBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-700 shadow-2xl p-6 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Créer une Réservation Directe
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Guichet aéroport ou réservation téléphonique
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQuickBookingModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {quickError && (
              <div className="mt-3 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 font-medium">
                {quickError}
              </div>
            )}

            <form
              onSubmit={handleQuickBookingSubmit}
              className="mt-4 space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Nom Complet du Client *
                </label>
                <input
                  type="text"
                  required
                  value={quickForm.customerName}
                  onChange={(e) => setQuickForm({ ...quickForm, customerName: e.target.value })}
                  placeholder="Ex: Mohamed Ben Salem"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Téléphone (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={quickForm.phone}
                    onChange={(e) => setQuickForm({ ...quickForm, phone: e.target.value })}
                    placeholder="+216 22 123 456"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Véhicule Assigné *
                  </label>
                  <select
                    required
                    value={quickForm.vehicleId}
                    onChange={(e) => setQuickForm({ ...quickForm, vehicleId: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  >
                    {adminVehicles.length === 0 ? (
                      <option value="">Chargement de la flotte...</option>
                    ) : (
                      adminVehicles.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.brand} {v.model} ({v.licensePlate || "Disponible"}) - {Math.round((v.pricing?.daily || 7000) / 100)} TND/j
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Agence de Prise en Charge *
                  </label>
                  <select
                    value={quickForm.pickupLocationId}
                    onChange={(e) => setQuickForm({ ...quickForm, pickupLocationId: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    {adminLocations.length === 0 ? (
                      <>
                        <option value="tun-airport">1. Aéroport de Tunis-Carthage (TUN)</option>
                        <option value="mir-airport">2. Aéroport de Monastir (MIR)</option>
                        <option value="soukra-agency">3. Agence La Soukra (Siège)</option>
                        <option value="hammamet-city">4. Hammamet Ville & Yasmine</option>
                        <option value="sousse-city">5. Sousse & Port El Kantaoui</option>
                      </>
                    ) : (
                      adminLocations.map((loc) => {
                        const name = typeof loc.name === "object" ? loc.name[lang] || loc.name.fr || loc.name.en : loc.name;
                        return (
                          <option key={loc._id} value={loc._id}>
                            {name} {loc.city ? `(${loc.city})` : ""}
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Agence de Restitution *
                  </label>
                  <select
                    value={quickForm.returnLocationId}
                    onChange={(e) => setQuickForm({ ...quickForm, returnLocationId: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    {adminLocations.length === 0 ? (
                      <>
                        <option value="tun-airport">1. Aéroport de Tunis-Carthage (TUN)</option>
                        <option value="mir-airport">2. Aéroport de Monastir (MIR)</option>
                        <option value="soukra-agency">3. Agence La Soukra (Siège)</option>
                        <option value="hammamet-city">4. Hammamet Ville & Yasmine</option>
                        <option value="sousse-city">5. Sousse & Port El Kantaoui</option>
                      </>
                    ) : (
                      adminLocations.map((loc) => {
                        const name = typeof loc.name === "object" ? loc.name[lang] || loc.name.fr || loc.name.en : loc.name;
                        return (
                          <option key={loc._id} value={loc._id}>
                            {name} {loc.city ? `(${loc.city})` : ""}
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Date Départ
                  </label>
                  <input
                    type="date"
                    required
                    value={quickForm.pickupDate}
                    onChange={(e) => setQuickForm({ ...quickForm, pickupDate: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Date Retour
                  </label>
                  <input
                    type="date"
                    required
                    value={quickForm.returnDate}
                    onChange={(e) => setQuickForm({ ...quickForm, returnDate: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowQuickBookingModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuick}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/30 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isSubmittingQuick && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>{isSubmittingQuick ? "Création..." : "Confirmer la réservation"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLangProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminLangProvider>
  );
}
