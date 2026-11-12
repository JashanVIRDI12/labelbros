import type { Metadata, Viewport } from "next";
import { Anton, Archivo, Fraunces, Yellowtail } from "next/font/google";
import { SmoothScroll } from "@/components/fx/SmoothScroll";
import { BASE_URL, BRAND } from "@/lib/site";
import "./globals.css";

// UI and display: one family. Archivo's width axis gives the headline its label-press stance.
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  axes: ["wdth"],
  display: "swap",
});

// Label and sticker artwork only (the hero table's drawn fallbacks).
// Not preloaded: they are fetched when a label first draws with them.
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", preload: false });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["600"], style: ["normal"], variable: "--font-fraunces", preload: false });
const yellowtail = Yellowtail({ subsets: ["latin"], weight: "400", variable: "--font-yellowtail", preload: false });

const DESCRIPTION =
  "Custom product labels on rolls and sheets for food, drinks, candles and cosmetics, with bulk pricing for business. Type your size, upload your artwork or let us design it, and approve a free proof before we print.";

// the site-wide defaults; each page sets its own title, description and canonical (lib/meta.ts)
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Label Bros · Custom product labels for business",
  description: DESCRIPTION,
  applicationName: BRAND,
  alternates: { canonical: "/" },
  openGraph: { title: "Label Bros · Custom product labels for business", description: DESCRIPTION, url: "/", siteName: BRAND, type: "website", locale: "en_CA" },
  twitter: { card: "summary_large_image", title: "Label Bros · Custom product labels for business", description: DESCRIPTION },
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
        <SmoothScroll />
      </body>
    </html>
  );
}
