# Bombino — Website & Admin Panel Setup Guide

This repo contains **two apps**:

| App             | Folder            | Default port | What it does                                  |
| --------------- | ----------------- | ------------ | --------------------------------------------- |
| **Website**     | `website-bombino` | `3000`       | Public site + blog + the blog data/API store  |
| **Admin Panel** | `admin-panel`     | `3001`       | Internal CMS to manage blog posts & users     |

The admin panel talks to the website's blog API over HTTP, authenticated by a
**shared secret**. Both apps must be running for the admin panel to work.

```
┌──────────────┐   x-admin-secret    ┌──────────────────┐
│ admin-panel  │ ──────────────────▶ │ website-bombino  │
│  (port 3001) │   blog read/write   │   (port 3000)    │
└──────────────┘                     └──────────────────┘
        │                                     │
   admin users,                         blog-posts.json,
   reset OTPs                           uploaded images
   (data/*.json)                        (public/blog-uploads)
```

---

## 1. Prerequisites

- **Node.js 20 LTS** or newer
- **npm** (ships with Node)
- A server that keeps a **persistent filesystem** — see [§7 Hosting](#7-hosting--important).

---

## 2. Install

From the project root, install each app:

```bash
cd website-bombino && npm install
cd ../admin-panel  && npm install
```

---

## 3. Environment variables

Create a `.env.local` in **each** app. Templates live in `.env.example`.

### 3a. `website-bombino/.env.local`

```ini
# Shared secret the admin panel uses to write to the blog API.
# Must EXACTLY match BLOG_ADMIN_SECRET in admin-panel/.env.local.
BLOG_ADMIN_SECRET=<long-random-string>
```

### 3b. `admin-panel/.env.local`

```ini
# Signs login session cookies. Use a long random string (32+ chars).
# Rotating this logs everyone out.
JWT_SECRET=<long-random-string>

# Where the website (blog API) is reachable from the admin panel.
# Local:      http://localhost:3000
# Production: https://www.bombinoexp.com
WEBSITE_API_URL=https://www.bombinoexp.com

# MUST match BLOG_ADMIN_SECRET in website-bombino/.env.local.
BLOG_ADMIN_SECRET=<same-long-random-string-as-website>

# ── SMTP for "forgot password" OTP email (see §5) ──
# Leave blank to print OTP codes to the server console (dev only).
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-account@your-domain.com
SMTP_PASS=your-app-password
SMTP_FROM=Bombino Admin <your-account@your-domain.com>
```

> **Generate a random secret:**
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**The two `BLOG_ADMIN_SECRET` values must be identical** — that's how the apps trust each other.

---

## 4. Create the first admin user

The admin panel has no default login. Create one from the `admin-panel` folder:

```bash
cd admin-panel
npm run set-password
```

It prompts for **email**, **password**, and **role** (`admin` or `editor`).
Pick `admin` for the first account. Credentials are stored **hashed** in
`admin-panel/data/admin-users.json`.

After that, more users are added from inside the panel: **Users → Add User**.

### Roles

| Role       | Can do                                                |
| ---------- | ----------------------------------------------------- |
| **admin**  | Everything — blog posts, settings, user management    |
| **editor** | Blog posts only                                       |

---

## 5. Email setup (forgot-password OTP)

The "Forgot password?" flow emails a 6-digit code. It needs SMTP credentials.
Without them, codes are logged to the server console (fine for testing, not for the client).

### Using Gmail / Google Workspace

1. The sending account must have **2-Step Verification** enabled.
2. Create an **App Password**: Google Account → Security → App passwords.
3. Put it in `SMTP_PASS` (spaces are fine — they're stripped automatically).
4. **`SMTP_FROM` must be the authenticated address** (or a verified
   "Send mail as" alias in Gmail). Gmail rejects unauthorized From addresses.

```ini
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465                 # 465 = SSL, 587 = STARTTLS
SMTP_USER=admin@bombinoexp.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM=Bombino Admin <admin@bombinoexp.com>
```

Other providers (Amazon SES, Mailtrap, Resend SMTP, etc.) work the same way —
just swap host/port/user/pass.

📄 **Full email guide:** see [`admin-panel/SMTP_SETUP.md`](./admin-panel/SMTP_SETUP.md)
for per-provider configs, testing steps, and troubleshooting.

---

## 6. Run

### Development

Two terminals:

```bash
# Terminal 1
cd website-bombino && npm run dev      # http://localhost:3000

# Terminal 2
cd admin-panel && npm run dev          # http://localhost:3001
```

Admin login: `http://localhost:3001/login`

### Production

Build then start each app:

```bash
cd website-bombino && npm run build && npm run start    # serves on :3000
cd admin-panel  && npm run build && npm run start       # serves on :3001
```

Keep both processes alive with a process manager (PM2, systemd, Docker, etc.).
Example with **PM2**:

```bash
npm install -g pm2
pm2 start npm --name bombino-web   --cwd ./website-bombino -- start
pm2 start npm --name bombino-admin --cwd ./admin-panel     -- start
pm2 save
```

Put both behind a reverse proxy (Nginx/Caddy) with HTTPS, e.g.:

- `www.bombinoexp.com`   → website (`:3000`)
- `admin.bombinoexp.com` → admin panel (`:3001`)

If you use separate domains, set `WEBSITE_API_URL=https://www.bombinoexp.com`
in the admin panel's env.

---

## 7. Hosting — IMPORTANT

This app stores data as **files on disk** at runtime:

- `website-bombino/src/data/blog-posts.json` — blog posts
- `website-bombino/public/blog-uploads/`      — uploaded images
- `admin-panel/data/admin-users.json`         — admin accounts (hashed)
- `admin-panel/data/reset-otps.json`          — short-lived reset codes

➡️ **Deploy on a host with a persistent filesystem** — a VPS, VM, or container
with a mounted volume (DigitalOcean, Render, Railway, Hetzner, AWS EC2, etc.).

⚠️ **Do NOT deploy to a read-only / ephemeral serverless host (e.g. Vercel,
Netlify functions) as-is.** Runtime file writes there are lost on every
redeploy/restart — new blog posts, images, and users would vanish. To use such
a host you'd first migrate storage to a database + object storage (S3/R2/Blob).

---

## 8. Backups

Back up these paths regularly (a nightly copy/cron is enough):

```
website-bombino/src/data/blog-posts.json
website-bombino/public/blog-uploads/
admin-panel/data/admin-users.json
```

`reset-otps.json` is disposable — no need to back it up.

---

## 9. Password reset & lockout recovery

- **Knows current password:** Admin panel → **Settings → Change Password**.
- **User forgot password:** Login → **Forgot your password?** → email OTP (needs SMTP).
- **Locked out / no email configured:** on the server, run
  `cd admin-panel && npm run set-password` to reset any account's password and role.

---

## 10. Go-live security checklist

- [ ] `JWT_SECRET` set to a unique long random value (not the example)
- [ ] `BLOG_ADMIN_SECRET` set to a unique long random value, **matching** in both apps
- [ ] First admin created with a **strong** password (`npm run set-password`)
- [ ] SMTP configured and a test OTP email received
- [ ] `SMTP_FROM` matches the authenticated mailbox (or a verified alias)
- [ ] HTTPS enabled on both domains (secure cookies require it in production)
- [ ] `.env.local` files are **not** committed (already in `.gitignore`)
- [ ] Backups scheduled for the data paths in §8
- [ ] Host has a persistent filesystem (§7)

---

## File reference

```
website/
├─ website-bombino/          # public site + blog
│  ├─ src/data/blog-posts.json
│  ├─ public/blog-uploads/
│  └─ .env.local             # BLOG_ADMIN_SECRET
└─ admin-panel/              # CMS
   ├─ data/admin-users.json  # accounts (hashed)
   ├─ scripts/set-password.mjs
   └─ .env.local             # JWT_SECRET, WEBSITE_API_URL, BLOG_ADMIN_SECRET, SMTP_*
```
