import { Link, useParams } from 'react-router-dom'
import RiskHero from '../components/RiskHero.jsx'
import VendorFingerprint from '../components/VendorFingerprint.jsx'
import AnalysisScanner from '../components/AnalysisScanner.jsx'
import LifecycleRibbon from '../components/LifecycleRibbon.jsx'
import { VENDORS, createRecoveryCase } from '../lib/store.js'

export default function PaymentRiskAnalysis({ state, update }) {
  const { id } = useParams()
  const payment = state.payments.find((p) => p.id === id)
  const analysis = state.analyses[id]
  if (!payment || !analysis) return <p>Payment not found. <Link className="text-teal-700 underline" to="/history">Back to history</Link></p>
  const vendor = VENDORS.find((v) => v.id === payment.vendor_id) || null
  const dispute = state.disputes.find((d) => d.payment_id === id)
  const approval = state.approvals.find((a) => a.payment_request_id === id)

  const decide = (decision) => {
    const next = {
      ...state,
      payments: state.payments.map((p) => (p.id === id ? { ...p, status: decision === 'approve' ? 'approved' : 'rejected' } : p)),
      approvals: state.approvals.map((a) => (a.payment_request_id === id ? { ...a, status: decision === 'approve' ? 'Approved' : 'Rejected', decided_by: state.user.name, decided_at: new Date().toISOString().slice(0, 10) } : a)),
      audit: [{ id: `AL-${Date.now()}`, timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '), actor: state.user.name, action: `Payment ${id} ${decision === 'approve' ? 'marked verified and approved' : 'rejected'} by manager.` }, ...state.audit],
    }
    update(next)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Payment Risk Analysis — {payment.id}</h1>
      <LifecycleRibbon level={analysis.risk_level} hasDispute={!!dispute} />
      <div className="mt-4"><RiskHero analysis={analysis} payment={payment} /></div>
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <VendorFingerprint vendor={vendor} payment={payment} />
        <AnalysisScanner analysis={analysis} />
      </div>
      <div className="card mt-4">
        <h3 className="font-semibold mb-2">AI Contextual Insights</h3>
        <p className="text-sm text-slate-600">{analysis.ai_summary}</p>
        <p className="text-xs text-slate-500 mt-2">These insights do <strong>not</strong> independently change the numerical risk score.</p>
        <h4 className="font-semibold mt-4 mb-2 text-sm">Verification questions</h4>
        <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">{analysis.verification_questions.map((q, i) => <li key={i}>{q}</li>)}</ul>
      </div>
      <div className="card mt-4">
        <h3 className="font-semibold mb-2">Payment details</h3>
        <p className="text-sm text-slate-600">Invoice {payment.invoice_number} · {payment.currency} ${payment.amount.toLocaleString()} · Due {payment.payment_due_date || '—'} · Method {payment.payment_method} · File: {payment.invoice_file || 'none'} · Submitted by {payment.submitted_by}</p>
        <p className="text-sm text-slate-600 mt-1">Message: “{payment.message_text || '—'}”</p>
      </div>
      {(analysis.risk_level === 'Medium' || analysis.risk_level === 'High') && (
        <div className="card mt-4">
          <h3 className="font-semibold mb-2">Recovery handoff</h3>
          {dispute ? <p className="text-sm">Dispute case <Link className="text-teal-700 underline" to={`/disputes/${dispute.id}`}>{dispute.case_number}</Link> is already open for this payment.</p>
            : <><p className="text-sm text-slate-600 mb-3">This payment is {analysis.risk_level.toLowerCase()} risk. Open a DisputeKit recovery case to track it with the bank.</p>
              <button className="btn-primary" onClick={() => update(createRecoveryCase(state, id))}>Create recovery case</button></>}
        </div>
      )}
      {approval && approval.status === 'Pending' && (
        <div className="card mt-4 flex gap-3">
          <button className="btn-primary" onClick={() => decide('approve')}>Mark Verified &amp; Approve</button>
          <button className="btn-danger" onClick={() => decide('reject')}>Reject Payment</button>
          <span className="text-sm text-slate-500 self-center">Manager review required — this payment is blocked.</span>
        </div>
      )}
      {approval && approval.status !== 'Pending' && (
        <p className="mt-4 text-sm">Decision: <strong>{approval.status}</strong> by {approval.decided_by} on {approval.decided_at}. <Link className="text-teal-700 underline" to="/approvals">View approvals</Link></p>
      )}
    </div>
  )
}
