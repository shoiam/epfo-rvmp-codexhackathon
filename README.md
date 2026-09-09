# EPFO Reimagined

A modern reimagining of India's [Employees' Provident Fund Organisation (EPFO)](https://www.epfindia.gov.in/) member portal — built for the **OpenAI Hackathon** to demonstrate what a citizen-first government service experience could look like.

The current EPFO portal is notoriously opaque and difficult to navigate. This project rebuilds the member experience from the ground up: direct access to your PF and pension records, clear claim tracking with stage-by-stage transparency, and actionable tools for escalation and grievance registration — all in a clean, trustworthy interface.

---

## Features

### Member Portal
- **Dashboard** — PF balance, pension summary, contribution health, active memberships, and claims needing attention
- **Service History** — Full chronological view of all employment memberships with employer details and status
- **Claims** — File PF withdrawal, settlement, and pension claims (Forms F31, F19, F10C, F10D) with eligibility checks
- **Claim Tracking** — Stage-by-stage timeline showing exactly where your claim is, who holds it, and for how long
- **Escalation** — One-click escalation when a claim stage stalls beyond 7 days, with a full escalation ladder
- **Passbook** — Monthly contribution breakdown (wages, employee/employer/EPS share, interest) with missing deposit detection
- **Nomination** — Manage nominees with share allocation (must total 100%)
- **Profile & KYC** — Personal info, UAN, Aadhaar verification, PAN and bank account linking

### Employer Portal (Bonus)
- Declare new memberships, confirm exits, and manage employee PF records

### Key Design Decisions
- **No auto-mutations** — time-based rules (10-day exit auto-accept, 7-day escalation eligibility) are derived on read, never written by cron jobs
- **Custom auth** — Signed `httpOnly` cookie sessions using HMAC-SHA256 (no NextAuth)
- **Ownership enforced** — every API endpoint validates session and member ownership
- **Status derived, never stored** — `getEffectiveStatus()` in `lib/membership-status.ts` is the single source of truth for membership state

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui (Radix UI) |
| Database | PostgreSQL (Neon) via Prisma 6 |
| Charts | Recharts |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A PostgreSQL database (e.g., [Neon](https://neon.tech))

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file at the project root:

```env
DATABASE_URL="postgresql://<pooled-connection-string>"
DIRECT_URL="postgresql://<direct-connection-string>"
SESSION_SECRET="<base64-random-string>"
```

Generate a session secret:
```bash
openssl rand -base64 32
```

### 3. Set up the database

```bash
npx prisma migrate dev
npx prisma db seed
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo

After seeding, a test member is available. Use the last 4 digits of the seeded Aadhaar and OTP `123456` to log in.

The seed data includes:
- Multiple memberships in different states (active, exited, pending)
- Contributions with some intentionally missing (to demonstrate grievance flow)
- Claims at various processing stages
- A membership stored as ACTIVE but effectively ENDOFSERVICE via the 10-day derived rule — testing the status logic

---

## Project Structure

```
app/
  (member)/          # Member portal pages (protected)
  (auth)/            # Login / signup pages
  employer/          # Employer portal
  api/               # API routes

components/          # React components
lib/
  session.ts         # Signed cookie auth
  membership-status.ts   # getEffectiveStatus() and derived rules
  claim-eligibility.ts   # Per-form eligibility logic
  preflight-rules.ts     # Machine-checkable claim validation
  verhoeff.ts        # Aadhaar checksum validation

prisma/
  schema.prisma      # Data model
  seed.ts            # Demo data
```

---

## Built For

**OpenAI Hackathon** — reimagining a government website in India.

EPFO manages retirement savings for over 270 million workers in India. This project is a proof-of-concept showing how the member experience can be redesigned to be transparent, actionable, and humane — without changing the underlying legal or administrative structure.

---

## Scripts

```bash
npm run dev            # Start dev server
npm run build          # Production build (runs prisma generate + next build)
npm run lint           # ESLint
npm run format         # Prettier format
npx prisma db seed     # Re-seed demo data
```
