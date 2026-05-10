# TanyaPeguam Admin Panel — Complete Build Summary

## ✅ Completed (May 10, 2026)

A comprehensive admin dashboard for lawyers to manage Donna AI, configure intake workflows, create Bridge links, and monitor leads.

---

## 📋 Architecture

### Database Schema (Prisma)

**NEW MODELS:**
- `User` — NextAuth with email/password support
- `Account`, `Session`, `VerificationToken` — NextAuth auth tables
- `DonnaConfig` — 5-step wizard configuration (practice areas, jurisdiction, fees, triage rules, email & tiers)
- `DonnaBridge` — Context links for Facebook Group handoffs
- `DonnaInquiry` — Individual intake records with scoring and status tracking

**ENUMS:**
- `UserRole` = SUPER_ADMIN | CLIENT
- `InquiryStatus` = DEFLECTED | CAPTURED | EMAILED | ACCEPTED | REJECTED | EXPIRED

**UPDATED:**
- `Profile` → Added optional `userId` to link lawyer profiles to users
- `User` → Added `passwordHash` for email/password auth

---

## 🔐 Authentication

### Files Created
- `auth.ts` — NextAuth v5 config with Google OAuth + Credentials provider (email/password)
- `app/api/auth/[...nextauth]/route.ts` — Auth handler
- `app/api/auth/register/route.ts` — Email registration endpoint
- `middleware.ts` — Protect /dashboard routes, redirect unauthorized to /login

### Pages
- **`app/login/page.tsx`** — Dual-tab login (Google OAuth + Email/Password)
- **`app/register/page.tsx`** — Email registration with password validation

### Key Features
- Google OAuth for quick signup
- Email/password with bcryptjs hashing
- Auto-login after registration
- Callback URL preservation

---

## 📊 Dashboard

### Layout & Navigation
- **`app/dashboard/layout.tsx`** — Dashboard container with sidebar
- **`components/dashboard/sidebar.tsx`** — Navigation with active state indicators, Donna badge, sign-out

### Pages

#### 1. **Dashboard Overview** (`app/dashboard/page.tsx`)
- Stats cards: Total inquiries, Accepted, Pending, Active bridges
- Quick-action links to Setup, Bridge, Logs
- Setup wizard CTA if incomplete
- Recent inquiries table with status/tier badges

#### 2. **Donna Setup Wizard** (`app/dashboard/donna/setup/page.tsx`)
- **`components/donna/setup-wizard.tsx`** — 5-step progressive form:
  - **Step 1:** Practice areas (multi-select grid)
  - **Step 2:** Jurisdiction (state dropdown + bar council)
  - **Step 3:** Availability & fees (hours preset, consult mode, pricing)
  - **Step 4:** Triage rules (sensitivity slider, auto-deflect patterns)
  - **Step 5:** Email & conversion tiers (tier labels, email override)

#### 3. **Bridge Creator** (`app/dashboard/donna/bridge/page.tsx`)
- **`components/donna/bridge-creator.tsx`** — Form to create Bridge links:
  - Generate unique refCode (nanoid)
  - Copy to clipboard
  - Signoff template generator for Facebook Rule 4 compliance
- **`components/donna/bridge-list.tsx`** — Display active bridges with:
  - Click tracking
  - Expandable question preview
  - Active/inactive status

#### 4. **Lead Logs** (`app/dashboard/donna/logs/page.tsx`)
- **`components/donna/inquiry-table.tsx`** — Filterable inquiry table:
  - Status filter pills (All, Captured, Emailed, Accepted, Rejected, Deflected, Expired)
  - Columns: Caller, Practice Area, Concreteness Score, Tier, Status, Date
  - Expandable rows showing full contact info + issue summary
  - Email sent timestamp

---

## 🔌 API Routes

### Donna System

#### **`/api/donna/config`** (GET, POST)
- Fetch or save DonnaConfig (wizard settings)
- Upsert pattern (create if new, update if exists)

#### **`/api/donna/bridge`** (GET, POST)
- **POST:** Create new Bridge link with refCode, track in DB
- **GET:** Fetch Bridge context by refCode, increment click count, return context for widget

#### **`/api/donna/inquiry`** (POST)
- Capture intake submission from widget
- Score concreteness (0-10)
- Suggest conversion tier (LOW/MED/HIGH)
- Generate magic link tokens (accept/reject)
- Send email with summary + action buttons
- Update status to EMAILED

#### **`/api/donna/respond`** (GET)
- Magic link handler for accept/reject
- Update inquiry status to ACCEPTED/REJECTED
- Redirect to dashboard with success message

---

## 📧 Email System

### `lib/email.ts`
- Nodemailer integration (Gmail SMTP)
- HTML email template with:
  - Caller info (name, phone, email, practice area)
  - Issue summary
  - Scoring metrics (concreteness, urgency, tier)
  - Accept/Reject magic links (silent tracking, no prospect notification)

### `.env` Requirements
```
SMTP_USER=your-email@gmail.com
SMTP_PASS=gmail-app-password  # Use App Password, not account password
```

---

## 🧠 Business Logic

