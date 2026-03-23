# DevTrack

> The learning tracker built for developers.

Live → [devtrackapp-orcin.vercel.app](https://devtrackapp-orcin.vercel.app)

---

## What is DevTrack?

DevTrack is a learning journal for developers. Log your study sessions, track topics, build streaks, and see a full year of learning activity in one view — like GitHub's contribution graph but for knowledge.

---

## Features

- **Google OAuth** — sign in with one click, no passwords
- **Topic tracking** — add topics you're learning and log time per session
- **Activity heatmap** — dot matrix view of your last 365 days of learning
- **Streak counter** — tracks consecutive days of study
- **Goals** — set learning goals and mark them complete
- **Analytics** — terminal-style report showing time per topic, weekly trends, insights
- **Dark / light theme** — smooth theme toggle
- **Fully responsive** — works on all screen sizes

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Auth.js v5 (Google OAuth) |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma |
| Deployment | Vercel |

---

## Architecture
```
app/
├── (auth)/
│   └── login/          → login page + server action
├── (dashboard)/
│   ├── layout.tsx       → sidebar layout
│   ├── dashboard/       → heatmap + stats
│   ├── topics/          → topic tracking + session logging
│   ├── goals/           → goal management
│   └── analytics/       → terminal-style analytics
├── api/
│   └── auth/[...nextauth]/ → Auth.js handler
└── page.tsx             → landing page

components/
├── heatmap.tsx          → dot matrix activity grid
├── theme-toggle.tsx     → dark/light toggle
└── ui/                  → shadcn components

lib/
└── prisma.ts            → Prisma client singleton
```

---

## Database Schema
```prisma
User     → id, email, name, image
Topic    → id, title, description, status, userId
Session  → id, minutes, note, date, topicId, userId
Goal     → id, title, completed, userId
```

---

## Running Locally

**1. Clone the repo**
```bash
git clone https://github.com/Anubhavg04/Devtrack.git
cd Devtrack
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**

Create a `.env.local` file:
```
AUTH_SECRET=your_auth_secret
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
DATABASE_URL=your_supabase_connection_string
```

Create a `.env` file with just:
```
DATABASE_URL=your_supabase_connection_string
```

**4. Push database schema**
```bash
npx prisma db push
npx prisma generate
```

**5. Run the dev server**
```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Description |
|---|---|
| `AUTH_SECRET` | Random secret for Auth.js session signing |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `DATABASE_URL` | Supabase PostgreSQL connection string |

---

## Screenshots

![Dashboard](public/screenshots/dashboard.png)

---

## What I learned building this

- Next.js App Router — layouts, route groups, nested routing
- Server Components vs Client Components in a real project
- Server Actions for form handling without API routes
- Auth.js v5 with Google OAuth and middleware route protection
- Prisma with Supabase for type-safe database queries
- Building a GitHub-style heatmap from scratch
- Deploying a full-stack Next.js app to Vercel

---

## Roadmap

- [ ] Public profile pages (`/u/username`)
- [ ] PDF export of analytics report
- [ ] Posthog analytics integration
- [ ] Weekly email summary
- [ ] Mobile app

---

## License

MIT