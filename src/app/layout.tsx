import type { Metadata, Viewport } from "next";
import { Anton, Archivo, Fraunces, Yellowtail } from "next/font/google";
import "./globals.css";

// UI and display: one family. Archivo's width axis gives the headline its label-press stance.
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  axes: ["wdth"],
  display: "swap",
});

// Sticker artwork only (drawn into canvas textures). Not preloaded: the stage asks for them
// after the headline has painted.
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", preload: false });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", preload: false });
const yellowtail = Yellowtail({ subsets: ["latin"], weight: "400", variable: "--font-yellowtail", preload: false });

export const metadata: Metadata = {
  title: "Label Bros · Custom stickers and product labels",
  description:
    "Custom die-cut stickers and product labels, cut to any shape. Send your artwork or let our designers make it, and approve a free proof before we print.",
};

export const viewport: Viewport = {
  themeColor: "#1E3FD8",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${anton.variable} ${fraunces.variable} ${yellowtail.variable}`}
    >
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
