import { Link } from 'react-router-dom'

export default function PaymentHistory({ state }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Payment History</h1>
      <div className="card">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th className="py-1">Payment</th><th>Vendor</th><th>Date</th><th>Amount</th><th>Score</th><th>Status</th></tr></thead>
          <tbody>
            {state.payments.map((p) => {
              const a = state.analyses[p.id]
              return <tr key={p.id} className="border-t border-slate-100">
                <td className="py-2"><Link className="text-teal-700 underline" to={`/analysis/${p.id}`}>{p.id}</Link></td>
                <td>{p.vendor_name}</td><td>{p.created_date}</td><td>${p.amount.toLocaleString()} {p.currency}</td>
                <td>{a ? `${a.overall_risk_score}/100 ${a.risk_level}` : '—'}</td><td>{p.status}</td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
