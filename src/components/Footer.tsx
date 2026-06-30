import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { navLinks, site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <BrandLogo variant="footer" />
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            {site.tagline} Serving {site.serviceArea}.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Quick Links</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-slate-400 transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Get in Touch</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li>
              <a href={site.phoneHref} className="transition-colors hover:text-white">
                {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.publicEmail}`} className="transition-colors hover:text-white">
                {site.publicEmail}
              </a>
            </li>
            <li>{site.serviceArea}</li>
            <li>{site.hours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 py-4">
        <p className="mx-auto max-w-6xl px-4 text-center text-xs text-slate-500 sm:px-6">
          © {new Date().getFullYear()} {site.name}. All rights reserved. Ontario&apos;s trusted moving partner.
        </p>
      </div>
    </footer>
  );
}
