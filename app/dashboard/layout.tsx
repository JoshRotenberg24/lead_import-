import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">CRM Hub</h1>
          <p className="text-slate-400 text-sm">Lead Management System</p>
        </div>

        <nav className="space-y-2">
          <Link
            href="/dashboard/leads"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 transition text-slate-100 hover:text-white"
          >
            <span className="text-xl">👥</span>
            <span>Leads</span>
          </Link>
          <Link
            href="/dashboard/automations"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 transition text-slate-100 hover:text-white"
          >
            <span className="text-xl">⚙️</span>
            <span>Automations</span>
          </Link>
          <Link
            href="/dashboard/templates"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 transition text-slate-100 hover:text-white"
          >
            <span className="text-xl">📧</span>
            <span>Email Templates</span>
          </Link>
          <Link
            href="/dashboard/campaigns"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 transition text-slate-100 hover:text-white"
          >
            <span className="text-xl">📢</span>
            <span>Campaigns</span>
          </Link>
        </nav>

        <div className="mt-8 pt-8 border-t border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 transition text-slate-100 hover:text-white text-sm"
          >
            <span>←</span>
            <span>Back to Import Tool</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
