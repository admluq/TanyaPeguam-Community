/**
 * tptree — Type definitions
 * Shape definitions for JSON metadata fields in Prisma models.
 * These give us type safety when accessing link.metadata.X
 */

import type { Profile, Link, LinkType } from '@prisma/client';

// ─── Re-exports ─────────────────────────────────────
export type { Profile, Link, LinkType };

// ─── Link metadata shapes (per type) ────────────────

export interface WhatsAppMetadata {
  phone: string;
  prefilledMessage?: string;
}

export interface WebsiteMetadata {
  domain: string;
  screenshotUrl?: string;
}

export interface LinkedInMetadata {
  handle: string;
  manualPosts?: LinkedInPost[];
}

export interface LinkedInPost {
  content: string; // markdown
  postedAt: string; // "2 hari lalu"
  reactions?: { likes: number; comments: number };
}

export interface TikTokMetadata {
  handle: string;
  videos?: TikTokVideo[];
}

export interface TikTokVideo {
  id: string;
  caption: string;
  thumbnailUrl?: string;
  views?: number;
}

export interface FacebookMetadata {
  pageId: string;
  stats?: FacebookStats;
  latestPost?: string;
}

export interface FacebookStats {
  likes: number;
  followers: number;
  rating: number;
}

export interface InstagramMetadata {
  handle: string;
}

export interface TwitterMetadata {
  handle: string;
}

export interface AIChatMetadata {
  agentId: string;
  modelName?: string;
}

// ─── Helpers ────────────────────────────────────────

/**
 * Type-safe accessor for link metadata.
 * Usage: const meta = getMetadata<WhatsAppMetadata>(link)
 */
export function getMetadata<T>(link: Link): T | null {
  if (!link.metadata) return null;
  return link.metadata as unknown as T;
}

// Profile with all relations included (used in [slug]/page.tsx)
export type ProfileWithLinks = Profile & {
  links: Link[];
};
