import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price from minor or major units to display string in TND / EUR
 */
export function formatPrice(
  amount: number,
  currency = "TND",
  locale = "fr-TN"
): string {
  const majorUnits = amount > 1000 ? amount / 100 : amount;
  return `${Math.round(majorUnits).toLocaleString("fr-FR")} ${currency}`;
}

/**
 * Convert major units to minor units (multiply by 100)
 */
export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert minor units to major units
 */
export function toMajorUnits(amount: number): number {
  return amount / 100;
}

/**
 * Generate a unique booking reference
 */
export function generateBookingReference(): string {
  const prefix = "PAY";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Calculate rental duration in days
 */
export function calculateRentalDays(startDate: Date, endDate: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay);
}

/**
 * Calculate rental price based on duration
 */
export function calculateRentalPrice(
  pricing: { daily: number; weekly: number; monthly: number },
  days: number
): number {
  if (days >= 30) {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    return months * pricing.monthly + remainingDays * pricing.daily;
  }
  if (days >= 7) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    return weeks * pricing.weekly + remainingDays * pricing.daily;
  }
  return days * pricing.daily;
}

/**
 * Format a date for display
 */
export function formatDate(
  date: Date | string,
  locale = "fr-FR",
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(d);
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string, locale = "fr-FR"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Get booking status color
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    awaiting_payment: "bg-orange-100 text-orange-800 border-orange-200",
    paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
    active: "bg-green-100 text-green-800 border-green-200",
    completed: "bg-gray-100 text-gray-800 border-gray-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
}

/**
 * Slugify a string
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trimEnd() + "...";
}

/**
 * Get locale direction
 */
export function getDirection(locale: string): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

/**
 * Sanitize MongoDB query input to prevent injection
 */
export function sanitizeQuery(query: string): string {
  return query.replace(/[{}$]/g, "");
}
