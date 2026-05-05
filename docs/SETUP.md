# Setup Guide — tptree

Panduan setup local development untuk **Adam** (atau dev lain). Follow step by step.

---

## 1. Prerequisites

Pastikan kau ada:

- **Node.js 20+** — [nodejs.org](https://nodejs.org)
- **PostgreSQL 14+** — local install atau Docker
- **Git** — untuk clone repo
- **VS Code / Cursor** — recommended editor
- **GitHub account** — untuk push code

Check version:

```bash
node --version    # should be v20.x or v22.x
npm --version     # should be 10.x+
psql --version    # should be 14+
git --version
```

---

## 2. Clone repo

```bash
git clone https://github.com/d7kijo/tptree.git
cd tptree
```

---

## 3. Install dependencies

```bash
npm install
```

Akan install Next.js, Prisma, Tailwind, dll. Ambil masa 1-2 minit.

---

## 4. Setup local PostgreSQL database

### Option A: Local Postgres install (recommended)

Kalau dah ada Postgres install kat laptop:

```bash
# Connect to Postgres (default user: postgres)
psql postgres

# Buat database
CREATE DATABASE tptree;

# Exit
\q
```

### Option B: Docker (kalau prefer container)

```bash
docker run --name tptree-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=tptree \
  -p 5432:5432 \
  -d postgres:16
```

### Option C: Supabase free project (cloud)

1. Sign up [supabase.com](https://supabase.com) (free)
2. Create new project (region: Singapore)
3. Settings → Database → copy "Connection string" (URI mode)
4. Use as `DATABASE_URL` dalam `.env`

---

## 5. Setup environment variables

```bash
cp .env.example .env
```

Edit `.env`, set `DATABASE_URL`:

**Local Postgres:**
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tptree"
```

**Supabase:**
```
DATABASE_URL="postgresql://postgres.[ref]:[password]@[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

---

## 6. Run database migrations

```bash
# Generate Prisma client + push schema to database
npm run db:push
```

Akan create tables dalam database kau berdasar `prisma/schema.prisma`.

---

## 7. Seed sample data

```bash
npm run db:seed
```

Akan create 3 sample profiles:
- Datuk Wan Azmir (full data, match artifact)
- Ahmad Rashid (mid-level)
- Siti Hasanah (minimal)

---

## 8. Start dev server

```bash
npm run dev
```

Buka browser:

- Landing page: http://localhost:3000
- Profile pages:
  - http://localhost:3000/datukwanazmir
  - http://localhost:3000/ahmadrashid
  - http://localhost:3000/sitihasanah
- 404 test: http://localhost:3000/randomslug

---

## 9. Inspect database (optional)

Prisma Studio bagi kau GUI untuk view/edit data:

```bash
npm run db:studio
```

Buka http://localhost:5555

---

## 10. Useful commands

```bash
# Start dev server
npm run dev

# Build for production (tests if build works)
npm run build

# Database operations
npm run db:push         # Push schema changes (dev mode)
npm run db:migrate      # Create proper migration file
npm run db:seed         # Re-seed sample data
npm run db:studio       # Open Prisma Studio GUI
npm run db:reset        # Nuke database & re-seed

# Linting
npm run lint
```

---

## 11. Branch & PR Workflow

**Workflow convention** (dalam README utama):

```bash
# Start from main
git checkout main
git pull

# Create feature branch
git checkout -b feature/admin-panel

# Code, commit, push
git add .
git commit -m "feat: add admin login page"
git push origin feature/admin-panel

# Buka PR di GitHub UI
# Reviewer: @d7kijo
# Tunggu approval, merge
```

### Naming convention untuk branches:
- `feature/xxx` — fitur baru
- `fix/xxx` — bug fix
- `chore/xxx` — refactor, deps update
- `docs/xxx` — documentation

### Commit message convention:
- `feat: add admin login`
- `fix: resolve profile slug 404 issue`
- `chore: update Prisma to 5.23`
- `docs: update setup guide`

---

## 12. Troubleshooting

### `Error: Can't reach database server`
- Check Postgres tengah running: `pg_isready`
- Verify `DATABASE_URL` dalam `.env`
- Test connection: `psql $DATABASE_URL`

### `prisma generate` failed
- Delete `node_modules` + `package-lock.json`
- Run `npm install` semula

### Tailwind classes tak load
- Pastikan dev server restart: Ctrl+C, `npm run dev` semula
- Check `tailwind.config.ts` — `content` paths betul tak

### `Module not found: @prisma/client`
- Run `npm run db:push` (akan auto generate client)

---

## Need help?

- Check `docs/ARCHITECTURE.md` untuk faham project structure
- Check `docs/ROADMAP.md` untuk task list
- Buka GitHub Issue kalau stuck
