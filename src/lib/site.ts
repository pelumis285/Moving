export const site = {
  name: "Surftmove",
  shortName: "Surftmove",
  phone: "(705) 905-8353",
  phoneHref: "tel:+17059058353",
  publicEmail: "info@mail.surftmove.ca",
  operationsEmail: "pelumis285@gmail.com",
  address: "Ontario, Canada",
  serviceArea: "Ontario, Canada",
  hours: "Mon–Sat: 7:00 AM – 8:00 PM",
  url: "https://surftmove.ca",
  tagline: "Stress-free local & long-distance moving across Ontario.",
  foundedYear: 2024,
  primaryCities: ["Toronto", "Ottawa", "Kingston", "Mississauga", "Hamilton", "London", "Barrie", "Peterborough"],
  primaryServices: [
    "Residential moving",
    "Long-distance moving",
    "Commercial and office moving",
    "Packing help",
    "Driver help for rental trucks and vehicles",
  ],
} as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/service-areas", label: "Service Areas" },
  { href: "/pricing", label: "Pricing" },
  { href: "/booking", label: "Book a Move" },
  { href: "/driver-help", label: "Driver Help" },
  { href: "/drive-with-us", label: "Drive With Us" },
  { href: "/contact", label: "Contact" },
] as const;
