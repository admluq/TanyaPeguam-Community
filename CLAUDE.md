# TanyaPeguam-Community — Project Memory

## Overview
Multi-tenant lawyer digital business card platform. Each lawyer gets a personal profile page (`/[slug]`) with a Donna AI front-desk assistant, links, and booking flow.

**Stack:** Next.js 14 (App Router) · Prisma ORM · PostgreSQL · Tailwind CSS · TypeScript

---

## Environment

### Database
```env
DATABASE_URL="postgresql://postgres:Positive%4024@127.0.0.1:5432/tptree"
```
- Password contains `@` → must be URL-encoded as `%40`
- Use `127.0.0.1` not `localhost` (avoids IPv6 resolution issues on Windows)
- DB name: `tptree`

### Dev Server
```bash
npm run dev -- --port 3001   # if 3000 is occupied
```
Launch config saved at: `.claude/launch.json` and `C:\Users\Swift 3\.claude\launch.json`
Batch helper (no-space path): `C:\Users\Public\tp-dev.bat`

---

## Design System

### Color Palette
| Token | Value | Usage |
|---|---|---|
| Background | `#06060a` | Page background |
| Gold | `#d4a853` | Lawyer brand, accents |
| Gold light | `#e8c07a` | Gradient highlights |
| Purple | `#7c3aed` | Donna / AI theme |
| Purple light | `#a78bfa` | Nav, badges |
| Text primary | `#ffffff` / `#eee8dc` | Headings, body |
| Text muted | `rgba(255,255,255,0.35)` | Secondary text |
| Text faint | `rgba(255,255,255,0.18)` | Labels |
| Emerald | `#34d399` | Status available, online dot |
| Orange | `#fb923c` | Status busy |

### Geometric Background (shared homepage + profile pages)
- Concentric circle outlines: purple `rgba(139,92,246,0.07)` + gold `rgba(212,168,83,0.05)`
- Plus marks at 4 positions (top-left, top-right, bottom-left, bottom-right)
- Dot grids: 3×3, mid-left purple + mid-right gold, `opacity-[0.08]`
- Gradient blobs: purple top-left, gold bottom-right, `blur(40px) opacity-[0.04]`

### CSS Classes (globals.css)
- `.lia-border-wrap` / `.lia-border-inner` — rotating conic-gradient border (Donna card)
- `.glass-card` — backdrop-blur glass card with hover scale
- `.text-shimmer` — gold shimmer sweep animation
- `.chip` — practice area / topic pill with purple hover glow
- `.typing-dot` — bounce animation for typing indicator
- `@property --angle` — CSS custom property for rotating border

### Fonts
- **Display:** Cormorant Garamond (500, 600, italic) — headings, monograms
- **Body:** Inter (400, 500, 600) — UI text

---

## Key Files

| File | Purpose |
|---|---|
| `app/page.tsx` | Homepage — hero, Donna chat card, lawyer grid |
| `app/[slug]/page.tsx` | Profile page — SSG, all link sections |
| `app/layout.tsx` | Root layout, Google Fonts |
| `app/globals.css` | Tailwind + custom CSS animations |
| `tailwind.config.ts` | Custom colors, shadows, keyframes |
| `components/profile/profile-header.tsx` | Avatar, name, title, badges, bio |
| `components/profile/booking-card.tsx` | Donna modal (idle→chat→form→success) |
| `components/profile/link-card.tsx` | Generic link card |
| `components/profile/profile-footer.tsx` | Dark theme footer |
| `components/TypingIndicator.tsx` | Three-dot typing animation |
| `prisma/schema.prisma` | DB schema |
| `prisma/seed.ts` | 3 real lawyer profiles |
| `lib/db.ts` | Prisma client singleton |
| `lib/utils.ts` | `getStatusColor`, `getStatusLabel` helpers |

---

## Profile Page — Link Rendering Order

```
1. Google Review + Maps   (2-col placeholder row)
2. WhatsApp               (green full-width card)
3. Donna                  (BookingCard — gold AI assistant)
4. Website                (indigo full-width card)
5. Other                  (LinkCard generic)
6. Socials                (grouped box — ALWAYS last)
    └── FACEBOOK, INSTAGRAM, TIKTOK, TWITTER, LINKEDIN
```

