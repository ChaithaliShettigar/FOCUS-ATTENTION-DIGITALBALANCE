# Backend Server Testing Guide

## Server Status
✅ **Server is running on port 5000**
✅ **MongoDB connected**
✅ **WebSocket enabled at /ws/sessions**

## How to Test Routes

### 1. Health Check
```powershell
Invoke-WebRequest "http://localhost:5000/api/health" -UseBasicParsing
```

### 2. Root Route
```powershell
Invoke-WebRequest "http://localhost:5000/" -UseBasicParsing
```

### 3. Register User
```powershell
$body = @{ 
    name = 'John Doe'
    email = 'john@example.com'
    password = 'password123'
    college = 'MIT'
    department = 'Computer Science'
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing
```

### 4. Login
```powershell
$body = @{ 
    email = 'john@example.com'
    password = 'password123'
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing

$token = ($response.Content | ConvertFrom-Json).token
```

### 5. Get User Profile (requires authentication)
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/me" `
    -Headers @{ Authorization = "Bearer $token" } `
    -UseBasicParsing
```

### 6. Create Focus Session
```powershell
$body = @{ 
    targetMinutes = 60
    subject = 'Mathematics'
    goal = 'Study Calculus'
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/sessions" `
    -Method POST `
    -Headers @{ Authorization = "Bearer $token" } `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing
```

### 7. End Session
```powershell
$body = @{ 
    elapsedSeconds = 3600
    activeSeconds = 3240
    idleSeconds = 360
    tabSwitches = 5
    status = 'completed'
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/sessions/{SESSION_ID}/end" `
    -Method PUT `
    -Headers @{ Authorization = "Bearer $token" } `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing
```

## WebSocket Connection

Connect to WebSocket at: `ws://localhost:5000/ws/sessions?token=YOUR_JWT_TOKEN`

### WebSocket Messages

**Start Tracking:**
```json
{
  "type": "start",
  "sessionId": "your_session_id"
}
```

**Activity Ping:**
```json
{
  "type": "activity"
}
```

**Tab Switch:**
```json
{
  "type": "tabSwitch"
}
```

**Stop Tracking:**
```json
{
  "type": "stop"
}
```

## Server Management

### Start Server
```powershell
cd c:\Users\HP\FOCUS-ATTENTION-DIGITALBALANCE\focusup-backend
Start-Process node -ArgumentList "server.js" -NoNewWindow -PassThru
```

### Stop Server
```powershell
Get-Process node | Stop-Process -Force
```

### Check if Server is Running
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue
```

## All Available Routes

- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login user
- **GET** `/api/auth/me` - Get current user (protected)
- **POST** `/api/sessions` - Create session (protected)
- **GET** `/api/sessions` - Get all sessions (protected)
- **GET** `/api/sessions/:id` - Get single session (protected)
- **PUT** `/api/sessions/:id` - Update session (protected)
- **PUT** `/api/sessions/:id/end` - End session (protected)
- **DELETE** `/api/sessions/:id` - Delete session (protected)
- **POST** `/api/groups` - Create group (protected)
- **GET** `/api/groups` - Get all groups (protected)
- **POST** `/api/groups/join` - Join group by code (protected)
- **GET** `/api/groups/:id/leaderboard` - Get group leaderboard (protected)
- **POST** `/api/groups/:id/resources` - Share resource (protected)
- **GET** `/api/content` - Get content (protected)
- **GET** `/api/analytics/summary` - Get analytics summary (protected)
- **GET** `/api/profile` - Get user profile (protected)
- **PUT** `/api/profile` - Update profile (protected)

## Focus Score Calculation

The focus score is calculated using this formula:

```
completion = elapsedSeconds / (targetMinutes * 60)
activityRatio = activeSeconds / elapsedSeconds
penalties = (tabSwitches * 2) + (idleSeconds / 30)
focusScore = max(0, round(100 * completion * activityRatio - penalties))
```

## Notes

- All protected routes require `Authorization: Bearer {token}` header
- WebSocket tracking runs every 1 second
- Idle threshold is 15 seconds (no activity)
- Tab switches and activity are tracked in real-time
