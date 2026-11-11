// PayGuard deterministic risk scorer.
// Reimplemented from the original PayGuard README and the live Base44 app
// (verified Nov 10, 2026). These are the ONLY rules — do not add new ones
// without updating the README risk table and the tests in scorer.test.mjs.
//
// Rules (points):
//   banking details changed        +35
//   sender domain mismatch        +30
//   new / unverified vendor       +20
//   invoice > 2x historical avg   +15
//   urgent / pressure language    +10
//   unusual payment method        +10
// Levels: 0-39 Low, 40-69 Medium, 70-100 High. Score is capped at 100.
//
// AI Contextual Insights do NOT change the numeric score. They are
// explanatory text only — see analyzePayment() in store.js.

export const RISK_RULES = [
  { key: 'bank_details_changed', label: 'Banking details changed', points: 35 },
  { key: 'email_domain_mismatch', label: 'Sender domain mismatch', points: 30 },
  { key: 'new_vendor', label: 'New / unverified vendor', points: 20 },
  { key: 'unusual_amount', label: 'Invoice > 2x historical average', points: 15 },
  { key: 'urgent_language', label: 'Urgent / pressure language', points: 10 },
  { key: 'unusual_payment_method', label: 'Unusual payment method', points: 10 },
]

export const URGENT_PHRASES = [
  'urgent', 'immediately', 'asap', 'as soon as possible', 'pay now',
  'today only', 'do not delay', 'overdue', 'final notice', 'wire immediately',
  'confidential', 'do not tell', 'keep this secret', 'bypass',
]

export function riskLevel(score) {
  if (score >= 70) return 'High'
  if (score >= 40) return 'Medium'
  return 'Low'
}

export function domainOf(email) {
  if (!email || !email.includes('@')) return ''
  return email.split('@')[1].trim().toLowerCase()
}

/** Detect urgent / pressure language in free text (case-insensitive). */
export function findUrgentPhrases(text) {
  const hay = (text || '').toLowerCase()
  return URGENT_PHRASES.filter((p) => hay.includes(p))
}

/**
 * Score a payment request against a verified vendor profile.
 * @param {object} payment { sender_email, payment_account_last4, amount, payment_method, message_text }
 * @param {object|null} vendor verified profile or null for an unknown vendor
 * @returns {object} { overall_risk_score, risk_level, flags, rule_contributions, detected_reasons, raw_score, score_capped }
 */
export function scorePayment(payment, vendor) {
  const contributions = []
  const reasons = []
  const flags = {
    bank_details_changed: false,
    email_domain_mismatch: false,
    new_vendor: false,
    unusual_amount: false,
    urgent_language: false,
    unusual_payment_method: false,
  }

  if (!vendor) {
    // No trusted fingerprint exists, so no vendor comparison can run.
    // This is exactly what happened live in Base44 for APP-1093
    // (vendor_id null -> only +20 fired). Only the new-vendor rule applies.
    flags.new_vendor = true
    contributions.push({ key: 'new_vendor', label: 'New / unverified vendor', points: 20 })
    reasons.push('No verified vendor profile found for this sender.')
  } else {
    const senderDomain = domainOf(payment.sender_email)
    if (senderDomain && senderDomain !== vendor.verified_domain.toLowerCase()) {
      flags.email_domain_mismatch = true
      contributions.push({ key: 'email_domain_mismatch', label: 'Sender domain mismatch', points: 30 })
      reasons.push(`Sender domain ${senderDomain} does not match verified domain ${vendor.verified_domain}.`)
    }
    if (payment.payment_account_last4 && payment.payment_account_last4 !== vendor.verified_bank_last4) {
      flags.bank_details_changed = true
      contributions.push({ key: 'bank_details_changed', label: 'Banking details changed', points: 35 })
      reasons.push(`Bank account ending ${payment.payment_account_last4} differs from verified account ending ${vendor.verified_bank_last4}.`)
    }
    if (payment.amount && vendor.average_invoice_amount && payment.amount > 2 * vendor.average_invoice_amount) {
      flags.unusual_amount = true
      contributions.push({ key: 'unusual_amount', label: 'Invoice > 2x historical average', points: 15 })
      reasons.push(`Amount $${payment.amount.toLocaleString()} is more than twice the vendor average of $${vendor.average_invoice_amount.toLocaleString()}.`)
    }
    if (payment.payment_method && vendor.usual_payment_method &&
        payment.payment_method.toLowerCase() !== vendor.usual_payment_method.toLowerCase()) {
      flags.unusual_payment_method = true
      contributions.push({ key: 'unusual_payment_method', label: 'Unusual payment method', points: 10 })
      reasons.push(`Payment method ${payment.payment_method} differs from the vendor's usual ${vendor.usual_payment_method}.`)
    }
  }

  const phrases = findUrgentPhrases(payment.message_text)
  if (phrases.length > 0) {
    flags.urgent_language = true
    contributions.push({ key: 'urgent_language', label: 'Urgent / pressure language', points: 10 })
    reasons.push(`Urgent / pressure language detected: "${phrases.join('", "')}".`)
  }

  const raw = contributions.reduce((s, c) => s + c.points, 0)
  const capped = Math.min(100, raw)
  return {
    overall_risk_score: capped,
    risk_level: riskLevel(capped),
    flags,
    rule_contributions: contributions,
    detected_reasons: reasons,
    suspicious_phrases: phrases,
    raw_score: raw,
    score_capped: raw > 100,
  }
}
