import { Shield } from 'lucide-react'

// Demo sign-in screen only — no real authentication, no accounts are created.
export default function Login({ onSignIn }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 p-4">
      <div className="card w-full max-w-sm text-center">
        <Shield className="h-10 w-10 text-teal-600 mx-auto" />
        <h1 className="text-xl font-bold mt-2">PayGuard</h1>
        <p className="text-xs tracking-widest text-slate-500">PAYMENT FRAUD PREVENTION</p>
        <p className="text-sm text-slate-600 mt-4">Demo sign-in — no real account is needed. You will enter as Samgar Nurlan, Manager at Northstar Manufacturing Ltd. (demo).</p>
        <button className="btn-primary w-full justify-center mt-4" onClick={onSignIn}>Enter demo</button>
        <p className="text-xs text-slate-500 mt-3">PayGuard is a simulation and never transfers money.</p>
      </div>
    </div>
  )
}
