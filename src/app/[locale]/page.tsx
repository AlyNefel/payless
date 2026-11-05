import React from "react";
import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { BookingSearchBox } from "@/components/home/BookingSearchBox";
import { FeaturedFleet } from "@/components/home/FeaturedFleet";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { RentalSteps } from "@/components/home/RentalSteps";
import { PromotionsBanner } from "@/components/home/PromotionsBanner";
import { Testimonials } from "@/components/home/Testimonials";
import { FAQSection } from "@/components/home/FAQSection";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Cinematic Hero Section */}
      <Hero />

      {/* 2. Glassmorphic Booking Search Box docked on Hero */}
      <BookingSearchBox />

      {/* 3. Showcase Fleet Grid with Interactive Category Tabs */}
      <FeaturedFleet />

      {/* 4. The PAYLESS Distinction / Why Choose Us Editorial Cards */}
      <WhyChooseUs />

      {/* 5. 3-Step Seamless Rental Progression */}
      <RentalSteps />

      {/* 6. VIP Seasonal Promotional Banner with One-Click Copy */}
      <PromotionsBanner />

      {/* 7. Verified Guest Testimonials with Ratings */}
      <Testimonials />

      {/* 8. Comprehensive Expandable FAQ Accordion */}
      <FAQSection />
    </div>
  );
}
