import {
  Calendar,
  MapPin,
  Phone,
  Mail,
  Home as HomeIcon,
  Video,
  Building2,
  CheckCircle,
  Shield,
  HeartPulse,
  Clock,
  MessageCircle,
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
} from "lucide-react";

const practice = {
  name: "BlueOak Psychiatry PLLC",
  brand: "BlueOaks Health",
  phone: "(210) 981-5702",
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
  "Generalized anxiety disorder",
  "Panic disorder",
  "Social anxiety",
  "OCD",
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

const careOptions = [
  {
    icon: <HomeIcon />,
    title: "Home Visits",
    text: "Select psychiatric visits may be available in the home for eligible patients in the San Antonio area.",
  },
  {
    icon: <Building2 />,
    title: "Outpatient Care",
    text: "Psychiatric evaluations, medication management, and follow-up care in an outpatient setting.",
  },
  {
    icon: <Video />,
    title: "Telehealth",
    text: "Convenient online psychiatric appointments for eligible patients located in Texas.",
  },
];

const steps = [
  {
    icon: <Calendar />,
    title: "Request an appointment",
    text: "Choose a time online or contact the office for current availability.",
  },
  {
    icon: <ClipboardCheck />,
    title: "Confirm visit type",
    text: "We review whether home visit, outpatient, or telehealth care is appropriate.",
  },
  {
    icon: <HeartPulse />,
    title: "Begin care",
    text: "Receive evaluation, treatment planning, medication support, and follow-up care.",
  },
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
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xl font-bold tracking-tight">{practice.brand}</p>
            <p className="text-sm text-slate-600">
              Home Visits · Outpatient · Telehealth
            </p>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <a
              href={`tel:2109815702`}
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              {practice.phone}
            </a>

            <a
              href={practice.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700"
            >
              Book Appointment
            </a>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-emerald-50">
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-emerald-100 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-slate-200 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-5 inline-flex rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-800">
              Psychiatric care in San Antonio and across Texas
            </p>

            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
              Mental health care at home, outpatient, and online.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              {practice.name} provides accessible psychiatric care through home
              visits, outpatient services, and telehealth appointments for
              eligible patients.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={practice.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-semibold text-white shadow-sm hover:bg-slate-700"
              >
                <Calendar size={18} />
                Request Appointment
              </a>

              <a
                href={`mailto:${practice.email}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold hover:bg-slate-100"
              >
                <MessageCircle size={18} />
                Contact Office
              </a>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex gap-2">
                <AlertTriangle size={18} className="shrink-0" />
                <p>
                  This website is not for emergencies. Call 911 for emergencies
                  or call/text 988 for mental health crisis support.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/70">
            <div className="rounded-2xl bg-slate-900 p-7 text-white">
              <p className="text-sm font-medium text-emerald-300">
                Care designed around access
              </p>
              <h2 className="mt-3 text-3xl font-bold">
                Support where patients are.
              </h2>
              <p className="mt-4 leading-7 text-slate-300">
                Flexible psychiatric care options for patients who need support
                at home, in an outpatient setting, or virtually.
              </p>
            </div>

            <div className="mt-6 grid gap-4">
              {careOptions.map((option) => (
                <Feature
                  key={option.title}
                  icon={option.icon}
                  title={option.title}
                  text={option.text}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold">Care Options</h2>
            <p className="mt-4 leading-7 text-slate-600">
              BlueOaks Health is built to make psychiatric care more accessible
              through flexible appointment options.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {careOptions.map((option) => (
              <InfoCard
                key={option.title}
                icon={option.icon}
                title={option.title}
                text={option.text}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              About BlueOaks Health
            </p>
            <h2 className="mt-3 text-3xl font-bold">
              A growing healthcare practice focused on access, dignity, and
              continuity of care.
            </h2>
          </div>

          <div className="space-y-4 leading-8 text-slate-600">
            <p>
              BlueOak Psychiatry PLLC provides compassionate, evidence-based
              psychiatric care for individuals seeking support with mental
              health concerns, medication management, and ongoing treatment
              planning.
            </p>

            <p>
              Our goal is to reduce barriers to care by offering multiple visit
              options, including outpatient appointments, telehealth visits, and
              select home-based psychiatric care for eligible patients.
            </p>

            <p>
              Our approach focuses on improving access to high-quality psychiatric care through flexible visit options designed around patient needs.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="mt-4 leading-7 text-slate-600">
              Getting started is simple. Appointment type and eligibility are
              reviewed based on clinical need, location, and availability.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="text-emerald-700">{step.icon}</div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-500">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 leading-7 text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-20 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-3">
            <StatCard
              icon={<Shield />}
              title="Patient-centered"
              text="Respectful, private, and supportive psychiatric care."
            />
            <StatCard
              icon={<Clock />}
              title="Flexible access"
              text="Home visit, outpatient, and telehealth appointment options."
            />
            <StatCard
              icon={<HeartPulse />}
              title="Continuity of care"
              text="Evaluation, treatment planning, medication support, and follow-up."
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold">Services</h2>
            <p className="mt-4 leading-7 text-slate-600">
              Services may vary by clinical need, location, provider
              availability, and patient eligibility.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <div
                key={service}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 p-5"
              >
                <CheckCircle
                  className="mt-1 shrink-0 text-emerald-600"
                  size={20}
                />
                <span className="font-medium">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold">Conditions Commonly Addressed</h2>
            <p className="mt-4 leading-7 text-slate-600">
              Care may include evaluation and treatment planning for common
              mental health concerns.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {conditions.map((condition) => (
              <span
                key={condition}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm"
              >
                {condition}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl bg-slate-100 p-8 md:p-10">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold">Insurance & Payment</h2>
              <p className="mt-4 leading-7 text-slate-600">
                Insurance credentialing is currently in progress. Self-pay
                options may be available during this period.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {insurance.map((item) => (
                <div key={item} className="rounded-2xl bg-white p-5 shadow-sm">
                  <CheckCircle className="mb-3 text-emerald-600" size={20} />
                  <p className="font-medium">{item}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm text-slate-500">
              Please contact the office directly for current insurance updates,
              eligibility, and payment details. Coverage and eligibility vary by
              plan.
            </p>
          </div>
        </div>
      </section>

      <section id="booking" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold">Schedule Your Appointment</h2>
            <p className="mt-4 leading-7 text-slate-600">
              Choose a time that works for you. Please do not include sensitive
              medical information, diagnoses, medications, or emergency concerns
              when booking.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <iframe
              src={practice.bookingUrl}
              width="100%"
              height="800"
              title="Schedule appointment with BlueOak Psychiatry PLLC"
            />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-3">
          <InfoCard
            icon={<MapPin />}
            title="Service Area"
            text={`${practice.location} · ${practice.serviceArea}`}
          />

          <InfoCard
            icon={<Phone />}
            title="Phone"
            text={<a href="tel:2109815702">{practice.phone}</a>}
          />

          <InfoCard
            icon={<Mail />}
            title="Email"
            text={
              <>
                <a href={`mailto:${practice.email}`}>{practice.email}</a>
                <br />
                <a
                  className="text-sm text-slate-500"
                  href={`mailto:${practice.appointmentsEmail}`}
                >
                  {practice.appointmentsEmail}
                </a>
              </>
            }
          />
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>

          <div className="mt-8 grid gap-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl bg-slate-50 p-6">
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="mt-2 leading-7 text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="mt-4 text-slate-300">
            Request an appointment or contact the office for current
            availability.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={practice.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-900 hover:bg-slate-200"
            >
              Request Appointment
              <ArrowRight size={18} />
            </a>

            <a
              href={`mailto:${practice.email}`}
              className="inline-flex justify-center rounded-full border border-white/30 px-6 py-3 font-semibold text-white hover:bg-white/10"
            >
              Email Office
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-white px-6 py-8 text-center text-sm text-slate-500">
        <p>
          {practice.name} — {practice.location}
        </p>
        <p className="mt-2">
          <a href="tel:2109815702">{practice.phone}</a> ·{" "}
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
        className="fixed bottom-6 right-6 rounded-full bg-slate-900 px-6 py-3 text-white shadow-lg hover:bg-slate-700"
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
    <div className="flex gap-4 rounded-2xl bg-slate-50 p-5">
      <div className="text-emerald-700">{icon}</div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 text-emerald-700">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 leading-7 text-slate-600">{text}</p>
    </div>
  );
}

function StatCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="text-emerald-300">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 leading-7 text-slate-300">{text}</p>
    </div>
  );
}
