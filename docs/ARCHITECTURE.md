# Architecture Decisions — tptree

Dokumen ni explain **kenapa** choice tertentu dibuat, bukan just **apa**.

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | SSG/ISR untuk SEO, dynamic routes built-in, Vercel-native |
| Language | **TypeScript** | Type safety untuk Prisma JSON metadata |
| Database | **PostgreSQL** | ACID, JSON support, Supabase native |
| ORM | **Prisma** | Best DX, Prisma Studio GUI, AI-friendly schema |
| Styling | **Tailwind CSS** | Utility-first, no CSS-in-JS overhead |
| UI Components | **shadcn/ui pattern** | Copy-paste, no lock-in, customizable |
| Icons | **Lucide React** | Consistent stroke icons, tree-shakable |
| Hosting (prod) | **Vercel** | Native Next.js, edge network, free tier ample |
| DB hosting (prod) | **Supabase** | Managed Postgres, generous free tier, Singapore region |

---

## Database Schema

### Why 3 main models (Profile, Link, CachedPreview)?

```
Profile (1) ── has many ──> Link (N)
Link    (1) ── has one  ──> CachedPreview (0..1)
```

**Profile**: identity + bio + practice areas. One per lawyer.

**Link**: each card on the profile (WhatsApp, LinkedIn, etc). Variable count.
- Has `metadata` JSON for type-specific data
- Has `displayOrder` for drag-drop sorting later
- Has `isActive` for soft-delete

**CachedPreview**: separated from Link sebab:
- Bisa null (some links no preview)
- Kena refresh independently via cron
- Larger payload (screenshots, post bodies)
- Different access pattern

### Why JSON metadata field on Link?

Each link type has DIFFERENT fields:
- WhatsApp needs `phone`, `prefilledMessage`
- LinkedIn needs `handle`, `manualPosts[]`
- Facebook needs `pageId`, `stats`

**Option A**: Separate columns for every possible field
- ❌ Wide table, mostly NULL
- ❌ Schema migration every new platform

**Option B (chosen)**: Single JSON field, typed via TypeScript
- ✅ Flexible per-type shape
- ✅ Type safety via `getMetadata<T>()` helper
- ✅ Easy to add new platforms (just add type definition)

### Why enum for LinkType?

Postgres enum + Prisma enum gives us:
- Type safety in code
- Constraint at DB level (no random strings)
- Easy to switch on type for icon/UI rendering

---

## Frontend Architecture

### Route structure

```
/                  → app/page.tsx           — Landing (profile grid)
/[slug]            → app/[slug]/page.tsx    — Profile page (main feature)
/[slug] (404)      → app/[slug]/not-found.tsx
```

Future:
```
/admin             → admin panel
/admin/[profileId] → edit profile
/api/preview/*     → preview engines (Phase 4)
```

### Why App Router (not Pages Router)?

- ✅ Server Components by default — Profile page fetches DB direct, no API call
- ✅ Streaming + Suspense for progressive rendering
- ✅ Better SEO with metadata API
- ✅ Parallel + intercepting routes for admin modals later

### Why Server Components for profile page?

```typescript
// app/[slug]/page.tsx
export default async function ProfilePage({ params }) {
  const profile = await prisma.profile.findUnique(...) // direct DB query
  return <ProfileHeader profile={profile} />          // SSR'd HTML
}
```

- No client-side fetch, no loading spinner
- HTML rendered server-side → faster initial paint
- SEO crawlers see content immediately
- Database calls don't expose to client

### Why "use client" only on LinkCard?

LinkCard needs `useState` for expand/collapse. Everything else stays Server Component.

**Pattern**: Push interactivity to leaves. Most components stay server.

---

## Styling

### Why Tailwind instead of CSS Modules / styled-components?

- Faster development (no naming things)
- Smaller bundle (only used utilities)
- AI-friendly (Claude/Copilot generate Tailwind well)
- Co-located with markup

### Why custom theme colors (`gold`, `cream`, `ink`)?

Default Tailwind colors are generic. Profile pages for **Malaysian lawyers** need:
- Refined, lawyerly feel
- Dark luxury aesthetic
- Gold accent (cultural fit, premium signal)

Custom palette in `tailwind.config.ts` enforces consistency.

### Why Cormorant Garamond + Inter Tight fonts?

- **Cormorant**: refined serif, lawyerly, distinctive (vs Times New Roman cliche)
- **Inter Tight**: clean sans for body, slightly tighter than Inter for elegance
- Both Google Fonts, free, fast-loading

---

## Phase Roadmap (see ROADMAP.md for detail)

```
Phase 1: Foundation       ✅ DONE (this skeleton)
Phase 2: Multi-tenant     🔄 In progress (basic done, polish needed)
Phase 3: Admin panel      ⏸  Not started
Phase 4: Live previews    ⏸  Not started
Phase 5: Analytics        ⏸  Not started
```

---

## Decisions deferred (TBC)

These are NOT decided yet — discuss before implementing:

| Decision | Options | Need to decide before |
|---|---|---|
| Auth provider | NextAuth, Supabase Auth, Clerk | Phase 3 |
| Image upload | Supabase Storage, Cloudinary, UploadThing | Phase 3 |
| Screenshot service | ScreenshotOne, Browserless, custom | Phase 4 |
| Cron service | Vercel Cron, GitHub Actions, Inngest | Phase 4 |
| Analytics | Plausible, PostHog, custom | Phase 5 |
| Billing (if SaaS) | Stripe, Chip (Malaysia) | Future |

---

## Anti-patterns to avoid

❌ **Direct DB calls from Client Components** — leak credentials, no auth check
❌ **Inline `<style>` or styled-components** — breaks Tailwind purge
❌ **Storing sensitive data in `metadata` JSON** — JSON not encrypted, use separate columns
❌ **Hardcoded text instead of i18n** — for now ok, but plan i18n for English mode later
❌ **Skipping `isActive` checks** — soft-delete is sacred, never query without filter
