import { Link } from 'react-router-dom'

export default function Approvals({ state }) {
  const pending = state.approvals.filter((a) => a.status === 'Pending')
  const decided = state.approvals.filter((a) => a.status !== 'Pending')
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Approvals</h1>
      <p className="text-sm text-slate-500 mb-4">High-risk payments are blocked until a manager approves or rejects them. Pending ({pending.length})</p>
      {pending.length === 0 && <div className="card"><p className="text-sm text-slate-600">No payments awaiting approval.</p></div>}
      {pending.map((a) => {
        const p = state.payments.find((x) => x.id === a.payment_request_id)
        const an = state.analyses[a.payment_request_id]
        return <div key={a.id} className="card mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm"><p className="font-semibold">{p?.id} — {p?.vendor_name} — ${p?.amount.toLocaleString()}</p>
            <p className="text-slate-600">Score {an?.overall_risk_score}/100 {an?.risk_level} · Blocked</p></div>
          <Link to={`/analysis/${a.payment_request_id}`} className="btn-primary">Review</Link>
        </div>
      })}
      {decided.length > 0 && <>
        <h2 className="font-semibold mt-6 mb-2">Decided</h2>
        {decided.map((a) => <div key={a.id} className="card mb-2 text-sm"><p><strong>{a.payment_request_id}</strong> — {a.status} by {a.decided_by} on {a.decided_at}</p></div>)}
      </>}
    </div>
  )
}
