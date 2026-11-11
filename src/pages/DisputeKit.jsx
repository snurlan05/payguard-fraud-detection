import { Link } from 'react-router-dom'
import { daysOverdue } from '../lib/store.js'

export default function DisputeKit({ state }) {
  const open = state.disputes.filter((d) => d.status !== 'Resolved' && d.status !== 'Closed')
  const total = state.disputes.reduce((s, d) => s + d.amount, 0)
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">DisputeKit</h1>
        <Link to="/disputes/new" className="btn-primary">New dispute case</Link>
      </div>
      <p className="text-sm text-slate-500 mb-4">{open.length} open case(s) · ${total.toLocaleString()} disputed · Demo data — these are not real bank disputes.</p>
      {state.disputes.map((d) => (
        <div key={d.id} className="card mb-3">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <p className="font-semibold">{d.case_number} — {d.bank_name} — ${d.amount.toLocaleString()} {d.currency}</p>
              <p className="text-sm text-slate-600">{d.fraud_type} · Payment {d.payment_id} · Complaint {d.complaint_date}</p>
              <p className="text-sm">Bank deadline {d.bank_deadline} (56-day rule){daysOverdue(d.bank_deadline) > 0 ? ` · ${daysOverdue(d.bank_deadline)}d overdue` : ' · within deadline'}</p>
              {d.demo_data && <span className="badge bg-slate-100 text-slate-600 mt-2">Demo data</span>}
            </div>
            <div className="text-right">
              <span className="badge bg-amber-100 text-amber-800">{d.status}</span><br />
              <Link to={`/disputes/${d.id}`} className="btn-outline mt-3">Open case</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
