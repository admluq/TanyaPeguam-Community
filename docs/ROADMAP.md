# Roadmap — tptree

Detailed task list per phase. Update sebagai progress.

---

## Phase 1: Foundation ✅ DONE

Foundation skeleton dah siap dalam initial commit:

- [x] Next.js 14 App Router setup
- [x] TypeScript config
- [x] Tailwind CSS with custom theme (gold/ink/cream)
- [x] Prisma schema (Profile, Link, CachedPreview, AnalyticsEvent)
- [x] Database seed (3 sample profiles)
- [x] Profile page dynamic route `/[slug]`
- [x] ProfileHeader, LinkCard, ExpandedContent components
- [x] 4 expanded link types (Website, LinkedIn, TikTok, Facebook)
- [x] 404 page
- [x] Landing page with profile grid

---

## Phase 2: Multi-tenant Polish 🔄 NEXT

- [ ] **Slug validation & reserved words**
  - Block slugs: `admin`, `api`, `_next`, `static`, etc
  - Min/max length, regex validation
  - Reserved list in `lib/reserved-slugs.ts`

- [ ] **Profile not found UX improvements**
  - Suggest similar slugs ("did you mean ...?")
  - Search bar to find correct profile

- [ ] **SEO improvements per profile**
  - JSON-LD structured data (Person schema)
  - Sitemap.xml auto-generated from active profiles
  - robots.txt
  - Favicon set

- [ ] **Mobile responsiveness QA**
  - Test on real devices (iOS Safari, Android Chrome)
  - Touch targets ≥ 44px
  - Safe area insets for notched devices

- [ ] **Loading states**
  - `loading.tsx` for slow DB queries
  - Skeleton placeholders

- [ ] **Error boundaries**
  - `error.tsx` per route segment
  - Sentry integration for production

---

## Phase 3: Admin Panel ⏸ NOT STARTED

- [ ] **Authentication**
  - Choose provider (NextAuth vs Supabase Auth vs Clerk)
  - Email/password + Google OAuth
  - Email verification
  - Password reset flow

- [ ] **Roles & permissions**
  - SUPER_ADMIN: D7 Holdings team (Boss + Adam)
  - CLIENT: lawyer who owns their profile
  - VIEWER: read-only (future)

- [ ] **Admin routes**
  - `/admin` — dashboard with stats
  - `/admin/profiles` — list all profiles, search, filter
  - `/admin/profiles/[id]` — edit profile (admin override)
  - `/admin/users` — manage admin users

- [ ] **Client portal**
  - `/dashboard` — client login, see their profile
  - `/dashboard/edit` — edit own profile
  - `/dashboard/links` — manage links (CRUD, reorder via drag-drop)
  - `/dashboard/analytics` — view their click analytics

- [ ] **Avatar / logo upload**
  - Choose storage (Supabase Storage / Cloudinary / UploadThing)
  - Image optimization (resize, webp conversion)
  - Replace monogram with uploaded image

- [ ] **Profile verification flow**
  - Client submits docs (SIS, lawyer ID)
  - Admin reviews, approves
  - `isVerified` flag toggles
  - Email notification on approval

---

## Phase 4: Live Preview Engines ⏸ NOT STARTED

- [ ] **Website screenshot**
  - Integrate ScreenshotOne API (or alternative)
  - Cache in `CachedPreview` model
  - Refresh every 7 days via cron
  - Fallback if fetch fails (show placeholder)

- [ ] **OG meta scraper**
  - Fetch Open Graph tags from URL
  - Extract: title, description, og:image
  - Use as supplementary preview data

- [ ] **TikTok integration**
  - oEmbed API for video metadata
  - Display 4 latest videos
  - Click-through to TikTok app

- [ ] **LinkedIn (manual paste system)**
  - LinkedIn API too restricted
  - Admin paste post content via dashboard
  - Render markdown, support reactions display
  - Manual refresh on demand

- [ ] **Facebook stats**
  - Setup Facebook Graph API + App
  - Fetch page likes, followers, rating
  - Latest post via Page Insights API
  - Refresh every 24h

- [ ] **Instagram (manual)**
  - Like LinkedIn, manual paste
  - 3-grid latest post images
  - Caption preview

- [ ] **Twitter/X**
  - Try oEmbed (may be paid now)
  - Fallback: manual paste tweets
  - Iframe embed if possible

- [ ] **Cron infrastructure**
  - Choose: Vercel Cron / GitHub Actions / Inngest
  - Refresh stale `CachedPreview` (where `expiresAt < NOW()`)
  - Rate limit per platform
  - Error tracking + retry

---

## Phase 5: Analytics & Polish ⏸ NOT STARTED

- [ ] **Click tracking**
  - Server-side event logging on link click
  - Anonymous (no PII)
  - Aggregate per profile per day

- [ ] **Profile analytics dashboard (client)**
  - Page views (last 7/30 days)
  - Top links clicked
  - Geographic breakdown (country level)
  - Referrer sources

- [ ] **Admin analytics**
  - Total profiles
  - Active vs inactive
  - Most-viewed profiles
  - Trending practice areas

- [ ] **Performance**
  - Lighthouse score ≥ 95
  - Core Web Vitals green
  - Image lazy loading verified
  - Bundle size analysis

- [ ] **A11y audit**
  - WCAG AA compliance
  - Keyboard navigation
  - Screen reader testing
  - Focus visible states

- [ ] **i18n preparation**
  - Extract strings to dictionary
  - Support BM (default) + EN
  - Locale switcher

---

## Phase 6 (Future): Commercial features

- [ ] Stripe / Chip integration
- [ ] Subscription tiers (Free / Pro)
- [ ] Custom domain support (lawyer.com → tptree)
- [ ] Profile QR code generator (printable)
- [ ] vCard download
- [ ] Email signature widget
- [ ] WhatsApp Business API integration
- [ ] White-label for partner law firms

---

## Maintenance ongoing

- [ ] Weekly: review error logs, fix critical issues
- [ ] Monthly: update dependencies, security patches
- [ ] Quarterly: review architecture, refactor pain points
- [ ] Yearly: major framework upgrades (Next.js, Prisma)
