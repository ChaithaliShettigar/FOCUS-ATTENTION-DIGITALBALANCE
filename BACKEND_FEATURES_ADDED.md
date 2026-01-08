# Focus Session Tracking - Backend Implementation Summary

## ✅ What Was Added to Backend

### 1. WebSocket Real-Time Tracking
**File:** `focusup-backend/realtime/sessionSocket.js` (NEW FILE - 140 lines)

**Features Implemented:**
- ✅ WebSocket server at `/ws/sessions`
- ✅ JWT authentication via query parameter
- ✅ **1-second server-side tick** that updates database every second
- ✅ **15-second idle threshold** detection
- ✅ Tracks: `elapsedSeconds`, `activeSeconds`, `idleSeconds`, `tabSwitches`
- ✅ Message handlers:
  - `start` - Begin tracking session
  - `activity` - Mark user active (resets idle timer)
  - `tabSwitch` - Increment tab switch count
  - `stop` - End session and calculate focus score

**Code Snippet:**
```javascript
// Every 1 second tick
state.tick = setInterval(async () => {
  const idle = Date.now() - state.lastActiveAt > IDLE_THRESHOLD_MS // 15 seconds
  await Session.updateOne(
    { _id: state.sessionId },
    {
      $inc: {
        elapsedSeconds: 1,
        activeSeconds: idle ? 0 : 1,
        idleSeconds: idle ? 1 : 0,
      }
    }
  )
}, 1000)
```

### 2. Focus Score Calculation
**File:** `focusup-backend/controllers/sessionController.js` (UPDATED)

**Formula Implemented:**
```javascript
const completion = elapsedSeconds / (targetMinutes * 60 || 1)
const activityRatio = activeSeconds / (elapsedSeconds || 1)
const distractionPenalty = tabSwitches * 2 + idleSeconds / 30
focusScore = Math.max(0, Math.round(100 * completion * activityRatio - distractionPenalty))
```

**Applied in:**
- `PUT /api/sessions/:id/end` endpoint (line 98-149)
- WebSocket `stop` message handler (line 85-105 in sessionSocket.js)

### 3. Session REST Endpoints
**File:** `focusup-backend/routes/sessions.js` (EXISTS)

**Endpoints:**
- ✅ `POST /api/sessions` - Create new session
- ✅ `GET /api/sessions` - Get all user sessions
- ✅ `GET /api/sessions/:id` - Get specific session
- ✅ `PUT /api/sessions/:id` - Update session (manual)
- ✅ `PUT /api/sessions/:id/end` - End session with score calculation
- ✅ `DELETE /api/sessions/:id` - Delete session

### 4. Database Schema Updates
**File:** `focusup-backend/models/Session.js` (UPDATED)

**New Fields Added:**
```javascript
elapsedSeconds: { type: Number, default: 0 },
activeSeconds: { type: Number, default: 0 },
idleSeconds: { type: Number, default: 0 },
tabSwitches: { type: Number, default: 0 },
status: { enum: ['active', 'paused', 'completed', 'abandoned'] }
```

### 5. Server Configuration
**File:** `focusup-backend/server.js` (UPDATED)

**Changes:**
```javascript
// Import WebSocket initializer
import { initSessionSocket } from './realtime/sessionSocket.js'

// Capture server instance and initialize WebSocket
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
initSessionSocket(server)
```

---

## 🔗 How Frontend Can Use It

### Connection Flow:
```javascript
// 1. Get JWT token from login
const token = localStorage.getItem('token')

// 2. Create session via REST
const response = await fetch('http://localhost:5000/api/sessions', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ targetMinutes: 25, contentId: 'xyz' })
})
const { session } = await response.json()

// 3. Connect to WebSocket
const ws = new WebSocket(`ws://localhost:5000/ws/sessions?token=${token}`)

// 4. Start tracking
ws.send(JSON.stringify({ type: 'start', sessionId: session._id }))

// 5. Send activity events (from useFocusTracking.js)
window.addEventListener('mousemove', () => {
  ws.send(JSON.stringify({ type: 'activity' }))
}, { passive: true })

// 6. Send tab switches (from useFocusTracking.js)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    ws.send(JSON.stringify({ type: 'tabSwitch' }))
  }
})

// 7. Stop session (from useSessionTimer.js when timer completes)
ws.send(JSON.stringify({ type: 'stop', status: 'completed' }))
```

---

## 📊 What Gets Tracked (Server-Side)

| Metric | Update Frequency | Source |
|--------|-----------------|--------|
| `elapsedSeconds` | Every 1 second | Server tick |
| `activeSeconds` | Every 1 second | Server tick (if user active) |
| `idleSeconds` | Every 1 second | Server tick (if idle > 15s) |
| `tabSwitches` | On event | WebSocket message |
| `status` | On start/stop | WebSocket message |
| `focusScore` | On stop | Calculated formula |

---

## 🧪 Test Commands

```powershell
# Health check
Invoke-RestMethod -Uri http://localhost:5000/api/health

# Create session (requires auth token first)
$token = "YOUR_JWT_TOKEN"
$headers = @{ Authorization = "Bearer $token" }
$body = @{ targetMinutes = 25 } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:5000/api/sessions -Method POST -Headers $headers -Body $body -ContentType "application/json"

# WebSocket test (use wscat or browser console)
# wscat -c "ws://localhost:5000/ws/sessions?token=YOUR_JWT_TOKEN"
```

---

## ✅ Backend Feature Checklist

- [x] Start/end session REST endpoints
- [x] Real-time WebSocket activity tracking
- [x] 1-second server-side tick
- [x] Track elapsed time, active time, idle time (15s threshold)
- [x] Track tab switches
- [x] Session status: active, completed, cancelled
- [x] Focus score calculation: `100 * completion * activityRatio - penalties`
- [x] MongoDB schema with all required fields
- [x] JWT authentication for WebSocket connections
- [x] User stats update (focusScore, streak)

---

**Files Modified/Created:**
1. ✅ `focusup-backend/realtime/sessionSocket.js` - NEW (WebSocket handler)
2. ✅ `focusup-backend/server.js` - UPDATED (WebSocket init)
3. ✅ `focusup-backend/controllers/sessionController.js` - UPDATED (score calculation)
4. ✅ `focusup-backend/models/Session.js` - UPDATED (new fields)
5. ✅ `focusup-backend/package.json` - UPDATED (ws dependency)
6. ✅ `focusup-backend/.env` - NEW (MongoDB URI)

**Frontend Files NOT Touched:**
- ❌ `focusup-frontend/src/hooks/useFocusTracking.js`
- ❌ `focusup-frontend/src/hooks/useSessionTimer.js`
- ❌ `focusup-frontend/src/pages/Dashboard.jsx`
