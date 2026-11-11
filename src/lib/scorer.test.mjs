import { test } from 'node:test'
import assert from 'node:assert/strict'
import { scorePayment, riskLevel } from './scorer.js'

const APPLETON = {
  vendor_name: 'Appleton Supplies',
  verified_domain: 'appletonsupplies.ca',
  verified_bank_last4: '4832',
  usual_payment_method: 'ACH',
  average_invoice_amount: 2750,
  total_verified_payments: 18,
  status: 'verified',
}

// The corrected README demo: APP-1093 linked to Appleton, lookalike domain,
// changed bank, $8,700 (>2x avg), urgent language.
// 35 (bank) + 30 (domain) + 15 (amount) + 10 (urgency) = 90 HIGH.
// New-vendor must NOT fire — the vendor is known.
test('APP-1093 corrected demo scores 90/100 HIGH', () => {
  const r = scorePayment({
    sender_email: 'billing@appletonsupp1ies.ca',
    payment_account_last4: '7291',
    amount: 8700,
    payment_method: 'ACH',
    message_text: 'URGENT — please pay immediately, do not delay.',
  }, APPLETON)
  assert.equal(r.overall_risk_score, 90)
  assert.equal(r.risk_level, 'High')
  assert.equal(r.flags.bank_details_changed, true)
  assert.equal(r.flags.email_domain_mismatch, true)
  assert.equal(r.flags.unusual_amount, true)
  assert.equal(r.flags.urgent_language, true)
  assert.equal(r.flags.new_vendor, false)
  assert.equal(r.flags.unusual_payment_method, false)
})

test('clean Appleton payment scores 0/100 LOW', () => {
  const r = scorePayment({
    sender_email: 'billing@appletonsupplies.ca',
    payment_account_last4: '4832',
    amount: 2750,
    payment_method: 'ACH',
    message_text: 'Monthly invoice, please process as usual.',
  }, APPLETON)
  assert.equal(r.overall_risk_score, 0)
  assert.equal(r.risk_level, 'Low')
  assert.deepEqual(r.rule_contributions, [])
})

// Medium: new vendor (+20) + amount is not compared for unknown vendors,
// so add urgency (+10) and an unusual method is not compared either.
// Use a known vendor with amount + urgency to reach the Medium band:
// amount >2x (+15) + urgency (+10) + unusual method (+10) = 35 is still Low,
// so use bank changed (+35) + urgency (+10) = 45 Medium.
test('medium case: bank changed + urgency = 45/100 Medium', () => {
  const r = scorePayment({
    sender_email: 'billing@appletonsupplies.ca',
    payment_account_last4: '9999',
    amount: 2000,
    payment_method: 'ACH',
    message_text: 'Urgent: pay immediately.',
  }, APPLETON)
  assert.equal(r.overall_risk_score, 45)
  assert.equal(r.risk_level, 'Medium')
})

test('unknown vendor scores only 20/100 LOW (the live Base44 behaviour)', () => {
  const r = scorePayment({
    sender_email: 'billing@appletonsupp1ies.ca',
    payment_account_last4: '7291',
    amount: 8700,
    payment_method: 'ACH',
    message_text: 'Please process this invoice.',
  }, null)
  assert.equal(r.overall_risk_score, 20)
  assert.equal(r.risk_level, 'Low')
  assert.equal(r.flags.new_vendor, true)
})

test('riskLevel thresholds', () => {
  assert.equal(riskLevel(0), 'Low')
  assert.equal(riskLevel(39), 'Low')
  assert.equal(riskLevel(40), 'Medium')
  assert.equal(riskLevel(69), 'Medium')
  assert.equal(riskLevel(70), 'High')
  assert.equal(riskLevel(100), 'High')
})
