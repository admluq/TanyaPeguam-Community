# Lean MVP QuickStart - 5-Question Intake + Email

Your MVP is now ready. Simple, clean, and working.

---

## What It Does

✅ **Client answers 5 questions** (3 context + 2 detail)  
✅ **System automatically progresses** (no complex logic)  
✅ **Email sent to lawyer** when intake completes  
✅ **No triage, no scoring, no complexity**  

---

## The 5 Questions

```
Q1: What's your legal issue about? (Please describe briefly)
Q2: When did this start or happen?
Q3: Who else is involved in this matter?
Q4: What's your main concern right now?
Q5: What outcome are you hoping for?
```

After Q5 → Email sent to lawyer → Done ✓

---

## Test It (Curl)

### 1️⃣ Get Your Profile ID

```bash
# Check your profile exists
curl -X GET "http://localhost:3000/api/admin/profile" \
  -H "Authorization: Bearer YOUR_SESSION_COOKIE"

# Copy the profile.id from response
```

### 2️⃣ Send Message 1 (First Question)

```bash
curl -X POST http://localhost:3000/api/admin/donna-intake \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": "YOUR_PROFILE_ID",
    "message": "I have a rental dispute with my landlord"
  }'
```

**Response:**
```json
{
  "success": true,
  "bridgeId": "xyz789",
  "shortCode": "ABC123",
  "message": "When did this start or happen?",
  "turnCount": 1,
  "intakeComplete": false
}
```

### 3️⃣ Send Message 2

```bash
curl -X POST http://localhost:3000/api/admin/donna-intake \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": "YOUR_PROFILE_ID",
    "message": "About 2 months ago",
    "bridgeId": "xyz789"
  }'
```

Response: `"Who else is involved in this matter?"`

### 4️⃣ Continue Through Q5

Repeat for remaining 3 messages. After Q5:

```bash
curl -X POST http://localhost:3000/api/admin/donna-intake \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": "YOUR_PROFILE_ID",
    "message": "I want him to fix the property or let me break the lease",
    "bridgeId": "xyz789"
  }'
```

**Final Response:**
```json
{
  "success": true,
  "bridgeId": "xyz789",
  "shortCode": "ABC123",
  "message": "Thank you for providing all that information. A lawyer from our firm will review your case and contact you soon.",
  "turnCount": 5,
  "intakeComplete": true  // ← EMAIL SENT!
}
```

---

## What Happens After Q5

1. ✅ Intake marked as `COMPLETED` in database
2. ✅ Email sent to lawyer with:
   - All 5 Q&A pairs
   - Client issue summary
   - Link to bridge record
3. ✅ Bridge stored in `DonnaBridge` table
4. ✅ Ready for lawyer to follow up

---

## Email Template

Lawyer receives email with:

```
INTAKE INFORMATION
==================

Q1: What's your legal issue about?
A: I have a rental dispute with my landlord

Q2: When did this start or happen?
A: About 2 months ago

Q3: Who else is involved in this matter?
A: My landlord and a property manager

Q4: What's your main concern right now?
A: The property has serious maintenance issues

Q5: What outcome are you hoping for?
A: I want him to fix the property or let me break the lease

[Link to View Full Bridge]
```

---

## Files Changed

| File | Change |
|------|--------|
| `lib/donna-simple.ts` | ✨ NEW - 5 question logic |
| `lib/email-donna.ts` | Updated - added `sendSimpleIntakeSummary()` |
| `app/api/admin/donna-intake/route.ts` | Updated - simplified to Q&A flow |
| `app/api/public/donna-intake/route.ts` | Updated - simplified to Q&A flow |

---

## Key Features

### Ultra Simple
- No AI agents
- No scoring
- No complex logic
- Just ask 5 questions

### Production Ready
- Email notifications
- Database persistence
- Rate limiting (public endpoint)
- Error handling

### Easy to Extend
Later you can add:
- Triage scoring (Agent B)
- Compliance check (Agent C)
- Recommendations (Agent D)
- Approval/rejection logic

---

## Next Steps

1. **Test the flow** - Use curl examples above
2. **Check email** - You should receive email from lawyer account
3. **Build UI** - Create a simple chat widget (5 messages)
4. **Deploy** - Push to production
5. **Later**: Add triage/scoring when ready

---

## Troubleshooting

**Email not arriving?**
- Check `sendEmail()` function in `lib/email.ts`
- Verify `SMTP_USER`, `SMTP_PASSWORD`, etc.
- Check spam folder

**"Profile not found" error?**
- Verify you're logged in (correct session)
- Confirm profileId is correct
- Check user owns the profile

**"intakeComplete" still false after Q5?**
- Each message increments turnCount
- After Q5 = turnCount of 5
- `isIntakeComplete(5)` should return true
- Check the question count matches

---

## Architecture

```
Client Sends Message
        ↓
Get turnCount from transcript
        ↓
Get next question from QUESTIONS array
        ↓
Store message + question in DonnaBridge
        ↓
Is turnCount >= 5?
        ├─ Yes → Send email to lawyer, mark COMPLETED
        └─ No → Return next question
        ↓
Client continues...
```

---

## Cost

- **Per intake**: ~$0 (no API calls)
- **Email**: ~$0.01 per send (SMTP)
- **Storage**: DonnaBridge record (~1KB)

Basically free.

---

**That's it! You have a working MVP.** 🚀

Questions? Issues? Let me know!
