import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";

const GTM_ID =
  process.env.NEXT_PUBLIC_GTM_ID?.trim() ||
  (process.env.NODE_ENV === "production" ? "GTM-NMM23LS9" : null);
const META_PIXEL_ID = "2996520100692899";

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
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}#organization`,
      name: site.name,
      url: site.url,
      logo: `${site.url}/logo-surftmove-red.png`,
      email: site.publicEmail,
      telephone: site.phone,
      foundingDate: String(site.foundedYear),
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: site.phone,
          email: site.publicEmail,
          contactType: "customer service",
          areaServed: "CA-ON",
          availableLanguage: ["en-CA"],
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}#website`,
      url: site.url,
      name: site.name,
      description: site.tagline,
      publisher: {
        "@id": `${site.url}#organization`,
      },
      inLanguage: "en-CA",
    },
    {
      "@type": "MovingCompany",
      "@id": `${site.url}#moving-company`,
      name: site.name,
      url: site.url,
      image: `${site.url}/logo-surftmove-red.png`,
      description:
        "Surftmove provides residential, long-distance, condo, office, and rental-truck driver help across Ontario.",
      telephone: site.phone,
      email: site.publicEmail,
      priceRange: "$$",
      slogan: site.tagline,
      areaServed: site.primaryCities.map((city) => ({
        "@type": "City",
        name: city,
        containedInPlace: {
          "@type": "AdministrativeArea",
          name: "Ontario",
        },
      })),
      address: {
        "@type": "PostalAddress",
        addressRegion: "ON",
        addressCountry: "CA",
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "07:00",
          closes: "20:00",
        },
      ],
      knowsAbout: [
        "Residential moving",
        "Condo moves",
        "Apartment moving",
        "Office relocation",
        "Long-distance Ontario moves",
        "Packing help",
        "Rental truck driver assistance",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Moving services",
        itemListElement: site.primaryServices.map((serviceName) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: serviceName,
          },
        })),
      },
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-CA">
      <body className="flex min-h-screen flex-col bg-white font-sans text-slate-800 antialiased">
        <Script id="meta-pixel" strategy="beforeInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        {GTM_ID ? (
          <>
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
          </>
        ) : null}
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
