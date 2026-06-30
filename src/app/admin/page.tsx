import type { Metadata } from "next";
import AdminBookingsDashboard from "@/components/AdminBookingsDashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Admin Dashboard</h1>
        <p className="mt-3 text-slate-600">
          Review new bookings, approve customer reviews, download booking PDFs, and send customers their
          confirmation details from one place.
        </p>
      </div>
      <div className="mt-10">
        <AdminBookingsDashboard />
      </div>
    </section>
  );
}
