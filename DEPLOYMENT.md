# 🚀 InventoryFlow Pro — Deployment Guide

This project is designed to support **two deploy modes** with the same code:

| Mode | Use case | Setup |
|---|---|---|
| **Local (Docker Compose)** | For you, your friends, recruiters, reviewers | `docker compose up` |
| **Cloud (Render + Vercel + Neon)** | Real production deployment | See below |

---

## 🐳 Mode 1 — Local with Docker Compose

For anyone who wants to run the project on their own machine.

### Prerequisites
- Docker Desktop (or Docker Engine + Compose plugin)

### Run it
```bash
git clone <your-repo-url>
cd inventory-and-order-management-system
cp .env.example .env       # (optional — defaults work out of the box)
docker compose up -d --build
```

That's it. After ~2 minutes:
- **Frontend:** http://localhost:8080
- **API docs:** http://localhost:8000/docs
- **Postgres:** localhost:5432 (user/pass = `postgres` / `postgres`)

### Data persistence
All data is stored in the `inventoryflow_postgres_data` Docker volume. To wipe it:
```bash
docker compose down -v
```

### Customize
Edit `.env`:
- `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` — DB credentials
- `BACKEND_CORS_ORIGINS` — add your own origins if you expose the backend somewhere
- `SECRET_KEY` — set to a real random string for production

---

## ☁️ Mode 2 — Production Deploy (Render + Vercel + Neon)

Recommended stack:
```
┌─────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   Vercel        │       │   Render         │       │   Neon           │
│  (Frontend SPA) │ ────► │  (Backend API)   │ ────► │  (Postgres DB)   │
│  inventoryflow  │ HTTPS │  FastAPI + Docker│ TCP   │  Free tier       │
│  .vercel.app    │       │  .onrender.com   │       │  neon.tech       │
└─────────────────┘       └──────────────────┘       └──────────────────┘
```

### Step 1 — Get a managed Postgres (Neon — free)

1. Sign up at https://neon.tech
2. Create a project (free tier: 0.5 GB, plenty for this app)
3. Copy the **pooled** connection string. It looks like:
   ```
   postgresql+psycopg2://neondb_owner:PASS@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. **Save this — you'll paste it in Step 2 and Step 3.**

### Step 2 — Deploy the backend to Render

#### Option A — Blueprint (one click)
1. Push your repo to GitHub.
2. Go to https://render.com → **New** → **Blueprint**.
3. Point it at your GitHub repo. Render detects `render.yaml` automatically.
4. Render creates a `inventoryflow-backend` service.
5. In the Render dashboard for the new service, set these env vars:
   - `DATABASE_URL` = your Neon connection string from Step 1
   - `FRONTEND_URL` = `https://<your-app>.vercel.app` (you'll fill this in after Step 3)
   - `BACKEND_CORS_ORIGINS` = `'["https://<your-app>.vercel.app"]'`
6. Click **Apply**. The backend will build (~2–3 min) and deploy.
7. Copy the backend's public URL (e.g. `https://inventoryflow-backend.onrender.com`).

#### Option B — Manual
1. Go to https://render.com → **New** → **Web Service**.
2. Connect your GitHub repo.
3. Settings:
   - **Root Directory:** `Backend`
   - **Runtime:** Docker
   - **Dockerfile Path:** `./Dockerfile`
   - **Health Check Path:** `/health`
4. Add the same env vars as above.
5. Deploy.

#### Run migrations (one-time)

The backend's Dockerfile runs `alembic upgrade head` automatically on container start, so your schema is created on first boot. No action needed unless you have a custom migration.

If you want to seed sample data into the production DB:
```bash
cd Backend
export DATABASE_URL="postgresql+psycopg2://neondb_owner:PASS@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
python scripts/seed.py
```

### Step 3 — Deploy the frontend to Vercel

1. Go to https://vercel.com → **Add New Project**.
2. Import your GitHub repo.
3. Settings:
   - **Root Directory:** `Frontend/vite-project` (click "Edit" next to the root)
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment Variables** — add:
   - `VITE_API_URL` = `https://inventoryflow-backend.onrender.com/api`
5. Click **Deploy**. Vercel builds and serves the SPA on `https://<your-app>.vercel.app`.

### Step 4 — Point CORS the right way

Now that you have the real Vercel URL, update Render:
- `FRONTEND_URL` = `https://<your-app>.vercel.app`
- `BACKEND_CORS_ORIGINS` = `'["https://<your-app>.vercel.app"]'`

Render will redeploy automatically.

### Step 5 — Verify

Visit `https://<your-app>.vercel.app`:
- ✅ Dashboard loads
- ✅ Browser console: no CORS errors
- ✅ Network tab: requests go to `https://<your-app>.vercel.app/api/...` (same origin, no CORS)
- ✅ Create a product / customer / order, refresh, data persists

---

## 🌍 Other deploy options

### Railway (alternative to Render)
1. https://railway.app → **New Project** → **Deploy from GitHub**
2. Choose the repo. Railway auto-detects the Dockerfile in `Backend/`.
3. Add a **Postgres** plugin from the Railway dashboard.
4. Set `DATABASE_URL` to the `DATABASE_URL` Railway provides.
5. Deploy.

### Fly.io (alternative to Render)
```bash
cd Backend
fly launch          # auto-detects Dockerfile
fly postgres create
fly postgres attach <db-name>   # sets DATABASE_URL
fly deploy
```

### Vercel for the backend (alternative, requires refactor)
FastAPI on Vercel is possible but not ideal — Render/Railway are simpler.

### VPS (Hetzner / DigitalOcean / AWS EC2)
```bash
ssh user@your-server
git clone <repo>
cd inventory-and-order-management-system
cp .env.example .env
# edit .env to set DATABASE_URL to your managed DB (or let it use the bundled one)
docker compose up -d --build
# point your domain's DNS A record to this server's IP
```

---

## 🔐 Production checklist

Before going live:
- [ ] `SECRET_KEY` is a real random 32+ character string (Render's `generateValue: true` does this)
- [ ] `DATABASE_URL` uses `sslmode=require` (Neon/Supabase need this)
- [ ] `BACKEND_CORS_ORIGINS` is locked to your real frontend URL(s) — no wildcards
- [ ] `APP_ENV=production` is set
- [ ] Logs/monitoring is configured (Render has this built in)
- [ ] Backups are enabled on the database (Neon free tier has 7-day point-in-time recovery)
- [ ] You have a custom domain (optional but nice)

---

## 🧰 Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Backend boots but `/health` returns `db: false` | `DATABASE_URL` wrong or DB unreachable | Check the connection string, ensure `sslmode=require` for Neon |
| Frontend shows CORS error | `BACKEND_CORS_ORIGINS` doesn't include the Vercel URL | Update it on Render, redeploy |
| 404 on `/api/dashboard` from the browser | `VITE_API_URL` is relative (`/api`) but frontend isn't using a proxy | On Vercel, set `VITE_API_URL=https://<backend>.onrender.com/api` |
| Render free tier sleeps after 15 min idle | Free tier behavior | Upgrade to Starter ($7/mo) or use Railway/Fly |
| Migrations didn't run | Entrypoint failed | Check Render logs for the `alembic upgrade head` output |
