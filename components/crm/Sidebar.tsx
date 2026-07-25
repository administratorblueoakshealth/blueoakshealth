export default function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 border-r bg-white p-6 md:block">
      <h1 className="text-xl font-bold">BlueOaks CRM</h1>

      <nav className="mt-8 space-y-3 text-sm">
        <p className="font-medium text-blue-700">Dashboard</p>
        <p className="text-gray-600">Facilities</p>
        <p className="text-gray-600">Daily Route</p>
        <p className="text-gray-600">Referrals</p>
        <p className="text-gray-600">Analytics</p>
      </nav>
    </aside>
  );
}