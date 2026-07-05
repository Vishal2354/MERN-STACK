# QueueEase

A digital queue management system for places that still make people stand in line - clinics, salons, banks, government offices, repair centers. Customers join a queue from their phone and get a live ticket instead of standing around; staff run the line from a simple dashboard.

Built for the MERN take-home assignment.

---

## Live demo flow (in one paragraph)

A customer opens the site, picks a department (e.g. "General Checkup"), enters their name and phone number, and gets a ticket with a token number. That ticket page updates in real time as staff call the next person, so the customer can wait wherever they like instead of standing at a counter. Staff log in to a dashboard scoped to their department, see who's waiting, and call the next token with one click. Admins manage departments and staff accounts and see a same-day stats overview.

---

## Assumptions

Since the brief was intentionally open-ended, here's what I assumed and why:

- **Customers don't need accounts.** Requiring signup before joining a queue adds friction for a walk-in use case - a clinic patient just wants a ticket, not another password to remember. Their "session" is just the unique ticket URL they're given.
- **"Department" is the generic unit**, standing in for an OPD counter, a salon chair, a bank teller window, etc. One flexible model covers every example the brief listed (clinics, salons, banks, government offices, repair centers) instead of building separate schemas per business type.
- **One organization per deployment.** The brief doesn't ask for multi-tenant SaaS (multiple businesses sharing one instance), so I scoped this to a single organization running multiple departments - closer to what a single clinic or bank branch would actually deploy. Multi-tenancy is a reasonable v2, noted below in Limitations.
- **Token numbers reset daily, per department.** This matches how physical queue ticket machines work and keeps numbers small and readable instead of growing forever.
- **Estimated wait time is a simple heuristic:** `(people ahead) × (average service time for that department)`. It's not based on live historical data - just what an MVP can reasonably promise.
- **Staff accounts are pre-provisioned by an admin**, not self-registered, since letting anyone create a "staff" login would defeat the point of scoping queue control to actual staff.

---

## Tech stack & why

- **MongoDB + Mongoose** - the data (departments, tickets, users) is naturally document-shaped and doesn't need complex joins, so schema flexibility was more useful than strict relational constraints.
- **Express** for the REST API, kept intentionally thin (routes → controllers, no unnecessary layers for an MVP this size).
- **Socket.io** for live queue updates. Polling every few seconds would technically work, but a queue app's entire value proposition is "know your status without checking constantly," so real-time push felt like the right call rather than a nice-to-have.
- **React (Vite) + Tailwind v4** on the frontend for a fast dev loop and small bundle.
- **JWT** for staff/admin auth - stateless and simple enough for this scope; no session store needed.

---

## Features implemented

**Customer**
- Browse open departments with average wait time
- Join a queue with just name + phone (no account)
- Live ticket page: token number, position in line, estimated wait, status
- Cancel a ticket

**Staff**
- Login scoped to their assigned department
- See who's waiting and who's currently at the counter
- Call next customer, mark as arrived, mark complete, mark no-show
- All actions push live updates to any customer watching their ticket

**Admin**
- Create/edit/hide/delete departments
- Create staff accounts and assign them to a department
- Same-day stats overview per department (total, completed, waiting, cancelled)

---

## Project structure

```
queueease/
├── backend/
│   └── src/
│       ├── config/       # DB connection
│       ├── models/       # User, Department, Ticket
│       ├── controllers/  # request handlers / business logic
│       ├── routes/       # Express routers
│       ├── middleware/   # auth guard, error handler
│       ├── sockets/      # Socket.io room logic
│       ├── utils/        # JWT helper, seed script
│       └── server.js
└── frontend/
    └── src/
        ├── pages/
        │   ├── customer/  # Home, JoinQueue, TicketStatus
        │   ├── staff/     # StaffDashboard
        │   └── admin/     # AdminDashboard + tabs
        ├── components/    # Navbar, TicketStub, ProtectedRoute
        ├── context/       # AuthContext
        └── services/      # axios instance, socket client
```

---

## Setup

See **SETUP.md** for full step-by-step instructions to run this on a fresh machine (installing Node, MongoDB, environment variables, seeding, running both servers).

Quick version if you already have Node.js installed:

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run seed      # creates demo admin/staff accounts + sample departments
npm run dev        # runs on http://localhost:5000
```

If you do not have a local MongoDB server or are running inside a container, start MongoDB with Docker:

```bash
docker run --name queueease-mongo -p 27017:27017 -d mongo:7.0
```

If that container already exists, start it instead:

```bash
docker start queueease-mongo
```

Then in a second terminal:

```bash
cd frontend
npm install
npm run dev        # runs on http://localhost:5173
```

Demo accounts after seeding:
- Admin: `admin@queueease.com` / `admin123`
- Staff: `staff@queueease.com` / `staff123` (General Checkup department)

---

## Design decisions worth explaining

- **Position and wait time are computed on read, not stored.** Storing a "position" field on each ticket would mean recalculating every other ticket's position each time one person is served - a lot of writes for something derivable on the fly with a single count query.
- **Deleting a department with existing tickets doesn't actually delete it** - it gets deactivated instead, so historical ticket data doesn't end up pointing at a department that no longer exists.
- **The Socket.io layer only broadcasts "something changed," not the new data itself.** Clients re-fetch via the REST API on that signal. This keeps the socket layer thin and means the REST endpoints stay the single source of truth - no risk of the socket payload and the database disagreeing.

---

## Limitations / what I'd add next

- No SMS/email notifications when it's a customer's turn - currently they need the ticket page open (or to check back on it).
- No multi-organization support - this is scoped to one business running several departments, not a multi-tenant platform.
- No automated tests yet - given the 3-day window I prioritized a working, coherent MVP over test coverage, but controllers are written as small pure-ish functions that would be straightforward to unit test.
- Estimated wait time doesn't learn from actual historical service times per department - it's a static average an admin sets manually.
- No pagination on the staff queue view - fine for a single day's queue, would need it at higher volume.

---

## Figma

Not included - the assignment notes this is optional and bonus-only, and candidates without Figma experience aren't penalized. I chose to spend the available time on the working MVP instead.
