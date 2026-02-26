# Deploy CRM

## Simple: Frontend on Vercel (no backend deploy)

Deploy the frontend live for your portfolio. The backend runs locally with H2 when you demo.

### 1. Deploy frontend to Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub (no card required).
2. Click **Add New** → **Project**.
3. Import **atulpanday44/CRM**.
4. **Configure**:
   - **Root Directory**: click **Edit** → set to `frontend`
   - **Framework**: Vite (auto-detected)
   - **Environment Variables**: leave empty (uses `localhost:8080` for API)
5. Click **Deploy**.

Your frontend is live at `https://crm-xxx.vercel.app`.

### 2. Run backend locally when demoing

```bash
cd backend-spring
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

This starts the backend with H2 (in-memory). Visit your Vercel URL — it will call `localhost:8080`, so it works when you're running the backend.

### 3. First login

On first run, create a superadmin:

```bash
export SUPERADMIN_EMAIL=admin@example.com
export SUPERADMIN_PASSWORD=your-password
cd backend-spring && mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

---

## Full deploy (frontend + backend) — when you have a host

When you find a free backend host (Koyeb, Railway, etc.):

- Deploy backend, get its URL
- Redeploy frontend on Vercel with `VITE_API_URL=https://your-backend-url/api`
- Add `CORS_ORIGINS` (your Vercel URL) to the backend
