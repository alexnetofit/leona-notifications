export default function DashboardLoading() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8 relative z-10">
      {/* Header Section skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="w-48 h-8 rounded bg-dark-700/50 animate-pulse mb-2" />
          <div className="w-64 h-4 rounded bg-dark-700/50 animate-pulse" />
        </div>
        <div className="w-40 h-10 rounded-lg bg-dark-700/50 animate-pulse" />
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-dark-700/50" />
              <div>
                <div className="w-32 h-5 rounded bg-dark-700/50 mb-2" />
                <div className="w-24 h-4 rounded bg-dark-700/50" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-full h-16 rounded-lg bg-dark-700/50" />
              <div className="w-full h-10 rounded-lg bg-dark-700/50" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
