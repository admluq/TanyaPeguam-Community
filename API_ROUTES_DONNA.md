# Donna AI API Routes - Complete Reference

All Phase 3 API routes are now live. Test them with curl, Postman, or your frontend client.

---

## 📍 Route Overview

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/admin/donna-intake` | POST | ✅ Required | Multi-turn intake conversation (lawyer admin) |
| `/api/admin/donna-intake` | GET | ✅ Required | Retrieve existing intake session |
| `/api/admin/donna-triage` | POST | ✅ Required | Run full pipeline (Triage → Compliance → Recommendation) |
| `/api/admin/donna-triage` | GET | ✅ Required | Get cached triage result |
| `/api/public/donna-intake` | POST | ❌ Public | Client-facing intake conversation |
| `/api/public/donna-intake` | GET | ❌ Public | Retrieve intake by short code |

---

## 1. Lawyer Intake Endpoint (Admin)

**Path:** `/api/admin/donna-intake`

### POST - Send a message to Donna

Create a new intake session or continue an existing one.

```bash
curl -X POST http://localhost:3000/api/admin/donna-intake \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": "lawyer-profile-123",
    "message": "Client called about a property dispute",
    "bridgeId": "bridge-456"  // optional, for continuing session
  }'
```

**Response (200):**
```json
{
  "success": true,
  "bridgeId": "bridge-456",
  "shortCode": "ABC123",
  "message": "Good morning! I'm Donna with your firm. I understand there's a property dispute...",
  "turnCount": 2
}
```

**Error Responses:**
- `401` - Not authenticated
- `400` - Missing profileId or message
- `403` - Profile not found or unauthorized
- `500` - Server error

### GET - Retrieve intake session

```bash
curl -X GET "http://localhost:3000/api/admin/donna-intake?bridgeId=bridge-456" \
  -H "Authorization: Bearer YOUR_SESSION"
```

**Response (200):**
```json
{
  "success": true,
  "bridgeId": "bridge-456",
  "shortCode": "ABC123",
  "status": "ACTIVE",
  "transcript": [
    {
      "role": "user",
      "content": "Client called about property dispute",
      "timestamp": "2026-05-11T10:30:00Z",
      "turnIndex": 0
    },
    {
      "role": "assistant",
      "content": "Good morning! I'm Donna...",
      "timestamp": "2026-05-11T10:30:05Z",
      "turnIndex": 0
    }
  ],
  "clientName": "John Doe",
  "clientEmail": "john@example.com",
  "practiceArea": "Harta Tanah",
  "createdAt": "2026-05-11T10:30:00Z",
  "updatedAt": "2026-05-11T10:30:05Z"
}
```

---

## 2. Triage Pipeline Endpoint (Admin)

**Path:** `/api/admin/donna-triage`

### POST - Run 4-agent pipeline

Takes completed intake transcript, runs Triage → Compliance → Recommendation.

```bash
curl -X POST http://localhost:3000/api/admin/donna-triage \
  -H "Content-Type: application/json" \
  -d '{
    "bridgeId": "bridge-456",
    "transcript": "Client: I have a tenant dispute...\nDonna: Tell me more...\nClient: He owes 3 months rent..."
  }'
```

**Response (200):**
```json
{
  "success": true,
  "triage": {
    "concreteScore": 85,
    "urgencyTag": "HIGH",
    "sophistication": "INFORMED",
    "suggestedTier": "PAID_CONSULT",
    "shouldDeflect": false,
    "deflectReason": null,
    "reasoning": {
      "concrete": "Clear timeline and amounts stated",
      "urgency": "Property damage ongoing",
      "sophistication": "Client researched tenant laws",
      "tier": "Requires detailed legal review",
      "practice_fit": "Matches property law expertise"
    },
    "keyStrengths": ["Clear liability", "Documented communication"],
    "risks": ["Limited budget mentioned"]
  },
  "compliance": {
    "complianceStatus": "APPROVED",
    "overrideReason": null,
    "overrideTier": null,
    "deflectionRequired": false,
    "deflectionReason": null,
    "conflictFlags": [],
    "scopeWarnings": [],
    "recommendations": "Proceed with paid consultation approach"
  },
  "recommendation": {
    "finalRecommendation": "ACCEPT",
    "tierRecommendation": "PAID_CONSULT",
    "priority": "HIGH",
    "nextSteps": [
      "Schedule 1-hour paid consultation",
      "Request copy of lease agreement",
      "Prepare fee estimate for full representation"
    ],
    "lawyerNotes": "Client is motivated and has documentation. Good fit for practice.",
    "followUpTemplate": {
      "subject": "Next Steps - Your Tenant Matter",
      "body": "Dear John,\n\nThank you for our consultation. We can help with your tenant issue.\n\nNext: Schedule paid consultation\nFee: RM 200/hour\n\nBest,\n[Lawyer Name]"
    },
    "estimatedValue": "paid_consult",
    "handoffReady": true
  },
  "totalProcessingTime": 8500
}
```

### GET - Retrieve cached triage result

```bash
curl -X GET "http://localhost:3000/api/admin/donna-triage?bridgeId=bridge-456" \
  -H "Authorization: Bearer YOUR_SESSION"
