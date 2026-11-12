# Backend: orders, payments, messages and the admin

The site takes payments with Stripe, saves every order, quote and message in a Postgres database, emails the shop about each one, and gives the shop a password-protected back office at `/admin`. It runs on Vercel or on a cPanel host (GoDaddy) unchanged.

Until a part is set up, the site says so plainly ("We can't take orders or messages from the site yet") instead of failing, and `/admin` shows a checklist of what is still missing.

## Prices and currencies

Prices follow Sticker Bros and are kept in **US dollars**. One formula prices every label and sticker, in `src/lib/pricing.ts` (2026-11-11):

    price each (USD) = 1.215 × (quantity ÷ 50) ^ −0.438 × (size ÷ 3) × material
    size = √(width × height) in inches for labels (the longest side for die-cut, circle and square stickers)
    material = 1 for white/clear BOPP, paper, kraft and vinyl; 1.128 for metallic silver, holographic, glitter

It gives Sticker Bros' 50 × 3 in = $60.75 exactly; double the quantity and each costs about 26% less. No setup or plate fees.

- **Shipping to Canada:** prices shown and charged in **CAD** (USD × `CAD_PER_USD`, now 1.38). Free shipping over $100 CAD.
- **Shipping anywhere else:** prices shown and charged in **USD**, exactly Sticker Bros' amounts.

The site picks the currency from the visitor's location on their first visit (Vercel and Cloudflare send it; on a cPanel host without Cloudflare everyone starts in CAD), and a **Shipping to: Canada · CAD / Elsewhere · USD** switch under the price changes it everywhere. The server works the price out again in the chosen currency, and Stripe Checkout only accepts Canadian addresses for CAD orders and non-Canadian addresses for USD orders.

To match Sticker Bros exactly, add their listed sticker prices to `LISTED_USD` in `src/lib/pricing.ts` (`"material|size|quantity": price`). Listed prices are used as they are; anything not listed comes from the formula. Update `CAD_PER_USD` in `src/lib/facts.ts` when the exchange rate moves.

## What happens

| Visitor does | What the backend does |
| --- | --- |
| Adds labels or stickers to the cart (any size, material, quantity; their file, "Design it for me" or "Send it later") and presses **Pay** on `/cart` | Saves one order with every line and its artwork (up to 4 MB in all), works every price out again on the server, sends them to Stripe Checkout. When Stripe says it's paid: **Paid: check artwork**, emails the shop (artwork attached) and the customer. |
| Chooses **Pay by invoice** on `/cart` (orders of $500 or more) with their business, billing address and PO number | Saves the order as **Invoice requested** (nothing charged) and emails the shop. From the admin you check the artwork, send the proof and press **Send Stripe invoice**: Stripe emails the invoice (due in 14 days by default, shipping added by you). When it's paid, the order is marked paid. |
| Gets a proof | From the job page you upload the proof (PNG, JPG or PDF). The customer gets a private link (`/proof/…`) to **Approve and print** or **Ask for changes**; their answer moves the order and emails the shop. Without email set up, copy the link from the job page. |
| Sends the **quote** form on `/business` (over 100,000, many versions, custom materials) or the **contact** form | Saves it, emails the shop with Reply-To set to the customer. |
| Sends the **contact** form or the **business** form (on `/business`) | Saves it, emails the shop with Reply-To set to the customer. |
| Leaves Stripe without paying | Back on the page with "nothing was charged". After 2 hours the order is marked **Checkout abandoned**. |

Refunds are made in the Stripe dashboard; the order is marked **Refunded** automatically.

## Setting it up (about 30 minutes)

### 1. Database (Neon, free)

1. Sign up at neon.tech, create a project (region near the host, e.g. AWS us-west-2 or Canada if offered).
2. Copy the **pooled** connection string. That is `DATABASE_URL` (it ends in `?sslmode=require`).
3. The tables are created on first use. To create them ahead of time: `DATABASE_URL=... pnpm db:setup`.

**Pick the region next to where the site runs**, not next to you: every query is a trip to the database and back. Vercel runs in Washington DC by default, so Neon's US East (N. Virginia) is right for it (about 1–2 ms a trip). For a GoDaddy server, pick the region nearest that server. Testing from far away is slower (about 0.25 s a trip from South Asia to US East) but customers never feel that: the server and database talk to each other, not the visitor's computer. The app keeps connections open for 5 minutes and sends each query in one trip.

