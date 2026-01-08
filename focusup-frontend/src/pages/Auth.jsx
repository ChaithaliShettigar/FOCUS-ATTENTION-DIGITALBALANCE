import { useState } from 'react'
import { DoodleBackground } from '../components/DoodleBackground'
import { useFocusStore } from '../store/useFocusStore'
import { toast } from 'react-hot-toast'

export const Auth = () => {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', department: '', role: 'student' })
  const setUser = useFocusStore((s) => s.setUser)
  const setAuthenticated = useFocusStore((s) => s.setAuthenticated)

  const submit = (e) => {
    e.preventDefault()
    if (!form.email.trim() || !form.password.trim()) {
      toast.error('Email and password are required.')
      return
    }
    if (mode === 'register' && !form.name.trim()) {
      toast.error('Please add your name to register.')
      return
    }
    setUser({
      name: form.name,
      college: form.college,
      department: form.department,
      role: form.role,
    })
    setAuthenticated(true)
    toast.success(mode === 'login' ? 'Logged in (local only).' : 'Profile saved. You are registered locally.')
  }

  return (
    <DoodleBackground>
      <div className="mx-auto max-w-3xl rounded-3xl bg-white/85 p-8 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold text-ink">{mode === 'login' ? 'Login' : 'Register'}</h2>
            <p className="text-ink/70">All fields start empty. No demo users exist.</p>
          </div>
          <div className="flex gap-2 rounded-full bg-clay/60 p-1">
            <button
              onClick={() => setMode('login')}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === 'login' ? 'bg-ink text-sand' : 'text-ink'}`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === 'register' ? 'bg-ink text-sand' : 'text-ink'}`}
            >
              Register
            </button>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
          {mode === 'register' && (
            <div className="md:col-span-2">
              <label className="text-sm text-ink/70">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-ink/10 px-3 py-2"
              />
            </div>
          )}
          <div>
            <label className="text-sm text-ink/70">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-ink/10 px-3 py-2"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-sm text-ink/70">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-ink/10 px-3 py-2"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>
          <div>
            <label className="text-sm text-ink/70">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-ink/10 px-3 py-2"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-ink/70">College</label>
            <input
              value={form.college}
              onChange={(e) => setForm({ ...form, college: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-ink/10 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm text-ink/70">Department</label>
            <input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-ink/10 px-3 py-2"
            />
          </div>
          <div className="md:col-span-2 flex items-center justify-between rounded-2xl bg-sand/80 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Privacy reminder</p>
              <p className="text-xs text-ink/70">This prototype stores data locally only for your session.</p>
            </div>
            <button className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-sand shadow-soft">{mode === 'login' ? 'Login' : 'Register'}</button>
          </div>
        </form>
      </div>
    </DoodleBackground>
  )
}
