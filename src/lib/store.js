// Local data layer — replaces the Base44 backend for this standalone demo.
// All data lives in localStorage (key below) and is seeded from seed.js on
// first load. No network calls, no real bank connection, no real accounts.
//
// Reimplemented Base44 backend functions (names preserved from the original):
//   analyzePayment, extractInvoice, generateDisputePackage,
//   createRecoveryCase, updateDisputeCaseStatus

import { scorePayment } from './scorer.js'
import { VENDORS, COMPANY, seedPayments, seedDispute, seedAudit } from './seed.js'

const KEY = 'payguard-demo-v1'

export { COMPANY, VENDORS }

function freshState() {
  const payments = seedPayments()
  const analyses = {}
  payments.forEach((p) => {
    const vendor = VENDORS.find((v) => v.id === p.vendor_id) || null
    const scored = scorePayment(p, vendor)
    analyses[p.id] = {
      id: `RA-${p.id}`,
      payment_request_id: p.id,
      company_id: COMPANY.id,
      ...scored,
      ai_summary: aiSummary(p, scored),
      verification_questions: verificationQuestions(p, scored),
      recommended_action: scored.risk_level === 'High'
        ? 'Block payment and escalate to a manager. Do not pay.'
        : scored.risk_level === 'Medium'
          ? 'Hold payment and verify with the vendor through a known channel.'
          : 'Payment matches the vendor trusted profile. Proceed with normal checks.',
    }
  })
  return {
    payments,
    analyses,
    approvals: payments
      .filter((p) => p.status === 'blocked')
      .map((p) => ({ id: `AP-${p.id}`, payment_request_id: p.id, status: 'Pending', decided_by: null, decided_at: null })),
    disputes: [seedDispute()],
    audit: seedAudit(),
    user: { name: 'Samgar Nurlan', email: 'nurlansamgar5@gmail.com', role: 'Manager', company: COMPANY.name },
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* corrupted storage -> reseed */ }
  const state = freshState()
  saveState(state)
  return state
}

export function saveState(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* storage full/blocked */ }
}

export function resetDemo() {
  const state = freshState()
  saveState(state)
  return state
}

/** AI Contextual Insights — explanatory text only. Never changes the score. */
export function aiSummary(payment, scored) {
  if (scored.overall_risk_score >= 70) {
    return 'Multiple independent fraud signals line up: a lookalike sender domain, a changed bank account, an amount far above the vendor average, and pressure language. This matches a business email compromise pattern in which a legitimate vendor is impersonated to redirect a payment.'
  }
  if (scored.overall_risk_score >= 40) {
    return 'Some signals are inconsistent with the vendor history. Verify the payment through a channel you already trust before releasing it.'
  }
  return 'This payment matches the vendor trusted profile. No social-engineering signals were detected in the message.'
}

function verificationQuestions(payment, scored) {
  const q = []
  if (scored.flags.bank_details_changed) q.push('Did the vendor confirm the bank change through a known phone number or in person?')
  if (scored.flags.email_domain_mismatch) q.push('Was this invoice sent from the vendor verified email domain?')
  if (scored.flags.unusual_amount) q.push('Is there a purchase order that explains this amount?')
  if (scored.flags.urgent_language) q.push('Is there a genuine deadline, or is the urgency designed to rush approval?')
  if (q.length === 0) q.push('Does this invoice match a purchase order and the expected amount?')
  return q
}

/**
 * analyzePayment — deterministic analysis of a new payment request.
 * Returns the created payment + analysis, and appends an audit entry.
 */
