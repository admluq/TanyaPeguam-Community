# tptree

**TanyaPeguam.com Link Tree** — Multi-tenant lawyer profile pages.

Link tree style profile pages untuk peguam Malaysia, dengan format:
`tanyapeguam.com/[slug]` (contoh: `tanyapeguam.com/datukwanazmir`)

---

## 🎯 Project Overview

Setiap peguam yang berdaftar dengan TanyaPeguam.com akan dapat satu landing page peribadi — macam Linktree tapi:

- ✅ Profesional (untuk peguam, bukan influencer)
- ✅ Live previews (website, LinkedIn, TikTok, Facebook posts)
- ✅ Bahasa Malaysia first
- ✅ SEO-friendly (backlink ke TanyaPeguam.com)
- ✅ Custom subdomain `tanyapeguam.com/[slug]`

**Reference design**: [Claude Artifact mockup](https://claude.ai/public/artifacts/018f3101-364a-46d5-a5a6-23c71bf84483)

---

## 🛠 Tech Stack (TBC — pending Adam confirmation)

- **Framework**: Next.js 14 (App Router) — *to be confirmed*
- **Database**: PostgreSQL (via Supabase) — *to be confirmed*
- **ORM**: Prisma / Drizzle — *to be confirmed*
- **UI**: Tailwind CSS + shadcn/ui — *to be confirmed*
- **Auth**: Supabase Auth / NextAuth — *to be confirmed*
- **Hosting**: Vercel (production)
- **Database hosting**: Supabase

---

## 📋 Scope (MVP)

### Phase 1 — Foundation
- [ ] Next.js + Postgres setup
- [ ] Database schema (profiles, links, cached_previews)
- [ ] Dynamic route `/[slug]/page.tsx`
- [ ] Single profile page (replicate artifact design)
- [ ] Sample seed data (Datuk Wan Azmir profile)

### Phase 2 — Multi-tenant
- [ ] Multi-tenant routing (any slug works)
- [ ] Profile not found (404) handling
- [ ] SEO metadata per profile (Open Graph, Twitter cards)

### Phase 3 — Admin Panel
- [ ] Authentication (admin + client roles)
- [ ] Client login → edit own profile
- [ ] CRUD for profile + social links
- [ ] Avatar upload

### Phase 4 — Live Previews
- [ ] OG meta scraper (website preview cards)
- [ ] Screenshot service (ScreenshotOne API)
- [ ] TikTok oEmbed integration
- [ ] LinkedIn manual paste system
- [ ] Facebook stats (Graph API or manual)
- [ ] Cache layer + refresh cron

### Phase 5 — Polish
- [ ] Click tracking analytics per profile
- [ ] Sitemap auto-generation
- [ ] robots.txt
- [ ] Dark theme (default per design)
- [ ] Mobile responsive QA

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 20+
- PostgreSQL 14+ (atau Docker)
- Git

### Setup

```bash
