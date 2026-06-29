export const site = {
  name: "Maple Move Ontario",
  shortName: "Maple Move",
  phone: "(647) 555-0142",
  phoneHref: "tel:+16475550142",
  email: "bookings@maplemoveontario.ca",
  address: "150 Front Street W, Toronto, ON M5J 2X5",
  serviceArea: "Toronto, Ottawa, Mississauga, Hamilton, London & all of Ontario",
  hours: "Mon–Sat: 7:00 AM – 8:00 PM",
  url: "https://moving.sam-portfolio.com",
  tagline: "Stress-free local & long-distance moving across Ontario.",
} as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/booking", label: "Book a Move" },
  { href: "/contact", label: "Contact" },
] as const;
