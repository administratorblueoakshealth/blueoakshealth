import {
  Calendar,
  Brain,
  Shield,
  HeartPulse,
  MessageCircle,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  Home as HomeIcon,
  Video,
  Building2,
} from "lucide-react";

const practice = {
  name: "BlueOak Psychiatry PLLC",
  phone: "(210) 868-4788",
  email: "a.adetunji44@outlook.com",
  bookingUrl: "https://calendly.com/blueoakspsych/30min",
  location: "San Antonio, TX",
  serviceArea:
    "Home visits in San Antonio · Outpatient services · Telehealth across Texas",
};

const services = [
  "Psychiatric evaluations",
  "Medication management",
  "In-home psychiatric visits",
  "Outpatient follow-up visits",
  "Telepsychiatry appointments",
  "Anxiety and depression care",
  "ADHD evaluation and follow-up",
  "Mood disorder care",
  "PTSD and trauma-related support",
  "Sleep and insomnia concerns",
  "Medication side effect management",
  "Care coordination when appropriate",
];

const conditions = [
  "Depression",
  "Anxiety",
  "ADHD",
  "Bipolar disorder",
  "PTSD",
  "Insomnia",
  "Mood disorders",
  "Generalized anxiety disorder (GAD)",
  "Panic disorder",
  "Social anxiety disorder",
  "Obsessive-compulsive disorder (OCD)",
  "Trauma-related disorders",
  "Adjustment disorders",
  "Stress and burnout",
];

const insurance = [
  "Self-pay options may be available",
  "BCBSTX credentialing in progress",
  "Aetna credentialing in progress",
  "Cigna / Evernorth credentialing in progress",
  "Optum / UnitedHealthcare credentialing in progress",
];

const faqs = [
  {
    q: "Do you offer home visits?",
    a: "Yes. Select in-home psychiatric visits may be available for eligible patients in the San Antonio area.",
  },
  {
    q: "Do you offer outpatient visits?",
    a: "Yes. Outpatient psychiatric services are available based on location and scheduling.",
  },
  {
    q: "Do you offer telehealth?",
    a: "Yes. Telehealth is available for eligible patients located in Texas.",
  },
  {
    q: "Do you prescribe medication?",
    a: "Medication decisions are made after a clinical evaluation.",
  },
  {
    q: "Is this website for emergencies?",
    a: "No. Call 911 or 988 for crisis support.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xl font-bold">{practice.name}</p>
            <p className="text-sm text-slate-600">
              Home Visits · Outpatient · Telehealth
            </p>
          </div>

          <a
            href={practice.bookingUrl}
            target="_blank"
            className="hidden rounded-full bg-slate-900 px-5 py-2 text-white sm:inline-flex"
          >
            Book Appointment
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2">
        <div>
          <h1 className="text-5xl font-bold">
            Psychiatric care where patients are.
          </h1>

          <p className="mt-6 text-lg text-slate-600">
            BlueOak Psychiatry PLLC provides mental health care through home
            visits, outpatient services, and telehealth across Texas.
          </p>

          <div className="mt-6 flex gap-3">
            <a
              href={practice.bookingUrl}
              target="_blank"
              className="bg-black text-white px-6 py-3 rounded-full"
            >
              Book Appointment
            </a>

            <a
              href={`mailto:${practice.email}`}
              className="border px-6 py-3 rounded-full"
            >
              Contact
            </a>
          </div>

          <div className="mt-6 text-sm text-red-600">
            Not for emergencies. Call 911 or 988.
          </div>
        </div>

        {/* CARE MODEL */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <Feature
            icon={<HomeIcon />}
            title="Home Visits"
            text="Care delivered in the patient’s home when appropriate."
          />
          <Feature
            icon={<Building2 />}
            title="Outpatient Care"
            text="Evaluation and ongoing psychiatric management."
          />
          <Feature
            icon={<Video />}
            title="Telehealth"
            text="Secure online visits across Texas."
          />
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold">Services</h2>

          <div className="grid gap-4 mt-6 md:grid-cols-3">
            {services.map((s) => (
              <div key={s} className="p-5 border rounded-xl">
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONDITIONS */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold">Conditions Commonly Addressed</h2>

        <div className="flex flex-wrap gap-3 mt-6">
          {conditions.map((c) => (
            <span key={c} className="bg-white px-4 py-2 rounded-full shadow">
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* INSURANCE */}
      <section className="bg-slate-100 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold">Insurance & Payment</h2>

          <div className="grid gap-4 mt-6 md:grid-cols-3">
            {insurance.map((i) => (
              <div key={i} className="p-5 bg-white rounded-xl">
                {i}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section className="py-20">
        <iframe src={practice.bookingUrl} width="100%" height="700" />
      </section>

      {/* CONTACT */}
      <section className="py-20 bg-white">
        <div className="grid max-w-6xl mx-auto md:grid-cols-3 gap-6 px-6">
          <div>
            <MapPin />
            {practice.location}
          </div>
          <div>
            <Phone />
            <a href="tel:2108684788">{practice.phone}</a>
          </div>
          <div>
            <Mail />
            <a href={`mailto:${practice.email}`}>{practice.email}</a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold">FAQ</h2>

        {faqs.map((f) => (
          <div key={f.q} className="mt-4 p-4 bg-white rounded-xl">
            <p className="font-semibold">{f.q}</p>
            <p className="text-sm text-gray-600">{f.a}</p>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer className="text-center p-6 text-sm text-gray-500">
        {practice.name} — {practice.location}
      </footer>

      {/* FLOAT BUTTON */}
      <a
        href={practice.bookingUrl}
        target="_blank"
        className="fixed bottom-6 right-6 bg-black text-white px-5 py-3 rounded-full"
      >
        Book Now
      </a>
    </main>
  );
}

function Feature({ icon, title, text }: any) {
  return (
    <div className="flex gap-3 mb-4">
      {icon}
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-gray-500">{text}</p>
      </div>
    </div>
  );
}
