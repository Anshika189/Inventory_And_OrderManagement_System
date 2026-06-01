# 📦 InventoryFlow Pro

> **Modern Inventory & Order Management Platform** — a production-grade full-stack reference application built with React, FastAPI, and PostgreSQL.

InventoryFlow Pro gives small and growing businesses a beautifully designed, fast, and reliable way to manage their **products**, **customers**, and **orders** — with a dashboard, real-time stock deduction, business-rule enforcement, and a CI-friendly containerized stack.

---

## ✨ Highlights

- **Premium SaaS dashboard** — animated KPI cards, stock & order trend charts, low-stock alerts, top-selling products, recent orders.
- **Strict business rules** — unique SKU/email, non-negative stock, prevent orders when stock is insufficient, auto-deduct stock, auto-compute totals.
- **Enterprise backend** — FastAPI + SQLAlchemy 2.0 + Pydantic v2 + Alembic migrations, repository/service layering, standardized API envelopes.
- **Modern frontend** — React 18 + Vite + TailwindCSS, React Query, React Hook Form + Zod, Framer Motion, Recharts, Lucide icons.
- **Production-ready infra** — multi-stage Dockerfiles, docker-compose with health-checks, named Postgres volume, nginx for the frontend.
- **DX-first** — typed env, one-command dev, seed data, sample tests, command palette (⌘K), dark mode, error boundary, toasts.

---

## 🏗 Architecture

```
┌────────────────────────┐    HTTP / JSON    ┌────────────────────────┐
│  React (Vite + Nginx) │ ────────────────▶ │  FastAPI (Uvicorn)     │
│  Tailwind, RQ, RHF     │                   │  Services / Repos      │
└────────────────────────┘                   │  SQLAlchemy 2.0        │
                                             └──────────┬─────────────┘
                                                        │  psycopg2
                                                        ▼
                                             ┌────────────────────────┐
                                             │  PostgreSQL 16         │
                                             │  (named volume)        │
                                             └────────────────────────┘
```

### Repository layout

```
.
├── Backend/                      # FastAPI service
│   ├── app/
│   │   ├── api/                  # Routers (products, customers, orders, dashboard)
│   │   ├── core/                 # Config, exceptions, security
│   │   ├── database/             # Engine, session, base
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── repositories/         # Data access
│   │   ├── schemas/              # Pydantic request/response models
│   │   ├── services/             # Business logic
│   │   └── main.py               # FastAPI factory + handlers
│   ├── alembic/                  # Database migrations
│   ├── scripts/seed.py           # Sample seed data
│   ├── tests/                    # Pytest suite
│   ├── Dockerfile
│   └── requirements.txt
├── Frontend/vite-project/        # React SPA
│   ├── src/
│   │   ├── components/{ui,layout,shared}
│   │   ├── pages/{dashboard,products,customers,orders}
│   │   ├── hooks/                # React Query hooks
│   │   ├── services/api/         # Axios client
│   │   ├── store/                # Lightweight UI state
│   │   ├── contexts/             # Theme
│   │   ├── routes/               # React Router
│   │   └── utils/                # cn, format, stock, csv
│   ├── Dockerfile
│   ├── nginx.conf.template
│   └── tailwind.config.js
├── docker-compose.yml            # Orchestrates Postgres + Backend + Frontend
├── .env.example                  # Environment template
└── README.md
```

---

## 🚀 Quick start

### Option A — Docker (recommended)

```bash
git clone https://github.com/<your-org>/inventoryflow-pro.git
cd inventoryflow-pro
cp .env.example .env
docker compose up --build
```

Then open:

- App: <http://localhost:8080>
- API: <http://localhost:8000/docs>

### Option B — Local development

#### Backend

```bash
cd Backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Point DATABASE_URL to a local Postgres instance
alembic upgrade head
python scripts/seed.py
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd Frontend/vite-project
npm install
cp .env.example .env  # set VITE_API_URL=http://localhost:8000/api
npm run dev
```

App runs on <http://localhost:5173>.

---

## 🔌 API

Base URL: `/api`

| Method | Endpoint              | Description                       |
|--------|-----------------------|-----------------------------------|
| GET    | `/health`             | Liveness probe                    |
| GET    | `/dashboard`          | Aggregated dashboard metrics      |
| POST   | `/products`           | Create product                    |
| GET    | `/products`           | List products (paginated/search)  |
| GET    | `/products/{id}`      | Get a product                     |
| PUT    | `/products/{id}`      | Update a product                  |
| DELETE | `/products/{id}`      | Delete a product                  |
| POST   | `/customers`          | Create customer                   |
| GET    | `/customers`          | List customers                    |
| GET    | `/customers/{id}`     | Get a customer                    |
| PUT    | `/customers/{id}`     | Update a customer                 |
| DELETE | `/customers/{id}`     | Delete a customer                 |
| POST   | `/orders`             | Create order (auto-deduct stock)  |
| GET    | `/orders`             | List orders                       |
| GET    | `/orders/{id}`        | Get order with line items         |
| DELETE | `/orders/{id}`        | Delete an order                   |

