"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";

const BRANCHES = [
  { code: "TUN", city: { fr: "Tunis", en: "Tunis", ar: "تونس" }, airport: { fr: "Aéroport de Tunis-Carthage (24/7)", en: "Tunis-Carthage Airport (24/7)", ar: "مطار تونس قرطاج الدولي (24/7)" }, phone: "+216 22 123 456", hours: "24h/24 - 7j/7" },
  { code: "MIR", city: { fr: "Monastir", en: "Monastir", ar: "المنستير" }, airport: { fr: "Aéroport Monastir Habib Bourguiba", en: "Monastir Habib Bourguiba Airport", ar: "مطار الحبيب بورقيبة المنستير" }, phone: "+216 22 123 457", hours: "06:00 - 00:00" },
  { code: "NBE", city: { fr: "Enfidha", en: "Enfidha", ar: "النفيضة" }, airport: { fr: "Aéroport Enfidha-Hammamet", en: "Enfidha-Hammamet Airport", ar: "مطار النفيضة الحمامات" }, phone: "+216 22 123 458", hours: "06:00 - 23:00" },
  { code: "SKR", city: { fr: "La Soukra", en: "La Soukra (HQ)", ar: "سكرة (المقر)" }, airport: { fr: "Agence Siège La Soukra / Grand Tunis", en: "HQ Agency La Soukra / Greater Tunis", ar: "وكالة المقر بسكرة / تونس الكبرى" }, phone: "+216 71 888 999", hours: "08:00 - 20:00" },
  { code: "HAM", city: { fr: "Hammamet", en: "Hammamet", ar: "الحمامات" }, airport: { fr: "Hammamet Ville & Yasmine Resort", en: "Hammamet & Yasmine Resort", ar: "الحمامات وياسمين الحمامات" }, phone: "+216 72 222 333", hours: "08:00 - 20:00" },
  { code: "SSX", city: { fr: "Sousse", en: "Sousse", ar: "سوسة" }, airport: { fr: "Sousse & Port El Kantaoui", en: "Sousse & Port El Kantaoui", ar: "سوسة وميناء القنطاوي" }, phone: "+216 73 333 444", hours: "08:00 - 20:00" },
  { code: "SFA", city: { fr: "Sfax", en: "Sfax", ar: "صفاقس" }, airport: { fr: "Sfax Ville & Centre d'Affaires", en: "Sfax City Center", ar: "مدينة صفاقس ومركز الأعمال" }, phone: "+216 74 444 555", hours: "08:00 - 20:00" },
  { code: "BIZ", city: { fr: "Bizerte", en: "Bizerte", ar: "بنزرت" }, airport: { fr: "Bizerte Ville & Vieux Port", en: "Bizerte City & Old Port", ar: "مدينة بنزرت والميناء القديم" }, phone: "+216 72 444 555", hours: "08:00 - 20:00" },
];

