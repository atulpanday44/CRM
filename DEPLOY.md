# Deploy CRM

## Free options (no paid hosting)

### Option 1: Run both locally (simplest)

Everything works on your machine with no deploy:

```bash
# Terminal 1 — backend
cd backend-spring
export SUPERADMIN_EMAIL=4.pandeyatul@gmail.com
export SUPERADMIN_PASSWORD=YourPassword123!
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

Open **http://localhost:5173** and log in. Ideal for development.

---

### Option 2: Frontend on Vercel + backend local (you demo only)

Useful when the frontend is live on Vercel but only **you** demo it:

1. Deploy frontend to [Vercel](https://vercel.com) (Root Directory: `frontend`, no env vars).
2. Run the backend locally (see Option 1).
3. Visit your Vercel URL **from the same machine** where the backend runs. Your browser will call `localhost:8080`, so it works only while backend is running locally.

---

### Option 3: Expose local backend via tunnel (shareable demo)

Use a tunnel so others can reach your local backend. Works with your Vercel frontend.

**Using Cloudflare (no sign-up):**

1. [Download cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) and install.
2. Start your backend: `cd backend-spring && mvn spring-boot:run -Dspring-boot.run.profiles=dev`
3. In another terminal:

   ```bash
   cloudflared tunnel --url http://localhost:8080
   ```

4. Copy the `trycloudflare.com` URL (e.g. `https://abc-xyz.trycloudflare.com`).
5. In Vercel, set `VITE_API_URL` = `https://your-tunnel-url.trycloudflare.com/api` and redeploy the frontend.
6. In your backend, set `CORS_ORIGINS` = your Vercel URL (e.g. `https://crm-xxx.vercel.app`) via env var and restart.

**Or using ngrok (free tier):**

1. Sign up at [ngrok.com](https://ngrok.com), install ngrok, add authtoken.
2. Start backend, then: `ngrok http 8080`
3. Use the ngrok URL in `VITE_API_URL` and `CORS_ORIGINS` as above.

**Note:** Tunnel URLs change each time you restart (Cloudflare Quick Tunnel) or on ngrok free tier. You’ll need to update Vercel and redeploy whenever the URL changes.

---

## Paid options (when you add a card later)

Render, Railway, Koyeb, Fly.io, etc. can host both frontend and backend. The `render.yaml` Blueprint is ready; connect it at [dashboard.render.com](https://dashboard.render.com) when you’re on a paid plan.
