import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CheckPayment from './pages/CheckPayment.jsx'
import PaymentRiskAnalysis from './pages/PaymentRiskAnalysis.jsx'
import PaymentHistory from './pages/PaymentHistory.jsx'
import Approvals from './pages/Approvals.jsx'
import DisputeKit from './pages/DisputeKit.jsx'
import DisputeCaseDetail from './pages/DisputeCaseDetail.jsx'
import NewDisputeCase from './pages/NewDisputeCase.jsx'
import AuditLog from './pages/AuditLog.jsx'
import Settings from './pages/Settings.jsx'
import Login from './pages/Login.jsx'
import { loadState, saveState } from './lib/store.js'

// Simple local demo auth: no real accounts. The demo starts signed in as
// Samgar Nurlan (Manager, Northstar) to match the Base44 prototype.
// The Login page is a demo sign-in screen only.
export default function App() {
  const [state, setState] = useState(() => loadState())
  const [signedIn, setSignedIn] = useState(true)
  const update = (next) => { saveState(next); setState({ ...next }) }
  const refresh = () => setState({ ...loadState() })

  if (!signedIn) return <Login onSignIn={() => setSignedIn(true)} />
  return (
    <Routes>
      <Route element={<Layout user={state.user} onReset={refresh} />}>
        <Route path="/" element={<Dashboard state={state} />} />
        <Route path="/check-payment" element={<CheckPayment state={state} update={update} />} />
        <Route path="/analysis/:id" element={<PaymentRiskAnalysis state={state} update={update} />} />
        <Route path="/history" element={<PaymentHistory state={state} />} />
        <Route path="/approvals" element={<Approvals state={state} update={update} />} />
        <Route path="/disputes" element={<DisputeKit state={state} />} />
        <Route path="/disputes/new" element={<NewDisputeCase state={state} update={update} />} />
        <Route path="/disputes/:id" element={<DisputeCaseDetail state={state} update={update} />} />
        <Route path="/audit" element={<AuditLog state={state} />} />
        <Route path="/settings" element={<Settings state={state} />} />
        <Route path="*" element={<Dashboard state={state} />} />
      </Route>
    </Routes>
  )
}
