import type Stripe from "stripe";
import { completeCheckout } from "@/server/checkout";
import { db } from "@/server/db";
import { env, ready } from "@/server/env";
import { markAbandoned, markRefunded } from "@/server/inbox";
import { stripe } from "@/server/stripe";

/*
 * POST /api/stripe/webhook: Stripe tells us what happened to a payment. Every call is checked
 * against the signing secret (anything unsigned is refused) and handled once, by event id.
 * Events to send (Stripe dashboard > Developers > Webhooks): checkout.session.completed,
 * checkout.session.async_payment_succeeded, checkout.session.expired, charge.refunded.
 */
export async function POST(req: Request) {
  if (!ready.db() || !ready.stripe() || !env.stripeWebhookSecret) return new Response("not configured", { status: 503 });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("no signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(await req.text(), signature, env.stripeWebhookSecret);
  } catch {
    return new Response("bad signature", { status: 400 });
  }

  const sql = await db();
  const fresh = await sql`insert into stripe_events (id, type) values (${event.id}, ${event.type}) on conflict do nothing returning id`;
  if (fresh.length === 0) return new Response("already handled");

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await completeCheckout(event.data.object);
        break;
      case "checkout.session.expired":
        await markAbandoned(event.data.object.id);
        break;
      case "charge.refunded": {
        const charge = event.data.object;
        const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        if (pi) await markRefunded(pi, `$${(charge.amount_refunded / 100).toFixed(2)} ${charge.currency.toUpperCase()}`);
        break;
      }
    }
  } catch (err) {
    // let Stripe retry: forget the event so the retry is handled
    await sql`delete from stripe_events where id = ${event.id}`;
    console.error("[webhook]", event.type, err instanceof Error ? err.message : err);
    return new Response("error", { status: 500 });
  }
  return new Response("ok");
}
