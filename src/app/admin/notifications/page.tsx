"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell, BellOff, Check, CheckCheck, Trash2, Car, Calendar,
  CreditCard, AlertTriangle, Package, Clock, RefreshCw, Search,
  LayoutGrid, Table as TableIcon, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminLang } from "@/contexts/AdminLangContext";

interface NotificationItem {
  _id: string;
  type: string;
  title: string | { fr?: string; en?: string; ar?: string };
  message: string | { fr?: string; en?: string; ar?: string };
  isRead: boolean;
  createdAt: string;
  link?: string;
  priority?: "high" | "medium" | "low";
  data?: Record<string, unknown>;
}

function timeAgo(dateStr: string, lang: "fr" | "en"): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (lang === "en") {
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }
  if (diff < 60) return `Il y a ${diff}s`;
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return `Il y a ${Math.floor(diff / 86400)} j`;
}

export default function NotificationsPage() {
  const { lang } = useAdminLang();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications?limit=100");
      const json = await res.json();
      if (json.success && Array.isArray(json.notifications)) {
        setNotifications(json.notifications);
      }
    } catch (e) {
      console.error("Error fetching notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getTitle = (n: NotificationItem): string => {
    if (typeof n.title === "object" && n.title) {
      return (n.title as any)[lang] || n.title.fr || n.title.en || "Notification";
    }
    return (n.title as string) || "Notification";
  };

  const getMessage = (n: NotificationItem): string => {
    if (typeof n.message === "object" && n.message) {
      return (n.message as any)[lang] || n.message.fr || n.message.en || "";
    }
    return (n.message as string) || "";
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered = notifications.filter((n) => {
    if (filter === "unread" && n.isRead) return false;
    if (filter === "high" && n.priority !== "high") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const t = getTitle(n).toLowerCase();
      const m = getMessage(n).toLowerCase();
      return t.includes(q) || m.includes(q);
    }
    return true;
  });

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead: true }),
      });
    } catch (e) {
      console.warn("Error marking notification as read:", e);
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
    } catch (e) {
      console.warn("Error marking all read:", e);
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    try {
      await fetch("/api/admin/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (e) {
      console.warn("Error deleting notification:", e);
    }
  };

  const clearAll = async () => {
    if (confirm(lang === "fr" ? "Supprimer toutes les notifications lues ?" : "Clear all read notifications?")) {
      setNotifications((prev) => prev.filter((n) => !n.isRead));
      try {
        await fetch("/api/admin/notifications", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deleteReadAll: true }),
        });
      } catch (e) {
        console.warn("Error clearing notifications:", e);
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {lang === "fr" ? "Centre de Notifications" : "Notification Center"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            {notifications.length} {lang === "fr" ? "notifications synchronisées en temps réel depuis la base de données" : "notifications synchronized in real-time from database"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View mode toggle: Grid vs Table */}
          <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
              title={lang === "fr" ? "Affichage Grille" : "Grid View"}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{lang === "fr" ? "Grille" : "Grid"}</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
                viewMode === "table"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
              title={lang === "fr" ? "Affichage Tableau" : "Table View"}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{lang === "fr" ? "Tableau" : "Table"}</span>
            </button>
          </div>

          <Button
            onClick={fetchNotifications}
            variant="outline"
            className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 gap-2 text-xs"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            {lang === "fr" ? "Actualiser" : "Refresh"}
          </Button>
          {unreadCount > 0 && (
            <Button
              onClick={markAllRead}
              variant="outline"
              className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 gap-2 text-xs"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {lang === "fr" ? "Tout marquer lu" : "Mark All Read"}
            </Button>
          )}
          <Button
            onClick={clearAll}
            variant="outline"
            className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 gap-2 text-xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {lang === "fr" ? "Purger lues" : "Clear Read"}
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === "fr" ? "Filtrer les notifications par mot-clé, référence..." : "Filter notifications by keyword, booking ref..."}
            className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {(["all", "unread", "high"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex-1 md:flex-initial",
                filter === f
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              )}
            >
              {f === "high"
                ? (lang === "fr" ? "Prioritaires" : "High Priority")
                : f === "unread"
                ? (lang === "fr" ? "Non lues" : "Unread")
                : (lang === "fr" ? "Toutes" : "All")}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Grid vs Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#0f141f] shadow-sm">
          <BellOff className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {lang === "fr" ? "Aucune notification correspondante." : "No notifications found."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((n) => (
            <div
              key={n._id}
              className={cn(
                "rounded-2xl border p-5 flex flex-col justify-between transition-all shadow-sm hover:shadow-md",
                n.isRead
                  ? "bg-white dark:bg-[#0f141f] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  : "bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60 text-slate-900 dark:text-white"
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm leading-tight line-clamp-1">{getTitle(n)}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {timeAgo(n.createdAt, lang)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {getMessage(n)}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                {n.link ? (
                  <a
                    href={n.link}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>{lang === "fr" ? "Voir dossier" : "View"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-1">
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 transition-colors"
                      title={lang === "fr" ? "Marquer comme lu" : "Mark as read"}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(n._id)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900 text-red-500 transition-colors"
                    title={lang === "fr" ? "Supprimer" : "Delete"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE (TABLEAU) VIEW */
        <div className="rounded-2xl bg-white dark:bg-[#0f141f] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">{lang === "fr" ? "Statut" : "Status"}</th>
                  <th className="px-5 py-3.5 font-semibold">{lang === "fr" ? "Titre" : "Title"}</th>
                  <th className="px-5 py-3.5 font-semibold">{lang === "fr" ? "Message / Détails" : "Message / Details"}</th>
                  <th className="px-5 py-3.5 font-semibold">{lang === "fr" ? "Date" : "Date"}</th>
                  <th className="px-5 py-3.5 font-semibold text-right">{lang === "fr" ? "Actions" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {filtered.map((n) => (
                  <tr
                    key={n._id}
                    className={cn(
                      "transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/40",
                      !n.isRead && "bg-blue-50/30 dark:bg-blue-950/20 font-medium"
                    )}
                  >
                    <td className="px-5 py-4 whitespace-nowrap">
                      {!n.isRead ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                          {lang === "fr" ? "Non lu" : "Unread"}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
                          {lang === "fr" ? "Lu" : "Read"}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white max-w-[200px] truncate">
                      {getTitle(n)}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400 max-w-[360px] truncate">
                      {getMessage(n)}
                    </td>
                    <td className="px-5 py-4 text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(n.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {n.link && (
                          <a
                            href={n.link}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                            title={lang === "fr" ? "Ouvrir" : "Open"}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {!n.isRead && (
                          <button
                            onClick={() => markAsRead(n._id)}
                            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                            title={lang === "fr" ? "Marquer comme lu" : "Mark read"}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(n._id)}
                          className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 transition-colors"
                          title={lang === "fr" ? "Supprimer" : "Delete"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
