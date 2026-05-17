# Quick Deployment Guide — Phase 1

**Time Required:** 15 minutes  
**Difficulty:** Beginner-friendly

---

## ✅ Pre-Deployment Checklist

Before you start, make sure you have:

- [ ] GitHub account (https://github.com/signup)
- [ ] Vercel account (https://vercel.com/signup)
- [ ] Supabase account (https://supabase.com/dashboard)
- [ ] Clerk account (https://clerk.com/sign-up)

---

## 📋 Step-by-Step Deployment

### **1. Prepare Your Local Project** (2 min)

```bash
# Navigate to project directory
cd my-phase1-project

# Install dependencies
npm install

# Verify it works locally
npm run dev
```

Visit http://localhost:3000 — you should see the landing page.

Press `Ctrl+C` to stop the server.

---

### **2. Create Supabase Tables** (3 min)

1. Go to **https://supabase.com/dashboard**
2. Create a new project (or use existing)
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Paste this SQL:

```sql
-- Cases table
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  case_reference TEXT NOT NULL UNIQUE,
  pseudonym_map_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  deletion_warning_sent BOOLEAN DEFAULT false
);

-- Pseudonym mapping
CREATE TABLE IF NOT EXISTS pseudonym_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL UNIQUE,
  encrypted_pii_blob TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  wiped_at TIMESTAMP
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  case_reference TEXT,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Calculations
CREATE TABLE IF NOT EXISTS calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  result_data JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

6. Click **Run**

✅ Tables created!

---

### **3. Get Supabase Credentials** (1 min)

1. In Supabase dashboard, click **Settings** → **API**
2. Copy these values into a text file:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

---

### **4. Create Clerk App** (2 min)

1. Go to **https://clerk.com/dashboard**
2. Click **Create New App**
3. Choose "Email" as authentication method
4. Name it "Financial Planning Co-Pilot"
5. In **API Keys**, copy:
   - `Publishable Key` → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `Secret Key` → `CLERK_SECRET_KEY`

---

### **5. Generate Encryption Keys** (1 min)

Open your terminal and run:

```bash
# Key 1
openssl rand -hex 32

# Key 2
openssl rand -hex 32

# Key 3
openssl rand -hex 16
```

You'll get 3 random strings. Copy them:
- First (32 bytes) → `ENCRYPTION_KEY`
- Second (32 bytes) → `PSEUDONYM_MAP_ENCRYPTION_KEY`
- Third (16 bytes) → `CRON_SECRET`

---

### **6. Create `.env.local`** (1 min)

In your project root, create `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in all 8 variables:

```env
NEXT_PUBLIC_SUPABASE_URL=<from Supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<from Clerk>
CLERK_SECRET_KEY=<from Clerk>
ENCRYPTION_KEY=<from openssl>
PSEUDONYM_MAP_ENCRYPTION_KEY=<from openssl>
CRON_SECRET=<from openssl>
```

Test locally:

```bash
npm run dev
```

If it starts without errors, you're ready to deploy! ✅

---

### **7. Push to GitHub** (2 min)

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "chore: Phase 1 - Privacy Foundation"

# Create main branch
git branch -M main

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/financial-planning-copilot.git

# Push to GitHub
git push -u origin main
```

> Replace `YOUR_USERNAME` with your actual GitHub username.

✅ Code on GitHub!

---

### **8. Deploy to Vercel** (3 min)

1. Go to **https://vercel.com/new**
2. Click **Import Git Repository**
3. Paste your GitHub URL and click Import
4. Framework: **Next.js** (should auto-detect)
5. Root Directory: `.` (current)
6. Click **Environment Variables**
7. Add all 8 variables from your `.env.local`
8. Click **Deploy**

⏳ **Wait 2-3 minutes for deployment...**

When you see ✅ **Congratulations!** your app is live!

---

### **9. Verify Deployment** (1 min)

1. Click the **Visit** button (or go to your Vercel domain)
2. You should see the Phase 1 landing page
3. Check **Settings** → **Cron Jobs** to confirm:
   - `/api/cron/delete-expired` is scheduled for 02:00 UTC daily

✅ **Live on Vercel!**

---

### **10. (Optional) Set Up Custom Domain**

In Vercel Dashboard → Settings → Domains:
1. Add your domain (e.g., `myapp.com`)
2. Follow DNS instructions
3. Wait 5-10 minutes for propagation

---

## 🎉 You're Done!

Your Phase 1 deployment is **complete and live**.

**What you have:**
- ✅ Privacy-by-design architecture
- ✅ AES-256 encryption for PII
- ✅ Automatic 7-day data deletion
- ✅ Compliance audit logs
- ✅ Clerk authentication ready
- ✅ Supabase data storage
- ✅ Vercel auto-deletion cron

**Next Steps:**
- Test the cron endpoint: `https://your-app.vercel.app/api/cron/delete-expired`
- Review audit logs in Supabase
- Plan Phase 2 features

---

## 🆘 Troubleshooting

### Build Fails on Vercel
**Solution:** Check Vercel logs → Settings → Build & Development Settings
- Ensure `npm run build` works locally first
- Verify all env variables are set in Vercel

### Cron Job Not Running
**Solution:** 
1. Check Vercel dashboard → Cron Jobs
2. Verify `CRON_SECRET` matches in `vercel.json`
3. See recent executions in logs

### TypeScript Errors
**Solution:** Run locally:
```bash
npm run typecheck
# Fix any errors, then redeploy
```

### Supabase Connection Fails
**Solution:** Verify in `.env.local`:
```bash
npm run dev
# Check browser console for connection errors
```

---

## 📞 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Clerk Docs:** https://clerk.com/docs

---

**Status:** Phase 1 Ready for Production ✅
