# EduTC Deploy

This repo is now prepared for:

- `frontend` on Vercel
- `backend` on Render
- MongoDB Atlas as the shared database

## 1. MongoDB Atlas

1. Create a cluster in MongoDB Atlas.
2. Create a database user.
3. Add the IP allowlist rule for Render:
   Use `0.0.0.0/0` during setup, then tighten later if desired.
4. Copy the Node.js connection string.
5. Replace the database name with `edutc`.

## 2. Render Backend

1. In Render, create a new Blueprint or Web Service from this repository.
2. Set the backend root directory to `backend` if Render asks.
3. Use these values:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables:
   - `PORT=10000`
   - `FRONTEND_URL=https://your-frontend-domain.vercel.app`
   - `MONGODB_URI=<your-atlas-connection-string>`
   - `JWT_SECRET=<random-long-secret>`
   - `SESSION_SECRET=<random-long-secret>`
5. Deploy the backend.

## 3. Seed Courses

After backend deploy, open the Render shell or run locally:

```bash
cd backend
node scripts/seedCourses.js
```

This creates shared courses in MongoDB so they appear for every device.

## 4. Vercel Frontend

In Vercel, keep:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `build`

Add the frontend environment variable:

- `VITE_API_URL=https://your-render-backend.onrender.com/api`

Then redeploy the frontend.

## 5. Result

After both services are live:

- registration works across all devices
- login works across all devices
- admin panel reads shared users and shared courses
- leaderboard is shared across devices

## Important

If `VITE_API_URL` is missing or the backend is offline, the frontend falls back to local browser storage. In that mode, users are not shared between devices.
