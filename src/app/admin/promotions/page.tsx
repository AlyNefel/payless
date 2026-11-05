"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tag, Plus, ToggleLeft, ToggleRight, Copy, Check, Trash2, Calendar, Percent, DollarSign } from "lucide-react";

const MOCK_PROMOTIONS = [
  { id: "1", name: "Early Bird Booking Special", code: "PAYLESS2026", type: "percentage", value: 15, usageCount: 42, usageLimit: 200, startDate: "2026-11-01", endDate: "2026-12-31", isActive: true, description: "Réservez à l'avance et économisez 15%" },
  { id: "2", name: "Luxury Weekend Special", code: "LUXWEEK20", type: "percentage", value: 20, usageCount: 18, usageLimit: 50, startDate: "2026-11-01", endDate: "2026-11-30", isActive: true, description: "20% de remise sur la flotte de luxe le week-end" },
  { id: "3", name: "Long Term Rental Special", code: "LONGTERM25", type: "percentage", value: 25, usageCount: 7, usageLimit: 100, startDate: "2026-11-01", endDate: "2027-03-31", isActive: true, description: "25% sur les locations de 7 jours et plus" },
  { id: "4", name: "Welcome New Customer", code: "WELCOME10", type: "percentage", value: 10, usageCount: 89, usageLimit: 500, startDate: "2026-01-01", endDate: "2027-01-01", isActive: true, description: "Bienvenue à bord — 10% de remise première réservation" },
  { id: "5", name: "VIP Discount Voucher", code: "VIP500", type: "fixed", value: 5000, usageCount: 12, usageLimit: 30, startDate: "2026-10-01", endDate: "2026-12-31", isActive: false, description: "50 TND de remise fixe pour clients VIP" },
];

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState(MOCK_PROMOTIONS);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newPromo, setNewPromo] = useState({ name: "", code: "", type: "percentage", value: "", usageLimit: "", startDate: "", endDate: "", description: "" });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const togglePromo = (id: string) => {
    setPromotions(ps => ps.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const fmt = (v: number, type: string) => type === "percentage" ? `${v}%` : `${Math.round(v / 100).toLocaleString("fr-FR")} TND`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Promotions & Coupons</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{promotions.filter(p => p.isActive).length} campagnes actives</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Nouveau coupon
        </button>
      </div>

      {/* New Coupon Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <h2 className="font-bold mb-4">Créer un nouveau coupon</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5">Nom de la campagne *</label>
              <input value={newPromo.name} onChange={e => setNewPromo(d => ({ ...d, name: e.target.value }))}
                placeholder="Ex: Été 2027 Special" className="w-full px-3 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Code promo *</label>
              <input value={newPromo.code} onChange={e => setNewPromo(d => ({ ...d, code: e.target.value.toUpperCase() }))}
                placeholder="SUMMER27" className="w-full px-3 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono uppercase" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Type de remise</label>
              <select value={newPromo.type} onChange={e => setNewPromo(d => ({ ...d, type: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                <option value="percentage">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (TND)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Valeur *</label>
              <div className="relative">
                <input type="number" value={newPromo.value} onChange={e => setNewPromo(d => ({ ...d, value: e.target.value }))}
                  placeholder={newPromo.type === "percentage" ? "15" : "50"}
                  className="w-full px-3 py-2.5 pr-10 rounded-xl border border-border focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  {newPromo.type === "percentage" ? "%" : "TND"}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Limite d'utilisations</label>
              <input type="number" value={newPromo.usageLimit} onChange={e => setNewPromo(d => ({ ...d, usageLimit: e.target.value }))}
                placeholder="100" className="w-full px-3 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Description</label>
              <input value={newPromo.description} onChange={e => setNewPromo(d => ({ ...d, description: e.target.value }))}
                placeholder="Description courte" className="w-full px-3 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Date début</label>
              <input type="date" value={newPromo.startDate} onChange={e => setNewPromo(d => ({ ...d, startDate: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Date fin</label>
              <input type="date" value={newPromo.endDate} onChange={e => setNewPromo(d => ({ ...d, endDate: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              Créer le coupon
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted/40 transition-colors">
              Annuler
            </button>
          </div>
        </motion.div>
      )}

      {/* Promotions grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promotions.map(p => (
          <motion.div key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-2xl border-2 p-5 transition-all ${p.isActive ? "border-border" : "border-dashed border-border opacity-60"}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm mb-0.5">{p.name}</h3>
                <p className="text-xs text-muted-foreground">{p.description}</p>
              </div>
              <button onClick={() => togglePromo(p.id)} className="ml-3 flex-shrink-0">
                {p.isActive
                  ? <ToggleRight className="w-8 h-8 text-blue-600" />
                  : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
              </button>
            </div>

            {/* Code */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 flex items-center gap-2 bg-muted/40 border border-border rounded-xl px-3 py-2">
                <Tag className="w-4 h-4 text-blue-600" />
                <span className="font-mono font-bold text-sm tracking-widest">{p.code}</span>
              </div>
              <button onClick={() => copyCode(p.code)}
                className="p-2 border border-border rounded-xl hover:bg-muted/40 transition-colors">
                {copiedCode === p.code ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center mb-4">
              <div className="bg-muted/30 rounded-xl p-2.5">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  {p.type === "percentage" ? <Percent className="w-3.5 h-3.5" /> : <DollarSign className="w-3.5 h-3.5" />}
                </div>
                <div className="font-bold text-base">{fmt(p.value, p.type)}</div>
                <div className="text-xs text-muted-foreground">Remise</div>
              </div>
              <div className="bg-muted/30 rounded-xl p-2.5">
                <div className="font-bold text-base">{p.usageCount} / {p.usageLimit}</div>
                <div className="text-xs text-muted-foreground">Utilisations</div>
                <div className="mt-1 h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (p.usageCount / p.usageLimit) * 100)}%` }} />
                </div>
              </div>
              <div className="bg-muted/30 rounded-xl p-2.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground mx-auto mb-1" />
                <div className="text-xs font-semibold">→ {p.endDate}</div>
                <div className="text-xs text-muted-foreground">Expiration</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 text-xs border border-border rounded-xl hover:bg-muted/40 transition-colors font-medium">
                Modifier
              </button>
              <button className="px-3 py-2 text-xs border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