All responses are wrapped in a standardized envelope:

```json
{ "success": true, "message": "OK", "data": { /* payload */ } }
```

Errors:

```json
{ "success": false, "message": "Insufficient stock", "code": "insufficient_stock", "errors": [] }
```

Full schema available at `/docs` (Swagger UI) and `/redoc`.

---

## 🧠 Business rules

- **Products**
  - `name` required (1–200 chars)
  - `sku` required, **unique** (case-insensitive, normalized to uppercase)
  - `price > 0`
  - `stock_quantity >= 0` (DB-level check constraint)
- **Customers**
  - `full_name` required
  - `email` valid and **unique**
  - `phone` optional, validated format
- **Orders**
  - One customer per order, ≥ 1 line item
  - Quantity > 0 per line
  - Stock availability validated **before** any mutation
  - Stock is deducted atomically (row-level `SELECT … FOR UPDATE`)
  - `total_amount` computed server-side

---

## 🗄 Database

PostgreSQL 16. All tables use UUID primary keys (server-generated), timezone-aware timestamps, named-check constraints, and indexes on commonly-queried columns (`sku`, `email`, `customer_id`, `status`, `created_at`).

The migration lives at `Backend/alembic/versions/0001_initial.py`. New migrations:

```bash
cd Backend
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

---

## 🧪 Testing

### Backend

```bash
cd Backend
pytest -q
```

Covers product/customer/order endpoints, business rules, dashboard aggregates, and the `/health` probe. Tests run against an in-memory SQLite engine with full isolation per test.

### Frontend

```bash
cd Frontend/vite-project
npm run test
```

Component smoke tests + utility test suite.

---

## 🐳 Docker

`docker-compose.yml` orchestrates three services:

| Service   | Image                              | Port  | Notes                              |
|-----------|------------------------------------|-------|------------------------------------|
| postgres  | `postgres:16-alpine`               | 5432  | Named volume `inventoryflow_postgres_data` |
| backend   | built from `Backend/Dockerfile`    | 8000  | Multi-stage, non-root, healthcheck |
| frontend  | built from `Frontend/.../Dockerfile` | 80 → 8080 | Nginx, proxies `/api` to backend |

> Health-checks gate `depends_on` so the backend never starts before Postgres is ready, and the frontend never starts before the backend reports healthy.

---

## ☁️ Deployment

### Backend → Render

1. Push the repo to GitHub.
2. On Render, click **New +** → **Blueprint** and point at the repo (an `render.yaml` is provided in `Backend/`).
3. Render auto-detects Python, installs requirements, runs `alembic upgrade head`, then starts with `uvicorn`.
4. Set env vars: `DATABASE_URL` (use Render Postgres), `SECRET_KEY`, `BACKEND_CORS_ORIGINS`, `FRONTEND_URL`.

### Frontend → Vercel

1. Import the repo, set the **Root Directory** to `Frontend/vite-project`.
2. Framework preset: **Vite**.
3. Add env var: `VITE_API_URL` = your Render backend URL + `/api`.
4. Deploy.

### Docker Hub

```bash
# Tag and push the backend image
docker build -t <your-dockerhub>/inventoryflow-backend:1.0.0 ./Backend
docker push <your-dockerhub>/inventoryflow-backend:1.0.0

# Optional: also publish the frontend image
docker build -t <your-dockerhub>/inventoryflow-frontend:1.0.0 ./Frontend/vite-project
docker push <your-dockerhub>/inventoryflow-frontend:1.0.0
```

---

## 🔐 Environment variables

See `.env.example` (repo root) and `Backend/.env.example`. **Never** commit real secrets.

| Variable                 | Description                                  |
|--------------------------|----------------------------------------------|
| `POSTGRES_*`             | Database credentials                         |
| `SECRET_KEY`             | Server-side signing key                      |
| `BACKEND_CORS_ORIGINS`   | JSON list of allowed origins                 |
| `FRONTEND_URL`           | Where the SPA is hosted (for redirects)      |
| `VITE_API_URL`           | Frontend → backend base URL (baked at build) |
| `API_PROXY_PASS`         | nginx upstream URL (used at container start) |
| `LOG_LEVEL`              | `INFO` / `DEBUG` / `WARNING`                 |

---

## 🛡 Security

- All secrets loaded from environment — nothing hard-coded.
- CORS restricted via configurable allow-list.
- Pydantic + SQLAlchemy ORM = no SQL-injection surface.
- DB-level check constraints on stock and price.
- Strict input validation on every endpoint.
- Non-root user inside the backend container.

---

## 🧭 Roadmap / future improvements

- Authentication & RBAC (JWT + refresh tokens)
- Stripe / payment integration on orders
- Per-tenant multi-tenancy
- Audit log + activity feed
- Email & webhook notifications
- Inventory forecasting using time-series data
- Mobile-first PWA + offline support
- WebSocket-powered live dashboard updates

---

## 📝 License

MIT — feel free to use, learn from, and extend.

---

Built with care for the next generation of inventory teams. 🚀
