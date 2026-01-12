export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-cosmic relative">
      {/* Glowing orbs */}
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />

      {/* Header skeleton */}
      <div className="glass-header sticky top-0 z-40 hidden sm:block">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-dark-700/50 animate-pulse" />
              <div className="w-40 h-6 rounded bg-dark-700/50 animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="w-24 h-8 rounded-lg bg-dark-700/50 animate-pulse" />
              <div className="w-28 h-8 rounded-lg bg-dark-700/50 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8 relative z-10">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="w-40 h-8 rounded bg-dark-700/50 animate-pulse mb-2" />
          <div className="w-56 h-4 rounded bg-dark-700/50 animate-pulse" />
        </div>

        {/* Cards skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-dark-700/50" />
                <div className="w-40 h-5 rounded bg-dark-700/50" />
              </div>
              <div className="space-y-3">
                <div className="w-full h-4 rounded bg-dark-700/50" />
                <div className="w-3/4 h-4 rounded bg-dark-700/50" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
