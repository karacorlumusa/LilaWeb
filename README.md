# LilaWeb

Minimal notes to develop and run the frontend. Backend (.NET API) lives under `dotnet-api/`.

## Tech stack
- Vite + React + TypeScript
- Tailwind CSS
- shadcn/ui components (in `src/components/ui`)

## Useful paths
- `index.html` – HTML entry
- `vite.config.ts` – Vite config
- `tailwind.config.ts` – Tailwind config
- `src/main.tsx` – App entry
- `src/pages/Index.tsx` – Home
- `src/pages/Admin.tsx` – Admin dashboard

## Commands
- Install deps: `pnpm i`
- Dev server: `pnpm run dev`
- Build: `pnpm run build`

API base URL defaults to `http://localhost:5000/api` and can be adjusted in `src/services/api.ts`.
