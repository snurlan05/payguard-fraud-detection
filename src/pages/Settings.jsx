export default function Settings({ state }) {
  const u = state.user
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="card max-w-2xl text-sm space-y-2">
        <p><strong>Name:</strong> {u.name}</p>
        <p><strong>Email:</strong> {u.email}</p>
        <p><strong>Company:</strong> {u.company} <span className="text-slate-500">(company is admin-only in the original)</span></p>
        <p><strong>Role:</strong> {u.role} <span className="text-slate-500">(role is admin-only in the original)</span></p>
        <p><strong>Department:</strong> Finance</p>
        <p className="text-slate-500 pt-2">Demo profile — changing company or role is disabled in this reconstruction, matching the original where those fields were admin-only.</p>
      </div>
    </div>
  )
}
