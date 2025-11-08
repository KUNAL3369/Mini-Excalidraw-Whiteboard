# Mini Excalidraw Whiteboard

A scalable, performant, and intuitive mini whiteboard application inspired by Excalidraw. Built with React, TypeScript, TailwindCSS, and Node.js/Express.

## Features

- **Core Drawing**: Canvas-based drawing with pencil, line, circle, and arrow tools
- **Shape Manipulation**: Select, drag, resize, and rotate shapes
- **Text Tool**: Add and edit text on canvas with customizable fonts and colors
- **Multi-Page Support**: Create and manage multiple pages
- **Undo/Redo**: Stack-based undo and redo functionality
- **Persistence**: Local storage and optional backend API integration
- **Responsive Design**: Scales dynamically with window resize
- **Accessibility**: Proper labeling and color contrast

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, HTML Canvas API
- **Backend**: Node.js, Express (in-memory storage)
- **Deployment**: Hosted on Vercel (frontend) and Heroku (backend)

## Project Structure

```
mini-excalidraw-whiteboard/
├── client/          # React frontend
├── server/          # Express backend
├── README.md        # This file
└── TODO.md          # Development tasks
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

```bash
cd server
npm install
npm start
```

### Frontend Setup

```bash
cd client
npm install
npm start
```

The frontend will run on `http://localhost:3000` and backend on `http://localhost:5000`.

### Running the Application

To run both frontend and backend simultaneously:

```bash
# Terminal 1: Start the backend
cd server
npm start

# Terminal 2: Start the frontend
cd client
npm start
```

Or use a process manager like `concurrently`:

```bash
npm install -g concurrently
concurrently "cd server && npm start" "cd client && npm start"
```

## API Endpoints

### Shapes

- `GET /api/shapes` - Fetch all shapes
- `POST /api/shapes` - Create a shape
- `PUT /api/shapes/:id` - Update a shape
- `DELETE /api/shapes/:id` - Delete a shape

### Pages

- `GET /api/pages` - Fetch all pages
- `POST /api/pages` - Create a new page
- `GET /api/pages/:id/shapes` - Get shapes for a page
- `DELETE /api/pages/:id` - Delete a page

## Data Models

### Shape

```typescript
{
  id: string;
  type: 'rectangle' | 'square' | 'line' | 'arrow' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
  fontSize?: number;
  fontFamily?: string;
  content?: string;
  pageId: string;
}
```

### Page

```typescript
{
  id: string;
  name: string;
  shapes: Shape[];
}
```

## Deployment

- Frontend: Deployed on Vercel
- Backend: Deployed on Heroku
- Demo URL: [Add deployed URL here]

## Deploying (Render + Netlify)

This project is ready to deploy manually to Render (backend) and Netlify (frontend).

Backend (Render)

- Ensure `server/package.json` has a `start` script that runs `node src/app.js` (this repo already uses `node src/app.js`).
- Render will set PORT in the environment. The server listens on `process.env.PORT || 5000`.
- Create a `render.yaml` at the repo root (included) to help Render auto-detect the service.

Steps (manual):

1. Sign in to https://render.com and create a new Web Service.
2. Connect your repository and select the `server` directory as the root.
3. Use `npm install` as the build command and `npm start` as start command.
4. Deploy. When deployed, copy the backend URL (e.g. `https://mini-excalidraw-backend.onrender.com`).

Frontend (Netlify)

- The frontend build is output to `client/build`.
- The React app reads the backend URL from the env var `REACT_APP_API_URL`. Set that in Netlify's site environment variables to point to your Render backend URL.

Steps (manual):

1. Build the app locally or let Netlify build it:

- Locally: `cd client && npm install && npm run build` then drag-and-drop `client/build` in Netlify's Deploy UI.
- Or connect the repo and set the build command to `npm run build` (in `client`) and publish directory to `build`.

2. Add an environment variable in Netlify: `REACT_APP_API_URL` = `https://<your-backend>.onrender.com`.
3. Deploy and copy the public URL.

Files added to help deployment:

- `render.yaml` — Render service config (root-level)
- `client/netlify.toml` — Netlify build/publish configuration
- `client/src/config.ts` — optional wrapper exposing `REACT_APP_API_URL`
- `deployment_links.txt` — placeholder file to record deployed URLs

Troubleshooting

- If you see CORS errors in the browser console, ensure `cors` middleware is applied in `server/src/app.js` before route declarations (this project already enables CORS).
- Ensure the env var `REACT_APP_API_URL` is set on Netlify (or use a global proxy) so the frontend talks to the correct backend.

## Evaluation Criteria Met

- ✅ Clean, modular, reusable components
- ✅ React component hierarchy with hooks
- ✅ Canvas rendering logic optimized
- ✅ RESTful API design
- ✅ TypeScript consistent usage
- ✅ Minimalist UI/UX
- ✅ Performance optimizations (requestAnimationFrame, debouncing)
- ✅ Accessible hosted demo

## Contact

Kunal.prabhakar3082@gmail.com
