import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useFocusStore } from '../store/useFocusStore'

export const useFocusTracking = (sessionId, { onThirdTabSwitch } = {}) => {
  const logActivity = useFocusStore((s) => s.logActivity)
  const addTabSwitch = useFocusStore((s) => s.addTabSwitch)

  useEffect(() => {
    if (!sessionId) return undefined

    let lastActive = Date.now()
    const idleThreshold = 15000 // 15s idle considered loss of focus

    const markActive = () => {
      lastActive = Date.now()
    }

    const tick = setInterval(() => {
      const now = Date.now()
      const delta = 1
      const idle = now - lastActive > idleThreshold
      logActivity(sessionId, { type: idle ? 'idle' : 'active', delta })
    }, 1000)

    const handleVisibility = () => {
      if (document.hidden) {
        addTabSwitch(sessionId)
        const count = useFocusStore.getState().tabSwitches
        if (count === 1 || count === 2) {
          toast((t) => `FocusUp is waiting for you 📚 (${count}/3)`, { id: 'tab-switch' })
        } else if (count >= 3) {
          toast.dismiss('tab-switch')
          toast('Mini break time! A quick game is loading.', { icon: '🎮' })
          if (onThirdTabSwitch) onThirdTabSwitch()
        }
      } else {
        lastActive = Date.now()
      }
    }

    const events = ['scroll', 'mousemove', 'mousedown', 'touchstart', 'keydown', 'click']
    events.forEach((evt) => window.addEventListener(evt, markActive, { passive: true }))
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(tick)
      events.forEach((evt) => window.removeEventListener(evt, markActive))
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [sessionId, logActivity, addTabSwitch, onThirdTabSwitch])
}
