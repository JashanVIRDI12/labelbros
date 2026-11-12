import "server-only";
import Stripe from "stripe";
import { FREE_SHIPPING } from "@/lib/facts";
import { BRAND } from "@/lib/site";
import { USD_COUNTRIES } from "./countries";
import { env } from "./env";
import type { Submission } from "./inbox";

/*
 * Payments through Stripe Checkout: the customer pays on Stripe's own page, so card details
 * never touch this server. We send Stripe the amount we worked out ourselves; Stripe tells us
 * when it is paid through the signed webhook (api/stripe/webhook).
 */

declare global {
  var __lbStripe: Stripe | undefined;
}

export function stripe() {
  if (!env.stripeSecretKey) throw new Error("STRIPE_SECRET_KEY is not set");
  globalThis.__lbStripe ??= new Stripe(env.stripeSecretKey, {
    appInfo: { name: "labelbros-site" },
    maxNetworkRetries: 2,
    timeout: 20_000,
  });
  return globalThis.__lbStripe;
}

type Country = Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry;

/**
 * CAD orders ship within Canada: free over the line, else the CAD rate from the dashboard (if set).
 * USD orders ship everywhere else, at the USD rate from the dashboard (if set).
 */
function shipping(cents: number, currency: string) {
  if (currency === "usd")
    return {
      countries: (env.shipCountriesUsd.length ? env.shipCountriesUsd : [...USD_COUNTRIES]) as Country[],
      options: env.stripeShippingRateIdUsd ? [{ shipping_rate: env.stripeShippingRateIdUsd }] : undefined,
    };
  return { countries: ["CA"] as Country[], options: cadShipping(cents) };
}

function cadShipping(cents: number): Stripe.Checkout.SessionCreateParams.ShippingOption[] | undefined {
  if (cents >= FREE_SHIPPING * 100)
    return [
      {
        shipping_rate_data: {
          display_name: "Free shipping",
          type: "fixed_amount",
          fixed_amount: { amount: 0, currency: "cad" },
        },
      },
    ];
  if (env.stripeShippingRateId) return [{ shipping_rate: env.stripeShippingRateId }];
  return undefined;
}

/** Start a Stripe Checkout for a saved order or sample kit; returns the page to send them to. */
type Item = { name: string; description: string; cents: number; quantity?: number };

export async function createCheckout(
  s: Submission,
  item: Item | Item[],
  origin: string,
  extra: Partial<Stripe.Checkout.SessionCreateParams> = {},
  back: { path: string; hash: string } = s.kind === "sample_kit" ? { path: "/", hash: "samples" } : { path: "/quote", hash: "send" },
) {
  const items = Array.isArray(item) ? item : [item];
  const total = items.reduce((n, i) => n + i.cents * (i.quantity ?? 1), 0);
  const currency = s.currency === "usd" ? "usd" : "cad";
  const ship = shipping(total, currency);
  const session = await stripe().checkout.sessions.create(
    {
      mode: "payment",
      currency,
      line_items: items.map((i) => ({
        quantity: i.quantity ?? 1,
        price_data: {
          currency,
          unit_amount: i.cents,
          product_data: { name: i.name.slice(0, 250), description: i.description.slice(0, 500) },
          tax_behavior: "exclusive" as const,
        },
      })),
      customer_email: s.email,
      client_reference_id: s.ref,
      metadata: { ref: s.ref, kind: s.kind },
      payment_intent_data: {
        metadata: { ref: s.ref, kind: s.kind },
        description: `${BRAND} ${s.ref}: ${s.summary}`.slice(0, 1000),
      },
      shipping_address_collection: { allowed_countries: ship.countries },
      shipping_options: ship.options,
      phone_number_collection: { enabled: true },
      automatic_tax: { enabled: env.stripeAutomaticTax },
      success_url: `${origin}/order/thanks?ref=${encodeURIComponent(s.ref)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${back.path}?checkout=cancelled${back.hash ? `#${back.hash}` : ""}`,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 2, // 2 hours
      ...extra,
    },
    { idempotencyKey: `checkout-${s.ref}` },
  );
  if (!session.url) throw new Error("Stripe returned no checkout URL");
  return session;
}

