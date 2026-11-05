const fs = require('fs');

const terms = fs.readFileSync('payless-car-rental/terms_extracted.txt', 'utf8');
const lines = terms.split('\n');
const articles = [];
let current = null;

for (const line of lines) {
  const match = line.match(/^#*\s*(Article\s+\d+\s*[-–—][^#\n]+)/i);
  if (match) {
    if (current) articles.push(current);
    current = { title: match[1].trim(), content: '' };
  } else if (current) {
    current.content += line + '\n';
  }
}
if (current) articles.push(current);

// Titles in French & English
const frTitles = [
  "Article 1 — Utilisation du véhicule et conditions requises pour la location",
  "Article 2 — Zone d'utilisation (Territoire Tunisien)",
  "Article 3 — État du véhicule et propreté",
  "Article 4 — Durée du contrat et prolongation",
  "Article 5 — Mise à disposition du véhicule",
  "Article 6 — Restitution du véhicule",
  "Article 7 — Garde et utilisation responsable",
  "Article 8 — Carburant et lubrifiants",
  "Article 9 — Modalités de paiement, prépaiement et caution",
  "Article 10 — Entretien et réparations mécaniques",
  "Article 11 — Assurances, sinistres et responsabilités",
  "Article 12 — Véhicules utilitaires (règles spécifiques)",
  "Article 13 — Papiers de bord et documents officiels",
  "Article 14 — Amendes, infractions routières et radars"
];

const cleanedArticles = articles.map((a, i) => ({
  number: i + 1,
  titleEn: a.title,
  titleFr: frTitles[i] || a.title,
  content: a.content.replace(/\n{3,}/g, '\n\n').trim()
}));

const pageCode = `"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FileText,
  Shield,
  MapPin,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  Clock,
  Phone,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const ARTICLES = ${JSON.stringify(cleanedArticles, null, 2)};

export default function TermsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const [openArticles, setOpenArticles] = useState<number[]>([1, 2, 3, 9, 11]);
  const [search, setSearch] = useState("");

  const toggleArticle = (num: number) => {
    if (openArticles.includes(num)) {
      setOpenArticles(openArticles.filter((n) => n !== num));
    } else {
      setOpenArticles([...openArticles, num]);
    }
  };

  const expandAll = () => setOpenArticles(ARTICLES.map((a) => a.number));
  const collapseAll = () => setOpenArticles([]);

  const filtered = ARTICLES.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.titleFr.toLowerCase().includes(q) ||
      a.titleEn.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      {/* Background glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-600/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Payless Car Rental Tunisia (Houimli Rent a Car)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            {locale === "en"
              ? "Terms and Conditions of Rental"
              : locale === "ar"
              ? "الشروط والأحكام العامة لتأجير السيارات"
              : "Conditions Générales de Location"}
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400">
            {locale === "en"
              ? "Official rental contract terms applicable to all vehicle hires across Tunisia. Please review these clauses carefully."
              : locale === "ar"
              ? "الشروط والبنود الرسمية المعمول بها لجميع عقود تأجير السيارات في الجمهورية التونسية."
              : "Clauses contractuelles officielles régissant la location de véhicules chez Payless Car Rental en Tunisie. Conforme au Code Civil et à la législation tunisienne."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              60, Avenue de l'UMA, La Soukra, Ariana 2036
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              +216 25 120 130 / +216 24 220 277
            </span>
          </div>
        </div>

        {/* Highlight Banner: 3 Crucial Rules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-blue-500/20 backdrop-blur-sm space-y-1.5">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase">
              <Clock className="w-4 h-4" />
              <span>Âge Minimal & Permis</span>
            </div>
            <p className="text-xs text-slate-300">
              <strong>23 ans</strong> pour les citadines, <strong>25 ans</strong> pour les compactes, berlines et SUV. Permis de conduire valide depuis <strong>≥ 24 mois</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/20 backdrop-blur-sm space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
              <MapPin className="w-4 h-4" />
              <span>Territoire Tunisien Exclusif</span>
            </div>
            <p className="text-xs text-slate-300">
              Circulation autorisée exclusivement en <strong>République Tunisienne</strong>. Interdiction absolue de franchir les frontières du pays.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/20 backdrop-blur-sm space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
              <Sparkles className="w-4 h-4" />
              <span>Kilométrage Illimité</span>
            </div>
            <p className="text-xs text-slate-300">
              Tous nos contrats bénéficient du <strong>kilométrage illimité</strong> et d'une assistance dépannage dédiée <strong>24h/24 & 7j/7</strong>.
            </p>
          </div>
        </div>

        {/* Controls: Search + Expand/Collapse */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher dans les 14 articles (ex: caution, assurance, âge, permis)..."
              className="w-full rounded-xl bg-slate-950 border border-slate-700/80 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={expandAll}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 transition-colors"
            >
              Tout Déplier
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 transition-colors"
            >
              Tout Replier
            </button>
          </div>
        </div>

        {/* Articles Accordion */}
        <div className="space-y-3.5">
          {filtered.map((art) => {
            const isOpen = openArticles.includes(art.number);
            return (
              <div
                key={art.number}
                className="rounded-2xl bg-slate-900/70 border border-slate-800/80 overflow-hidden hover:border-slate-700 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleArticle(art.number)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-bold text-white hover:text-blue-400 transition-colors gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {art.number}
                    </span>
                    <span>{locale === "en" ? art.titleEn : art.titleFr}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 whitespace-pre-line font-light">
                    {art.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Footer */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900/30 via-slate-900 to-blue-900/30 border border-blue-500/30 text-center space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Besoin d'une précision sur les conditions de location ?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Notre équipe commerciale et assistance est disponible 7j/7 pour répondre à toutes vos questions avant votre départ.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="https://wa.me/21625120130"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/25"
            >
              <span>Contacter sur WhatsApp (+216 25 120 130)</span>
            </a>
            <Link
              href={\`/\${locale}/vehicles\`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/25"
            >
              <span>Voir Notre Flotte 2026</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.mkdirSync('payless-car-rental/src/app/[locale]/terms', { recursive: true });
fs.writeFileSync('payless-car-rental/src/app/[locale]/terms/page.tsx', pageCode, 'utf8');
console.log('Successfully created payless-car-rental/src/app/[locale]/terms/page.tsx with all 14 articles!');

