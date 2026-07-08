import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-NMM23LS9";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Professional Movers in Ontario`,
    template: `%s | ${site.name}`,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: ["/favicon-32x32.png"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  description:
    "Surftmove offers reliable local and long-distance moving services across Ontario. Get an instant quote, book online, and enjoy a stress-free move with upfront pricing.",
  keywords: [
    "movers Ontario",
    "moving company Toronto",
    "movers Ottawa",
    "movers Kingston",
    "long distance movers Ontario",
    "local moving service",
    "moving quote Ontario",
    "residential movers",
    "commercial movers Ontario",
  ],
  authors: [{ name: site.name }],
  alternates: { canonical: "/" },
  openGraph: {
    title: `${site.name} | Professional Movers in Ontario`,
    description: site.tagline,
    url: site.url,
    siteName: site.name,
    locale: "en_CA",
    type: "website",
    images: [
      {
        url: "/logo-surftmove-red.png",
        width: 906,
        height: 276,
        alt: `${site.name} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | Professional Movers in Ontario`,
    description: site.tagline,
    images: ["/logo-surftmove-red.png"],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MovingCompany",
  name: site.name,
  image: `${site.url}/logo-surftmove-red.png`,
  url: site.url,
  telephone: site.phone,
  email: site.publicEmail,
  address: {
    "@type": "PostalAddress",
    addressRegion: "ON",
    addressCountry: "CA",
  },
  areaServed: "Ontario, Canada",
  priceRange: "$$",
  openingHours: "Mo-Sa 07:00-20:00",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-CA">
      <body className="flex min-h-screen flex-col bg-white font-sans text-slate-800 antialiased">
        <Script id="google-tag-manager" strategy="beforeInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `}
        </Script>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Script
          id="ld-json"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