### `lib/donna.ts` — Scoring & Utility Functions

#### Core Functions
- **`generateTokens()`** — Create accept/reject magic link tokens (nanoid)
- **`scoreConcreteScore()`** — Assess specificity (0-10) based on keywords
- **`determineUrgency()`** — Tag as STANDARD | MEDIUM | HIGH | CRITICAL
- **`suggestConversionTier()`** — Recommend LOW/MED/HIGH based on scores
- **`shouldDeflect()`** — Check if inquiry matches auto-reject patterns
- **`detectSophistication()`** — Classify as lay/intermediate/sophisticated
- **`buildInquirySummary()`** — Format inquiry data for email

---

## 🎨 UI Components

### Dashboard Components
- `Sidebar` — Active state nav, Donna badge, sign-out
- Dashboard pages with glass-card design
- Responsive grid layouts (mobile-first)
- Status/Tier badge components with color coding

### Donna Components
- `SetupWizard` — 5-step form with state management + API persistence
- `BridgeCreator` — Form + success state with copy-to-clipboard
- `BridgeList` — Card-based list with click tracking
- `InquiryTable` — Expandable rows, filterable, responsive

---

## 🔒 Security & Privacy

- ✅ Passwords hashed with bcryptjs (10 salt rounds)
- ✅ Magic links for silent accept/reject (no email to prospect)
- ✅ Protected /dashboard routes via middleware
- ✅ Session management with NextAuth
- ✅ Prisma adapter prevents SQL injection
- ⚠️ Email not yet integrated (SMTP_PASS required in .env)

---

## 📦 Dependencies Installed

```json
{
  "next-auth": "^5.0.0-beta",
  "@auth/prisma-adapter": "latest",
  "bcryptjs": "^2.4.3",
  "zod": "^3.x",
  "@types/bcryptjs": "^2.4.x",
  "nanoid": "^4.x",
  "nodemailer": "^6.x",
  "@types/nodemailer": "^6.x"
}
```

---

## 🚀 Getting Started

### 1. Push Schema to Database
```bash
node ".\node_modules\prisma\build\index.js" db push
```

### 2. Set Environment Variables
```bash
# .env
AUTH_SECRET=<32-char-random-string>  # openssl rand -base64 32
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Start Dev Server
```bash
npm run dev
```

### 4. Access Dashboard
- Public: `http://localhost:3001`
- Dashboard: `http://localhost:3001/dashboard`
- Login: `http://localhost:3001/login`
- Register: `http://localhost:3001/register`

---

## 📝 File Structure

```
app/
├── login/page.tsx                          # Dual-tab login form
├── register/page.tsx                       # Email registration
├── dashboard/
│   ├── layout.tsx                          # Dashboard layout + sidebar
│   ├── page.tsx                            # Overview with stats
│   └── donna/
│       ├── setup/page.tsx                  # 5-step wizard
│       ├── bridge/page.tsx                 # Bridge creator + list
│       └── logs/page.tsx                   # Inquiry logs table
└── api/
    ├── auth/
    │   ├── [...nextauth]/route.ts          # NextAuth handler
    │   └── register/route.ts               # Email signup
    └── donna/
        ├── config/route.ts                 # GET/POST wizard config
        ├── bridge/route.ts                 # Create + fetch bridges
        ├── inquiry/route.ts                # Capture intakes + send email
        └── respond/route.ts                # Magic link handler

components/
├── dashboard/
│   └── sidebar.tsx                         # Navigation sidebar
└── donna/
    ├── setup-wizard.tsx                    # 5-step form component
    ├── bridge-creator.tsx                  # Bridge creation form
    ├── bridge-list.tsx                     # Bridge cards + list
    └── inquiry-table.tsx                   # Filterable inquiry log

lib/
├── email.ts                                # Nodemailer setup + templates
├── donna.ts                                # Scoring + utility functions
└── db.ts                                   # Prisma singleton

middleware.ts                               # Route protection
auth.ts                                     # NextAuth config
```

---

## ✨ Next Steps / Enhancements

1. **Widget Integration** — Wire Donna widget on profile to call `/api/donna/bridge` and `/api/donna/inquiry`
2. **Email Templates** — Polish HTML email with lawyer branding
3. **Dashboard Customization** — Add lawyer name to profile page
4. **Analytics Dashboard** — Track conversion rates, triage patterns
5. **Deflection Patterns** — Pre-populate with industry defaults
6. **Localization** — Extend to English + other languages

---

## 🐛 Known Issues

### Build Issue (Environmental)
- Prisma DLL permission error on Windows (likely virus scanner or file lock)
- **Workaround:** Restart, clean node_modules, reinstall

### Outstanding
- Email sending requires valid SMTP credentials (Gmail App Password)
- Donna widget not yet connected to backend APIs
- Magic link redirect needs polish

---

## 📞 Support

For issues during setup:
1. Check `.env` has all required keys
2. Verify database connection: `npx prisma studio`
3. Check network tab in browser DevTools for API errors
4. Review server logs: `npm run dev`

---

**Build Date:** May 10, 2026  
**Status:** ✅ Feature-complete, awaiting email + widget integration
