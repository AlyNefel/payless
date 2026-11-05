"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import {
  HelpCircle,
  ChevronDown,
  FileText,
  CreditCard,
  MapPin,
  Globe2,
  Calendar,
  CheckCircle2,
} from "lucide-react";

interface FAQItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  question: Record<string, string>;
  answer: Record<string, string>;
  keyPoints?: Record<string, string[]>;
}

const FAQS: FAQItem[] = [
  {
    id: "faq-docs",
    icon: FileText,
    question: {
      fr: "Quels documents sont nécessaires pour louer une voiture ?",
      en: "What documents do I need to rent a vehicle?",
      ar: "ما هي الوثائق المطلوبة لاستئجار سيارة؟",
    },
    answer: {
      fr: "Pour louer chez Payless Tunisie (Houimli Rent a Car), vous devez présenter : un passeport valide (ou CIN pour les résidents tunisiens), un permis de conduire original valable depuis plus de 1 an (2 ans pour certains modèles), et un moyen de paiement ou carte pour la caution. Vous pouvez envoyer vos documents à l'avance sur WhatsApp (+216 25 120 130) pour un retrait express.",
      en: "To rent with Payless Tunisia (Houimli Rent a Car), you need: a valid original Passport (or Tunisian National ID for residents), a valid original Driving License held for at least 1 year, and a card or cash for deposit. You can submit scans via WhatsApp (+216 25 120 130) for express pickup.",
      ar: "لاستئجار سيارة مع باي ليس تونس: جواز سفر ساري المفعول (أو بطاقة التعريف الوطنية للتونسيين)، رخصة قيادة أصلية سارية لأكثر من سنة، وتأمين الضمان. يمكنك إرسال وثائقك مسبقاً عبر الواتساب لتسريع الاستلام.",
    },
    keyPoints: {
      fr: ["Passeport ou CIN en cours de validité", "Permis de conduire valide (min. 1 an)", "Pré-enregistrement express via WhatsApp"],
      en: ["Original Passport or National ID", "Valid Driving License (held min. 1 year)", "Express pre-clearance via WhatsApp"],
      ar: ["جواز سفر أو بطاقة هوية سارية", "رخصة قيادة سارية (أكثر من سنة)", "تسجيل مسبق سريع عبر الواتساب"],
    },
  },
  {
    id: "faq-deposit",
    icon: CreditCard,
    question: {
      fr: "Comment fonctionne la caution et quand est-elle restituée ?",
      en: "How does the security deposit work and when is it refunded?",
      ar: "كيف يعمل الضمان المالي ومتى يتم استرجاعه؟",
    },
    answer: {
      fr: "La caution varie de 600 TND (citadines économiques) à 4 000 TND (SUV premium). Elle est bloquée comme pré-autorisation sur votre carte bancaire ou versée en espèces selon accord, et restituée immédiatement lors de la restitution du véhicule après vérification d'usage.",
      en: "Security deposits range from 600 TND (economy cars) to 4,000 TND (premium SUVs). Placed as a pre-authorization hold on your card or accepted via approved methods, it is immediately released upon vehicle inspection at return.",
      ar: "يتراوح مبلغ التأمين بين 600 د.ت (السيارات الاقتصادية) و4000 د.ت (سيارات الدفع الرباعي الفاخرة). يتم تحريره فور فحص السيارة عند إرجاعها.",
    },
    keyPoints: {
      fr: ["Montants transparents : 600 TND à 4 000 TND", "Restitution immédiate au retour", "Option rachat de franchise disponible"],
      en: ["Transparent deposits: 600 TND to 4,000 TND", "Instant release upon return", "Zero-excess waiver options available"],
      ar: ["مبالغ واضحة: من 600 إلى 4000 د.ت", "إرجاع فوري عند تسليم السيارة", "خيارات إعفاء من التأمين متوفرة"],
    },
  },
  {
    id: "faq-return-city",
    icon: MapPin,
    question: {
      fr: "Puis-je restituer la voiture dans une autre ville ou aéroport en Tunisie ?",
      en: "Can I return the car to a different airport or city in Tunisia?",
      ar: "هل يمكنني إرجاع السيارة في مطار أو مدينة أخرى في تونس؟",
    },
    answer: {
      fr: "Oui, tout à fait. Nous proposons la location aller simple entre nos 11 agences et aéroports en Tunisie : Aéroport de Tunis-Carthage, Aéroport de Monastir, Aéroport d'Enfidha, La Soukra, Grand Tunis, Hammamet, Sousse, Sfax, Bizerte, Nabeul et Jendouba.",
      en: "Yes, absolutely. We offer flexible one-way rentals across all our 11 hubs and international airports in Tunisia: Tunis-Carthage Airport, Monastir Airport, Enfidha Airport, La Soukra, Grand Tunis, Hammamet, Sousse, Sfax, Bizerte, Nabeul, and Jendouba.",
      ar: "نعم بكل تأكيد. نوفر خدمة الإرجاع في مدينة أو مطار مختلف بين جميع فروعنا الـ 11 في تونس: مطار تونس قرطاج، مطار المنستير، مطار النفيضة، سكرة، تونس الكبرى، الحمامات، سوسة، صفاقس، بنزرت، نابل وجندوبة.",
    },
    keyPoints: {
      fr: ["11 agences et aéroports couverts", "Service 24/7 aux aéroports internationaux", "Flexibilité maximale pour vos circuits"],
      en: ["11 agencies & international airports covered", "24/7 curbside service at airports", "Maximum flexibility for your road trips"],
      ar: ["تغطية 11 فرعاً ومطاراً دولياً", "خدمة 24/7 في المطارات", "مرونة تامة لرحلاتكم"],
    },
  },
  {
    id: "faq-license",
    icon: Globe2,
    question: {
      fr: "Les permis de conduire internationaux et étrangers sont-ils acceptés ?",
      en: "Are foreign and international driving licenses accepted in Tunisia?",
      ar: "هل تقبل رخص القيادة الأجنبية والدولية في تونس؟",
    },
    answer: {
      fr: "Oui. La Tunisie reconnaît les permis de conduire nationaux émis en caractères latins ou arabes (France, Union Européenne, Royaume-Uni, Canada, États-Unis, pays du Golfe...). Pour les permis dans d'autres alphabets, un permis de conduire international (PCI) est requis.",
      en: "Yes. Tunisia recognizes all national driving licenses written in Latin or Arabic alphabets (EU, UK, US, Canada, GCC, etc.) for tourists. For licenses written in other scripts, an International Driving Permit (IDP) accompanied by your original license is required.",
      ar: "نعم. تعترف تونس برخص القيادة الصادرة بالحروف اللاتينية أو العربية (فرنسا، الاتحاد الأوروبي، كندا، أمريكا، دول الخليج...). للغات الأخرى يُطلب تصريح قيادة دولي مع الرخصة الأصلية.",
    },
    keyPoints: {
      fr: ["Permis français et européens valables directement", "Permis des pays du Golfe acceptés", "Assistance multilingue 24/7"],
      en: ["EU, French & GCC licenses valid directly", "No extra paperwork needed for tourists", "Multilingual 24/7 assistance"],
      ar: ["رخص الاتحاد الأوروبي ودول الخليج مقبولة مباشرة", "إجراءات مبسطة للسياح", "دعم بعدة لغات على مدار الساعة"],
    },
  },
  {
    id: "faq-min-age",
    icon: Calendar,
    question: {
      fr: "Quel est l'âge minimum requis pour louer un véhicule ?",
      en: "What is the minimum driver age to rent a vehicle?",
      ar: "ما هو الحد الأدنى لعمر السائق لاستئجار سيارة؟",
    },
    answer: {
      fr: "L'âge minimum standard est de 23 ans avec au moins 1 an d'expérience de permis. Pour certaines catégories supérieures et SUV premium, l'âge minimum est de 25 ans avec 2 ans de permis. Les sièges bébé et le 2ème conducteur sont offerts gratuitement.",
      en: "The standard minimum driver age is 23 years old with at least 1 year of driving experience (25 years old for premium SUVs). Baby seats and a 2nd driver are provided free of charge.",
      ar: "الحد الأدنى للسن هو 23 سنة مع سنة واحدة على الأقل من تاريخ الحصول على رخصة القيادة (25 سنة لسيارات الدفع الرباعي الفاخرة). مقاعد الأطفال والسائق الثاني مجاناً.",
    },
    keyPoints: {
      fr: ["23 ans minimum (25 ans pour SUV premium)", "2ème conducteur inclus gratuitement", "Sièges bébé / enfant offerts"],
      en: ["23+ years old (25+ for premium SUVs)", "2nd driver included for free", "Complimentary baby / child seats"],
      ar: ["23 سنة على الأقل (25 سنة للدفع الرباعي)", "سائق إضافي مجاني", "مقاعد أطفال مجانية"],
    },
  },
];

