import "server-only";
import type Stripe from "stripe";
import { filesWithBytes, markPaid } from "./inbox";
import { confirmToCustomer, notifyShop, safely } from "./mail";
import { env } from "./env";
import { paidDetails } from "./stripe";

/*
 * A checkout that Stripe says is paid: mark it paid and send the emails. The webhook and the
 * thank-you page both call this; only the first call changes anything, so emails go once.
 */
export async function completeCheckout(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") return null;
  const row = await markPaid(session.id, paidDetails(session));
  if (!row) return null;

  const files = await filesWithBytes(row.id);
  const adminUrl = env.siteUrl ? `${env.siteUrl}/admin/${row.ref}` : undefined;
  await safely(() =>
    notifyShop(row, {
      adminUrl,
      headline: row.kind === "sample_kit" ? "Sample kit paid" : "New paid order",
      attachments: files.map((f) => ({ name: f.name, bytes: f.bytes })),
    }),
  );
  await safely(() => confirmToCustomer(row));
  return row;
}
