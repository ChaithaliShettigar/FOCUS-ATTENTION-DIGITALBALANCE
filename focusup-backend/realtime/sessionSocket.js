import WebSocket, { WebSocketServer } from 'ws'
import jwt from 'jsonwebtoken'
import Session from '../models/Session.js'
import User from '../models/User.js'

// 15 seconds idle threshold
const IDLE_THRESHOLD_MS = 15000

// Parse token from query string (?token=...)
function getTokenFromUrl(url) {
  try {
    const u = new URL(url, 'http://localhost')
    return u.searchParams.get('token') || null
  } catch {
    return null
  }
}

export function initSessionSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws/sessions' })

  // Map of connectionId -> state
  const connections = new Map()

  wss.on('connection', async function connection(ws, req) {
    // Authenticate via JWT token in query
    const token = getTokenFromUrl(req.url)
    if (!token) {
      ws.close(4401, 'Missing token')
      return
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      ws.close(4401, 'Invalid token')
      return
    }

    const connectionId = Math.random().toString(36).slice(2)
    const state = {
      connectionId,
      userId: decoded.id,
      sessionId: null,
      lastActiveAt: Date.now(),
      tick: null,
    }
    connections.set(connectionId, state)

    ws.send(JSON.stringify({ type: 'connected', connectionId }))

    ws.on('message', async (raw) => {
      let msg
      try { msg = JSON.parse(raw) } catch { return }

      switch (msg.type) {
        case 'start': {
          const { sessionId } = msg
          if (!sessionId) return
          // Validate session ownership
          const session = await Session.findById(sessionId)
          if (!session || session.userId.toString() !== state.userId) {
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid session' }))
            return
          }
          state.sessionId = sessionId
          state.lastActiveAt = Date.now()

          // Start 1s tick to update elapsed/active/idle
          if (state.tick) clearInterval(state.tick)
          state.tick = setInterval(async () => {
            try {
              const idle = Date.now() - state.lastActiveAt > IDLE_THRESHOLD_MS
              await Session.updateOne(
                { _id: state.sessionId, userId: state.userId },
                {
                  $inc: {
                    elapsedSeconds: 1,
                    activeSeconds: idle ? 0 : 1,
                    idleSeconds: idle ? 1 : 0,
                  },
                  $set: { status: 'active' },
                }
              )
              ws.send(JSON.stringify({ type: 'tick', idle }))
            } catch (e) {
              // Silently ignore to avoid spamming client
            }
          }, 1000)
          ws.send(JSON.stringify({ type: 'started', sessionId }))
          break
        }
        case 'activity': {
          // Mark user as active now
          state.lastActiveAt = Date.now()
          break
        }
        case 'tabSwitch': {
          if (!state.sessionId) break
          await Session.updateOne(
            { _id: state.sessionId, userId: state.userId },
            { $inc: { tabSwitches: 1 } }
          )
          ws.send(JSON.stringify({ type: 'tabSwitchAck' }))
          break
        }
        case 'stop': {
          const { status } = msg
          if (!state.sessionId) break

          const s = await Session.findById(state.sessionId)
          if (s && s.userId.toString() === state.userId) {
            s.status = status || 'completed'
            s.endTime = new Date()

            // Calculate focus score
            const completion = s.elapsedSeconds / (s.targetMinutes * 60 || 1)
            const activityRatio = s.activeSeconds / (s.elapsedSeconds || 1)
            const distractionPenalty = s.tabSwitches * 2 + s.idleSeconds / 30
            s.focusScore = Math.max(0, Math.round(100 * completion * activityRatio - distractionPenalty))
            await s.save()

            // Update user stats
            const u = await User.findById(state.userId)
            if (u) {
              u.focusScore = Math.max(0, (u.focusScore || 0) + s.focusScore)
              if (s.status === 'completed') u.streak = (u.streak || 0) + 1
              await u.save()
            }

            ws.send(JSON.stringify({ type: 'stopped', sessionId: state.sessionId, focusScore: s.focusScore }))
          }

          if (state.tick) clearInterval(state.tick)
          state.tick = null
          state.sessionId = null
          break
        }
        default:
          // Ignore unknown message types
          break
      }
    })

    ws.on('close', () => {
      if (state.tick) clearInterval(state.tick)
      connections.delete(connectionId)
    })
  })

  console.log('🔌 WebSocket session tracking initialized at /ws/sessions')
}

export default initSessionSocket
