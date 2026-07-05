# Setup Guide - Running QueueEase Locally

This guide covers the exact steps needed to install dependencies, configure the app, and run both the backend and frontend for this repository.

## 1. Prerequisites

Make sure you have:

- Node.js 18 or newer
- npm
- Docker (recommended) or a local MongoDB server

Verify the runtime tools:

```bash
node -v
npm -v
docker --version
```

## 2. Start MongoDB

Run MongoDB with Docker from the repository root:

```bash
docker run --name queueease-mongo -p 27017:27017 -d mongo:7.0
```

If the container already exists, start it with:

```bash
docker start queueease-mongo
```

The app expects MongoDB at:

```bash
mongodb://127.0.0.1:27017/queueease
```

## 3. Open the project

From the repository root:

```bash
cd /path/to/MERN-STACK
```

## 4. Set up the backend

```bash
cd queueease/backend
npm install
cp .env.example .env
```

Edit the new `.env` file and make sure it contains:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/queueease
JWT_SECRET=change_this_to_a_long_random_string
CLIENT_URL=http://localhost:5173
```

Seed the demo data and start the backend:

```bash
npm run seed
npm run dev
```

The backend should run at:

```text
http://localhost:5000
```

## 5. Set up the frontend

Open a second terminal and run:

```bash
cd /path/to/MERN-STACK/queueease/frontend
npm install
cp .env.example .env
npm run dev
```

The frontend should run at:

```text
http://localhost:5173
```

## 6. Sign in

After seeding the database, use these demo credentials:

- Admin: `admin@queueease.com` / `admin123`
- Staff: `staff@queueease.com` / `staff123`

## Troubleshooting

- If the backend cannot connect to MongoDB, confirm that the Docker container is running with `docker ps`.
- If the frontend cannot reach the backend, check that `VITE_API_URL` in the frontend `.env` matches `http://localhost:5000/api`.
- If a port is already in use, change the backend port in `queueease/backend/.env` and update the frontend URL accordingly.
- If login fails, run `npm run seed` again from the backend folder.
