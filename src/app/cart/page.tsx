import type { Metadata } from "next";
import { CartCheckout } from "@/components/shop/CartCheckout";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { BRAND } from "@/lib/site";

export const metadata: Metadata = {
  title: `Your cart · ${BRAND}`,
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <>
      <Header current="/cart" />
      <main id="main" className="cartpage">
        <h1 className="hero-title cart-title">
          <span className="title-line">
            <span style={{ ["--i" as string]: 0 }}>Your cart.</span>
          </span>
        </h1>
        <CartCheckout />
      </main>
      <Footer />
    </>
  );
}
