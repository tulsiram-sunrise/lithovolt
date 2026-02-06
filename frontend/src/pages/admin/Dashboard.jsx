export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value="150" icon="👥" />
        <StatCard title="Battery Models" value="25" icon="🔋" />
        <StatCard title="Active Orders" value="42" icon="🛒" />
        <StatCard title="Warranties Issued" value="1,234" icon="📜" />
      </div>
      {/* TODO: Add charts and tables */}
    </div>
  )
}

function StatCard({ title, value, icon }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}
