// Demo seed data — clearly labelled demonstration data, not real payments.
// Company: Northstar Manufacturing Ltd. (demo company from the Base44 prototype)
// Vendors and historical payments match the live Base44 records observed
// Nov 10, 2026, EXCEPT APP-1093, which is corrected here (see README:
// "Why the demo scores 90/100 here, but 20/100 live in Base44").

export const COMPANY = {
  id: 'northstar',
  name: 'Northstar Manufacturing Ltd.',
  industry: 'Manufacturing (demo)',
}

export const VENDORS = [
  {
    id: 'appleton',
    vendor_name: 'Appleton Supplies',
    verified_email: 'billing@appletonsupplies.ca',
    verified_domain: 'appletonsupplies.ca',
    verified_phone: '+1 (416) 555-0148',
    verified_bank_last4: '4832',
    usual_payment_method: 'ACH',
    average_invoice_amount: 2750,
    total_verified_payments: 18,
    status: 'verified',
  },
  {
    id: 'metro',
    vendor_name: 'Metro Industrial Parts',
    verified_email: 'accounts@metroindustrial.ca',
    verified_domain: 'metroindustrial.ca',
    verified_phone: '+1 (905) 555-0112',
    verified_bank_last4: '3387',
    usual_payment_method: 'ACH',
    average_invoice_amount: 1850,
    total_verified_payments: 9,
    status: 'verified',
  },
  {
    id: 'summit',
    vendor_name: 'Summit Packaging Co.',
    verified_email: 'billing@summitpackaging.ca',
    verified_domain: 'summitpackaging.ca',
    verified_phone: '+1 (647) 555-0176',
    verified_bank_last4: '5510',
    usual_payment_method: 'ACH',
    average_invoice_amount: 4200,
    total_verified_payments: 12,
    status: 'verified',
  },
]

// 12 clean historical payments (0/100, approved) + the corrected APP-1093.
function historical(id, vendorId, vendorName, amount, date, invoice) {
  return {
    id, vendor_id: vendorId, vendor_name: vendorName, submitted_by: 'Samgar Nurlan',
    invoice_number: invoice, amount, currency: 'CAD',
    sender_email: VENDORS.find((v) => v.id === vendorId).verified_email,
    sender_domain: VENDORS.find((v) => v.id === vendorId).verified_domain,
    payment_account_last4: VENDORS.find((v) => v.id === vendorId).verified_bank_last4,
    payment_method: 'ACH', payment_due_date: date, invoice_file: null,
    message_text: 'Regular invoice — please process as usual.',
    status: 'approved', created_date: date,
  }
}

export function seedPayments() {
  const list = [
    historical('APP-1041', 'appleton', 'Appleton Supplies', 2680, '2026-06-02', 'INV-1041'),
    historical('APP-1042', 'appleton', 'Appleton Supplies', 2810, '2026-06-16', 'INV-1042'),
    historical('APP-1043', 'appleton', 'Appleton Supplies', 2745, '2026-06-30', 'INV-1043'),
    historical('APP-1044', 'appleton', 'Appleton Supplies', 2690, '2026-07-14', 'INV-1044'),
    historical('APP-1045', 'appleton', 'Appleton Supplies', 2795, '2026-07-28', 'INV-1045'),
    historical('APP-1046', 'appleton', 'Appleton Supplies', 2720, '2026-08-11', 'INV-1046'),
    historical('MET-3305', 'metro', 'Metro Industrial Parts', 1820, '2026-06-09', 'MET-3305'),
    historical('MET-3311', 'metro', 'Metro Industrial Parts', 1890, '2026-07-07', 'MET-3311'),
    historical('MET-3316', 'metro', 'Metro Industrial Parts', 1845, '2026-08-04', 'MET-3316'),
    historical('SUM-2207', 'summit', 'Summit Packaging Co.', 4150, '2026-06-19', 'SUM-2207'),
    historical('SUM-2212', 'summit', 'Summit Packaging Co.', 4230, '2026-07-17', 'SUM-2212'),
    historical('SUM-2218', 'summit', 'Summit Packaging Co.', 4190, '2026-08-08', 'SUM-2218'),
    // CORRECTED demo payment. Live in Base44 this row had vendor_id null,
    // sender domain appletonsupplies.ca and no urgency, so it scored 20/100.
    // Here it is linked to Appleton, uses the lookalike domain
    // appletonsupp1ies.ca (digit "1" in place of "l"), a changed bank
    // account, $8,700 (>2x the $2,750 average) and urgent language,
    // so it scores 35 + 30 + 15 + 10 = 90/100 HIGH, as the README expects.
    {
      id: 'APP-1093', vendor_id: 'appleton', vendor_name: 'Appleton Supplies',
      submitted_by: 'Samgar Nurlan', invoice_number: 'APP-1093', amount: 8700,
      currency: 'CAD', sender_email: 'billing@appletonsupp1ies.ca',
      sender_domain: 'appletonsupp1ies.ca', payment_account_last4: '7291',
      payment_method: 'ACH', payment_due_date: '2026-08-22',
      invoice_file: 'Appleton_Invoice_APP-1093_Suspicious.pdf',
      message_text: 'URGENT — please pay immediately, do not delay. Updated bank details attached.',
      status: 'blocked', created_date: '2026-08-22',
    },
  ]
  return list
}

