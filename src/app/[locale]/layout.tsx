import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Toaster } from "sonner";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppWidget } from "@/components/layout/WhatsAppWidget";
import { AIAgentChat } from "@/components/layout/AIAgentChat";
import "../globals.css";

// Fallback font variables - resilient for offline build environments
const inter = { variable: 'font-sans' };
const playfair = { variable: 'font-serif' };
const cairo = { variable: 'font-arabic' };
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const metadataByLocale: Record<
    string,
    { title: string; description: string; keywords: string[] }
  > = {
    en: {
      title: "PAYLESS CAR RENTAL — Tunisia Premier Fleet 2026",
      description:
        "Experience Tunisia in showroom-grade vehicles. Guaranteed exact models, 0 TND deposit options, and 24/7 VIP concierge curbside delivery in Tunis, Monastir, Enfidha, Sousse, and Sfax.",
      keywords: [
        "car rental Tunisia",
        "car hire Tunis airport",
        "Monastir car rental",
        "SUV rental Tunisia",
        "Enfidha airport car rental",
        "0 deposit car rental Tunisia",
      ],
    },
    fr: {
      title: "PAYLESS LOCATION DE VOITURES — Location de Voitures en Tunisie",
      description:
        "Découvrez la Tunisie au volant de véhicules en état neuf. Modèle exact garanti, caution 0 TND et livraison VIP aéroport à Tunis, Monastir, Enfidha, Sousse et Sfax.",
      keywords: [
        "location voiture tunisie",
        "location voiture aéroport tunis",
        "location voiture monastir",
        "location suv tunisie",
        "location voiture sans caution tunisie",
      ],
    },
    ar: {
      title: "باي ليس لتأجير السيارات — أفضل سيارات تونس 2026",
      description:
        "استأجر أفضل السيارات في تونس مع باي ليس. موديل مضمون 100%، خيارات بدون تأمين، وخدمة تسليم كبار الشخصيات في مطارات تونس، المنستير، إنفيذة، سوسة وصفاقس.",
      keywords: [
        "تأجير سيارات تونس",
        "كراء السيارات مطار تونس",
        "تأجير سيارات المنستير",
        "كراء سيارات بدون تأمين تونس",
      ],
    },
  };

  const current = metadataByLocale[locale] || metadataByLocale.fr;

  return {
    title: {
      default: current.title,
      template: "%s | PAYLESS CAR RENTAL TUNISIA",
    },
    description: current.description,
    keywords: current.keywords,
    metadataBase: new URL("https://payless.tn"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        fr: "/fr",
        ar: "/ar",
      },
    },
    openGraph: {
      title: current.title,
      description: current.description,
      url: `https://payless.tn/${locale}`,
      siteName: "PAYLESS Car Rental Tunisia",
      images: [
        {
          url: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1200&auto=format&fit=crop",
          width: 1200,
          height: 630,
          alt: "PAYLESS Fleet Tunisia",
        },
      ],
      locale: locale === "ar" ? "ar_TN" : locale === "en" ? "en_US" : "fr_TN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: current.title,
      description: current.description,
    },
    robots: {
      index: true,
      follow: true,
    },
    other: {
      "darkreader-lock": "true",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "fr" | "en" | "ar")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const isRtl = locale === "ar";

  return (
    <div
      lang={locale}
      dir={isRtl ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} ${cairo.variable} min-h-screen flex flex-col bg-background text-foreground overflow-x-clip ${
        isRtl ? "font-arabic" : "font-sans"
      }`}
    >
      <NextIntlClientProvider messages={messages} locale={locale}>
        <Header />
        <main className="flex-1 w-full overflow-x-clip">{children}</main>
        <Footer />
        <WhatsAppWidget />
        <AIAgentChat />
        <Toaster richColors position="top-right" />
      </NextIntlClientProvider>
    </div>
  );
}