export default function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [locale, setLocale] = React.useState("fr");
  const { settings } = useCompanySettings();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    params.then(({ locale }) => setLocale(locale));
  }, [params]);

  const isRTL = locale === "ar";

  const t = {
    title: { fr: "Contactez-nous", en: "Contact Us", ar: "اتصل بنا" },
    subtitle: { fr: "Notre équipe est disponible pour vous aider", en: "Our team is here to help you", ar: "فريقنا متاح لمساعدتك" },
    name: { fr: "Nom complet", en: "Full Name", ar: "الاسم الكامل" },
    email: { fr: "Email", en: "Email", ar: "البريد الإلكتروني" },
    phone: { fr: "Téléphone", en: "Phone", ar: "الهاتف" },
    subject: { fr: "Sujet", en: "Subject", ar: "الموضوع" },
    message: { fr: "Message", en: "Message", ar: "الرسالة" },
    send: { fr: "Envoyer le message", en: "Send Message", ar: "إرسال الرسالة" },
    success: { fr: "Message envoyé avec succès!", en: "Message sent successfully!", ar: "تم إرسال الرسالة بنجاح!" },
    branches: { fr: "Nos agences", en: "Our Branches", ar: "وكالاتنا" },
    whatsapp: { fr: "WhatsApp direct", en: "WhatsApp Direct", ar: "واتساب مباشر" },
    emergency: { fr: "Assistance d'urgence 24h/24", en: "24/7 Emergency Roadside Assistance", ar: "مساعدة طارئة على الطريق 24/7" },
  };

  const getText = (key: keyof typeof t) => t[key][locale as "fr" | "en" | "ar"] ?? t[key].fr;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, locale }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setSuccess(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("min-h-screen bg-[#0A0A0B] text-white pt-20 sm:pt-24 pb-16 sm:pb-20", isRTL && "rtl")}>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10 sm:mb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-3 sm:mb-4 tracking-tight">
            {getText("title")}
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-white/60 max-w-2xl mx-auto">{getText("subtitle")}</p>
        </motion.div>
      </div>

      {/* Emergency Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 sm:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-[#1D4ED8]/10 border border-[#1D4ED8]/30 rounded-2xl p-4 sm:p-6 flex items-center justify-between flex-wrap gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1D4ED8]/20 rounded-full flex items-center justify-center shrink-0">
              <Phone className="h-5 w-5 text-[#1D4ED8]" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm sm:text-base">{getText("emergency")}</p>
              <p className="text-white/60 text-xs sm:text-sm font-mono">{settings.phone}</p>
            </div>
          </div>
          <a
            href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto justify-center flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#20b958] transition-colors text-sm shadow-md shadow-emerald-900/30"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{getText("whatsapp")}</span>
          </a>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16 sm:mb-20">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-6">
              {locale === "fr" ? "Envoyez-nous un message" : locale === "ar" ? "أرسل لنا رسالة" : "Send Us a Message"}
            </h2>

            {success ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="h-16 w-16 text-emerald-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{getText("success")}</h3>
                <p className="text-white/50 text-sm">
                  {locale === "fr" ? "Nous vous répondrons dans les 24 heures." : locale === "ar" ? "سنرد عليك خلال 24 ساعة." : "We'll reply within 24 hours."}
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-6 text-[#1D4ED8] hover:underline text-sm font-semibold"
                >
                  {locale === "fr" ? "Envoyer un autre message" : locale === "ar" ? "إرسال رسالة أخرى" : "Send another message"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wide">{getText("name")}</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full h-11 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] placeholder:text-white/20"
                      placeholder={getText("name")}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wide">{getText("phone")}</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full h-11 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] placeholder:text-white/20"
                      placeholder="+216 25..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wide">{getText("email")}</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] placeholder:text-white/20"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wide">{getText("subject")}</label>
                  <input
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] placeholder:text-white/20"
                    placeholder={getText("subject")}
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wide">{getText("message")}</label>
                  <textarea
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={5}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] placeholder:text-white/20 resize-none"
                    placeholder={getText("message")}
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#1D4ED8] hover:bg-[#1e40af] text-white font-semibold rounded-xl"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {getText("send")}
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-6"
        >
          {/* Quick contact items */}
          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: Mail, title: "Email Contact", value: settings.email, href: `mailto:${settings.email}` },
              ...(settings.supportEmail && settings.supportEmail !== settings.email
                ? [{ icon: Mail, title: locale === "fr" ? "Email Support / Réservations" : locale === "ar" ? "البريد الإلكتروني للدعم" : "Support Email", value: settings.supportEmail, href: `mailto:${settings.supportEmail}` }]
                : []),
              { icon: Phone, title: locale === "fr" ? "Téléphone principal" : locale === "ar" ? "الهاتف الرئيسي" : "Main Phone", value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}` },
              { icon: MessageCircle, title: "WhatsApp", value: settings.whatsapp, href: `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}` },
              ...(settings.address
                ? [{ icon: MapPin, title: locale === "fr" ? "Siège social" : locale === "ar" ? "المقر الرئيسي" : "Headquarters", value: `${settings.address}, ${settings.city}`, href: undefined }]
                : []),
              { icon: Clock, title: locale === "fr" ? "Horaires" : locale === "ar" ? "أوقات العمل" : "Business Hours", value: locale === "fr" ? "Lun-Dim: 24h/24" : locale === "ar" ? "الاثنين-الأحد: 24/24" : "Mon-Sun: 24/7", href: undefined },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#1D4ED8]/30 transition-colors">
                <div className="w-10 h-10 bg-[#1D4ED8]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5 text-[#1D4ED8]" />
                </div>
                <div>
                  <p className="text-white/40 text-xs">{item.title}</p>
                  {item.href ? (
                    <a href={item.href} className="text-white text-sm hover:text-[#1D4ED8] transition-colors">{item.value}</a>
                  ) : (
                    <p className="text-white text-sm">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Branches */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">{getText("branches")}</h3>
            <div className="space-y-3">
              {BRANCHES.map((branch) => (
                <div
                  key={branch.code}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#1D4ED8]/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#1D4ED8]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin className="h-4 w-4 text-[#1D4ED8]" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">
                          {branch.city[locale as "fr" | "en" | "ar"] ?? branch.city.fr}
                        </p>
                        <p className="text-white/50 text-xs">
                          {branch.airport[locale as "fr" | "en" | "ar"] ?? branch.airport.fr}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-white/40 border border-white/10 rounded px-2 py-0.5 font-mono">{branch.code}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between flex-wrap gap-2 text-xs text-white/50">
                    <a href={`tel:${branch.phone.replace(/\s/g, "")}`} className="flex items-center gap-1 hover:text-white transition-colors">
                      <Phone className="h-3 w-3" />
                      <span>{branch.phone}</span>
                    </a>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{branch.hours}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