export function analyzePayment(state, input) {
  const vendor = VENDORS.find((v) => v.id === input.vendor_id) || null
  const id = `APP-${1100 + state.payments.length}`
  const payment = {
    id, vendor_id: input.vendor_id || null,
    vendor_name: vendor ? vendor.vendor_name : (input.vendor_name || 'Unknown vendor'),
    submitted_by: state.user.name, invoice_number: input.invoice_number || id,
    amount: Number(input.amount), currency: input.currency || 'CAD',
    sender_email: input.sender_email, sender_domain: input.sender_email?.split('@')[1] || '',
    payment_account_last4: input.payment_account_last4, payment_method: input.payment_method,
    payment_due_date: input.payment_due_date || '', invoice_file: input.invoice_file_name || null,
    message_text: input.message_text || '', status: 'pending', created_date: new Date().toISOString().slice(0, 10),
  }
  const scored = scorePayment(payment, vendor)
  const analysis = {
    id: `RA-${id}`, payment_request_id: id, company_id: COMPANY.id, ...scored,
    ai_summary: aiSummary(payment, scored),
    verification_questions: verificationQuestions(payment, scored),
    recommended_action: scored.risk_level === 'High'
      ? 'Block payment and escalate to a manager. Do not pay.'
      : scored.risk_level === 'Medium'
        ? 'Hold payment and verify with the vendor through a known channel.'
        : 'Payment matches the vendor trusted profile. Proceed with normal checks.',
  }
  payment.status = scored.risk_level === 'High' ? 'blocked' : scored.risk_level === 'Medium' ? 'pending_review' : 'approved'
  const next = {
    ...state,
    payments: [payment, ...state.payments],
    analyses: { ...state.analyses, [id]: analysis },
    approvals: scored.risk_level === 'High'
      ? [{ id: `AP-${id}`, payment_request_id: id, status: 'Pending', decided_by: null, decided_at: null }, ...state.approvals]
      : state.approvals,
    audit: [{ id: `AL-${Date.now()}`, timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '), actor: 'PayGuard', action: `Payment ${id} scored ${scored.overall_risk_score}/100 ${scored.risk_level.toUpperCase()}${scored.risk_level === 'High' ? ' and blocked automatically' : ''}.` }, ...state.audit],
  }
  saveState(next)
  return { payment, analysis, state: next }
}

/**
 * extractInvoice — demo file handling only. Reads a file's name, size and
 * type and returns them as "extracted" metadata. It does NOT perform real
 * OCR or AI invoice extraction; the original Base44 function did that
 * server-side and is not available in this reconstruction.
 */
export function extractInvoice(file) {
  if (!file) return null
  return { file_name: file.name, file_size: file.size, file_type: file.type, extracted: false, note: 'Demo: file metadata only. Real OCR/AI extraction is not implemented in this reconstruction.' }
}

/** 56-day bank response deadline (from the complaint date). */
export function bankDeadline(complaintDate) {
  const d = new Date(complaintDate)
  d.setDate(d.getDate() + 56)
  return d.toISOString().slice(0, 10)
}

export function daysOverdue(deadline) {
  const today = new Date()
  const end = new Date(deadline)
  return Math.max(0, Math.floor((today - end) / 86400000))
}

/**
 * generateDisputePackage — builds the 8-section draft package from the
 * stored dispute case. The package is a STATIC HACKATHON DEMONSTRATION
 * PACKAGE — manually seeded demo data, NOT AI-generated.
 */
export function generateDisputePackage(disputeCase) {
  return {
    case_number: disputeCase.case_number,
    status: 'Draft',
    generated: new Date().toISOString().slice(0, 10),
    label: 'STATIC HACKATHON DEMONSTRATION PACKAGE — manually seeded demo data, NOT AI-generated',
    sections: disputeCase.package_sections.map((title) => ({ title, content: 'Demo content — see the Dispute Case Detail page for the seeded evidence and timeline.' })),
  }
}

export function createRecoveryCase(state, paymentId) {
  const payment = state.payments.find((p) => p.id === paymentId)
  if (!payment) return state
  const existing = state.disputes.find((d) => d.payment_id === paymentId)
  if (existing) return state // duplicate-safe: one recovery case per payment
  const complaint = new Date().toISOString().slice(0, 10)
  const disputeCase = {
    id: `DK-${new Date().getFullYear()}-${String(state.disputes.length + 1).padStart(3, '0')}`,
    case_number: `DK-${new Date().getFullYear()}-${String(state.disputes.length + 1).padStart(3, '0')}`,
    payment_id: paymentId, bank_name: 'Demo Commercial Bank', amount: payment.amount,
    currency: payment.currency, status: 'Open', fraud_type: 'Suspected fraudulent vendor payment',
    transaction_id: `TXN-${payment.amount}-${paymentId}`, transaction_date: payment.created_date,
    discovery_date: payment.created_date, complaint_date: complaint,
    bank_deadline: bankDeadline(complaint), demo_data: true,
    evidence: [], timeline: [{ date: complaint, event: `Dispute case opened for ${paymentId}.` }],
    package_sections: seedDispute().package_sections, package_status: 'Draft', package_generated: complaint,
  }
  const next = { ...state, disputes: [disputeCase, ...state.disputes] }
  saveState(next)
  return next
}

export function updateDisputeCaseStatus(state, caseId, status) {
  // In the original, status changes were manager/admin-only (server-side).
  // Here the demo user is a Manager, so the change is allowed and logged.
  const next = {
    ...state,
    disputes: state.disputes.map((d) => (d.id === caseId ? { ...d, status } : d)),
    audit: [{ id: `AL-${Date.now()}`, timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '), actor: state.user.name, action: `Dispute case ${caseId} status changed to ${status}.` }, ...state.audit],
  }
  saveState(next)
  return next
}
