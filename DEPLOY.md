# Deploy CRM (100% Free – No Credit Card)

Use **Vercel** (frontend) + **Koyeb** (backend + database). Both have free tiers.

---

## Deploy from terminal (Koyeb backend)

If you have a Koyeb account and token:

1. Get **KOYEB_TOKEN** from [app.koyeb.com/account/api](https://app.koyeb.com/account/api)
2. Create **PostgreSQL** at app.koyeb.com → Create → Database → copy **Connection URI**
3. Run from project root:

```bash
KOYEB_TOKEN=xxx DATABASE_URL="postgresql://..." \
SUPERADMIN_EMAIL=admin@example.com SUPERADMIN_PASSWORD=your-password \
./scripts/deploy-koyeb.sh
```

Then deploy frontend on Vercel (see below).

---

## Part 1: Backend + Database on Koyeb (Dashboard)

### 1. Create Koyeb Account
- Go to **[app.koyeb.com](https://app.koyeb.com)** and sign up (GitHub works)
- Free tier: 1 web service + 1 Postgres database (50 hrs/month)

### 2. Add PostgreSQL
1. Click **Create** → **Database**
2. Choose **PostgreSQL**
3. Name it `crm-db`
4. Region: pick one (e.g. US East)
5. Click **Create Database**
6. Once ready, open the database → **Connection** tab
7. Copy the **Connection URI** (format: `postgresql://user:pass@host:port/db`)

### 3. Deploy Backend
1. Click **Create** → **Web Service**
2. **Deploy from GitHub** → connect repo → select **atulpanday44/CRM**
3. **Builder**:
   - Toggle **Override** for **Work directory** → set to `backend-spring`
   - Builder: **Java** (or Dockerfile if you prefer)
4. **Environment variables**:
   ```
   DATABASE_URL           = (paste Connection URI from step 2)
   SPRING_PROFILES_ACTIVE  = pg
   SUPERADMIN_EMAIL        = admin@example.com
   SUPERADMIN_PASSWORD     = your-secure-password
   ```
5. Click **Deploy**
6. After deploy, open the service → **Domains** → **Generate domain**
7. Copy the backend URL (e.g. `https://crm-backend-xxxx.koyeb.app`)

---

## Part 2: Frontend on Vercel

### 1. Create Vercel Account
- Go to **[vercel.com](https://vercel.com)** and sign up with GitHub

### 2. Deploy Frontend
1. Click **Add New** → **Project**
2. Import **atulpanday44/CRM**
3. **Configure Project**:
   - **Root Directory**: click **Edit** → set to `frontend`
   - **Framework Preset**: Vite (auto-detected)
   - **Environment Variables** → Add:
     ```
     VITE_API_URL = https://YOUR-KOYEB-BACKEND-URL/api
     ```
     (Replace with your Koyeb backend URL from Part 1, step 7)
4. Click **Deploy**
5. Copy the frontend URL (e.g. `https://crm-xxxx.vercel.app`)

---

## Part 3: Fix CORS

1. Go back to **Koyeb** → your backend service
2. **Settings** → **Environment variables** → Add:
   ```
   CORS_ORIGINS = https://YOUR-VERCEL-FRONTEND-URL
   ```
   (No trailing slash)
3. Save — the backend will redeploy

---

## Done

Open your Vercel frontend URL and log in with `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD`.

---

## Alternative: Railway (Trial Credit)

Railway offers $5 trial credit (≈30 days). See the original steps above if you prefer Railway.
