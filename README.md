# Bombino Admin Panel

Internal CMS for the [Bombino Express](https://www.bombinoexp.com) website. Manage
blog posts and admin users from one dashboard.

> This is the **admin panel** only. It reads/writes the blog through the main
> website's API (a separate app), authenticated by a shared secret.

---

## Features

- **Blog management** — create, edit, publish/draft, and delete posts
- **Rich-text editor** (TipTap) — headings, lists, links, images, with a live
  WYSIWYG preview that matches the published page
- **Image uploads** — cover/hero images and inline images, stored on the website
- **Users & roles**
  - **Admin** — full access incl. user management
  - **Editor** — blog posts only
- **Auth** — email + password login, signed session cookies
- **Forgot password** — 6-digit OTP emailed via SMTP (see [`SMTP_SETUP.md`](./SMTP_SETUP.md))

---

## Tech stack

- **Next.js** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **TipTap** rich-text editor
- **nodemailer** for OTP email
- File-based storage (no database) — passwords hashed with Node `scrypt`

---

## Quick start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local
#    then edit .env.local — see "Environment" below

# 3. Create the first admin account
npm run set-password

# 4. Run (http://localhost:3001)
npm run dev
```

The main website (blog API) must also be running and reachable at
`WEBSITE_API_URL`. See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the full picture.

---

## Environment

Set in `.env.local` (template in `.env.example`):

| Variable            | Purpose                                                      |
| ------------------- | ----------------------------------------------------------- |
| `JWT_SECRET`        | Signs login session cookies (long random string)            |
| `WEBSITE_API_URL`   | URL of the website / blog API                               |
| `BLOG_ADMIN_SECRET` | Shared secret — **must match** the website's value          |
| `SMTP_*`            | Mail server for forgot-password OTP (optional in dev)       |

Generate a secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Scripts

| Command                | Does                                            |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Start dev server on port 3001                   |
| `npm run build`        | Production build                                |
| `npm run start`        | Start production server on port 3001            |
| `npm run lint`         | Lint                                            |
| `npm run set-password` | Create / reset an admin user (lockout recovery) |

---

## Project structure

```
src/
├─ app/
│  ├─ login/                # sign in
│  ├─ forgot/               # OTP password reset
│  ├─ dashboard/            # protected app
│  │  ├─ blog/              # post list + editor
│  │  ├─ users/             # user management (admin only)
│  │  └─ settings/          # change own password
│  └─ api/                  # auth, posts, users, upload
├─ components/              # editor, forms, sidebar, preview
├─ lib/                     # auth, users, mailer, otp-store, api client
└─ middleware.ts            # protects /dashboard
scripts/
└─ set-password.mjs         # CLI to create/reset a user
data/                       # runtime store (gitignored): users, OTPs
```

---

## Docs

- [`DEPLOYMENT.md`](./DEPLOYMENT.md) — full setup & hosting guide
- [`SMTP_SETUP.md`](./SMTP_SETUP.md) — email configuration & troubleshooting

---

## Notes

- Credentials and runtime data live in `data/*.json` and are **gitignored**.
- Deploy on a host with a **persistent filesystem** (see `DEPLOYMENT.md §7`).
