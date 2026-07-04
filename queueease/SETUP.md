# Setup Guide - Running QueueEase Locally

This assumes a completely fresh machine (Windows, macOS, or Linux). Follow it in order.

## 1. Install Node.js

You need Node.js 18 or newer.

- Go to https://nodejs.org and download the **LTS** version for your OS.
- Install it (default options are fine).
- Verify it worked by opening a terminal (Command Prompt/PowerShell on Windows, Terminal on macOS/Linux) and running:

```bash
node -v
npm -v
```

You should see version numbers, e.g. `v20.11.0` and `10.2.4`.

## 2. Install MongoDB

You have two options - pick whichever is easier for you.

### Option A - MongoDB Atlas (cloud, no local install, recommended if you want the fastest path)

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. Create a free "M0" cluster (takes a couple of minutes to provision).
3. Under **Database Access**, create a database user with a username and password.
4. Under **Network Access**, add your current IP (or `0.0.0.0/0` for "allow from anywhere" while testing).
5. Click **Connect** on your cluster → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/queueease?retryWrites=true&w=majority
   ```
6. You'll paste this into the backend `.env` file in step 4 below.

### Option B - MongoDB installed locally

- **Windows/macOS:** download the installer from https://www.mongodb.com/try/download/community and follow the installer (choose "Install as a Service" on Windows so it starts automatically).
- **macOS with Homebrew:**
  ```bash
  brew tap mongodb/brew
  brew install mongodb-community
  brew services start mongodb-community
  ```
- **Linux (Ubuntu/Debian):** follow https://www.mongodb.com/docs/manual/administration/install-on-linux/ for your distro, then:
  ```bash
  sudo systemctl start mongod
  sudo systemctl enable mongod
  ```
- Once installed and running, your connection string is simply:
  ```
  mongodb://127.0.0.1:27017/queueease
  ```

## 3. Get the project onto your machine

If you received this as a folder/zip, just extract it somewhere and open a terminal in that folder.

If you're pushing it to GitHub first:

```bash
cd queueease
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-empty-github-repo-url>
git push -u origin main
```

Then to run it on another machine: `git clone <repo-url>` and continue below.

## 4. Set up the backend

```bash
cd backend
npm install
```

Copy the example environment file:

```bash
# macOS/Linux
cp .env.example .env

# Windows (PowerShell)
copy .env.example .env
```

Open the new `.env` file in any text editor and fill in:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/queueease
JWT_SECRET=any_long_random_string_you_want
CLIENT_URL=http://localhost:5173
```

- If you used **MongoDB Atlas**, replace `MONGO_URI` with the connection string you copied in step 2.
- `JWT_SECRET` can be any random string - it's used to sign login tokens. Something like `mysecretkey12345changeThis` is fine for local use.
- Leave `CLIENT_URL` as-is unless you change the frontend's port.

Seed the database with a demo admin account, a demo staff account, and a few sample departments:

```bash
npm run seed
```

You should see output confirming the accounts were created. This only needs to be run once.

Start the backend:

```bash
npm run dev
```

You should see:
```
MongoDB connected: ...
QueueEase API running on port 5000
```

Leave this terminal window open and running.

## 5. Set up the frontend

Open a **new** terminal window (keep the backend one running) and:

```bash
cd frontend
npm install
```

Copy the example environment file:

```bash
# macOS/Linux
cp .env.example .env

# Windows (PowerShell)
copy .env.example .env
```

The defaults inside are already correct for local use:

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

You should see something like:
```
VITE ready
➜  Local:   http://localhost:5173/
```

## 6. Open the app

Go to **http://localhost:5173** in your browser.

- As a **customer**: pick a department, join the queue, watch your ticket update live.
- As **staff**: click "Staff / Admin Login" top right, sign in with `staff@queueease.com` / `staff123`, and manage the "General Checkup" queue.
- As **admin**: sign in with `admin@queueease.com` / `admin123` to add departments, create more staff accounts, and view stats.

To see the real-time updates in action, open the customer ticket page in one browser tab and the staff dashboard in another (or on your phone) - calling "next" on staff side updates the customer's tab instantly, with no refresh.

## Troubleshooting

- **"Failed to connect to MongoDB"** - make sure MongoDB is actually running (`brew services list` on macOS, `sudo systemctl status mongod` on Linux, check Services app on Windows), or double check your Atlas connection string and that your IP is whitelisted under Network Access.
- **Frontend loads but shows no departments / network errors** - make sure the backend terminal is still running and shows no errors, and that `VITE_API_URL` in `frontend/.env` matches the port the backend is running on.
- **"Port already in use"** - something else is using port 5000 or 5173. Either close that program, or change `PORT` in `backend/.env` (and update `VITE_API_URL` to match).
- **Login fails with demo accounts** - make sure you ran `npm run seed` inside the `backend` folder before trying to log in.
