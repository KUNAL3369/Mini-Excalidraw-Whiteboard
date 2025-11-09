# Deployment guide (Render backend + Vercel frontend)

Short checklist to deploy the project (backend to Render, frontend to Vercel).

1. Backend — Render

- Confirm `render.yaml` is present at the repo root (it should point `rootDir: server`).
- In Render dashboard, New → Web Service → Connect repo → select this repository.
- If Render reads `render.yaml` it will create the service automatically. If not, create a web service and set:
  - Root directory: `server`
  - Environment: Node
  - Build command: `npm install`
  - Start command: `npm start`
- Make sure server uses `process.env.PORT` (already implemented in `server/src/app.js`).
- Wait for the deploy logs and copy the public service URL (e.g. `https://<your-backend>.onrender.com`).

2. Frontend — Vercel

- You can deploy from the Vercel dashboard (New Project → Import Git Repository) or use the Vercel CLI.
- When importing:
  - Set Root Directory to `client` (so Vercel runs `npm install` and `npm run build` there).
  - Build command: `npm run build` (detected automatically for CRA)
  - Output directory: `build`
- Add environment variable `REACT_APP_API_URL` pointing to the Render backend URL from step 1.

3. Local testing

- Start server locally: `cd server && npm install && npm start` (listen on port configured by `process.env.PORT` or 5000).
- Start client locally: `cd client && npm install && npm start` (CRA dev server).
- Locally the client will use `process.env.REACT_APP_API_URL` if set, otherwise fall back to `http://localhost:5000` (see `client/src/config.ts`).

4. Notes and cleanup

- `.gitignore` has been added to ignore `node_modules/` and build outputs.
- If server or client `node_modules` are still large in Git history, consider using BFG to remove them from history (this rewrites history).
- If anything fails, check Render and Vercel build logs for errors and ensure environment variables are set.
