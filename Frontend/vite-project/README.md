# InventoryFlow Pro · Frontend

React 18 + Vite + TailwindCSS + React Query + Framer Motion.

## Local dev

```bash
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev
```

Open <http://localhost:5173>.

## Scripts

| Script           | Description                              |
|------------------|------------------------------------------|
| `npm run dev`    | Vite dev server with `/api` proxy        |
| `npm run build`  | Production build → `dist/`               |
| `npm run preview`| Serve the production build locally       |
| `npm run test`   | Run Vitest suite                         |
| `npm run lint`   | ESLint                                   |

## Project layout

```
src/
├── components/{ui,layout,shared}   # Reusable building blocks
├── pages/                          # Route components
├── hooks/                          # React Query + custom hooks
├── services/api/                   # Axios client + endpoints
├── store/                          # Lightweight UI state
├── contexts/                       # Theme context
├── routes/                         # Router config
├── utils/                          # cn, format, stock, csv
└── test/                           # Vitest setup + tests
```

## Design system

Tokens live in `tailwind.config.js` + `index.css`. To re-theme:

- Colors / radii / fonts: edit `:root` in `index.css` (light) and `.dark` (dark).
- Animation keyframes: extend the `theme.extend.keyframes` block.

## Deployment

### Vercel (recommended)

1. Import the repo, set **Root Directory** to `Frontend/vite-project`.
2. Add env var: `VITE_API_URL=https://<your-backend>.onrender.com/api`.
3. Deploy — `vercel.json` rewrites are included for SPA routing.

### Docker

```bash
docker build -t inventoryflow-frontend:1.0.0 .
docker run -p 8080:80 \
  -e API_PROXY_PASS=https://<your-backend>/api \
  inventoryflow-frontend:1.0.0
```
