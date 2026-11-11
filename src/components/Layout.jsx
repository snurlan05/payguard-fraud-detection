import { NavLink, Outlet } from 'react-router-dom'
import { Shield, LayoutDashboard, FileSearch, History, CheckSquare, Scale, ScrollText, Settings, RotateCcw } from 'lucide-react'
import { resetDemo } from '../lib/store.js'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/check-payment', label: 'Check Payment', icon: FileSearch },
  { to: '/history', label: 'Payment History', icon: History },
  { to: '/approvals', label: 'Approvals', icon: CheckSquare },
  { to: '/disputes', label: 'DisputeKit', icon: Scale },
  { to: '/audit', label: 'Audit Log', icon: ScrollText },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Layout({ user, onReset }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 bg-navy-900 text-white p-4 flex flex-col">
        <div className="flex items-center gap-2 px-2 py-3">
          <Shield className="h-8 w-8 text-teal-400" />
          <div>
            <p className="font-bold leading-tight">PayGuard</p>
            <p className="text-[10px] tracking-widest text-slate-400">PAYMENT FRAUD PREVENTION</p>
          </div>
        </div>
        <nav className="mt-4 space-y-1 flex-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-navy-700 text-white' : 'text-slate-300 hover:bg-navy-800'}`}>
              <Icon className="h-4 w-4" /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="text-xs text-slate-400 px-2">
          <p className="font-semibold text-slate-200">{user.name}</p>
          <p>{user.role} · {user.company}</p>
          <button className="mt-3 inline-flex items-center gap-1 text-teal-300 hover:text-teal-200"
            onClick={() => { resetDemo(); onReset() }}>
            <RotateCcw className="h-3 w-3" /> Reset demo data
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          <strong>Demo / simulation:</strong> PayGuard is a simulation and never transfers money or connects to real bank accounts. All data shown is demonstration data.
        </div>
        <Outlet />
      </main>
    </div>
  )
}