/** What markPaid needs from a finished checkout. */
export function paidDetails(session: Stripe.Checkout.Session) {
  const pi = typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);
  const ship = session.collected_information?.shipping_details ?? null;
  return {
    paymentIntent: pi,
    amountCents: session.amount_total ?? null,
    shipping: ship
      ? {
          name: ship.name,
          address: ship.address,
          cost: session.shipping_cost?.amount_total ?? 0,
          tax: session.total_details?.amount_tax ?? 0,
          custom: session.custom_fields?.map((f) => ({ key: f.key, value: f.dropdown?.value ?? f.text?.value ?? null })),
        }
      : null,
    phone: session.customer_details?.phone ?? null,
    name: session.customer_details?.name ?? ship?.name ?? null,
    email: session.customer_details?.email ?? null,
  };
}

/*
 * Pay by invoice (business orders): a Stripe invoice that Stripe emails to the customer, with a
 * page where they pay by card or bank transfer. One customer per order, so the invoice carries
 * the business name, address and PO number they gave.
 */
type Billing = { company?: string; line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country?: string; po?: string };

export async function sendInvoice(
  s: Submission,
  items: Item[],
  opts: { shippingCents: number; days: number; billing: Billing; note?: string },
) {
  const st = stripe();
  const currency = s.currency === "usd" ? "usd" : "cad";
  const b = opts.billing;
  const address = b.line1
    ? { line1: b.line1, line2: b.line2 || undefined, city: b.city, state: b.state, postal_code: b.postal_code, country: b.country }
    : undefined;
  const key = `${s.ref}-${Date.now()}`;
  const customer = await st.customers.create(
    {
      email: s.email,
      name: b.company || s.name,
      phone: s.phone ?? undefined,
      address,
      shipping: address ? { name: s.name, address, phone: s.phone ?? undefined } : undefined,
      metadata: { ref: s.ref, contact: s.name },
    },
    { idempotencyKey: `cust-${key}` },
  );
  const invoice = await st.invoices.create(
    {
      customer: customer.id,
      collection_method: "send_invoice",
      days_until_due: opts.days,
      currency,
      auto_advance: false,
      pending_invoice_items_behavior: "exclude",
      automatic_tax: { enabled: env.stripeAutomaticTax },
      description: (opts.note || `${BRAND} order ${s.ref}. We print once your proof is approved and this invoice is paid.`).slice(0, 1500),
      custom_fields: [
        { name: "Order", value: s.ref },
        ...(b.po ? [{ name: "PO number", value: b.po.slice(0, 140) }] : []),
      ],
      metadata: { ref: s.ref, kind: s.kind },
    },
    { idempotencyKey: `inv-${key}` },
  );
  if (!invoice.id) throw new Error("Stripe returned no invoice id");
  for (const [i, it] of items.entries())
    await st.invoiceItems.create(
      {
        customer: customer.id,
        invoice: invoice.id,
        currency,
        amount: it.cents * (it.quantity ?? 1),
        description: `${it.name}: ${it.description}${(it.quantity ?? 1) > 1 ? ` (× ${it.quantity})` : ""}`.slice(0, 500),
        tax_behavior: "exclusive",
      },
      { idempotencyKey: `ii-${key}-${i}` },
    );
  if (opts.shippingCents > 0)
    await st.invoiceItems.create(
      { customer: customer.id, invoice: invoice.id, currency, amount: opts.shippingCents, description: "Shipping", tax_behavior: "exclusive" },
      { idempotencyKey: `ii-${key}-ship` },
    );
  const final = await st.invoices.finalizeInvoice(invoice.id, { auto_advance: false });
  await st.invoices.sendInvoice(invoice.id);
  return { id: invoice.id, url: final.hosted_invoice_url ?? null, number: final.number ?? null, cents: final.amount_due };
}
