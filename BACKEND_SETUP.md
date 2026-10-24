# Booking form email setup

When a visitor fills in the "Book an India Readiness Call" form, the website:

1. emails the request to your team (name, email, company, profile, timeline, message), with **Reply** going straight to the visitor;
2. sends the visitor a short "we've received your request" email (can be turned off);
3. quietly drops spam bots (hidden honeypot field and a minimum fill time).

The code is ready. You only need an email provider API key and a few settings.

## 1. Get an API key (Resend, recommended)

1. Sign up at [resend.com](https://resend.com).
2. Go to **Domains → Add domain** and add `incubr.com`.
3. Resend shows a few DNS records (DKIM/SPF). Add them in your domain's DNS panel (wherever incubr.com is managed: GoDaddy, Cloudflare, etc.). Wait until Resend shows the domain as **Verified**. This is what lets the site send from `products@incubr.com`.
4. Go to **API Keys → Create API key** with "Sending access". Copy the key (it starts with `re_`).

> SendGrid also works. If you already use it, set `SENDGRID_API_KEY` instead of `RESEND_API_KEY`, and verify the sender in SendGrid. If both keys are set, Resend is used.

## 2. Add the settings to Vercel

In Vercel: **Project → Settings → Environment Variables**, add these for **Production** (and Preview if you want):

| Name | Value | Required |
|---|---|---|
| `RESEND_API_KEY` | your `re_...` key | Yes (or `SENDGRID_API_KEY`) |
| `MAIL_FROM` | `products@incubr.com` (must be on the verified domain) | Yes |
| `CONTACT_TO_EMAIL` | who receives requests, e.g. `products@incubr.com`. Separate several with commas | No (defaults to products@incubr.com) |
| `MAIL_FROM_NAME` | sender name, e.g. `Incubr website` | No |
| `SEND_CONFIRMATION_EMAIL` | `false` to stop the visitor confirmation email | No (on by default) |

Then **redeploy** (Deployments → latest → ⋯ → Redeploy) so the new settings take effect.

Older setups that used `SENDGRID_FROM_EMAIL` still work; `MAIL_FROM` is the new name.

## 3. Check it works

1. Open `https://YOUR-SITE/api/book-call` in a browser. You should see `"ready": true`. This page never shows your keys.
2. Fill in the form at `https://YOUR-SITE/book-a-call` with your own email. You should get the team email and the confirmation email within a minute.

## Running it on your computer

1. Copy `.env.example` to `.env` and fill in the same values. `.env` is never committed.
2. Build and start: `npm run build` then `npm run server`, and open http://localhost:8787.
3. Or, while developing: run `npm run server` in one terminal and `npm run dev` in another. The dev site sends form requests to the local server.

The local server also keeps a copy of every valid request in `data/bookings.jsonl`, as a backup.

## If something goes wrong

| What you see | What to do |
|---|---|
| Form says "Our booking form is being set up" | The key or `MAIL_FROM` is missing in Vercel. Add it and redeploy. |
| Form says "We couldn't send your request just now" | The provider rejected the email. Usually the sender domain isn't verified yet, or the key is wrong. Check Vercel → Logs for the exact reason. |
| Team email arrives, visitor email doesn't | Check the visitor's spam folder, and that `SEND_CONFIRMATION_EMAIL` isn't `false`. |
| Emails land in spam | Make sure the domain is fully verified (all DNS records green) in Resend or SendGrid. |

## Where the code lives

- `api/_lib/booking.js`: validation, spam checks and email sending (shared).
- `api/book-call.js`: the Vercel function the live site uses.
- `server.js`: the same API for local or self-hosted use.
