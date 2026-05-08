# tptree

**TanyaPeguam.com Link Tree** — Multi-tenant lawyer profile pages.

Link tree style profile pages untuk peguam Malaysia, dengan format:
`tanyapeguam.com/[slug]` (contoh: `tanyapeguam.com/datukwanazmir`)

---

> ⚠️ **PENTING — Branch Protection Convention**
>
> Repo ni **TIDAK ENFORCE** branch protection (private repo limitation).
> Tapi semua collaborator MESTI ikut workflow ni:
>
> ❌ **JANGAN** push terus ke `main`
> ✅ **WAJIB** buat feature branch + Pull Request
> ✅ **TUNGGU** approval dari @d7kijo sebelum merge
>
> Pelanggaran convention = revoke access. Serious.

---

## 🎯 Project Overview

Setiap peguam yang berdaftar dengan TanyaPeguam.com akan dapat satu landing page peribadi — macam Linktree tapi:

- ✅ Profesional (untuk peguam, bukan influencer)
- ✅ Live previews (website, LinkedIn, TikTok, Facebook posts)
- ✅ Bahasa Malaysia first
- ✅ SEO-friendly (backlink ke TanyaPeguam.com)
- ✅ Custom URL path `tanyapeguam.com/[slug]`

**Reference design**: [Claude Artifact mockup](https://claude.ai/public/artifacts/018f3101-364a-46d5-a5a6-23c71bf84483)

---

## 🛠 Tech Stack (CONFIRMED)

| Layer | Choice |
|---|---|
| Framework | **Next.js 14** (App Router, TypeScript) |
| Database | **PostgreSQL** (via Supabase in production) |
| ORM | **Prisma** (with Prisma Studio for inspection) |
| Styling | **Tailwind CSS** + custom luxury dark theme |
| UI Pattern | **shadcn/ui** style (copy-paste components) |
| Icons | **Lucide React** |
| Hosting | **Vercel** (production) |
| Database hosting | **Supabase** (managed Postgres) |

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/d7kijo/tptree.git
cd tptree

# Install
npm install

# Setup database (local Postgres)
createdb tptree
cp .env.example .env
# Edit .env, set DATABASE_URL

# Push schema + seed
npm run db:push
npm run db:seed

# Run
npm run dev
```

Open:
- http://localhost:3000 — landing
- http://localhost:3000/datukwanazmir — sample profile (matches artifact)
- http://localhost:3000/ahmadrashid — sample 2
- http://localhost:3000/sitihasanah — sample 3

📖 **Full setup guide**: [`docs/SETUP.md`](./docs/SETUP.md)

---

## 📁 Project Structure

```
tptree/
├── app/
│   ├── layout.tsx          # Root layout (fonts, global styles)
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Tailwind + custom CSS
│   └── [slug]/
│       ├── page.tsx        # Profile dynamic route ⭐
│       └── not-found.tsx   # 404 for invalid slugs
│
├── components/
│   ├── profile/
│   │   ├── profile-header.tsx     # Avatar, name, badges
│   │   ├── link-card.tsx          # Expandable link card ⭐
│   │   ├── link-icon.tsx          # Brand icons per platform
│   │   ├── expanded-content.tsx   # Dispatcher
│   │   ├── profile-footer.tsx
│   │   └── expanded/
│   │       ├── expanded-website.tsx    # Browser frame mockup
│   │       ├── expanded-linkedin.tsx   # Post cards
│   │       ├── expanded-tiktok.tsx     # Video grid
│   │       └── expanded-facebook.tsx   # Stats + post
│   └── ui/                # shadcn components (add as needed)
│
├── lib/
│   ├── db.ts              # Prisma client singleton
│   └── utils.ts           # cn(), formatters, helpers
│
├── prisma/
│   ├── schema.prisma      # Database schema ⭐
│   └── seed.ts            # Sample data
│
├── types/
│   └── profile.ts         # TypeScript types for metadata JSON
│
├── docs/
│   ├── SETUP.md           # Local dev setup (Adam start here)
│   ├── ARCHITECTURE.md    # Why decisions were made
│   └── ROADMAP.md         # Phase 1-6 task list
│
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 📋 Roadmap

| Phase | Status | Description |
|---|---|---|
| 1. Foundation | ✅ DONE | Skeleton, schema, sample data, profile page rendering |
| 2. Multi-tenant polish | 🔄 NEXT | SEO, slug validation, mobile QA, loading states |
| 3. Admin panel | ⏸ Pending | Auth, client dashboard, edit profile UI |
| 4. Live previews | ⏸ Pending | Screenshot, oEmbed, scraping engines |
| 5. Analytics | ⏸ Pending | Click tracking, dashboard insights |

📖 **Full roadmap**: [`docs/ROADMAP.md`](./docs/ROADMAP.md)

---

## 🔄 Workflow

### Branch & PR convention

```bash
# 1. Start from main
git checkout main && git pull

# 2. Create feature branch
git checkout -b feature/admin-login

# 3. Code + commit
git add .
git commit -m "feat: add admin login page"

# 4. Push branch
git push origin feature/admin-login

# 5. Open PR on GitHub
#    Reviewer: @d7kijo
#    Wait for approval
#    Merge to main
```

### Branch naming

- `feature/xxx` — new feature
- `fix/xxx` — bug fix
- `chore/xxx` — refactor, deps update
- `docs/xxx` — docs only

### Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org):

- `feat: ...` — new feature
- `fix: ...` — bug fix
- `chore: ...` — maintenance
- `docs: ...` — documentation
- `refactor: ...` — code refactor

---

## 🔐 Environment Variables

See [`.env.example`](./.env.example) for full list.

**Required for local dev:**
- `DATABASE_URL` — Postgres connection string

**Required for Phase 4 (later):**
- `SCREENSHOTONE_API_KEY`
- `FACEBOOK_APP_ID` + `FACEBOOK_APP_SECRET`

**Required for Phase 3 (later):**
- `NEXTAUTH_SECRET` + `NEXTAUTH_URL`

⚠️ Never commit `.env` to Git.

---

## 🚢 Deployment (Production)

**TBC** — production setup akan dibuat masa Phase 2/3 ready.

Plan:
1. Vercel project linked to this repo
2. Auto-deploy `main` branch → production
3. Auto-deploy PR branches → preview URLs
4. Supabase project for managed Postgres
5. Domain `tanyapeguam.com` pointed to Vercel

---

## 👥 Team

| Role | Person |
|---|---|
| Owner / Product | **D7 Holdings** ([@d7kijo](https://github.com/d7kijo)) |
| Developer | **Adam Lawyer** (collaborator) |

---

## 📞 Support

- **Bug or feature request**: open [GitHub Issue](https://github.com/d7kijo/tptree/issues)
- **Setup help**: see [`docs/SETUP.md`](./docs/SETUP.md)
- **Architecture questions**: see [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)

---
test adam

## 📄 License

Proprietary. © D7 Holdings Sdn Bhd. All rights reserved.
