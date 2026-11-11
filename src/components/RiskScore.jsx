// RiskScore — circular gauge + level badge (reimplementation of the
// original component's visible behaviour; no original code was recovered).
export default function RiskScore({ score, level, size = 120 }) {
  const color = level === 'High' ? '#dc2626' : level === 'Medium' ? '#d97706' : '#16a34a'
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={`Risk score ${score} out of 100, ${level} risk`}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 60 60)" />
        <text x="60" y="58" textAnchor="middle" fontSize="26" fontWeight="700" fill="#0f172a">{score}</text>
        <text x="60" y="76" textAnchor="middle" fontSize="11" fill="#64748b">/ 100</text>
      </svg>
      <div>
        <span className="badge" style={{ background: color + '1a', color }}>{level.toUpperCase()} RISK</span>
        <p className="text-xs text-slate-500 mt-2 max-w-[180px]">
          {level === 'High' ? 'Automatically blocked. A manager must review it.' : level === 'Medium' ? 'Hold the payment and verify with the vendor.' : 'Matches the vendor trusted profile.'}
        </p>
      </div>
    </div>
  )
}
