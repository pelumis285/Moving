import type { Metadata } from "next";
import DriverApplicationForm from "@/components/DriverApplicationForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Drive With Us",
  description:
    "Create a driver account profile with Surftmove, set your own price per kilometre, and apply for approval to help with moving routes across Ontario and beyond.",
  alternates: { canonical: "/drive-with-us" },
};

const highlights = [
  {
    title: "Set Your Own Rate",
    text: "Tell us your preferred price per kilometre so we can review you for the right trips.",
  },
  {
    title: "Build A Driver Profile",
    text: "Share your city, service area, vehicle experience, and route availability in one place.",
  },
  {
    title: "Admin Approval First",
    text: "Every profile is reviewed before it becomes an approved driver in the system.",
  },
];

export default function DriveWithUsPage() {
  return (
    <>
      <section className="bg-slate-900 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-300">Driver Recruitment</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold text-white sm:text-5xl">
            Create your driver account profile and set your own price per kilometre.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Want to work with {site.name}? Build your driver profile, tell us what vehicles you can drive,
            share your service area, and set your own per-kilometre rate for review by the admin team.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {highlights.map((highlight) => (
            <div key={highlight.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">{highlight.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{highlight.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-slate-900">Driver Account Application</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              This first version lets drivers create an account profile for admin review. Once approved,
              you will already be in the system with your contact details, rate, coverage area, and
              experience on file.
            </p>
          </div>

          <div className="mt-8">
            <DriverApplicationForm />
          </div>
        </div>
      </section>
    </>
  );
}
