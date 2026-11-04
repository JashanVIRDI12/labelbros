import type { Metadata } from "next";
import { StickerSheet } from "@/components/stickers-page/StickerSheet";
import { StickersHero } from "@/components/stickers-page/StickersHero";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

export const metadata: Metadata = {
  title: "Custom stickers · Label Bros",
  description:
    "Custom die-cut stickers in any shape and size, in gloss, matte, holographic, glitter or kraft. Send your artwork or let our designers make it, and approve a free proof before we print.",
};

export default function StickersPage() {
  return (
    <>
      <Header current="/stickers" />
      <main id="main">
        <StickersHero />
        <StickerSheet />
      </main>
      <Footer />
    </>
  );
}