```ts
const SOCIAL_TYPES = ['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'TWITTER', 'LINKEDIN'];
const whatsapp = profile.links.filter((l) => l.type === 'WHATSAPP');
const socials   = profile.links.filter((l) => SOCIAL_TYPES.includes(l.type));
const website   = profile.links.filter((l) => l.type === 'WEBSITE');
const donna     = profile.links.filter((l) => l.type === 'AI_CHAT');
const other     = profile.links.filter((l) => !['WHATSAPP','AI_CHAT','WEBSITE',...SOCIAL_TYPES].includes(l.type));
```

---

## Donna (Booking Card)

- **Name:** Donna — personal front-desk AI per lawyer
- **File:** `components/profile/booking-card.tsx` (Client Component)
- **Flow:** `idle` → `chat` → `form` → `success`
- **Avatar:** Full circle (`rounded-full`), purple gradient, "D" letter
- **Steps:**
  - `chat`: Greeting bubble + 4 quick-prompt buttons + "Tempah Temujanji →" CTA
  - `form`: Name / Email / Phone / Issue fields
  - `success`: Checkmark + personalised message + "— Donna, pembantu peribadi [firstName]"
- **Mock submit:** 1.8s delay (no real API yet)

---

## Seeded Lawyers

| Slug | Name | Firm | Location |
|---|---|---|---|
| `admluq` | Adam Luqman Bin Iskandar Afian | Messrs Iskandar & Co | Kota Bharu, Kelantan |
| `RizlanGhazali` | Rizlan Ghazali Chewan | Messrs Chin Eng Adlina | Shah Alam, Selangor |
| `ArifAzmi` | Muhammad Arif Azmi | Arif Azmi & Co. | Rawang, Selangor |

---

## Known Issues & Fixes

| Issue | Fix |
|---|---|
| `npm` not found in PowerShell | `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force` |
| PostgreSQL connection refused | Use `127.0.0.1` not `localhost` in DATABASE_URL |
| `@` in password breaks URL | URL-encode as `%40` |
| Port 3000 in use | `npm run dev -- --port 3001` |
| `onMouseEnter` in Server Component | Use Tailwind `hover:` classes instead |
| SSG stale after seed | Restart dev server to re-run `generateStaticParams` |
| Preview tool can't find project | Space in `Swift 3` path — use `C:\Users\Public\tp-dev.bat` helper |

---

## Homepage — Current UI State

### Nav
- Logo: `width={36} height={36}`, `rounded-md`
- Brand text: `font-bold text-xl tracking-tight` white
- Beta badge: `text-xs font-semibold` purple pill
- "Untuk Peguam": `text-lg` muted link
- "Tanya Donna →": `text-lg font-semibold px-5 py-2.5` purple button

### Hero Left
- Badge: `text-lg px-4 py-2 rounded-full` purple — "Donna AI tersedia sekarang"
- H1: `clamp(2.6rem, 5vw, 3.75rem)` — "Penyelesaian digital untuk peguam *profesional*"
- Stats: 3 / 24/7 / Free — gold gradient text

### Hero Right (Donna Card)
- Label above card: `text-base uppercase tracking-[0.2em]` — "PEMBANTU PERIBADI PEGUAM"
- Card uses `.lia-border-wrap` rotating border
- Header avatar: `w-11 h-11 rounded-full` purple gradient
- Message avatars: `w-9 h-9 rounded-full`
- Greeting: "Selamat datang! 👋 / Saya Donna, pembantu peribadi Peguam anda. / Saya boleh bantu anda tinggalkan pesanan kepada peguam atau atur temujanji. / Apa yang saya boleh bantu hari ini?"

### Peguam Berdaftar Divider
- Purple glowing box: `rounded-2xl` with purple border + `boxShadow` glow
- Content: 💎 **PEGUAM BERDAFTAR** 💎
- Text: `text-base font-bold uppercase tracking-[0.25em]` color `#c4b5fd`

---

## Commands Reference

```bash
npm run dev              # start dev server
npm run build            # prisma generate + next build
npm run db:seed          # seed database
npm run db:studio        # open Prisma Studio (port 5555)
npm run db:push          # push schema to DB
npm run db:migrate       # run migrations
```

---

*Last updated: 2026-05-07*
