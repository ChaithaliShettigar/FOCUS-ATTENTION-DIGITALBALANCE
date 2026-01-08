import { useState } from 'react'
import { DoodleBackground } from '../components/DoodleBackground'
import { useFocusStore } from '../store/useFocusStore'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export const Profile = () => {
  const user = useFocusStore((s) => s.user)
  const setUser = useFocusStore((s) => s.setUser)
  const togglePublicFocus = useFocusStore((s) => s.togglePublicFocus)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [editingSection, setEditingSection] = useState(null)

  const update = (key, value) => setUser({ [key]: value })

  const handlePasswordChange = (e) => {
    e.preventDefault()
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error('All password fields are required.')
      return
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('New passwords do not match.')
      return
    }
    if (passwordForm.new.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    toast.success('Password changed successfully!')
    setPasswordForm({ current: '', new: '', confirm: '' })
    setEditingSection(null)
  }

  return (
    <DoodleBackground>
      <div className="max-w-4xl space-y-6">
        <div>
          <h2 className="text-4xl font-bold text-ink">Profile Settings</h2>
          <p className="mt-2 text-ink/70">Manage your personal information, security, and preferences.</p>
        </div>

        {/* Personal Information */}
        <Section title="Personal Information" icon="👤">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Full Name" value={user.name} onChange={(e) => update('name', e.target.value)} />
            <FormField label="Email" value={user.email || 'not.set@focusup.com'} disabled placeholder="Email" />
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Role</label>
              <select
                value={user.role}
                onChange={(e) => update('role', e.target.value)}
                className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-2.5 text-ink focus:border-teal focus:outline-none"
              >
                <option value="student">🎓 Student</option>
                <option value="faculty">👨‍🏫 Faculty/Teacher</option>
              </select>
            </div>
            <FormField label="College/University" value={user.college} onChange={(e) => update('college', e.target.value)} />
            <FormField label="Department" value={user.department} onChange={(e) => update('department', e.target.value)} />
            <FormField label="Student ID" value={user.studentId || 'Not set'} onChange={(e) => update('studentId', e.target.value)} placeholder="e.g., STU123456" />
          </div>
        </Section>

        {/* Security */}
        <Section title="Security & Password" icon="🔐">
          {editingSection === 'password' ? (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-2.5 text-ink focus:border-teal focus:outline-none"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/50 hover:text-ink"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                  className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-2.5 text-ink focus:border-teal focus:outline-none"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-2.5 text-ink focus:border-teal focus:outline-none"
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-gradient-to-r from-teal to-teal-dark px-6 py-2.5 font-semibold text-white hover:shadow-lg transition-all"
                >
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingSection(null)
                    setPasswordForm({ current: '', new: '', confirm: '' })
                  }}
                  className="rounded-full border border-ink/20 px-6 py-2.5 font-semibold text-ink hover:bg-ink/5 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-sand/50 px-4 py-3">
                <div>
                  <p className="font-semibold text-ink">Password</p>
                  <p className="text-xs text-ink/70">Last changed: Never</p>
                </div>
                <button
                  onClick={() => setEditingSection('password')}
                  className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink hover:bg-white transition-all"
                >
                  Change Password
                </button>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-sand/50 px-4 py-3">
                <div>
                  <p className="font-semibold text-ink">Two-Factor Authentication</p>
                  <p className="text-xs text-ink/70">Add an extra layer of security</p>
                </div>
                <button
                  onClick={() => toast.success('2FA setup coming soon!')}
                  className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink hover:bg-white transition-all"
                >
                  Enable
                </button>
              </div>
            </div>
          )}
        </Section>

        {/* Privacy & Preferences */}
        <Section title="Privacy & Preferences" icon="⚙️">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-sand/50 px-4 py-3">
              <div>
                <p className="font-semibold text-ink">Focus Score Visibility</p>
                <p className="text-xs text-ink/70">Control whether others see your score on leaderboards</p>
              </div>
              <button
                onClick={togglePublicFocus}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  user.publicFocus ? 'bg-gradient-to-r from-teal to-teal-dark text-white' : 'bg-white border border-ink/20 text-ink'
                }`}
              >
                {user.publicFocus ? '🌐 Public' : '🔒 Private'}
              </button>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-sand/50 px-4 py-3">
              <div>
                <p className="font-semibold text-ink">Email Notifications</p>
                <p className="text-xs text-ink/70">Receive study reminders and progress updates</p>
              </div>
              <button
                onClick={() => toast.success('Notification preferences updated!')}
                className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink hover:bg-white transition-all"
              >
                ✓ Enabled
              </button>
            </div>


          </div>
        </Section>

        {/* Account Actions */}
        <Section title="Account Actions" icon="⚠️">
          <div className="space-y-3">
            <button
              onClick={() => toast.success('Active sessions will be logged out in 5 seconds')}
              className="w-full rounded-2xl border border-ink/20 bg-white px-4 py-3 font-semibold text-ink hover:bg-ink/5 transition-all text-left"
            >
              🖥️ Logout from all devices
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure? This action cannot be undone.')) {
                  toast.error('Account deletion requested. Confirm via email.')
                }
              }}
              className="w-full rounded-2xl border border-red-300 bg-red-50 px-4 py-3 font-semibold text-red-700 hover:bg-red-100 transition-all text-left"
            >
              🗑️ Delete account permanently
            </button>
          </div>
        </Section>
      </div>
    </DoodleBackground>
  )
}

const Section = ({ title, icon, children }) => (
  <div className="rounded-3xl bg-white/80 p-6 shadow-soft">
    <h3 className="mb-6 flex items-center gap-3 text-xl font-semibold text-ink">
      <span className="text-2xl">{icon}</span>
      {title}
    </h3>
    {children}
  </div>
)

const FormField = ({ label, value, onChange, disabled, placeholder }) => (
  <div>
    <label className="block text-sm font-semibold text-ink mb-2">{label}</label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-2.5 text-ink placeholder-ink/40 focus:border-teal focus:outline-none disabled:bg-ink/5 disabled:cursor-not-allowed"
    />
  </div>
)
