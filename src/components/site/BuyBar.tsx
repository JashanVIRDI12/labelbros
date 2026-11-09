"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Arrow } from "./Arrow";
import { SAMPLE_KIT_ON } from "@/lib/site";

/*
 * Phones only: the order button stays in reach while you read. It slides up once the first screen
 * (and its own buttons) has scrolled away, and steps aside wherever the page already offers the
 * order: the builder, the order form, the footer's buttons, anything marked [data-buybar-hide].
 */

const HIDE = "#pricing, #send, .footer-top, [data-buybar-hide]";

export function BuyBar() {
  const path = usePathname();
  const [past, setPast] = useState(false);
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const seen = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) seen.add(e.target);
          else seen.delete(e.target);
        }
        setCovered(seen.size > 0);
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    document.querySelectorAll(HIDE).forEach((el) => io.observe(el));
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, [path]);

  // the shop, its products and the cart have their own buttons (Add to cart, Pay)
  const shopping = path.startsWith("/shop") || path === "/cart";
  const show = past && !covered && !shopping;
  // on the home page the builder is right here; elsewhere it is on the order page
  const href = path === "/" ? "#pricing" : "/quote#pricing";

  return (
    <div className="buybar" data-show={show || undefined} aria-hidden={!show} inert={!show}>
      <Link href={href} className="btn btn-primary buybar-main">
        Upload your design
        <Arrow />
      </Link>
      {SAMPLE_KIT_ON && (
        <Link href="/#samples" className="buybar-kit">
          Sample kit
        </Link>
      )}
    </div>
  );
}
