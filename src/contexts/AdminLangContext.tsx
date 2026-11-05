"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export type AdminLang = "fr" | "en";

export const ADMIN_DICT: Record<AdminLang, Record<string, string>> = {
  fr: {
    dashboard: "Tableau de bord",
    fleet: "Gestion de la Flotte",
    bookings: "Gestion des Réservations",
    calendar: "Calendrier Flotte",
    locations: "Agences & Villes",
    fees: "Tarifs & Extras",
    customers: "Gestion Clients (CRM)",
    finance: "Finances & Règlements",
    promotions: "Codes Promo",
    notifications: "Notifications",
    settings: "Paramètres",
    logout: "Déconnexion",
    searchPlaceholder: "Recherche matricule, client, réf...",
    newBooking: "+ Nouvelle Réservation",
    lightMode: "Clair",
    darkMode: "Sombre",
    viewSite: "Voir le site",
    all: "Toutes",
    pending: "En Attente",
    confirmed: "Confirmées",
    active: "En Cours",
    completed: "Clôturées",
    cancelled: "Annulées",
    totalAmount: "Montant Total",
    fiscalStamp: "Timbre fiscal (1 DT)",
    lf2026: "Contribution LF 2026 (2 DT/j)",
    tva: "TVA 0% (TTC)",
    search: "Rechercher",
    filter: "Filtrer",
    status: "Statut",
    actions: "Actions",
    print: "Imprimer",
    close: "Fermer",
  },
  en: {
    dashboard: "Dashboard",
    fleet: "Fleet Manager",
    bookings: "Reservation Manager",
    calendar: "Fleet Calendar",
    locations: "Agencies & Locations",
    fees: "Pricing & Extras",
    customers: "Customer Manager (CRM)",
    finance: "Finance & Payments",
    promotions: "Promo Codes",
    notifications: "Notifications",
    settings: "Settings",
    logout: "Sign Out",
    searchPlaceholder: "Search license plate, customer, ref...",
    newBooking: "+ New Reservation",
    lightMode: "Light",
    darkMode: "Dark",
    viewSite: "Visit Website",
    all: "All",
    pending: "Pending",
    confirmed: "Confirmed",
    active: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
    totalAmount: "Total Amount",
    fiscalStamp: "Fiscal Stamp (1 TND)",
    lf2026: "Contribution LF 2026 (2 TND/d)",
    tva: "VAT 0% (Included)",
    search: "Search",
    filter: "Filter",
    status: "Status",
    actions: "Actions",
    print: "Print",
    close: "Close",
  },
};

interface AdminLangContextType {
  lang: AdminLang;
  setLang: (l: AdminLang) => void;
  t: (key: string) => string;
}

const AdminLangContext = createContext<AdminLangContextType>({
  lang: "fr",
  setLang: () => {},
  t: (k: string) => k,
});

export function AdminLangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("payless-admin-lang") as AdminLang | null;
        if (saved === "fr" || saved === "en") return saved;
      } catch {
        // ignore
      }
    }
    return "fr";
  });

  const setLang = (l: AdminLang) => {
    setLangState(l);
    try {
      localStorage.setItem("payless-admin-lang", l);
    } catch {
      // ignore
    }
  };

  const t = (key: string): string => {
    return ADMIN_DICT[lang]?.[key] || ADMIN_DICT.fr[key] || key;
  };

  return (
    <AdminLangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </AdminLangContext.Provider>
  );
}

export function useAdminLang() {
  return useContext(AdminLangContext);
}
