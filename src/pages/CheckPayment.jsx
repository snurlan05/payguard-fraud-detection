import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VENDORS, analyzePayment, extractInvoice } from '../lib/store.js'

// Check Payment — 3-step wizard: Enter details / Review & confirm / Risk analysis.
export default function CheckPayment({ state, update }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    vendor_id: 'appleton', vendor_name: '', sender_email: 'billing@appletonsupplies.ca',
    invoice_number: '', amount: '', currency: 'CAD', payment_method: 'ACH',
    payment_account_last4: '4832', payment_due_date: '', message_text: '',
  })
  const [fileInfo, setFileInfo] = useState(null)
  const [isNewVendor, setIsNewVendor] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const onFile = (e) => {
    const f = e.target.files?.[0]
    if (f) setFileInfo(extractInvoice(f))
  }

  const submit = () => {
    const { payment, state: next } = analyzePayment(state, {
      ...form, vendor_id: isNewVendor ? '' : form.vendor_id,
      vendor_name: isNewVendor ? form.vendor_name : undefined,
      invoice_file_name: fileInfo?.file_name,
    })
    update(next)
    navigate(`/analysis/${payment.id}`)
  }

  const fillDemo = () => {
    setIsNewVendor(false)
    setForm({
      vendor_id: 'appleton', vendor_name: '', sender_email: 'billing@appletonsupp1ies.ca',
      invoice_number: 'APP-1093', amount: '8700', currency: 'CAD', payment_method: 'ACH',
      payment_account_last4: '7291', payment_due_date: '2026-08-22',
      message_text: 'URGENT — please pay immediately, do not delay. Updated bank details attached.',
    })
    setStep(2)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Check Payment</h1>
      <p className="text-sm text-slate-500 mb-1">Step {step} of 3 — {step === 1 ? 'Enter details' : step === 2 ? 'Review & confirm' : 'Risk analysis'}</p>
      <p className="text-sm text-slate-500 mb-5">PayGuard is a simulation and never transfers money or connects to real bank accounts.</p>
      <button className="btn-outline mb-4" onClick={fillDemo}>Fill with the APP-1093 demo (expected 90/100 HIGH)</button>

      {step === 1 && (
        <div className="card space-y-4 max-w-2xl">
          <div>
            <span className="label">Vendor</span>
            <div className="flex gap-4 text-sm mb-2">
              <label><input type="radio" checked={!isNewVendor} onChange={() => setIsNewVendor(false)} /> Existing vendor</label>
              <label><input type="radio" checked={isNewVendor} onChange={() => setIsNewVendor(true)} /> New vendor</label>
            </div>
            {isNewVendor
              ? <input className="input" placeholder="Vendor name" value={form.vendor_name} onChange={(e) => set('vendor_name', e.target.value)} />
              : <select className="input" value={form.vendor_id} onChange={(e) => set('vendor_id', e.target.value)}>
                  {VENDORS.map((v) => <option key={v.id} value={v.id}>{v.vendor_name} — {v.verified_domain}</option>)}
                </select>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Invoice number</label><input className="input" value={form.invoice_number} onChange={(e) => set('invoice_number', e.target.value)} placeholder="INV-0000" /></div>
            <div><label className="label">Amount (CAD)</label><input className="input" type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="2750" /></div>
            <div><label className="label">Sender email</label><input className="input" value={form.sender_email} onChange={(e) => set('sender_email', e.target.value)} /></div>
            <div><label className="label">Bank account (last 4)</label><input className="input" maxLength={4} value={form.payment_account_last4} onChange={(e) => set('payment_account_last4', e.target.value)} /></div>
            <div><label className="label">Payment method</label>
              <select className="input" value={form.payment_method} onChange={(e) => set('payment_method', e.target.value)}>
                <option>ACH</option><option>Wire Transfer</option><option>Cheque</option><option>Credit Card</option>
              </select></div>
            <div><label className="label">Due date</label><input className="input" type="date" value={form.payment_due_date} onChange={(e) => set('payment_due_date', e.target.value)} /></div>
          </div>
          <div><label className="label">Message / payment instructions</label><textarea className="input" rows={3} value={form.message_text} onChange={(e) => set('message_text', e.target.value)} /></div>
          <div>
            <label className="label">Invoice file (optional — PDF, image, CSV, Excel)</label>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg,.csv,.xls,.xlsx" onChange={onFile} />
            {fileInfo && <p className="text-xs text-slate-500 mt-1">{fileInfo.file_name} · {fileInfo.note}</p>}
          </div>
          <button className="btn-primary" onClick={() => setStep(2)} disabled={!form.amount || !form.sender_email}>Continue to review</button>
        </div>
      )}

      {step === 2 && (
        <div className="card space-y-2 max-w-2xl text-sm">
          <p><strong>Vendor:</strong> {isNewVendor ? form.vendor_name || '(new vendor)' : VENDORS.find((v) => v.id === form.vendor_id)?.vendor_name}</p>
          <p><strong>Invoice:</strong> {form.invoice_number || '—'} · <strong>Amount:</strong> ${Number(form.amount || 0).toLocaleString()} {form.currency}</p>
          <p><strong>Sender:</strong> {form.sender_email} · <strong>Bank:</strong> •••• {form.payment_account_last4} · <strong>Method:</strong> {form.payment_method}</p>
          <p><strong>Message:</strong> {form.message_text || '—'}</p>
          {fileInfo && <p><strong>File:</strong> {fileInfo.file_name}</p>}
          <div className="flex gap-3 pt-3">
            <button className="btn-outline" onClick={() => setStep(1)}>Back</button>
            <button className="btn-primary" onClick={submit}>Run risk analysis</button>
          </div>
        </div>
      )}
    </div>
  )
}