Any Postgres works (Supabase, the host's own). GoDaddy cPanel usually offers MySQL, not Postgres, which is why an outside Postgres is used: it works from both hosts.

### 2. Stripe

1. dashboard.stripe.com: finish the account (business details, Canadian bank account). Stay in **Test mode** until you've tried an order.
2. Developers > API keys: copy the **Secret key** → `STRIPE_SECRET_KEY`.
3. Developers > Webhooks > Add endpoint: `https://YOUR-DOMAIN/api/stripe/webhook`, events `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`, `charge.refunded` and, for business invoices, `invoice.paid`. Copy its **Signing secret** → `STRIPE_WEBHOOK_SECRET`.
4. **Shipping** (decide): Canadian orders of $100 CAD and more ship free. In Product catalogue > Shipping rates make a **CAD** rate for smaller Canadian orders (`STRIPE_SHIPPING_RATE_ID`) and a **USD** rate for orders outside Canada (`STRIPE_SHIPPING_RATE_ID_USD`). Without them, no shipping is charged. USD orders can ship anywhere Stripe does; limit it with `SHIP_COUNTRIES_USD` (e.g. `US`).
5. **Sales tax** (decide, with your accountant): turn on Stripe Tax, add your GST/HST registration, then set `STRIPE_AUTOMATIC_TAX=true`. Without it, prices are charged with no tax added.
6. Settings > Customer emails: turn on receipts for successful payments.
7. Going live: switch to Live mode, repeat steps 2 and 3 with the live keys.

### 3. Email

Any mailbox that offers SMTP works:

| Mailbox | SMTP_HOST | SMTP_PORT |
| --- | --- | --- |
| cPanel email on your domain | `mail.YOUR-DOMAIN` (see cPanel > Email Accounts > Connect Devices) | 465 |
| GoDaddy Microsoft 365 email | `smtp.office365.com` | 587 |
| Google Workspace | `smtp.gmail.com` (with an app password) | 465 |
| Resend / Postmark (best delivery) | as their SMTP page says | 465 |

Set `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` (e.g. `Label Bros <hello@labelbros.ca>`) and `SHOP_INBOX` (where new orders go). Add SPF and DKIM records for the domain so the emails don't land in spam.

### 4. Admin password

On any computer with the project: `pnpm admin:password`. It asks for a password (12+ characters, a few random words is good) and prints `ADMIN_PASSWORD_HASH` and `SESSION_SECRET`. Paste both into the host's settings. Changing the password signs everyone out.

### 5. The rest

`NEXT_PUBLIC_SITE_URL=https://YOUR-DOMAIN` (links in emails; needs a rebuild when changed). All settings are listed in `.env.example`.

## Deploying

**Vercel.** Import the repo, add the environment variables, deploy. Nothing else.

**GoDaddy cPanel** (a plan with *Setup Node.js App*; HTTPS must be on, the admin sign-in needs it):

1. On your computer: `pnpm install && pnpm build`. This makes `.next/standalone`.
2. Copy `public` into `.next/standalone/public` and `.next/static` into `.next/standalone/.next/static`.
3. Upload the contents of `.next/standalone` to the app folder (e.g. `~/labelbros`).
4. cPanel > Setup Node.js App > Create: Node 22, application root `labelbros`, startup file `server.js`, add the environment variables, Start.
5. If the host limits database connections, set `DATABASE_POOL_MAX=3`.

## Using the back office

`https://YOUR-DOMAIN/admin`, sign in with the shop password.

Sections down the side (across the top on a phone), each with a yellow count of what is waiting:

- **Overview:** money paid this month (CAD and USD apart), proofs to send, jobs in production, new enquiries, the production line stage by stage, paid orders over the last 30 days, "Needs you" and the latest activity.
- **Production · Orders:** a board with one column per stage (Invoice requested → Check artwork → Proof sent → Approved → Printing → Shipped). Each job is a ticket with its items, due date (red when late), customer, amount and flags (We design it, Bulk, Invoice to send / sent / paid, Changes asked); the longest-waiting job is on top, and the button along its bottom goes to the next step (Send proof and Send invoice open the job page). **List** shows every order with a filter per status.
- **Production · Sample kits:** paid kits to pack, with the sticker size.
- **Sales · Quotes, Business leads, Messages:** each a list with filters (New, Replied...). Leads show the label types, quantity and how often.
- **Everything / search:** the search box at the top finds anything by name, email, business or `LB-` number.
- **A job's page:** a stepper showing where it is, with "Mark as …" for the next step (or any status from the menu); the items (with Bulk and We design it flags) and their notes; **Pay by invoice** (billing address, PO number, Send Stripe invoice, and the invoice once sent); **Proofs** (every version with the customer's answer, and the form to send a new one); artwork to download; private shop notes; the customer (Reply by email opens your mail app with the order number in the subject); payment and the shipping address, with a link to the receipt and refunds in Stripe; and the history of every change.
- The **Setup** box at the bottom of the side shows which settings are still missing.

## Security, in short

- Card details never reach this server (Stripe Checkout).
- Prices are always worked out on the server; the browser's price is ignored.
- Stripe's webhook is checked against its signing secret, and each event is handled once.
- Forms: checked on the server (lengths, types, emails, no line breaks in names), same-site only, a hidden bot field and a too-fast check, rate limits per visitor and site-wide (kept in the database, so they hold on Vercel too).
- Uploads: only the artwork file types, up to 4 MB, stored in the database and only ever served to the signed-in shop as a download.
- Admin: scrypt password hash, constant-time checks, 5 tries per 15 minutes, signed http-only cookie (8 hours, SameSite strict), checked by the proxy and again by every page and action. Never indexed.
- Visitor IPs are stored only as a keyed hash. Customers get an email only after paying (an open form that emails any address could be used for spam).
- Security headers on every page (no framing, no sniffing, HSTS, permissions policy).

## Where the code is

| | |
| --- | --- |
| `src/server/` | settings (`env.ts`), database and tables (`db.ts`, `schema.ts`), the inbox (`inbox.ts`), Stripe (`stripe.ts`, `checkout.ts`), email (`mail.ts`), admin sign-in (`auth.ts`, `session-token.ts`), guards (`security.ts`), form checks and server prices (`validate.ts`) |
| `src/app/api/` | `checkout` (cart: card or invoice), `messages`, `track`, `subscribe`, `stripe/webhook` |
| `src/app/proof/` | the customer's proof page and its answers |
| `src/app/admin/` | the back office; `src/proxy.ts` guards it |
| `src/app/order/` | the page after paying (`thanks`) and after an invoice request (`requested`) |
| `src/lib/api.ts`, `src/lib/forms.ts` | the browser side of the forms, and the form choices shared with the server |
