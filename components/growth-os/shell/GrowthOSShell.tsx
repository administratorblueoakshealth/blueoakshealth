import Link from "next/link";

const nav = [
  ["Dashboard", "/internal/crm"],
  ["Facilities", "/internal/crm/facilities"],
  ["Contacts", "/internal/crm/contacts"],
  ["Visits", "/internal/crm/visits"],
  ["Daily Route", "/internal/crm/routes"],
  ["Referrals", "/internal/crm/referrals"],
  ["Analytics", "/internal/crm/analytics"],
  ["Markets", "/internal/crm/markets"],
];

export default function GrowthOSShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex">
        <aside className="hidden min-h-screen w-72 border-r border-white/10 bg-slate-950 p-6 lg:block">
          <div>
            <p className="text-sm text-blue-300">BlueOaks</p>
            <h1 className="mt-1 text-xl font-bold">Growth OS</h1>
          </div>

          <nav className="mt-8 space-y-1">
            {nav.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="block rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
              >
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          <header className="border-b border-white/10 bg-slate-950/80 px-5 py-4 backdrop-blur md:px-8">
            <p className="text-sm font-medium text-blue-300">
              BlueOaks Growth OS
            </p>
            <h2 className="text-2xl font-bold tracking-tight">
              Referral Growth Command Center
            </h2>
          </header>

          <div className="p-5 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}