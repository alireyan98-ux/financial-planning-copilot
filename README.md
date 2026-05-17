# Financial Planning Co-Pilot — Phase 1: Foundation

**Status:** ✅ Production Ready | Ready to Deploy to Vercel/GitHub

---

## 📋 Quick Start (5 minutes)

### 1️⃣ Clone & Install

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/financial-planning-copilot.git
cd financial-planning-copilot

# Install dependencies
npm install
```

### 2️⃣ Set Up Environment Variables

```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local and fill in your actual values
# See "Environment Variables" section below
```

### 3️⃣ Generate Encryption Keys

```bash
# Generate all required keys (run these 3 commands):
openssl rand -hex 32   # → Copy to ENCRYPTION_KEY
openssl rand -hex 32   # → Copy to PSEUDONYM_MAP_ENCRYPTION_KEY
openssl rand -hex 16   # → Copy to CRON_SECRET
```

### 4️⃣ Create Supabase Tables

Run these SQL queries in your Supabase dashboard:

```sql
-- Cases table
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  case_reference TEXT NOT NULL UNIQUE,
  pseudonym_map_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  deletion_warning_sent BOOLEAN DEFAULT false
);

-- Pseudonym mapping (encrypted PII storage)
CREATE TABLE pseudonym_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL UNIQUE,
  encrypted_pii_blob TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  wiped_at TIMESTAMP
);

-- Audit logs (permanent, PII-free compliance trail)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  case_reference TEXT,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Calculations (case analysis results)
CREATE TABLE calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  result_data JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 5️⃣ Start Development Server

```bash
npm run dev
```

Visit **http://localhost:3000** — you should see the Phase 1 landing page.

---

## 🔐 Environment Variables

Copy these into your `.env.local` file:

| Variable | Source | Example |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings | `eyJ...` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys | `sk_test_...` |
| `ENCRYPTION_KEY` | `openssl rand -hex 32` | `0123456789...` |
| `PSEUDONYM_MAP_ENCRYPTION_KEY` | `openssl rand -hex 32` | `0123456789...` |
| `CRON_SECRET` | `openssl rand -hex 16` | `0123456789...` |

---

## 🏗️ Project Architecture

```
my-phase1-project/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── api/cron/delete-expired/route.ts  # Auto-deletion endpoint
├── lib/
│   ├── encryption.ts            # AES-256-GCM encryption
│   ├── deletion.ts              # 7-day expiry + auto-wipe
│   ├── supabase/server.ts       # Supabase client
│   ├── anonymization/           # Privacy-by-design engine
│   │   ├── index.ts
│   │   ├── client-id.ts
│   │   ├── pii-stripper.ts
│   │   └── purge.ts
│   └── audit/                   # Compliance logging
│       ├── index.ts
│       └── types.ts
├── types/
│   └── anonymization.ts         # TypeScript interfaces
├── middleware.ts                # Clerk auth + cron protection
├── package.json
├── tsconfig.json
├── next.config.js
├── vercel.json                  # Vercel cron config
└── .env.example
```

---

## 📊 Data Flow (Privacy-by-Design)

```
Fact-find submitted
     │
     ▼
stripPII()        ← PII separated at ingestion
     │
     ├──→ PIIFields (encrypted) → pseudonym_mapping table
     └──→ SanitizedData (anonymized) → cases table
     │
     ▼
Calculations run on CLIENT_ID + sanitized data only
     │
     ▼
Export: decryptForExport() → restore name for .docx
     │
     ▼
Day 7: wipeEncryptedBlob() → cryptographic overwrite → delete
     │
     ▼
audit_logs (permanent) ← "Case auto-deleted" (no PII)
```

---

## 🔒 Security Features

✅ **PII Never in Calculations**  
PII is encrypted and separated immediately at submission.

✅ **AES-256-GCM Encryption**  
Authenticated encryption — detects tampering automatically.

✅ **Separate Encryption Keys**  
PII uses a different key (`PSEUDONYM_MAP_ENCRYPTION_KEY`) than general data.

✅ **Cryptographic Wipe**  
PII blobs are overwritten with random bytes before deletion — unrecoverable.

✅ **Audit Logging**  
All actions logged with NO PII — permanent compliance trail.

✅ **Cron Protection**  
Auto-deletion endpoint protected by secret header, not Clerk.

✅ **Age/Income Banding**  
Exact DOB/income stripped, replaced with bands (e.g., "50-59", "60k-100k").

---

## 📝 API Endpoints

### GET `/`
Landing page. Shows "Phase 1 deployed successfully" message.

### GET `/api/cron/delete-expired`
**Auto-deletion endpoint** (Vercel Cron)
- Runs: Daily at 02:00 UTC
- Requires: `x-cron-secret` header (value: `CRON_SECRET`)
- Deletes: All cases past 7-day expiry
- Returns: JSON with deletedCount, failedCount, errors

**Example response:**
```json
{
  "success": true,
  "deletedCases": 5,
  "failedDeletions": 0,
  "warningsSent": 3,
  "runAt": "2024-05-15T02:00:00Z"
}
```

---

## 🚀 Deploy to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "chore: initial Phase 1 setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/financial-planning-copilot.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to **https://vercel.com/new**
2. Import your GitHub repository
3. Framework: **Next.js**
4. Root directory: `.` (current directory)
5. Click **Deploy**

### Step 3: Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add all 8 variables from `.env.example`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `ENCRYPTION_KEY`
- `PSEUDONYM_MAP_ENCRYPTION_KEY`
- `CRON_SECRET`

### Step 4: Verify Cron

Go to Vercel Dashboard → Cron Jobs. You should see:
- `/api/cron/delete-expired` scheduled for **0 2 * * *** (02:00 UTC daily)

---

## ✅ Verification Checklist

Before deploying, verify:

- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts on http://localhost:3000
- [ ] Home page displays correctly
- [ ] `npm run typecheck` passes (no TypeScript errors)
- [ ] `npm run build` completes without errors
- [ ] `.env.local` filled with all 8 variables
- [ ] Supabase tables created
- [ ] Clerk app created (Development mode)

---

## 📚 Phase 2 Roadmap

Phase 1 provides the **privacy foundation**. Phase 2 adds:

- [ ] **Workspace & Organizations** — multi-user support
- [ ] **Fact-Find Forms** — adviser data input
- [ ] **Calculations Engine** — retirement, investment models
- [ ] **Document Generation** — Word/PDF export
- [ ] **Real-time Collaboration** — shared workspace features

---

## 🛠️ Available Commands

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Build for production
npm run start            # Run production server
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run typecheck        # Check TypeScript types
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
```

---

## 📧 Support & Documentation

- **Clerk Docs:** https://clerk.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Encryption:** AES-256-GCM (see `lib/encryption.ts`)

---

## ⚠️ Important Notes

### Never Share:
- `.env.local` (never commit to git)
- Encryption keys or CRON_SECRET
- Clerk/Supabase credentials

### Best Practices:
- Always use separate encryption keys for different data types
- Review audit logs regularly
- Test auto-deletion in development before production
- Monitor cron job execution in Vercel dashboard

### Data Retention:
- Cases: 7 days (then auto-deleted)
- Audit logs: **Permanent** (even after case deletion)
- Encrypted PII: Cryptographically wiped before deletion

---

## 📄 License

MIT

---

**Project Status:** Phase 1 Foundation Complete ✅  
**Last Updated:** 2024-05-15  
**Ready for:** Vercel + GitHub Deployment
