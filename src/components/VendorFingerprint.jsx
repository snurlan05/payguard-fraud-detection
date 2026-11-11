import { CheckCircle2, XCircle } from 'lucide-react'

// VendorFingerprint — side-by-side verified vs. requested vendor details.
export default function VendorFingerprint({ vendor, payment }) {
  if (!vendor) {
    return (
      <div className="card">
        <h3 className="font-semibold mb-3">Vendor Fingerprint</h3>
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          No trusted vendor fingerprint available — this sender has no verified vendor profile.
        </p>
      </div>
    )
  }
  const rows = [
    { label: 'Domain', verified: vendor.verified_domain, requested: payment.sender_domain },
    { label: 'Email', verified: vendor.verified_email, requested: payment.sender_email },
    { label: 'Bank account (last 4)', verified: `•••• ${vendor.verified_bank_last4}`, requested: `•••• ${payment.payment_account_last4}` },
    { label: 'Payment method', verified: vendor.usual_payment_method, requested: payment.payment_method },
    { label: 'Average invoice', verified: `$${vendor.average_invoice_amount.toLocaleString()}`, requested: `$${payment.amount.toLocaleString()}` },
  ]
  return (
    <div className="card">
      <h3 className="font-semibold mb-1">Vendor Fingerprint — {vendor.vendor_name}</h3>
      <p className="text-xs text-slate-500 mb-4">{vendor.total_verified_payments} verified payments · Status: {vendor.status}</p>
      <table className="w-full text-sm table-fixed">
        <thead><tr className="text-left text-slate-500"><th className="py-1 w-[28%]">Field</th><th className="w-[31%]">Verified</th><th className="w-[31%]">Requested</th><th className="w-[10%]"></th></tr></thead>
        <tbody>
          {rows.map((r) => {
            const match = String(r.verified).toLowerCase() === String(r.requested).toLowerCase()
            return (
              <tr key={r.label} className="border-t border-slate-100">
                <td className="py-2 pr-2 font-medium">{r.label}</td>
                <td className="py-2 pr-2 break-all">{r.verified}</td>
                <td className="py-2 pr-2 break-all">{r.requested}</td>
                <td className="py-2">{match ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
