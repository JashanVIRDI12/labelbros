import Image from "next/image";
import Link from "next/link";
import { Ph } from "@/components/site/Ph";
import { PROOF, REPRINT_WINDOW } from "@/lib/facts";
import { contactOr } from "@/lib/site";

/*
 * The reasons to trust a first order, said once and the same way everywhere: printed in Canada,
 * paid securely through Stripe (with the cards and wallets it takes), a free proof first, and a
 * reprint if we get it wrong. Flat marks in the UI's colours; the leaf is the only sticker.
 */

/** Canadian flag leaf: https://commons.wikimedia.org/wiki/File:Flag_of_Canada_(leaf).svg */
export function MapleLeaf({ className }: { className?: string }) {
  return (
    <svg viewBox="-1953 -2031 3906 4061" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="m-90 2030 45-863a95 95 0 0 0-111-98l-859 151 116-320a65 65 0 0 0-20-73l-941-762 212-99a65 65 0 0 0 34-79l-186-572 542 115a65 65 0 0 0 73-38l105-247 423 454a65 65 0 0 0 111-57l-204-1052 327 189a65 65 0 0 0 91-27l332-652 332 652a65 65 0 0 0 91 27l327-189-204 1052a65 65 0 0 0 111 57l423-454 105 247a65 65 0 0 0 73 38l542-115-186 572a65 65 0 0 0 34 79l212 99-941 762a65 65 0 0 0-20 73l116 320-859-151a95 95 0 0 0-111 98l45 863z"
      />
    </svg>
  );
}

const ICONS = {
  lock: "M7 10V7.5a5 5 0 0 1 10 0V10M5.5 10h13v10h-13zM12 14v2.5",
  proof: "M5 3.5h9l4 4V20.5H5zM14 3.5v4h4M8.5 13.5l2.2 2.2 4.6-4.7",
  reprint: "M4.5 12a7.5 7.5 0 0 1 13-5.1M19.5 12a7.5 7.5 0 0 1-13 5.1M17.5 3.5v3.6h-3.6M6.5 20.5v-3.6h3.6",
} as const;

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="trust-icon">
      <path d={ICONS[name]} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The cards and wallets Stripe Checkout takes, using their original SVG artwork. */
export function PayMarks({ className = "" }: { className?: string }) {
  const marks = [
    { name: "Visa", src: "/payments/visa.svg" },
    { name: "Mastercard", src: "/payments/mastercard.svg" },
    { name: "American Express", src: "/payments/american-express.svg" },
    { name: "Apple Pay", src: "/payments/apple-pay.svg" },
    { name: "Google Pay", src: "/payments/google-pay.svg" },
  ];
  return (
    <ul className={`pay-marks ${className}`} aria-label="Payment methods">
      {marks.map((m) => (
        <li key={m.name} title={m.name}>
          <Image className="pay-logo" src={m.src} width={38} height={24} alt="" unoptimized />
          <span className="sr-only">{m.name}</span>
        </li>
      ))}
    </ul>
  );
}

/** A band of four promises. `compact`: the short version for the cart and product pages. */
export function TrustStrip({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return (
    <section aria-label="Why order from Label Bros" className={`trust ${compact ? "trust-compact" : ""} ${className}`}>
      <ul className="trust-list">
        <li className="trust-item">
          <span className="trust-leaf" aria-hidden="true">
            <MapleLeaf />
          </span>
          <span className="trust-text">
            <b>Printed in Canada</b>
            <span>
              <Ph text={contactOr("city")} />
            </span>
          </span>
        </li>
        <li className="trust-item">
          <Icon name="lock" />
          <span className="trust-text">
            <b>Secure checkout</b>
            <span>Paid through Stripe</span>
          </span>
          {!compact && <PayMarks className="trust-pay" />}
        </li>
        <li className="trust-item">
          <Icon name="proof" />
          <span className="trust-text">
            <b>Free proof</b>
            <span>{PROOF.replace("Free proof ", "")}, before we print</span>
          </span>
        </li>
        <li className="trust-item">
          <Icon name="reprint" />
          <span className="trust-text">
            <b>
              <Link href="/reprints" className="trust-link">
                Reprint guarantee
              </Link>
            </b>
            <span>Wrong or damaged? Tell us within {REPRINT_WINDOW}</span>
          </span>
        </li>
      </ul>
      {compact && <PayMarks className="trust-pay" />}
    </section>
  );
}
