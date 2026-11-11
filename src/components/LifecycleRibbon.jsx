// LifecycleRibbon — Detect / Verify / Block / Recover stages.
export default function LifecycleRibbon({ level, hasDispute }) {
  const stages = [
    { name: 'Detect', done: true, label: 'Complete' },
    { name: 'Verify', done: true, label: 'Verified against vendor history' },
    { name: 'Block', done: level === 'High', label: level === 'High' ? 'Blocked' : 'Not required' },
    { name: 'Recover', done: !!hasDispute, label: hasDispute ? 'Dispute case open' : 'Available for Medium / High risk' },
  ]
  return (
    <div className="card">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stages.map((s, i) => (
          <div key={s.name} className="text-center">
            <div className={`mx-auto h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${s.done ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{i + 1}</div>
            <p className="font-semibold text-sm mt-2">{s.name}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
