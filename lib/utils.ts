/**
 * tptree — Utility functions
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes intelligently.
 * Standard shadcn-style utility.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number with K/M suffix.
 * 8200 -> "8.2k", 1450 -> "1.4k"
 */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

/**
 * Format star rating: 4.9 -> "4.9"
 */
export function formatRating(r: number): string {
  return r.toFixed(1);
}

/**
 * Status display label (BM)
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    AVAILABLE: 'Available',
    BUSY: 'Sibuk',
    AWAY: 'Tiada',
    OFFLINE: 'Offline',
  };
  return labels[status] ?? status;
}

/**
 * Status indicator color
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    AVAILABLE: 'bg-success',
    BUSY: 'bg-warning',
    AWAY: 'bg-cream-muted',
    OFFLINE: 'bg-ink-50',
  };
  return colors[status] ?? 'bg-ink-50';
}
