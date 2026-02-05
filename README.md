# Event POS & Footfall

Admin portal for **Hackerz** — a fast, offline-first POS for event check-ins, footfall tracking, and attendance management. This app lets gate admins sign in with Google, manage participants, and work with the backend API for events, attendance, and payments.

---

## Features

### Offline-First Operation

Fully functional without internet. Local storage with automatic sync when online. Zero downtime during network failures.

### Entry Footfall Tracking

Log every gate entry separately. Track total footfall in real time with append-only logs.

### Event-Wise Attendance

Mark attendance per event. Prevent duplicates. Track event footfall accurately.

### Payment Verification

View payment status per participant. Event-wise validation. Team and individual support.

---

## Tech Stack

| Category        | Technology        |
|----------------|-------------------|
| Framework      | Next.js 14 (App Router) |
| Auth           | NextAuth.js (Google provider, JWT) |
| UI             | shadcn/ui, Tailwind CSS, Lucide icons |
| Language       | TypeScript        |
| State          | Zustand, React Query |
| Forms          | React Hook Form, Zod |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### 1. Install dependencies

```bash
cd hackerz-pos
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_SECRET` | Secret for NextAuth JWT signing (e.g. `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_BASE_URL` | Backend API base URL (used for `/admin/login`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `UPLOADTHING_TOKEN` | Optional; for UploadThing if used |

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with Google; the app will call your backend `POST {{NEXT_PUBLIC_BASE_URL}}/admin/login` with `{ "admin_email": "<google-email>" }`. On success, the session includes `adminId`, `codeBlock`, and profile data.

---

## Project Structure

```
revamp-admin/
├── public/
│   ├── logo.svg
│   └── ...
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Login (Google only)
│   │   ├── layout.tsx
│   │   ├── (auth)/                   # Forgot / reset password (if used)
│   │   ├── (dashboard-routes)/      # Protected dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── users/
│   │   │   ├── attendance/
│   │   │   ├── events/
│   │   │   └── payments/
│   │   └── api/
│   │       └── auth/
│   │           ├── [...nextauth]/    # NextAuth handler
│   │           ├── get-token/
│   │           └── update-session/
│   ├── components/
│   │   ├── admin-panel/              # Sidebar, navbar, layout, Google login
│   │   ├── auth-layout.tsx           # Login page layout + feature list
│   │   ├── providers/
│   │   └── ui/                       # shadcn components
│   ├── lib/                          # axios, menu-list, utils
│   ├── hooks/
│   ├── types/                        # next-auth.d.ts, base-response
│   └── module/                       # auth API, queries
├── .env.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run registry:build` | Build component registry (if used) |

---

## Contributing

1. Fork the repo.
2. Create a branch: `git checkout -b feature/your-feature`.
3. Commit: `git commit -m "Add your feature"`.
4. Push: `git push origin feature/your-feature`.
5. Open a pull request.

---

## License

MIT. See [LICENSE](LICENSE) for details.
