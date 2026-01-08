import { create } from 'zustand'

// Lightweight id helper
const makeId = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 9)

const initialUser = {
  name: '',
  college: '',
  department: '',
  role: 'student',
  publicFocus: false,
}

export const useFocusStore = create((set, get) => ({
  user: initialUser,
  isAuthenticated: false,
  language: 'en',
  focusScore: 0,
  streak: 0,
  contents: [], // uploads and links
  groups: [], // created or joined groups
  sessions: [], // focus sessions
  notifications: [],
  tabSwitches: 0,
  currentSessionId: null,

  setLanguage: (lng) => set({ language: lng }),
  setUser: (payload) => set({ user: { ...get().user, ...payload } }),
  setAuthenticated: (flag) => set({ isAuthenticated: !!flag }),
  togglePublicFocus: () => set({ user: { ...get().user, publicFocus: !get().user.publicFocus } }),

  setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),

  addContent: (content) =>
    set({ contents: [...get().contents, { ...content, id: makeId(), createdAt: Date.now() }] }),

  removeContent: (contentId) =>
    set((state) => {
      const filtered = state.contents.filter((c) => c.id !== contentId)
      // If the current session is tied to removed content, clear current session reference
      const current = state.sessions.find((s) => s.id === state.currentSessionId)
      const shouldClearSession = current && current.contentId === contentId && current.status !== 'active'
      return {
        contents: filtered,
        currentSessionId: shouldClearSession ? null : state.currentSessionId,
      }
    }),

  addGroup: (group) =>
    set({ groups: [...get().groups, { ...group, id: makeId(), members: [], resources: [], leaderboard: [] }] }),

  joinGroup: (groupId, memberName) =>
    set({
      groups: get().groups.map((g) =>
        g.id === groupId && !g.members.includes(memberName)
          ? { ...g, members: [...g.members, memberName] }
          : g
      ),
    }),

  addResourceToGroup: (groupId, resource) =>
    set({
      groups: get().groups.map((g) =>
        g.id === groupId ? { ...g, resources: [...g.resources, { ...resource, id: makeId() }] } : g
      ),
    }),

  startSession: ({ contentId, targetMinutes }) => {
    const session = {
      id: makeId(),
      contentId,
      targetMinutes,
      startedAt: Date.now(),
      elapsedSeconds: 0,
      activeSeconds: 0,
      idleSeconds: 0,
      tabSwitches: 0,
      status: 'active',
    }
    set({ sessions: [...get().sessions, session], currentSessionId: session.id })
    return session.id
  },

  updateSession: (sessionId, updates) =>
    set({
      sessions: get().sessions.map((s) => (s.id === sessionId ? { ...s, ...updates } : s)),
    }),

  endSession: (sessionId, status = 'completed') => {
    const sessions = get().sessions.map((s) => (s.id === sessionId ? { ...s, status } : s))
    const finished = sessions.find((s) => s.id === sessionId)
    let scoreDelta = 0
    if (finished) {
      const completion = finished.elapsedSeconds / (finished.targetMinutes * 60 || 1)
      const activityRatio = finished.activeSeconds / (finished.elapsedSeconds || 1)
      const distractionPenalty = finished.tabSwitches * 2 + finished.idleSeconds / 30
      scoreDelta = Math.max(0, Math.round(100 * completion * activityRatio - distractionPenalty))
    }
    set({
      sessions,
      focusScore: Math.max(0, get().focusScore + scoreDelta),
      streak: status === 'completed' ? get().streak + 1 : get().streak,
      currentSessionId: status === 'active' ? sessionId : null,
    })
  },

  logActivity: (sessionId, { type = 'active', delta = 1 }) => {
    set({
      sessions: get().sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              elapsedSeconds: s.elapsedSeconds + delta,
              activeSeconds: type === 'active' ? s.activeSeconds + delta : s.activeSeconds,
              idleSeconds: type === 'idle' ? s.idleSeconds + delta : s.idleSeconds,
            }
          : s
      ),
    })
  },

  addTabSwitch: (sessionId) => {
    set({ tabSwitches: get().tabSwitches + 1 })
    if (!sessionId) return
    set({
      sessions: get().sessions.map((s) =>
        s.id === sessionId ? { ...s, tabSwitches: s.tabSwitches + 1 } : s
      ),
    })
  },

  pushNotification: (message) =>
    set({ notifications: [...get().notifications.slice(-3), { id: makeId(), message }] }),
}))
