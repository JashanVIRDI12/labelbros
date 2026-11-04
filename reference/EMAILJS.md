# Sending the quote and contact forms (EmailJS)

The quote page (`/quote`) and the contact page (`/contact`) send from the visitor's browser through EmailJS (`src/lib/emailjs.ts`). Until the variables below are set, both forms say "We can't send messages from the site yet" instead of pretending to send.

## 1. Environment variables

Set these where the site is built (for example in the host's project settings, or `.env.local` for local work). They are public by design; lock them to the site's domain in the EmailJS dashboard (Account > Security > Allowed origins).

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | Account > API keys > Public key |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | Email Services > your service |
| `NEXT_PUBLIC_EMAILJS_QUOTE_TEMPLATE_ID` | Email Templates > the quote template |
| `NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID` | Email Templates > the contact template |
| `NEXT_PUBLIC_EMAILJS_ATTACHMENT_KB` | Optional. Attach artwork up to this size, in KB. Needs a plan with attachments and, in the quote template's Attachments tab, a "Form file attachment" with the parameter name `artwork`. Unset or `0`: the file is named in the email but not attached, and the customer is told you will ask for it. |

Restart or rebuild after changing them (Next.js writes `NEXT_PUBLIC_` values into the page at build time).

## 2. The quote template

Variables sent: `{{name}}`, `{{email}}`, `{{reply_to}}`, `{{phone}}`, `{{company}}`, `{{needed_by}}`, `{{artwork_link}}`, `{{notes}}`, `{{quote}}`, `{{price}}`, `{{each}}`, `{{artwork_choice}}`, `{{artwork_file}}`, `{{page}}` (and the `artwork` file, when attached).

Suggested settings: To = your inbox, Reply-To = `{{reply_to}}`, Subject = `Quote: {{quote}}`.

Suggested body:

```
New quote request from {{name}} ({{email}}, {{phone}}), {{company}}

{{quote}}
{{price}} ({{each}} each)

Artwork: {{artwork_choice}}, {{artwork_file}}
Link to files: {{artwork_link}}
Needed by: {{needed_by}}

{{notes}}

Sent from {{page}}
```

## 3. The contact template

Variables sent: `{{topic}}`, `{{name}}`, `{{email}}`, `{{reply_to}}`, `{{order}}`, `{{message}}`, `{{page}}`.

Suggested settings: Reply-To = `{{reply_to}}`, Subject = `{{topic}}: message from {{name}}`.

```
{{name}} ({{email}}) wrote about: {{topic}}
Order: {{order}}

{{message}}

Sent from {{page}}
```

## Notes

- The free plan allows two templates, which is exactly what the site uses, and small requests (artwork attachments need a paid plan; check EmailJS's current limits).
- A hidden field catches simple bots: if it is filled in, nothing is sent.
- Contact details (email, phone, city) shown on the contact page come from `CONTACT` in `src/lib/site.ts`; empty values are left off the page.
