import { useMemo, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { NavBar } from './components/NavBar'
import { HelpBot } from './components/HelpBot'
import { MiniBreak } from './components/MiniBreak'
import { useFocusStore } from './store/useFocusStore'
import { useFocusTracking } from './hooks/useFocusTracking'
import { useSessionTimer } from './hooks/useSessionTimer'
import { Landing } from './pages/Landing'
import { Dashboard } from './pages/Dashboard'
import { Learn } from './pages/Learn'
import { Groups } from './pages/Groups'
import { Analytics } from './pages/Analytics'
import { Profile } from './pages/Profile'
import { Settings } from './pages/Settings'
import { Auth } from './pages/Auth'

const PageWrapper = ({ children }) => <div className="app-shell min-h-screen">{children}</div>

function useActiveSession() {
  const sessions = useFocusStore((s) => s.sessions)
  const currentSessionId = useFocusStore((s) => s.currentSessionId)
  return useMemo(() => sessions.find((s) => s.id === currentSessionId), [sessions, currentSessionId])
}

function App() {
  const location = useLocation()
  const endSession = useFocusStore((s) => s.endSession)
  const currentSessionId = useFocusStore((s) => s.currentSessionId)
  const [showBreak, setShowBreak] = useState(false)
  const activeSession = useActiveSession()

  useFocusTracking(currentSessionId, { onThirdTabSwitch: () => setShowBreak(true) })

  useSessionTimer(currentSessionId, activeSession?.targetMinutes, () => {
    if (!currentSessionId) return
    endSession(currentSessionId, 'completed')
    toast.success('Target reached! Focus score updated.')
  })

  const hideNav = location.pathname === '/'

  return (
    <PageWrapper>
      {!hideNav && <NavBar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Landing />} />
      </Routes>
      <HelpBot />
      <MiniBreak open={showBreak} onClose={() => setShowBreak(false)} />
      {hideNav ? null : (
        <footer className="mt-10 bg-transparent pb-10 text-center text-xs text-ink/60">
          FocusUp respects zero-state: nothing is prefilled. Add your own content to begin.
        </footer>
      )}
    </PageWrapper>
  )
}

export default App
