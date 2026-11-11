import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bankDeadline } from '../lib/store.js'

// New Dispute Case — creates a case in local demo state (no real bank filing).
export default function NewDisputeCase({ state, update }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ payment_id: 'APP-1093', bank_name: 'Demo Commercial Bank', amount: '8700', fraud_type: 'BEC — Fraudulent vendor payment, account substitution', transaction_id: '', complaint_date: new Date().toISOString().slice(0, 10) })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const submit = (e) => {
    e.preventDefault()
    const n = state.disputes.length + 1
    const disputeCase = {
      id: `DK-${new Date().getFullYear()}-${String(n).padStart(3, '0')}`,
      case_number: `DK-${new Date().getFullYear()}-${String(n).padStart(3, '0')}`,
      payment_id: form.payment_id, bank_name: form.bank_name, amount: Number(form.amount), currency: 'CAD',
      status: 'Open', fraud_type: form.fraud_type, transaction_id: form.transaction_id || '—',
      transaction_date: form.complaint_date, discovery_date: form.complaint_date, complaint_date: form.complaint_date,
      bank_deadline: bankDeadline(form.complaint_date), demo_data: true, evidence: [],
      timeline: [{ date: form.complaint_date, event: `Dispute case opened for ${form.payment_id}.` }],
      package_sections: ['1. Case summary', '2. Transaction details', '3. Vendor verification', '4. Fraud indicators', '5. Evidence index', '6. Timeline of events', '7. Requested remedy', '8. Contact and authorisation'],
      package_status: 'Draft', package_generated: form.complaint_date,
    }
    update({ ...state, disputes: [disputeCase, ...state.disputes] })
    navigate(`/disputes/${disputeCase.id}`)
  }
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">New Dispute Case</h1>
      <p className="text-sm text-slate-500 mb-4">Demo only — this does not file a real dispute with a bank.</p>
      <form className="card space-y-4 max-w-2xl" onSubmit={submit}>
        <div><label className="label">Payment ID</label><input className="input" value={form.payment_id} onChange={(e) => set('payment_id', e.target.value)} /></div>
        <div><label className="label">Bank name</label><input className="input" value={form.bank_name} onChange={(e) => set('bank_name', e.target.value)} /></div>
        <div><label className="label">Amount (CAD)</label><input className="input" type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)} /></div>
        <div><label className="label">Fraud type</label><input className="input" value={form.fraud_type} onChange={(e) => set('fraud_type', e.target.value)} /></div>
        <div><label className="label">Transaction ID</label><input className="input" value={form.transaction_id} onChange={(e) => set('transaction_id', e.target.value)} placeholder="TXN-…" /></div>
        <div><label className="label">Complaint date</label><input className="input" type="date" value={form.complaint_date} onChange={(e) => set('complaint_date', e.target.value)} /></div>
        <p className="text-xs text-slate-500">Bank response deadline (56 days): {bankDeadline(form.complaint_date)}</p>
        <button className="btn-primary" type="submit">Create dispute case</button>
      </form>
    </div>
  )
}
