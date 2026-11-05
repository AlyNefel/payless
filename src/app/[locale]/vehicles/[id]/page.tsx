import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { VehicleDetailClient } from "./VehicleDetailClient";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Vehicle Details | PAYLESS Car Rental`,
    description: "View vehicle specifications, pricing and book your rental.",
  };
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <VehicleDetailClient vehicleId={id} locale={locale} />;
}

