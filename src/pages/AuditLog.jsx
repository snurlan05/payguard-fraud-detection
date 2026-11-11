export default function AuditLog({ state }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Audit Log</h1>
      <p className="text-sm text-slate-500 mb-4">Compliance feed — every scoring, approval, and dispute action is recorded here.</p>
      <div className="card">
        <ul className="space-y-3">
          {state.audit.map((e) => (
            <li key={e.id} className="text-sm border-b border-slate-100 pb-3">
              <span className="text-slate-500">{e.timestamp}</span> · <strong>{e.actor}</strong> — {e.action}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
