# 🚀 Admin Panel — Quick Start Guide

## ✅ Status
**Your admin panel is fully built and ready to use!**

All files are in place. Email is configured (adamlqmn@gmail.com). Just start the server.

---

## 📍 What's Live Right Now

### Authentication Routes
- **`/login`** — Dual-tab login (Google + Email/Password)
- **`/register`** — Email signup with password validation
- **`/api/auth/[...nextauth]`** — NextAuth handler

### Dashboard (Protected `/dashboard/*`)
- **`/dashboard`** — Overview with stats & quick links
- **`/dashboard/donna/setup`** — 5-step wizard
- **`/dashboard/donna/bridge`** — Create Bridge links
- **`/dashboard/donna/logs`** — Inquiry log viewer

### API Endpoints (All POST/GET ready)
- `/api/auth/register` — Email signup
- `/api/donna/config` — Save/fetch wizard settings
- `/api/donna/bridge` — Create & retrieve bridge links
- `/api/donna/inquiry` — Capture intakes & send emails
- `/api/donna/respond` — Silent accept/reject magic links

---

## 🎯 Quick Test Flow

### 1. **Register a New Lawyer**
```
1. Go to http://localhost:3001/register
2. Enter name, email, password
3. Click "Daftar Akaun"
4. Auto-logs in, redirects to /dashboard
```

### 2. **Configure Donna (5-Step Wizard)**
```
1. On dashboard, click "Mulakan Tetapan" (or go to /dashboard/donna/setup)
2. Step 1: Select practice areas (e.g., Defamasi, Probet)
3. Step 2: Choose jurisdiction (e.g., Selangor) + bar council
4. Step 3: Set hours (preset) & consultation fee (RM50 default)
5. Step 4: Triage sensitivity (slider 1-10) + auto-deflect patterns
6. Step 5: Email recipient + tier labels
7. Click "Selesai" → saves to database → back to dashboard
```

### 3. **Create a Bridge Link**
```
1. Go to /dashboard/donna/bridge
2. Fill form:
   - Source: "Facebook Group"
   - Question: Paste FB post
   - Practice Area: Select from dropdown
   - Key Facts: Optional context
3. Click "Jana Bridge Link"
4. Copy pautan (URL) + signoff template
5. Paste signoff in FB Group conversation
```

### 4. **View Inquiry Logs**
```
1. Go to /dashboard/donna/logs
2. Filter by status (Captured, Emailed, Accepted, Rejected)
3. Click row to expand caller info + issue summary
4. Magic links in email allow silent accept/reject tracking
```

---

## 🔧 Development Commands

```bash
# Start dev server (port 3001)
npm run dev -- --port 3001

# View database (Prisma Studio)
npx prisma studio

# View logs
node ".\node_modules\prisma\build\index.js" db push  # If schema changes

# Build for production
npm run build
npm start
```

---

## 🔐 Email Testing

When an inquiry is submitted:
1. Donna captures caller name, phone, email, issue summary
2. Calculates concreteness score (0-10)
3. Tags urgency (STANDARD/MEDIUM/HIGH/CRITICAL)
4. Suggests conversion tier (LOW/MED/HIGH)
5. **Sends HTML email to: adamlqmn@gmail.com** with:
   - Caller contact info
   - Issue summary
   - Scoring metrics
   - Two magic links:
     - Accept link (silent accept, no email to caller)
     - Reject link (silent reject, no email to caller)

---

## 📱 Default Test Credentials

**Google OAuth:** Use your Google account  
**Email/Password:** Create any account during registration

---

## 🎨 UI/UX Features

✅ Dark luxury theme (ink/gold/cream/purple palette)  
✅ Responsive (mobile-first)  
✅ Glass-card design with Tailwind  
✅ Sidebar navigation with active state  
✅ Expandable table rows  
✅ Copy-to-clipboard buttons  
✅ Real-time validation  
✅ Loading states  

---

## 🛠️ Troubleshooting

### Dev server won't start
```bash
# Clear cache
rm -r .next node_modules/.cache
npm run dev -- --port 3001
```

### Database connection error
- Check DATABASE_URL in .env
- Verify PostgreSQL is running
- Try: `npx prisma studio` to test connection

### Email not sending
- Check SMTP_USER & SMTP_PASS in .env
- Verify Gmail App Password (not account password)
- Check spam folder
- Review server logs for SMTP errors

### Page shows 404
- Make sure dev server is running
- Check URL (case-sensitive on Linux)
- Clear browser cache (Ctrl+Shift+R)

---

## 📊 Database Models Created

```
User (email, password, profile link)
  ├─ DonnaConfig (wizard settings)
  ├─ DonnaBridge (context links)
  └─ DonnaInquiry (intake records)

Profile (lawyer public page)
  └─ User (optional link)
```

All models auto-generated from Prisma schema. Studio URL: http://localhost:5555

---

## 🔐 Security Features

- ✅ Passwords hashed (bcryptjs)
- ✅ Magic links for silent tracking (no prompt email to caller)
- ✅ Protected routes (middleware redirect to /login)
- ✅ Session management (NextAuth)
- ✅ CSRF protection (NextAuth)
- ✅ SQL injection prevention (Prisma)

---

## 📝 Next Steps

1. **Test the flow** — Register → Setup wizard → Create bridge → View logs
2. **Customize tiers** — Adjust tier labels in step 5 of wizard
3. **Wire Donna widget** — Connect public profile widget to `/api/donna/inquiry`
4. **Monitor emails** — Check adamlqmn@gmail.com for inquiry summaries
5. **Refine triage** — Add auto-deflect patterns based on real inquiries

---

## 💬 Support

All files documented in: `ADMIN_PANEL_BUILD_SUMMARY.md`

Questions? Check:
1. Server logs (`npm run dev`)
2. Browser DevTools (Network tab)
3. Database (Prisma Studio at :5555)
4. Email logs (adamlqmn@gmail.com inbox)

---

**Ready? Fire it up:**
```bash
npm run dev -- --port 3001
```

Then visit: **http://localhost:3001/register**

Enjoy! 🚀
