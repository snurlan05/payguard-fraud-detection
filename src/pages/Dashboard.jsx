import { Link } from 'react-router-dom'
import { ShieldCheck, AlertTriangle, Clock, DollarSign } from 'lucide-react'

export default function Dashboard({ state }) {
  const total = state.payments.length
  const high = state.payments.filter((p) => state.analyses[p.id]?.risk_level === 'High').length
  const pending = state.approvals.filter((a) => a.status === 'Pending').length
  const protectedAmount = state.payments
    .filter((p) => state.analyses[p.id]?.risk_level === 'High')
    .reduce((s, p) => s + p.amount, 0)
  const low = state.payments.filter((p) => state.analyses[p.id]?.risk_level === 'Low').length
  const medium = state.payments.filter((p) => state.analyses[p.id]?.risk_level === 'Medium').length
  const stats = [
    { label: 'Payments checked', value: total, icon: ShieldCheck },
    { label: 'High-risk blocked', value: high, icon: AlertTriangle },
    { label: 'Awaiting approval', value: pending, icon: Clock },
    { label: 'Estimated protected', value: `$${protectedAmount.toLocaleString()}`, icon: DollarSign },
  ]
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-sm text-slate-500 mb-5">{state.user.company} · Demo data — no real money moves here.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card"><s.icon className="h-5 w-5 text-teal-600" />
            <p className="text-2xl font-bold mt-2">{s.value}</p><p className="text-xs text-slate-500">{s.label}</p></div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div className="card">
          <h2 className="font-semibold mb-3">Risk distribution</h2>
          {[['Low', low, 'bg-green-500'], ['Medium', medium, 'bg-amber-500'], ['High', high, 'bg-red-500']].map(([label, n, color]) => (
            <div key={label} className="flex items-center gap-3 mb-2 text-sm">
              <span className="w-16">{label}</span>
              <div className="flex-1 bg-slate-100 rounded h-3"><div className={`h-3 rounded ${color}`} style={{ width: `${total ? (n / total) * 100 : 0}%` }} /></div>
              <span className="w-6 text-right font-semibold">{n}</span>
            </div>
          ))}
          <Link to="/check-payment" className="btn-primary mt-4">Check a payment</Link>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3">Flagged payment</h2>
          {high === 0 ? <p className="text-sm text-slate-600">No high-risk payments right now.</p> : state.payments.filter((p) => state.analyses[p.id]?.risk_level === 'High').map((p) => (
            <div key={p.id} className="text-sm">
              <p className="font-semibold">{p.id} — {p.vendor_name} — ${p.amount.toLocaleString()} {p.currency}</p>
              <p className="text-slate-600 mt-1">Score {state.analyses[p.id].overall_risk_score}/100 HIGH · Blocked automatically.</p>
              <Link to={`/analysis/${p.id}`} className="btn-danger mt-3">View risk analysis</Link>
            </div>
          ))}
        </div>
      </div>
      <div className="card mt-4">
        <h2 className="font-semibold mb-3">Recent payments</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th className="py-1">Payment</th><th>Vendor</th><th>Amount</th><th>Score</th><th>Status</th></tr></thead>
          <tbody>
            {state.payments.slice(0, 6).map((p) => {
              const a = state.analyses[p.id]
              return <tr key={p.id} className="border-t border-slate-100">
                <td className="py-2"><Link className="text-teal-700 underline" to={`/analysis/${p.id}`}>{p.id}</Link></td>
                <td>{p.vendor_name}</td><td>${p.amount.toLocaleString()}</td>
                <td>{a ? `${a.overall_risk_score}/100 ${a.risk_level}` : '—'}</td><td>{p.status}</td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
