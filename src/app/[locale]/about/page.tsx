"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Star, Clock, Globe, Award, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [locale, setLocale] = React.useState("fr");
  const router = useRouter();

  React.useEffect(() => {
    params.then(({ locale }) => setLocale(locale));
  }, [params]);

  const isRTL = locale === "ar";

  const t = {
    hero: {
      badge: { fr: "Notre histoire", en: "Our Story", ar: "قصتنا" },
      title: { fr: "Votre partenaire mobilité premium en Tunisie", en: "Your Premium Mobility Partner in Tunisia", ar: "شريكك المتميز في التنقل بتونس" },
      sub: { fr: "Depuis 2015, PAYLESS redéfinit l'expérience de location de voitures en Tunisie avec une flotte d'exception et un service VIP.", en: "Since 2015, PAYLESS has been redefining the car rental experience in Tunisia with an exceptional fleet and VIP service.", ar: "منذ عام 2015، تعيد PAYLESS تعريف تجربة تأجير السيارات في تونس بأسطول استثنائي وخدمة VIP." },
    },
    mission: { fr: "Notre Mission", en: "Our Mission", ar: "مهمتنا" },
    missionText: { fr: "Rendre le voyage en Tunisie inoubliable en proposant des véhicules premium, un service irréprochable et des tarifs transparents.", en: "Make travel in Tunisia unforgettable by offering premium vehicles, impeccable service, and transparent pricing.", ar: "جعل السفر في تونس لا يُنسى من خلال تقديم سيارات متميزة وخدمة لا تشوبها شائبة وأسعار شفافة." },
    stats: [
      { value: "5,000+", label: { fr: "Clients satisfaits", en: "Happy Clients", ar: "عملاء سعداء" } },
      { value: "50+", label: { fr: "Véhicules en flotte", en: "Fleet Vehicles", ar: "سيارات الأسطول" } },
      { value: "11+", label: { fr: "Agences & Villes", en: "Agencies & Cities", ar: "وكالات ومدن" } },
      { value: "9+", label: { fr: "Années d'expérience", en: "Years of Experience", ar: "سنوات من الخبرة" } },
    ],
    values: [
      { icon: Shield, title: { fr: "Fiabilité", en: "Reliability", ar: "الموثوقية" }, text: { fr: "Des véhicules vérifiés, entretenus et assurés.", en: "Verified, maintained and insured vehicles.", ar: "سيارات موثوقة وصيانتها مضمونة ومؤمنة عليها." } },
      { icon: Star, title: { fr: "Excellence", en: "Excellence", ar: "التميز" }, text: { fr: "Un service 5 étoiles à chaque étape.", en: "5-star service at every step.", ar: "خدمة 5 نجوم في كل خطوة." } },
      { icon: Clock, title: { fr: "Ponctualité", en: "Punctuality", ar: "الدقة" }, text: { fr: "Livraison à l'heure, chaque fois.", en: "On-time delivery, every time.", ar: "التسليم في الوقت المحدد دائماً." } },
      { icon: Globe, title: { fr: "Transparence", en: "Transparency", ar: "الشفافية" }, text: { fr: "Tarifs clairs, sans frais cachés.", en: "Clear pricing, no hidden fees.", ar: "أسعار واضحة بدون رسوم خفية." } },
      { icon: HeartHandshake, title: { fr: "Confiance", en: "Trust", ar: "الثقة" }, text: { fr: "Milliers de clients fidèles nous font confiance.", en: "Thousands of loyal clients trust us.", ar: "آلاف العملاء الأوفياء يثقون بنا." } },
      { icon: Award, title: { fr: "Qualité", en: "Quality", ar: "الجودة" }, text: { fr: "Que des véhicules haut de gamme.", en: "Only top-tier vehicles.", ar: "سيارات فاخرة فقط." } },
    ],
    cta: { fr: "Réserver un véhicule", en: "Book a Vehicle", ar: "احجز سيارة" },
    contact: { fr: "Nous contacter", en: "Contact Us", ar: "تواصل معنا" },
  };

  const g = (obj: Record<string, string>) => obj[locale as "fr" | "en" | "ar"] ?? obj.fr;

  return (
    <div className={cn("min-h-screen bg-[#0A0A0B] text-white", isRTL && "rtl")}>
      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1D4ED8]/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-2 mb-6">
              <Star className="h-4 w-4 text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-sm font-medium">{g(t.hero.badge)}</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold font-playfair mb-6 leading-tight">{g(t.hero.title)}</h1>
            <p className="text-xl text-white/60 leading-relaxed max-w-2xl mx-auto">{g(t.hero.sub)}</p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-white/10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {t.stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl font-bold text-[#D4AF37] mb-1">{stat.value}</p>
              <p className="text-white/50 text-sm">{g(stat.label)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold font-playfair text-white mb-6">{g(t.mission)}</h2>
            <p className="text-xl text-white/60 leading-relaxed">{g(t.missionText)}</p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-white/2">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold font-playfair text-white text-center mb-12"
          >
            {locale === "fr" ? "Nos Valeurs" : locale === "ar" ? "قيمنا" : "Our Values"}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.values.map((val, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#1D4ED8]/30 transition-all"
              >
                <div className="w-12 h-12 bg-[#1D4ED8]/10 rounded-xl flex items-center justify-center mb-4">
                  <val.icon className="h-6 w-6 text-[#1D4ED8]" />
                </div>
                <h3 className="font-semibold text-white mb-2">{g(val.title)}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{g(val.text)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold font-playfair text-white mb-4">
              {locale === "fr" ? "Prêt pour votre prochain voyage?" : locale === "ar" ? "هل أنت مستعد لرحلتك القادمة؟" : "Ready for your next journey?"}
            </h2>
            <p className="text-white/50 mb-8">
              {locale === "fr" ? "Réservez en quelques minutes avec confirmation immédiate." : locale === "ar" ? "احجز في دقائق مع تأكيد فوري." : "Book in minutes with instant confirmation."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push(`/${locale}/vehicles`)}
                className="h-12 px-8 bg-[#1D4ED8] hover:bg-[#1e40af] text-white font-semibold rounded-xl"
              >
                {g(t.cta)}
              </Button>
              <Button
                onClick={() => router.push(`/${locale}/contact`)}
                variant="outline"
                className="h-12 px-8 border-white/20 text-white hover:bg-white/5 rounded-xl"
              >
                {g(t.contact)}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

