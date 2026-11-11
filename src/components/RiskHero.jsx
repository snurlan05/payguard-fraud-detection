import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react'
import RiskScore from './RiskScore.jsx'

// RiskHero — the large score banner on the Payment Risk Analysis page.
export default function RiskHero({ analysis, payment }) {
  const { overall_risk_score: score, risk_level: level } = analysis
  const Icon = level === 'High' ? ShieldAlert : level === 'Medium' ? AlertTriangle : ShieldCheck
  const bg = level === 'High' ? 'bg-red-50 border-red-200' : level === 'Medium' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
  return (
    <div className={`card flex flex-col md:flex-row md:items-center gap-6 border-2 ${bg}`}>
      <RiskScore score={score} level={level} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <h2 className="text-xl font-bold">
            {level === 'High' ? 'PAYMENT BLOCKED — High Risk' : level === 'Medium' ? 'Payment Held — Medium Risk' : 'Low Risk — Matches Vendor Profile'}
          </h2>
        </div>
        <p className="text-sm text-slate-600 mt-2">
          Payment <strong>{payment.id}</strong> · {payment.vendor_name} · {payment.currency} ${payment.amount.toLocaleString()} ·
          Invoice {payment.invoice_number}
        </p>
        <p className="text-sm text-slate-600 mt-1">{analysis.recommended_action}</p>
        <p className="text-xs text-slate-500 mt-2">AI Contextual Insights are explanatory only — they do not change the numeric score.</p>
      </div>
    </div>
  )
}
