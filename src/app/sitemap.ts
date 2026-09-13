import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { cityPages, servicePages } from "@/lib/seo-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/about",
    "/service-areas",
    "/pricing",
    "/booking",
    "/driver-help",
    "/drive-with-us",
    "/contact",
    "/services",
    "/movers",
    ...servicePages.map(({ slug }) => `/services/${slug}`),
    ...cityPages.map(({ slug }) => `/movers/${slug}`),
  ];
  const now = new Date();
  return routes.map((route) => ({
    url: `${site.url}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : route === "/booking" ? 0.9 : 0.8,
  }));
}