export function FAQSection() {
  const t = useTranslations("home");
  const locale = useLocale();
  const [openId, setOpenId] = useState<string | null>("faq-docs");

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 bg-background relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-500 text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Clear & Transparent</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground font-display tracking-tight">
            {t("faq") || "Questions fréquentes"}
          </h2>

          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            {t("faqSubtitle") ||
              (locale === "fr"
                ? "Tout ce que vous devez savoir pour louer une voiture en Tunisie avec Payless."
                : locale === "ar"
                ? "كل ما تحتاج معرفته لاستئجار سيارة في تونس مع باي ليس."
                : "Everything you need to know about renting a car in Tunisia with PAYLESS.")}
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            const Icon = faq.icon;
            const questionText = faq.question[locale] || faq.question.fr;
            const answerText = faq.answer[locale] || faq.answer.fr;
            const points = faq.keyPoints?.[locale] || faq.keyPoints?.fr;

            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-card border-amber-400/50 shadow-md"
                    : "bg-card/60 border-border/70 hover:border-border hover:bg-card"
                }`}
              >
                {/* Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-5 py-4 sm:p-5 flex items-center justify-between text-left gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isOpen
                          ? "bg-amber-400/20 text-amber-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm sm:text-base text-foreground">
                      {questionText}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-amber-500" : ""
                    }`}
                  />
                </button>

                {/* Accordion Content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-border/40 space-y-3">
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {answerText}
                        </p>

                        {points && points.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                            {points.map((pt, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-1.5 text-xs text-foreground bg-muted/40 px-2.5 py-1.5 rounded-lg border border-border/30"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span className="truncate">{pt}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
