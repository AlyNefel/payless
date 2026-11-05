"use client";

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

const ARTICLES = [
  {
    "number": 1,
    "titleEn": "Article 1 – USE OF THE CAR AND CONDITIONS REQUIRED FOR RENTAL",
    "titleFr": "Article 1 — Utilisation du véhicule et conditions requises pour la location",
    "content": "All drivers must be at least 23 years old for city cars and 25 years old for compacts, SUVs and sedans and must have held a valid driving licence for at least 24 months.\n\nUpon delivery of the vehicle, the renter and authorized drivers become fully responsible for it according to the terms set out in the article of the Civil Code. The renter is prohibited from participating in any match, race, competition, rally, or any other competition of any kind whatsoever, as well as in tests or preparations. He undertakes not to use the car for illicit purposes or purposes other than those intended by the Manufacturer. The renter undertakes to use the locking and protection control systems at each stop."
  },
  {
    "number": 2,
    "titleEn": "Article 2 – AREA OF USE",
    "titleFr": "Article 2 — Zone d'utilisation (Territoire Tunisien)",
    "content": "The Republic of Tunisia, no vehicle may leave the territory of the Tunisian Republic.\n\nThe tenant undertakes that the vehicle will not be used or driven outside the area provided for in the contract without the prior consent of the lessor.\n\nAny harmful consequences resulting from driving the vehicle outside the declared area would be entirely the responsibility of the tenant, without the latter being able to claim the benefit of the rental company's guarantees, in particular for the reduction of the excess."
  },
  {
    "number": 3,
    "titleEn": "Article 3 – CONDITION OF THE VEHICLE",
    "titleFr": "Article 3 — État du véhicule et propreté",
    "content": "The vehicle is delivered in good working order and bodywork with keys and documents and tires in good condition, spare wheel and normal accessories. By signing the contract, the lessee accepts the vehicle in the condition in which it is and undertakes to return it in the same working order and bodywork with tires, spare wheel and accessories in good condition. The lessee is prohibited from claiming compensation for interruption of service, incident or accident attributed to the condition of the vehicle or tires. The vehicle is given in a perfectly clean condition upon return, it must be returned in the same condition. Otherwise, the cleaning costs will be invoiced. Repairs resulting from abnormal wear, frost, negligence for accidental or undetermined causes remain the responsibility of the lessee unless the latter provides proof that he has committed no fault.\n\nThe lessee remains liable for all non-accidental losses or damages to the vehicle, keys and registration documents, tires (including punctures), rims, tools, instruments, accessories, interior and exterior equipment. He undertakes to reimburse the lessor for the full amount of any damage or loss as well as the costs of immobilizing the vehicle. The amount of repairs will be payable upon estimate. Please note that the lessor will collect the prepayment immediately."
  },
  {
    "number": 4,
    "titleEn": "Article 4 – DURATION OF THE CONTRACT",
    "titleFr": "Article 4 — Durée du contrat et prolongation",
    "content": "The rental agreement is for a fixed period, as specified in the contract. \n\nThe rental agreement is personal and non-transferable. The renter agrees not to allow other people to drive the car.\n\nIn the event of non-return of the vehicle by the due date indicated on the front, the lessor reserves the right to repossess the said vehicle from any location whatsoever, at the sole expense of the lessee, without the latter being able to claim an unfair termination of this rental against it.\n\nIn case of extension, the tenant must go to the departure agency to make the request to the lessor at least 24 hours in advance in order to extend the contract and pay for the extension of the rental in case of exceeding the duration without the agreement of the lessor, the insurance will end on the date and time stipulated in the contract. The lessor reserves the right to refuse any request for extension."
  },
  {
    "number": 5,
    "titleEn": "Article 5 – PROVISION OF THE VEHICLE",
    "titleFr": "Article 5 — Mise à disposition du véhicule",
    "content": "The vehicle is made available to the tenant at the rental company's agencies and must (unless expressly agreed by the latter) be returned to the same location.\n\nThe vehicle is delivered in perfect condition. A joint inspection of the vehicle will be carried out and accepted by the renter. Any reservations must be made at the time of collection and must be noted on the contract."
  },
  {
    "number": 6,
    "titleEn": "Article 6 – RETURN OF THE VEHICLE",
    "titleFr": "Article 6 — Restitution du véhicule",
    "content": "The vehicle must be returned to the departure agency (unless otherwise agreed).\n\nThe vehicle must be returned during the agency's opening hours. The vehicle keys and documents must be handed over to the rental company's staff in person. The renter agrees to return the vehicle in the condition in which it was delivered. Any damage noted upon return will be the responsibility of the renter."
  },
  {
    "number": 7,
    "titleEn": "Article 7 – CUSTODY AND USE",
    "titleFr": "Article 7 — Garde et utilisation responsable",
    "content": "From the time the vehicle is picked up until it is returned, the renter has full control and responsibility for it, whether it is in circulation or parked.\n\nGenerally speaking, the tenant agrees to use the vehicle as a responsible person and in particular:\n\nto allow only authorized drivers whose name appears on the contract to drive,\nto drive it only on roads suitable for traffic,\nnot to participate in any race, rally, test, preparation or competition of any kind whatsoever,\nnot to use it for illicit or immoral purposes or purposes not intended by the manufacturer,\nnot to use it to push, pull or tow another vehicle (except a rental vehicle equipped with special equipment),\nnot to drive it under the influence of alcohol or under the effect of absorbed elements which modify the reflexes essential for driving,\nnot to carry out the transport of people or goods for payment (except utility vehicles),\nnot to use it for driving lessons,\nto use it in accordance with the highway code, customs regulations and generally with legal and regulatory provisions."
  },
  {
    "number": 8,
    "titleEn": "Article 8 – FUEL, LUBRICANT",
    "titleFr": "Article 8 — Carburant et lubrifiants",
    "content": "Fuel is always the responsibility of the renter. Unless otherwise agreed, the vehicle is delivered with a half-full tank and must be returned half-full. If this is not the case, the rental company will provide the service of half-filling the tank. Fuel and the cost of the service will be billed according to the current rate. Any breakdowns resulting from a lack or error in fuel or lubricant remain the responsibility of the renter. The renter must check their levels every 500 km. The latter must constantly check the oil and water levels."
  },
  {
    "number": 9,
    "titleEn": "Article 9 – PAYMENT – prepayment – ​​SECURITY DEPOSIT",
    "titleFr": "Article 9 — Modalités de paiement, prépaiement et caution",
    "content": "The rental and security deposit amounts are determined by the current rates. The renter pays the rental company upon collection of the vehicle or pays online by credit or debit card or bank transfer:\n\nthe amount of the security deposit requested,\nthe estimated cost of the rental, calculated from the daily rate and the expected duration of the rental.\n\nRentals are for 24-hour periods. The renter has a one-hour grace period at the end of the rental period. After this period, a new day will be charged.\n\nBy express agreement, the amount of the security deposit indicated on the front is allocated to the lessor in full ownership up to the amount owed by the tenant to the lessor in the event of:\n\nnon-payment of rent,\ndamage or loss of the vehicle as provided for,\nnon-return of the vehicle, except in cases of force majeure and after formal notice."
  },
  {
    "number": 10,
    "titleEn": "Article 10 – MAINTENANCE – REPAIR",
    "titleFr": "Article 10 — Entretien et réparations mécaniques",
    "content": "Repairs, replacement of parts or tires resulting from normal wear and tear are the responsibility of the lessor: those resulting from abnormal wear and tear, negligence, accidental or undetermined causes remain the responsibility of the lessee and will be carried out without delay by the lessor; their amount will be increased by an immobilization fee. In either case, if the vehicle is immobilized, the lessee may only carry out work at an Official Agent of the vehicle brand, after written agreement from the lessor, and must be given a paid invoice as well as the replaced defective parts."
  },
  {
    "number": 11,
    "titleEn": "Article 11 – INSURANCE",
    "titleFr": "Article 11 — Assurances, sinistres et responsabilités",
    "content": "HOUIMLI RENT A CAR insurance is  third-party insurance .\n\nDuration of insurance:\n\nInsurance is only valid for the rental period and extension.\n\nThe tenant is guaranteed for the following risks:\n\nFor an unlimited amount for accidents caused to people who are in the rental vehicle free of charge,\nAgainst vehicle fire except in the event of serious negligence on the part of the tenant,\nAgainst car theft except in the event of negligence on the part of the tenant,\nAgainst road accidents,  not responsible ,\n\nThe insurance does not cover the following:\n\nThe tenant will be liable for the amount of repairs, or the market value of the vehicle in the following cases:\n\nDriving of the vehicle by a person whose name does not appear on this contract as an authorized driver,\nDamage caused in the absence of an identified third party or who  fled , or as a result of inexcusable fault, or as a result of gross negligence: e.g.:  skidding ,  crossing a continuous line ,  failure to respect speed, collision from behind, failure to respect priority.\nThe insurance does not include damage to  headlights ,  lights ,  mirrors ,  rear window ,  windshield ,  front and rear bumpers  ,  car paint  and any loss of equipment,  papers ,  keys  and towing in the event of an accident are the responsibility of the customer.\nAny damage resulting from an incorrect assessment of the size of the rented vehicle (example: top of roof, rut, lateral rubbing of the bodywork).\nDriving with a blood alcohol level above the legal limit or under the influence of substances absorbed which modify the reflexes essential for driving,\nDrowsiness and falling asleep of the tenant,\nDamage to the interior of the vehicle, to the tires and rims, unless it can be proven that they are not the result of the fault or negligence of the party.\nError in fuel type,\nCollision with a  fixed or moving obstacle  (e.g. road sign, animal or pedestrian, etc.),\nFailure to return the vehicle keys and documents excludes the theft guarantee,\nDamage occurring on construction sites, private roads and roads closed to traffic,\nDamage occurring after the date stipulated in the contract for the return of the vehicle,\nDamage occurring with another vehicle from Houimli Rent a Car Company.\nDamage occurring with a vehicle registered in the name of the lessee or its subsidiaries,\nTheft by an employee of the tenant, or an authorized driver,\nPersonal effects and goods,\nDeclaration received after the vehicle was returned.\n\nDeclaration: In the event of an accident, a complete declaration must be sent to the lessor within 24 hours by registered mail with acknowledgment of receipt. This declaration must include the circumstances, the date and time, the location, the Agent's number, a police or National Guard report, the names and addresses of witnesses, as well as information on the opposing party. Under no circumstances should the lessee discuss liability, nor deal with or enter into any transaction with third parties regarding the accident. The lessee undertakes to immediately communicate to the lessor all documents received following an accident and all useful information."
  },
  {
    "number": 12,
    "titleEn": "Article 12 – COMMERCIAL VEHICLES (SPECIAL RULES)",
    "titleFr": "Article 12 — Véhicules utilitaires (règles spécifiques)",
    "content": "In addition to the obligations provided for in this contract, the tenant:\n\nassumes control of driving and transport operations,\nundertakes to transport in the vehicle only goods that are suitable for the use to which it is assigned,\nrefrain from loading materials likely to damage the vehicle or leave persistent impregnations on it, either by themselves or by their packaging or stowage,\nundertakes to use the vehicle only on the driving areas for which it was designed,\nacknowledges liability for damage suffered by the vehicle, its equipment or its accessories due to loading or unloading,\nwill be responsible for the consequences of any excess of the total rolling weight of the vehicle or the number of authorized persons indicated on the registration document,\nwill return the vehicle empty of any packaging or merchandise."
  },
  {
    "number": 13,
    "titleEn": "Article 13 – CAR PAPERS",
    "titleFr": "Article 13 — Papiers de bord et documents officiels",
    "content": "The tenant will return to the lessor, upon return of the car, all the registration documents relating to the latter; failing which, the rental will continue to be invoiced at the initial price, until production of a certificate of loss and payment of the duplicate costs."
  },
  {
    "number": 14,
    "titleEn": "Article 14 – FINES, INFRINGEMENTS",
    "titleFr": "Article 14 — Amendes, infractions routières et radars",
    "content": "The renter and the authorized driver are responsible for any fines, speeding offenses, speed cameras, tickets, and reports issued against them that are legally their responsibility. They agree to reimburse the rental company for all resulting costs, including impound fees, if the rental company is required to pay them in advance.\n\n \n\n\t\t    \n\t\t\t\t\t\t\t\t\t\n\nAt Payless Car Rental Tunisia, we believe that renting a car should be easy, affordable,  and enjoyable.We are a locally owned and operated car rental company built on trust, transparency, and customer satisfaction. \n\n\t\t\t\n                        \n\n### Opennig hours\n\t\t\tMonday-Friday: 10:00 - 14:00 | 15:30 - 20:00\n\nSaturday: 10:00 - 14:00\n\nSunday: Closed\n\n                        \n\n###"
  }
];

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
              href={`/${locale}/vehicles`}
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
