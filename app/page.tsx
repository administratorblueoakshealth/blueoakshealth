import {
  Calendar,
  MapPin,
  Phone,
  Mail,
  Home as HomeIcon,
  Video,
  Building2,
} from "lucide-react";

const practice = {
  name: "BlueOak Psychiatry PLLC",
  phone: "(210) 868-4788",
  email: "info@blueoakshealth.com",
  appointmentsEmail: "appointments@blueoakshealth.com",
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
            rel="noopener noreferrer"
            className="hidden rounded-full bg-slate-900 px-5 py-2 text-white sm:inline-flex"
          >
            Book Appointment
          </a>
        </div>
      </header>

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
              rel="noopener noreferrer"
              className="rounded-full bg-black px-6 py-3 text-white"
            >
              Book Appointment
            </a>

            <a
              href={`mailto:${practice.email}`}
              className="rounded-full border px-6 py-3"
            >
              Contact
            </a>
          </div>

          <div className="mt-6 text-sm text-red-600">
            Not for emergencies. Call 911 or 988.
          </div>
        </div>

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

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold">Services</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {services.map((service) => (
              <div key={service} className="rounded-xl border p-5">
                {service}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold">Conditions Commonly Addressed</h2>

        <div className="mt-6 flex flex-wrap gap-3">
          {conditions.map((condition) => (
            <span
              key={condition}
              className="rounded-full bg-white px-4 py-2 shadow"
            >
              {condition}
            </span>
          ))}
        </div>
      </section>

      <section className="bg-slate-100 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold">Insurance & Payment</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {insurance.map((item) => (
              <div key={item} className="rounded-xl bg-white p-5">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold">
            Schedule Your Appointment
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
            Please do not include sensitive medical information, diagnoses,
            medications, or emergency concerns when booking.
          </p>

          <div className="mt-10 overflow-hidden rounded-3xl border bg-white shadow-sm">
            <iframe
              src={practice.bookingUrl}
              width="100%"
              height="700"
              title="Schedule appointment with BlueOak Psychiatry PLLC"
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-3">
          <div>
            <MapPin />
            <p className="mt-2">{practice.location}</p>
          </div>

          <div>
            <Phone />
            <a className="mt-2 block" href="tel:2108684788">
              {practice.phone}
            </a>
          </div>

          <div>
            <Mail />
            <a className="mt-2 block" href={`mailto:${practice.email}`}>
              {practice.email}
            </a>
            <a
              className="mt-1 block text-sm text-slate-500"
              href={`mailto:${practice.appointmentsEmail}`}
            >
              {practice.appointmentsEmail}
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold">FAQ</h2>

        {faqs.map((faq) => (
          <div key={faq.q} className="mt-4 rounded-xl bg-white p-4">
            <p className="font-semibold">{faq.q}</p>
            <p className="text-sm text-gray-600">{faq.a}</p>
          </div>
        ))}
      </section>

      <footer className="p-6 text-center text-sm text-gray-500">
        <p>
          {practice.name} — {practice.location}
        </p>
        <p className="mt-2">
          <a href="tel:2108684788">{practice.phone}</a> ·{" "}
          <a href={`mailto:${practice.email}`}>{practice.email}</a>
        </p>
        <p className="mx-auto mt-4 max-w-3xl">
          This website is for general informational purposes only and does not
          provide medical advice, diagnosis, or treatment. Do not submit
          sensitive medical information through unsecured email or website forms.
          If you are experiencing an emergency, call 911. For mental health
          crisis support, call or text 988.
        </p>
      </footer>

      <a
        href={practice.bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 rounded-full bg-black px-5 py-3 text-white"
      >
        Book Now
      </a>
    </main>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="mb-4 flex gap-3">
      <div className="text-emerald-700">{icon}</div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-gray-500">{text}</p>
      </div>
    </div>
  );
}