# Would You Join Me for One Hour?

Eucharistic Adoration Worldwide — find chapels, pledge an hour of prayer.

## Stack
- **Frontend**: vanilla HTML/CSS/JS + Leaflet (with marker clustering)
- **Backend**: Vercel Serverless Functions (`/api/*`)
- **DB**: Vercel Postgres
- **Email**: Resend (for notifications)

## Project structure
```
/
├── index.html              # main site
├── style.css
├── main.js
├── admin.html              # moderation panel (password-gated)
├── logo.png                # (your existing assets — keep)
├── favicon.ico
├── 204-stay with me.mp3
│
├── api/
│   ├── chapels.js          # GET  approved chapels
│   ├── chapel.js           # POST submit a chapel for review
│   ├── pledge.js           # POST a pledge
│   ├── contact.js          # POST a contact message
│   ├── stats.js            # GET  live stats
│   └── admin/
│       ├── login.js        # POST password check
│       ├── chapels.js      # GET  pending/approved/rejected (auth)
│       └── moderate.js     # POST approve | reject | delete (auth)
│
├── lib/
│   ├── db.js               # Postgres client
│   ├── email.js            # Resend wrapper
│   ├── auth.js             # bearer-token check
│   └── validate.js         # input sanitization
│
├── db/
│   └── schema.sql          # run once in Vercel Postgres
│
├── package.json
├── vercel.json
└── .env.example
```

## Setup (5 steps)

### 1. Push to GitHub
Push this folder to your existing `webdesign` repo (`apostolate` branch is fine).

### 2. Connect to Vercel
- Import the repo in Vercel (if not already)
- Project root = repo root
- No build command needed (static + serverless auto-detected)

### 3. Add Vercel Postgres
- Vercel dashboard → your project → **Storage** → **Create Database** → **Postgres**
- Vercel auto-injects all `POSTGRES_*` env vars
- Open the database's **Query** tab and paste the contents of `db/schema.sql`, run it once.
  This creates the 3 tables and seeds the 10 original chapels.

### 4. Set environment variables
In Vercel → Project → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `ADMIN_PASSWORD` | A long random string (used to log into `/admin.html`) |
| `RESEND_API_KEY` | From [resend.com](https://resend.com) (free tier: 3,000/month) |
| `NOTIFY_EMAIL` | Where to send chapel/contact notifications |
| `NOTIFY_FROM` | `WYJMFOH <onboarding@resend.dev>` until you verify a domain |
| `SITE_URL` | `https://wouldyoujoinmeforonehour.org` |

### 5. Deploy
Push to GitHub → Vercel auto-deploys.

## How it works

### Public flow
- `GET /api/chapels` populates the map with approved chapels (clustered)
- `GET /api/stats` populates the stats bar (chapels / pledges / countries)
- `POST /api/pledge` records a pledge in the DB
- `POST /api/contact` saves contact messages and emails the admin
- `POST /api/chapel` saves new chapels with status='pending', emails the admin

### Admin flow
1. Go to `/admin.html`
2. Enter the `ADMIN_PASSWORD`
3. See tabs: **Pending** / **Approved** / **Rejected** with counts
4. Approve a chapel → it appears on the main map within 60s (cache TTL)
5. Reject or delete as needed

### Live Adoration
- The "▶ Start Adoration" button opens a single EWTN YouTube embed
- All chapel markers are physical (green) — no individual stream links
- To swap the EWTN stream, edit `CONFIG.liveAdorationUrl` at the top of `main.js`

## Local development
```bash
npm install
npm install -g vercel
vercel link        # connect to your Vercel project (pulls env vars)
vercel env pull    # creates .env.local
vercel dev         # local dev server on :3000
```

## Email setup (Resend)
1. Sign up at [resend.com](https://resend.com)
2. API Keys → create a key → paste into `RESEND_API_KEY`
3. Until your domain is verified, the `from` address must use `onboarding@resend.dev`
4. To send from your own domain, add a domain in Resend, add the DNS records, then update `NOTIFY_FROM`

## Notes
- The map caches `/api/chapels` at the edge for 60s — approving a chapel won't show instantly. Force-refresh to see immediately, or wait 60s.
- Admin password is stored in `sessionStorage` and sent as a Bearer token. It's MVP-grade; for production-grade auth, swap in NextAuth or Clerk later.
- Pledge / contact forms surface errors inline; check the browser console for details if a submission fails.
