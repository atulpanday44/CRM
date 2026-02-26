# Deploy CRM to Railway (Free)

Follow these steps to deploy your CRM live. Railway free tier works without a credit card.

## Step 1: Create Project

1. Go to **[railway.com/new](https://railway.com/new)**
2. Sign in with **GitHub**
3. Click **Deploy from GitHub repo**
4. Select **atulpanday44/CRM** (or your repo name)
5. Click **Add variables** or **Deploy now** — you’ll add services next

## Step 2: Add PostgreSQL

1. In your project, click **+ New**
2. Choose **Database** → **PostgreSQL**
3. Wait for it to provision
4. Open the Postgres service → **Variables** tab
5. Copy **DATABASE_URL** (or **DATABASE_PRIVATE_URL** — use this for backend)

## Step 3: Deploy Backend

1. Click **+ New** → **GitHub Repo**
2. Select the same repo (**atulpanday44/CRM**)
3. In the new service:
   - **Settings** → **Root Directory**: set to `backend-spring`
   - **Variables** (tab) → **Add variables**:
     ```
     DATABASE_URL          = (paste from Postgres)
     SPRING_PROFILES_ACTIVE = pg
     SUPERADMIN_EMAIL      = admin@example.com
     SUPERADMIN_PASSWORD   = your-secure-password
     ```
4. **Settings** → **Networking** → **Generate Domain**
5. Copy the backend URL (e.g. `https://crm-backend-production-xxxx.up.railway.app`)

## Step 4: Deploy Frontend

1. Click **+ New** → **GitHub Repo**
2. Select the same repo
3. In the new service:
   - **Settings** → **Root Directory**: set to `frontend`
   - **Settings** → **Build**:
     - Build Command: `npm ci && npm run build`
     - Output Directory: `dist`
   - **Variables** → Add:
     ```
     VITE_API_URL = https://YOUR-BACKEND-URL/api
     ```
     (Replace `YOUR-BACKEND-URL` with the URL from Step 3, e.g. `https://crm-backend-production-xxxx.up.railway.app`)
4. **Settings** → **Networking** → **Generate Domain**
5. Copy the frontend URL

## Step 5: Fix CORS

1. Open the **backend** service
2. **Variables** → Add:
   ```
   CORS_ORIGINS = https://YOUR-FRONTEND-URL
   ```
   (Use the frontend URL from Step 4, no trailing slash)
3. The backend will redeploy automatically

## Step 6: Done

1. Open your frontend URL in a browser
2. Log in with `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD`

---

**Note:** If the frontend shows a blank page or API errors, check that `VITE_API_URL` is set correctly and that the backend has finished deploying.
