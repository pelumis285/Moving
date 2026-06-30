import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Professional Movers in Ontario`,
    template: `%s | ${site.name}`,
  },
  description:
    "Surftmove offers reliable local and long-distance moving services across Ontario. Get an instant quote, book online, and enjoy a stress-free move with upfront pricing.",
  keywords: [
    "movers Ontario",
    "moving company Toronto",
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
        width: 1881,
        height: 836,
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
  email: site.email,
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