```

**Response (200):**
```json
{
  "success": true,
  "triageResult": { /* triage output from above */ },
  "summary": "Client is motivated and has documentation. Good fit for practice.",
  "completedAt": "2026-05-11T10:35:00Z"
}
```

---

## 3. Public Intake Endpoint (Clients)

**Path:** `/api/public/donna-intake`

### POST - Client starts intake conversation

**NO AUTHENTICATION REQUIRED** - Published lawyers only

```bash
curl -X POST http://localhost:3000/api/public/donna-intake \
  -H "Content-Type: application/json" \
  -d '{
    "lawyerSlug": "arif-azmi",
    "message": "Hi, I need help with a rental dispute",
    "bridgeShortCode": "ABC123"  // optional, continue existing
  }'
```

**Response (200):**
```json
{
  "success": true,
  "bridgeShortCode": "ABC123",
  "bridgeId": "bridge-456",
  "message": "Good morning! I'm Donna with Arif Azmi & Co. I understand you have a rental dispute...",
  "turnCount": 1
}
```

**Error Responses:**
- `400` - Missing lawyerSlug or message
- `404` - Lawyer not found
- `403` - Profile not public or Donna not set up
- `429` - Rate limited (10 messages/minute)
- `500` - Server error

### GET - Retrieve public intake session

```bash
curl -X GET "http://localhost:3000/api/public/donna-intake?shortCode=ABC123"
```

**Response (200):**
```json
{
  "success": true,
  "shortCode": "ABC123",
  "lawyerName": "Arif Azmi",
  "firmName": "Arif Azmi & Co",
  "transcript": [
    {
      "role": "user",
      "content": "Hi, I need help with a rental dispute",
      "timestamp": "2026-05-11T10:30:00Z"
    },
    {
      "role": "assistant",
      "content": "Good morning! I'm Donna...",
      "timestamp": "2026-05-11T10:30:05Z"
    }
  ],
  "createdAt": "2026-05-11T10:30:00Z"
}
```

---

## Test Scenarios

### Scenario 1: Lawyer Starts Intake Session (First Message)

```bash
# 1. Create new intake
curl -X POST http://localhost:3000/api/admin/donna-intake \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": "your-profile-id",
    "message": "Client inquiry: tenant dispute"
  }'

# Response will include bridgeId (e.g., "xyz789")
# Copy bridgeId for next request
```

### Scenario 2: Continue Intake Conversation

```bash
# 2. Send follow-up message to same session
curl -X POST http://localhost:3000/api/admin/donna-intake \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": "your-profile-id",
    "message": "Client also mentioned property damage",
    "bridgeId": "xyz789"
  }'
```

### Scenario 3: Run Triage Analysis

```bash
# 3. After intake is complete, trigger pipeline
curl -X POST http://localhost:3000/api/admin/donna-triage \
  -H "Content-Type: application/json" \
  -d '{
    "bridgeId": "xyz789",
    "transcript": "Client: tenant dispute...\nDonna: Tell me more...\nClient: Property damaged..."
  }'

# Response includes:
# - Triage scores
# - Compliance status
# - Lawyer recommendation
# - Suggested next steps
```

### Scenario 4: Client Starts Intake (No Auth)

```bash
# 4. Public client start intake
curl -X POST http://localhost:3000/api/public/donna-intake \
  -H "Content-Type: application/json" \
  -d '{
    "lawyerSlug": "your-slug",
    "message": "Hello, I need legal help"
  }'

# Response includes bridgeShortCode (e.g., "ABC123")
# Client can continue with same code
```

---

## Implementation Notes

### Authentication
- `/api/admin/*` routes require NextAuth session
- `/api/public/*` routes are open (rate-limited)
- Verify ownership via `profile.user.id === session.user.id`

### Rate Limiting
- Public endpoints: 10 requests per minute per IP
- Requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Falls back to no rate limiting if not configured

### Tool Execution
- Tool handlers in `lib/donna-handler.ts`
- All 10 tools implemented (get_lawyer_profile, etc.)
- Tools execute during agent processing

### Database
- All conversations stored in `DonnaBridge`
- Triage results saved to `triageResult` field
- Transcript stored as JSON array

### Email Integration
- `lib/email-donna.ts` has functions ready
- Call after triage completes to notify lawyer
- Template sends HTML email with scores

---

## Frontend Integration Example

```typescript
// Start new intake (public client)
const startIntake = async (lawyerSlug: string, message: string) => {
  const res = await fetch('/api/public/donna-intake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lawyerSlug, message }),
  });
  const data = await res.json();
  return data.bridgeShortCode; // Save this
};

// Continue intake
const sendMessage = async (shortCode: string, message: string) => {
  const res = await fetch('/api/public/donna-intake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lawyerSlug: 'your-slug',
      message,
      bridgeShortCode: shortCode,
    }),
  });
  return await res.json();
};

// Get transcript
const getTranscript = async (shortCode: string) => {
  const res = await fetch(`/api/public/donna-intake?shortCode=${shortCode}`);
  return await res.json();
};
```

---

## Success! 🚀

All 3 API routes are live and ready to use. Next steps:

1. **Test with curl** - Use examples above
2. **Build frontend** - Create intake chat widget
3. **Send emails** - Use `sendDonnaIntakeSummary()` after triage
4. **Deploy** - Push to production

Everything is production-ready!
