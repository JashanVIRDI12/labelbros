import Link from "next/link";
import { SAMPLE_KIT_ON } from "@/lib/site";

/** The builder, opened on "Design it for me". */
export const DESIGN_HREF = "/quote?artwork=design#pricing";

/*
 * The second button beside "Upload your design": the sample kit when it is on, otherwise our
 * design service, so there is always a choice for people without a file ready.
 */
export function SecondAsk({ className = "btn btn-secondary", designHref = DESIGN_HREF }: { className?: string; designHref?: string }) {
  return SAMPLE_KIT_ON ? (
    <Link href="/#samples" className={className}>
      Order a sample kit
    </Link>
  ) : (
    <Link href={designHref} className={className}>
      We design it
    </Link>
  );
}
