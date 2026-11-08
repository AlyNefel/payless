"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CompanySettings {
  agencyName: string;
  legalName: string;
  phone: string;
  whatsapp: string;
  email: string;
  supportEmail: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  website: string;
  outOfTownReturnFee: number;
  differentLocationFee: number;
  timbreFiscal: number;
  contributionLF2026: number;
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  agencyName: "PAYLESS CAR RENTAL TUNISIE",
  legalName: "Houimli Rent a Car SARL",
  phone: "+216 25 120 130",
  whatsapp: "+216 25 120 130",
  email: "contact@paylesscarrental.tn",
  supportEmail: "support@paylesscarrental.tn",
  address: "Agence La Soukra, Siège Social Ariana",
  city: "Tunis",
  postalCode: "2036",
  country: "Tunisie",
  website: "https://paylesscarrental.tn",
  outOfTownReturnFee: 100,
  differentLocationFee: 50,
  timbreFiscal: 1,
  contributionLF2026: 2,
};

const CompanySettingsContext = createContext<{
  settings: CompanySettings;
  refreshSettings: () => Promise<void>;
}>({
  settings: DEFAULT_COMPANY_SETTINGS,
  refreshSettings: async () => {},
});

export function CompanySettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_COMPANY_SETTINGS);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings?t=" + Date.now());
      const json = await res.json();
      if (json.success && json.settings) {
        const s = json.settings;
        setSettings({
          agencyName: (s.agencyName as string) || DEFAULT_COMPANY_SETTINGS.agencyName,
          legalName: (s.legalName as string) || DEFAULT_COMPANY_SETTINGS.legalName,
          phone: (s.phone as string) || DEFAULT_COMPANY_SETTINGS.phone,
          whatsapp: (s.whatsapp as string) || (s.phone as string) || DEFAULT_COMPANY_SETTINGS.whatsapp,
          email: (s.email as string) || DEFAULT_COMPANY_SETTINGS.email,
          supportEmail: (s.supportEmail as string) || DEFAULT_COMPANY_SETTINGS.supportEmail,
          address: (s.address as string) || DEFAULT_COMPANY_SETTINGS.address,
          city: (s.city as string) || DEFAULT_COMPANY_SETTINGS.city,
          postalCode: (s.postalCode as string) || DEFAULT_COMPANY_SETTINGS.postalCode,
          country: (s.country as string) || DEFAULT_COMPANY_SETTINGS.country,
          website: (s.website as string) || DEFAULT_COMPANY_SETTINGS.website,
          outOfTownReturnFee: Number(s.outOfTownReturnFee || DEFAULT_COMPANY_SETTINGS.outOfTownReturnFee),
          differentLocationFee: Number(s.differentLocationFee !== undefined ? s.differentLocationFee : DEFAULT_COMPANY_SETTINGS.differentLocationFee),
          timbreFiscal: Number(s.timbreFiscal !== undefined ? s.timbreFiscal : DEFAULT_COMPANY_SETTINGS.timbreFiscal),
          contributionLF2026: Number(s.contributionLF2026 !== undefined ? s.contributionLF2026 : DEFAULT_COMPANY_SETTINGS.contributionLF2026),
        });
      }
    } catch {
      // Keep defaults gracefully
    }
  };

  useEffect(() => {
    fetchSettings();

    const handleUpdate = () => {
      fetchSettings();
    };

    window.addEventListener("company-settings-updated", handleUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "company-settings-updated") {
        fetchSettings();
      }
    });

    return () => {
      window.removeEventListener("company-settings-updated", handleUpdate);
    };
  }, []);

  return (
    <CompanySettingsContext.Provider value={{ settings, refreshSettings: fetchSettings }}>
      {children}
    </CompanySettingsContext.Provider>
  );
}

export function useCompanySettings() {
  return useContext(CompanySettingsContext);
}
