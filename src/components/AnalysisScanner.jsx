// AnalysisScanner — the detected-factors list on the analysis page.
export default function AnalysisScanner({ analysis }) {
  return (
    <div className="card">
      <h3 className="font-semibold mb-3">Detected Risk Factors</h3>
      {analysis.rule_contributions.length === 0 ? (
        <p className="text-sm text-slate-600">No risk factors detected. This payment matches the vendor trusted profile.</p>
      ) : (
        <ul className="space-y-2">
          {analysis.rule_contributions.map((c) => (
            <li key={c.key} className="flex justify-between text-sm border-b border-slate-100 pb-2">
              <span>{c.label}</span><strong className="text-red-600">+{c.points}</strong>
            </li>
          ))}
          <li className="flex justify-between text-sm font-bold pt-1">
            <span>TOTAL RISK</span><span>{analysis.overall_risk_score}/100 · {analysis.risk_level}</span>
          </li>
        </ul>
      )}
      <h4 className="font-semibold mt-5 mb-2 text-sm">Why this was flagged</h4>
      <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
        {analysis.detected_reasons.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
    </div>
  )
}