export function seedDispute() {
  return {
    id: 'DK-2026-001',
    case_number: 'DK-2026-001',
    payment_id: 'APP-1093',
    bank_name: 'Demo Commercial Bank',
    amount: 8700,
    currency: 'CAD',
    status: 'Awaiting Bank Response',
    fraud_type: 'BEC — Fraudulent vendor payment, account substitution',
    transaction_id: 'TXN-8700-081226',
    transaction_date: '2026-08-12',
    discovery_date: '2026-08-13',
    complaint_date: '2026-08-18',
    // 56-day bank response deadline: Aug 18 + 56 days = Oct 13, 2026.
    bank_deadline: '2026-10-13',
    demo_data: true,
    evidence: [
      { id: 'EV-1', type: 'Suspicious invoice', name: 'Appleton_Invoice_APP-1093_Suspicious.pdf', note: 'Bank account •••• 7291, not the verified •••• 4832.' },
      { id: 'EV-2', type: 'Email headers', name: 'sender-headers.txt', note: 'Sender domain appletonsupp1ies.ca — lookalike of appletonsupplies.ca.' },
      { id: 'EV-3', type: 'Verified vendor profile', name: 'appleton-verified-profile.pdf', note: 'Verified domain, bank •••• 4832, 18 verified payments.' },
      { id: 'EV-4', type: 'Bank statement excerpt', name: 'bank-statement-aug-2026.pdf', note: 'No payment of $8,700 left Northstar; payment was blocked.' },
      { id: 'EV-5', type: 'Internal approval log', name: 'approval-log.txt', note: 'Blocked by PayGuard; manager review pending.' },
    ],
    timeline: [
      { date: '2026-08-12', event: 'Suspicious payment request APP-1093 received ($8,700).' },
      { date: '2026-08-12', event: 'PayGuard scored the payment 90/100 HIGH and blocked it.' },
      { date: '2026-08-13', event: 'Fraud discovered: lookalike domain and changed bank account confirmed.' },
      { date: '2026-08-18', event: 'Complaint filed with Demo Commercial Bank.' },
      { date: '2026-08-18', event: 'Dispute case DK-2026-001 opened.' },
      { date: '2026-08-22', event: 'Dispute package drafted (8 sections, static demo package).' },
      { date: '2026-10-13', event: '56-day bank response deadline.' },
    ],
    package_sections: [
      '1. Case summary', '2. Transaction details', '3. Vendor verification',
      '4. Fraud indicators', '5. Evidence index', '6. Timeline of events',
      '7. Requested remedy', '8. Contact and authorisation',
    ],
    package_status: 'Draft',
    package_generated: '2026-08-22',
  }
}

export function seedAudit() {
  return [
    { id: 'AL-1', timestamp: '2026-08-22 09:41', actor: 'PayGuard', action: 'Payment APP-1093 scored 90/100 HIGH and blocked automatically.' },
    { id: 'AL-2', timestamp: '2026-08-22 09:41', actor: 'PayGuard', action: 'Approval requested from manager for APP-1093.' },
    { id: 'AL-3', timestamp: '2026-08-22 10:05', actor: 'Samgar Nurlan', action: 'Dispute package for DK-2026-001 drafted (static demo package).' },
    { id: 'AL-4', timestamp: '2026-08-18 14:20', actor: 'Samgar Nurlan', action: 'Dispute case DK-2026-001 opened with Demo Commercial Bank.' },
    { id: 'AL-5', timestamp: '2026-08-13 11:02', actor: 'Samgar Nurlan', action: 'Confirmed lookalike domain appletonsupp1ies.ca for APP-1093.' },
    { id: 'AL-6', timestamp: '2026-08-11 16:30', actor: 'PayGuard', action: 'Payment APP-1046 scored 0/100 LOW and approved.' },
  ]
}
