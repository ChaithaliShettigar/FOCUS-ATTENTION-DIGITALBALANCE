# 🚀 Quick Start Guide - FocusUp Backend

## ✅ Backend Status: ALL ROUTES WORKING

### 🔧 Start Backend
```powershell
cd c:\Users\HP\FOCUS-ATTENTION-DIGITALBALANCE\focusup-backend
Start-Process node -ArgumentList "server.js" -NoNewWindow -PassThru
```

### 🧪 Quick Test
```powershell
# Health check
Invoke-WebRequest "http://localhost:5000/api/health" -UseBasicParsing
```

## 📋 API Endpoints

### Public Routes (No Auth Required)
```powershell
# Root
GET http://localhost:5000/

# Health check
GET http://localhost:5000/api/health

# Register
POST http://localhost:5000/api/auth/register
Body: {"name":"User","email":"user@test.com","password":"test123","college":"MIT","department":"CS","role":"student"}

# Login
POST http://localhost:5000/api/auth/login
Body: {"email":"user@test.com","password":"test123"}
```

### Protected Routes (Auth Required)
```powershell
# All require header: Authorization: Bearer YOUR_TOKEN

# Get current user
GET http://localhost:5000/api/auth/me

# Create session
POST http://localhost:5000/api/sessions
Body: {"targetMinutes":25}

# Get all sessions
GET http://localhost:5000/api/sessions

# Get single session
GET http://localhost:5000/api/sessions/:id

# Update session
PUT http://localhost:5000/api/sessions/:id
Body: {"notes":"Great session!"}

# End session (calculates focus score)
PUT http://localhost:5000/api/sessions/:id/end
Body: {"elapsedSeconds":1500,"activeSeconds":1350,"idleSeconds":150,"tabSwitches":5,"status":"completed"}

# Get profile
GET http://localhost:5000/api/profile

# Update profile
PUT http://localhost:5000/api/profile
Body: {"bio":"Focus master","publicFocus":true}

# Get analytics
GET http://localhost:5000/api/analytics

# Get daily analytics
GET http://localhost:5000/api/analytics/daily

# Get content
GET http://localhost:5000/api/content

# Get groups
GET http://localhost:5000/api/groups
```

## 🔌 WebSocket Connection

```javascript
const token = 'YOUR_JWT_TOKEN'
const ws = new WebSocket(`ws://localhost:5000/ws/sessions?token=${token}`)

ws.onopen = () => {
  // Start tracking
  ws.send(JSON.stringify({
    type: 'start',
    sessionId: 'YOUR_SESSION_ID'
  }))
  
  // Send activity (resets idle timer)
  ws.send(JSON.stringify({ type: 'activity' }))
  
  // Send tab switch
  ws.send(JSON.stringify({ type: 'tabSwitch' }))
  
  // Stop tracking
  ws.send(JSON.stringify({
    type: 'stop',
    status: 'completed'
  }))
}

ws.onmessage = (event) => {
  console.log('Update:', JSON.parse(event.data))
  // Receives updates every 1 second:
  // { type: 'update', elapsedSeconds, activeSeconds, idleSeconds, tabSwitches }
}
```

## 🎯 Focus Score Formula

```javascript
completion = elapsedSeconds / (targetMinutes * 60)
activityRatio = activeSeconds / elapsedSeconds
penalties = (tabSwitches * 2) + (idleSeconds / 30)
focusScore = max(0, round(100 * completion * activityRatio - penalties))
```

**Example:**
- Elapsed: 1500s (25 min)
- Active: 1350s (90%)
- Idle: 150s (10%)
- Tab Switches: 5
- **Focus Score: 40**

Calculation:
```
completion = 1500 / (25 * 60) = 1.0
activityRatio = 1350 / 1500 = 0.9
penalties = (5 * 2) + (150 / 30) = 15
focusScore = max(0, round(100 * 1.0 * 0.9 - 15)) = 40
```

## 💾 MongoDB Connection

```
URI: mongodb+srv://chaithalishettigar_db_user:qisdjM9sTvWFa21o@cluster0.l6xkolb.mongodb.net/focusup
Database: focusup
Collections: users, sessions, groups, contents, analytics
```

## 📊 Real-Time Tracking Features

✅ **Every 1 Second:**
- Elapsed time increments
- Active time tracked (if user active)
- Idle time tracked (if inactive >15s)
- Tab switches counted
- Database updated

✅ **Session Status:**
- `active` - Session in progress
- `completed` - Session finished successfully
- `cancelled` - Session stopped early

✅ **Activity Detection:**
- User sends `activity` message → resets idle timer
- No activity for 15s → starts counting idle time
- Tab switch message → increments counter

## 🧪 Complete Test Flow

```powershell
# 1. Register
$body = @{name="Test";email="test@example.com";password="test123";college="MIT";department="CS";role="student"} | ConvertTo-Json
$response = Invoke-WebRequest "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
$token = ($response.Content | ConvertFrom-Json).token

# 2. Create session
$sessionBody = @{targetMinutes=25} | ConvertTo-Json
$sessionResponse = Invoke-WebRequest "http://localhost:5000/api/sessions" -Method POST -Headers @{Authorization="Bearer $token"} -Body $sessionBody -ContentType "application/json" -UseBasicParsing
$sessionId = (($sessionResponse.Content | ConvertFrom-Json).session._id)

# 3. Connect WebSocket (in browser console)
const ws = new WebSocket('ws://localhost:5000/ws/sessions?token=YOUR_TOKEN')
ws.onopen = () => ws.send(JSON.stringify({type:'start',sessionId:'YOUR_SESSION_ID'}))

# 4. End session
$endBody = @{elapsedSeconds=1500;activeSeconds=1350;idleSeconds=150;tabSwitches=5;status="completed"} | ConvertTo-Json
Invoke-WebRequest "http://localhost:5000/api/sessions/$sessionId/end" -Method PUT -Headers @{Authorization="Bearer $token"} -Body $endBody -ContentType "application/json" -UseBasicParsing

# 5. Check focus score
$sessions = Invoke-WebRequest "http://localhost:5000/api/sessions" -Headers @{Authorization="Bearer $token"} -UseBasicParsing
$sessions.Content | ConvertFrom-Json
```

## 🐛 Troubleshooting

### Server not responding
```powershell
# Check if running
Get-Process -Name node -ErrorAction SilentlyContinue

# Stop all node processes
Get-Process -Name node | Stop-Process -Force

# Restart
cd focusup-backend
Start-Process node -ArgumentList "server.js" -NoNewWindow -PassThru
```

### "Not authorized" error
- Make sure to include `Authorization: Bearer YOUR_TOKEN` header
- Token expires in 30 days - login again if expired

### WebSocket connection failed
- Token must be in query params: `?token=YOUR_TOKEN`
- Check if server is running on port 5000

### Route not found
- Check URL is exact (case-sensitive)
- Verify HTTP method (GET/POST/PUT/DELETE)
- Check if route requires authentication

## 🎓 Next Steps

1. **Connect Frontend**: Update frontend API calls to use `http://localhost:5000`
2. **Test WebSocket**: Implement WebSocket in frontend for real-time tracking
3. **Deploy**: Deploy backend to production (Railway, Render, Heroku)
4. **Monitor**: Check MongoDB Atlas for data persistence

---

**Backend Server:** http://localhost:5000
**MongoDB:** Connected ✅
**All Routes:** Working ✅
**WebSocket:** Enabled ✅
**Focus Tracking:** Implemented ✅
