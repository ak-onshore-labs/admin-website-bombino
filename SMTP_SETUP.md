# Email (SMTP) Setup — Admin Panel

The admin panel sends one type of email: the **6-digit OTP code** for the
"Forgot your password?" flow. This guide explains how to wire up a mail server.

> **No SMTP configured?** The app still runs — OTP codes are printed to the
> **server console** instead of being emailed. Fine for testing, not for the client.

---

## 1. The environment variables

All mail config lives in `admin-panel/.env.local`:

```ini
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=admin@bombinoexp.com
SMTP_PASS=your-app-password
SMTP_FROM=Bombino Admin <admin@bombinoexp.com>
```

| Variable    | What it is                                                                 |
| ----------- | -------------------------------------------------------------------------- |
| `SMTP_HOST` | Your provider's outgoing mail server                                       |
| `SMTP_PORT` | `465` (SSL) or `587` (STARTTLS)                                             |
| `SMTP_USER` | The mailbox you authenticate as                                            |
| `SMTP_PASS` | Password / app-password / API key for that mailbox                         |
| `SMTP_FROM` | The "From" shown to recipients — **must be authorized** for `SMTP_USER`    |

After editing `.env.local`, **restart the admin panel** for changes to load.

> The app sets `secure: true` automatically when `SMTP_PORT` is `465`,
> otherwise STARTTLS (for `587`/`25`). You don't configure this — just pick the port.

---

## 2. The #1 gotcha: `SMTP_FROM`

`SMTP_FROM` **must be the same mailbox as `SMTP_USER`**, or a verified alias of
it. Mail providers reject (or silently rewrite) a "From" address you're not
authorized to send as.

✅ Correct:
```ini
SMTP_USER=admin@bombinoexp.com
SMTP_FROM=Bombino Admin <admin@bombinoexp.com>
```

❌ Will fail / get rewritten:
```ini
SMTP_USER=admin@bombinoexp.com
SMTP_FROM=Bombino Admin <no-reply@bombinoexp.com>   # not the authed mailbox
```

To use a `no-reply@…` From, first add it as a verified sender/alias with your
provider (see Gmail steps below), then set it in `SMTP_FROM`.

---

## 3. Provider setup

### Gmail / Google Workspace

1. Sign in to the Google account that will send the mail.
2. Enable **2-Step Verification** (required for app passwords):
   Google Account → **Security** → **2-Step Verification**.
3. Create an **App Password**:
   Google Account → **Security** → **App passwords** → name it "Bombino Admin" →
   **Generate**. You get a 16-character code like `abcd efgh ijkl mnop`.
4. Fill in `.env.local`:
   ```ini
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=youraccount@yourdomain.com
   SMTP_PASS=abcd efgh ijkl mnop      # spaces are OK — stripped automatically
   SMTP_FROM=Bombino Admin <youraccount@yourdomain.com>
   ```

> Using a different `no-reply@` From with Gmail? Add it under Gmail →
> Settings → **Accounts** → **Send mail as** → add address → verify, then use it
> in `SMTP_FROM`.

### Amazon SES

```ini
SMTP_HOST=email-smtp.us-east-1.amazonaws.com   # your region
SMTP_PORT=587
SMTP_USER=<SES SMTP username>
SMTP_PASS=<SES SMTP password>
SMTP_FROM=Bombino Admin <verified@yourdomain.com>   # must be SES-verified
```
The From address/domain must be **verified** in SES, and the account out of the
sandbox to email arbitrary recipients.

### Mailtrap (testing — catches mail, doesn't deliver)

```ini
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=<mailtrap user>
SMTP_PASS=<mailtrap pass>
SMTP_FROM=Bombino Admin <test@example.com>
```

### Resend (SMTP mode)

```ini
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=<your Resend API key>
SMTP_FROM=Bombino Admin <admin@your-verified-domain.com>
```

---

## 4. Test it

1. Restart the admin panel (`npm run dev` or `npm run start`).
2. Go to `/forgot`, enter a **real registered** admin email.
3. Check that inbox for the 6-digit code.
4. Enter the code + a new password to confirm the full flow.

If SMTP is left blank, watch the **server console** instead — the code prints there:

```
──────── EMAIL (SMTP not configured) ────────
To:      admin@bombinoexp.com
Subject: Your Bombino Admin password reset code
Body:
 Your password reset code is 482915.
─────────────────────────────────────────────
```

---

## 5. Troubleshooting

| Symptom                                   | Likely cause / fix                                                            |
| ----------------------------------------- | ---------------------------------------------------------------------------- |
| `Invalid login` / `535` auth error        | Wrong `SMTP_USER`/`SMTP_PASS`. For Gmail, use an **app password**, not the login password. |
| Email never arrives, no error             | `SMTP_FROM` not authorized for the account → it was rejected/rewritten. Fix §2. |
| `self signed certificate` / TLS error     | Wrong port. Use `465` (SSL) or `587` (STARTTLS) — not mismatched.            |
| `Connection timeout` / `ETIMEDOUT`        | Host's firewall blocks outbound SMTP, or wrong `SMTP_HOST`/port.            |
| Works locally, fails in production        | Provider blocks the server's IP, or env vars not set on the prod host.      |
| Lands in spam                             | Set up **SPF/DKIM** for your sending domain (provider docs).                |

### How the OTP behaves (for context)

- 6 digits, **expires in 10 minutes**, **single use**
- Max **5 wrong attempts**, then the code is invalidated
- **60-second cooldown** between resend requests
- Codes are stored **hashed** in `admin-panel/data/reset-otps.json`

---

## 6. Security notes

- `.env.local` holds a live credential — it's gitignored; never commit it.
- Prefer an **app password / API key** over a real account password, so it can be
  revoked without changing the mailbox login.
- If a credential leaks, **rotate it** (revoke the app password, generate a new one).
- For deliverability and to avoid spam folders, configure **SPF & DKIM** DNS
  records for `bombinoexp.com` with your mail provider.
```
