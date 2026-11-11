import { useParams, Link } from 'react-router-dom'
import { generateDisputePackage, updateDisputeCaseStatus, daysOverdue } from '../lib/store.js'

export default function DisputeCaseDetail({ state, update }) {
  const { id } = useParams()
  const d = state.disputes.find((x) => x.id === id)
  if (!d) return <p>Case not found. <Link className="text-teal-700 underline" to="/disputes">Back to DisputeKit</Link></p>
  const pkg = generateDisputePackage(d)
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dispute Case {d.case_number}</h1>
      <p className="text-sm text-slate-500 mb-4">{d.fraud_type} · {d.bank_name} · ${d.amount.toLocaleString()} {d.currency} · Transaction {d.transaction_id}</p>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold mb-2">Overview</h2>
          <p className="text-sm text-slate-600">Transaction date {d.transaction_date} · Discovered {d.discovery_date} · Complaint {d.complaint_date}</p>
          <p className="text-sm mt-2"><strong>Complaint tracking:</strong> 56-day bank response deadline {d.bank_deadline}.
            {daysOverdue(d.bank_deadline) > 0 ? ` ${daysOverdue(d.bank_deadline)} days overdue.` : ' Within deadline.'}</p>
          <p className="text-sm mt-2"><strong>Status:</strong> {d.status}</p>
          <div className="flex gap-2 mt-3">
            <select className="input w-auto" value={d.status} onChange={(e) => update(updateDisputeCaseStatus(state, d.id, e.target.value))}>
              <option>Open</option><option>Awaiting Bank Response</option><option>Resolved</option><option>Closed</option>
            </select>
          </div>
          <p className="text-xs text-slate-500 mt-2">Status changes are manager-only in the original; the demo user is a Manager.</p>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-2">Evidence ({d.evidence.length})</h2>
          {d.evidence.length === 0 ? <p className="text-sm text-slate-600">No evidence attached yet in this demo case.</p> :
            <ul className="text-sm space-y-2">{d.evidence.map((e) => <li key={e.id}><strong>{e.type}:</strong> {e.name}<br /><span className="text-slate-600">{e.note}</span></li>)}</ul>}
        </div>
      </div>
      <div className="card mt-4">
        <h2 className="font-semibold mb-2">Timeline</h2>
        <ul className="text-sm space-y-1">{d.timeline.map((t, i) => <li key={i}><strong>{t.date}:</strong> {t.event}</li>)}</ul>
      </div>
      <div className="card mt-4">
        <h2 className="font-semibold mb-2">Dispute Package — {pkg.status}</h2>
        <p className="text-xs bg-slate-100 rounded p-2 mb-3">{pkg.label}</p>
        <ol className="list-decimal pl-5 text-sm space-y-1">{pkg.sections.map((s) => <li key={s.title}>{s.title}</li>)}</ol>
        <p className="text-xs text-slate-500 mt-3">Generated {pkg.generated} · 8 sections · Demo content only.</p>
      </div>
    </div>
  )
}
