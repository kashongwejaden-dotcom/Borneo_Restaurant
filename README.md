# EatLocal OS — Commission-Free Ordering & Management System

Built for **Borneo Indonesian Restaurant** (18 KG 4 Ave, Kigali, Rwanda · 4.6★).

Zero commission on orders. The restaurant pays a flat monthly SaaS fee; every franc of
every order — and 100% of every tip — goes straight to the kitchen via Stripe Connect.

---

## What you're looking at

This package ships the **complete interactive MVP** as a client-side app (React + Vite +
Tailwind v4 + Zustand + Framer Motion + dnd-kit + Recharts) so the entire product can be
run, clicked and demoed with **no server, no database, no keys**:

- The data layer in `src/lib/store.ts` **mirrors the Prisma schema 1:1**
  (`prisma/schema.prisma` is included in full) — swapping the store for real API calls is
  a drop-in migration.
- Auth (customer + restaurant-owner onboarding with simulated Stripe Connect), payments
  (Apple Pay / Google Pay / card), and the realtime channel are **faithfully simulated**
  in-browser: orders stream into the dashboard via a simulated SSE feed
  (`useLiveFeed` in `src/lib/store.ts`) and kitchen tickets auto-advance, which you can
  watch live on the customer tracking page.

### Customer storefront (public)
| Route | Feature |
|---|---|
| `/` | Landing — live order ticker, hero, popular dishes, 30% vs 0% comparison, reserve teaser |
| `/menu` | Live menu — categories with scroll-spy, dietary tags, modifiers, stock warnings, 86'd items |
| `/checkout` | Guest checkout, pickup/delivery, tips (100% to staff), Apple Pay / Google Pay / card |
| `/track/:code` | Real-time status: Received → Preparing → Ready/Out for delivery → Completed |
| `/reserve` | Book a table — 14-day date strip, live time-slot availability, party of 1–8 |

### Restaurant dashboard (`/dashboard`, ADMIN role)
| Page | Feature |
|---|---|
| Overview | Revenue/orders/avg-ticket/tips metrics, hourly revenue area chart, channel donut, popular items |
| Orders | Live Kanban (New / Preparing / Ready / Completed) with drag-and-drop + full ticket modal |
| Menu Builder | Drag-to-reorder items, instant "Available" toggle, inline price editing, stock meters |
| Reservations | Month calendar with bookings, check-in / cancel |
| Promotions | Time-based discount engine (name, %, start/end datetime) — auto-applies at checkout |
| Inventory | Low-stock (<10 units) alerts with restock / 86 actions |

The **Accepting Orders** toggle in the dashboard header pauses storefront checkout instantly.

> **Demo tip:** open `/` and `/dashboard/orders` side by side — place an order on the
> storefront and watch the ticket land on the Kanban board through the simulated SSE feed.

---

## Run it locally

```bash
npm install
npm run dev        # Vite dev server
npm run build      # production build → dist/
```

## Publish to GitHub

The repo is git-ready (`.gitignore` excludes `node_modules`, `dist` and secrets).

**From Qwen Coder (easiest):** Settings → **GitHub** → *Connect*, authorize with your
GitHub account, then use the **Publish to GitHub** action to push this project to a
new repository.

**Or manually, from any terminal:**

```bash
git init
git add .
git commit -m "Borneo Indonesian Restaurant — EatLocal OS MVP"
git branch -M main
git remote add origin https://github.com/<your-username>/borneo-eatlocal.git
git push -u origin main
```

> `.env` is ignored on purpose — only `.env.example` is committed.

## Production blueprint (Next.js 15)

For the hosted product, map this MVP onto:

- **Next.js 15 App Router + TypeScript**, Tailwind v4, shadcn/ui
- **PostgreSQL + Prisma** — schema ready in `prisma/schema.prisma`
- **NextAuth.js** — credentials + Google OAuth, `Role.ADMIN | Role.CUSTOMER`
- **Stripe Connect** — connected accounts per restaurant, `application_fee_amount = 0`
- **Zustand** (client state) + **TanStack Query** (server state)
- **Resend + React-Email** — confirmations & reservation reminders
- **SSE/WebSocket** — order fan-out (simulated here by `useLiveFeed`)
- Env template: `.env.example`
