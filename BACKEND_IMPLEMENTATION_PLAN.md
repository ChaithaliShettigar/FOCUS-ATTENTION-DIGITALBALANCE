# FocusUp Backend Implementation Plan

## 📊 Frontend Analysis Complete

Based on the frontend code analysis, here's the complete backend implementation required:

---

## 🎯 Required API Endpoints

### 1. **Authentication** (`/api/auth`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/register` | Register new user | `{ name, email, password, college, department, role, studentId }` | `{ token, user }` |
| POST | `/login` | Login user | `{ email, password }` | `{ token, user }` |
| GET | `/me` | Get current user | - | `{ user }` |
| POST | `/logout` | Logout user | - | `{ message }` |

---

### 2. **Sessions** (`/api/sessions`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/` | Create new session | `{ contentId, targetMinutes }` | `{ session }` |
| GET | `/` | Get all user sessions | - | `{ sessions }` |
| GET | `/:id` | Get specific session | - | `{ session }` |
| PATCH | `/:id` | Update session progress | `{ elapsedSeconds, activeSeconds, idleSeconds, tabSwitches }` | `{ session }` |
| POST | `/:id/end` | End session | `{ status }` | `{ session, focusScore }` |
| DELETE | `/:id` | Delete session | - | `{ message }` |

---

### 3. **Content** (`/api/content`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/` | Add content | `{ title, type, url, notes }` | `{ content }` |
| GET | `/` | Get all user content | - | `{ contents }` |
| GET | `/:id` | Get specific content | - | `{ content }` |
| PATCH | `/:id` | Update content | `{ title, notes }` | `{ content }` |
| DELETE | `/:id` | Delete content | - | `{ message }` |

**Content Types:** `pdf`, `youtube`, `code`, `link`

---

### 4. **Groups** (`/api/groups`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/` | Create group | `{ name }` | `{ group (with code) }` |
| GET | `/` | Get user's groups | - | `{ groups }` |
| GET | `/:id` | Get specific group | - | `{ group }` |
| POST | `/join` | Join by code | `{ code, userName }` | `{ group }` |
| POST | `/:id/members` | Add member | `{ userId, name }` | `{ group }` |
| POST | `/:id/resources` | Share resource | `{ contentId, title, type, url }` | `{ group }` |
| GET | `/:id/leaderboard` | Get leaderboard | - | `{ leaderboard }` |
| DELETE | `/:id` | Delete group | - | `{ message }` |

**Group Code:** Auto-generated 4-character uppercase code (e.g., `A7K2`)

---

### 5. **Profile** (`/api/profile`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/` | Get profile | - | `{ user }` |
| PATCH | `/` | Update profile | `{ name, college, department, studentId, role }` | `{ user }` |
| PATCH | `/password` | Change password | `{ currentPassword, newPassword }` | `{ message }` |
| PATCH | `/preferences` | Update preferences | `{ publicFocus, preferences }` | `{ user }` |
| PATCH | `/toggle-public` | Toggle public focus | - | `{ user }` |

---

### 6. **Analytics** (`/api/analytics`)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/stats` | Get user stats | - | `{ focusScore, streak, totalSessions, totalMinutes }` |
| GET | `/sessions` | Get session history | `?limit=50` | `{ sessions (with chart data) }` |
| GET | `/dashboard` | Get dashboard data | - | `{ stats, recentSessions, trends }` |

---

## 📦 Database Models

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: Enum ['student', 'faculty'],
  college: String,
  department: String,
  studentId: String,
  focusScore: Number (default: 0),
  streak: Number (default: 0),
  publicFocus: Boolean (default: false),
  preferences: {
    notifications: { ... },
    sounds: { ... },
    focus: { ... },
    display: { ... }
  },
  language: String (default: 'en'),
  createdAt: Date,
  updatedAt: Date
}
```

### Session Model
```javascript
{
  userId: ObjectId (ref: User),
  contentId: String,
  targetMinutes: Number (required),
  elapsedSeconds: Number (default: 0),
  activeSeconds: Number (default: 0),
  idleSeconds: Number (default: 0),
  tabSwitches: Number (default: 0),
  startTime: Date,
  endTime: Date,
  status: Enum ['active', 'completed', 'cancelled'],
  focusScore: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Content Model
```javascript
{
  userId: ObjectId (ref: User),
  title: String (required),
  type: Enum ['pdf', 'youtube', 'code', 'link'],
  url: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Group Model
```javascript
{
  name: String (required),
  code: String (required, unique, 4 chars),
  createdBy: ObjectId (ref: User),
  members: [{
    userId: ObjectId,
    name: String,
    joinedAt: Date
  }],
  resources: [{
    contentId: ObjectId,
    title: String,
    type: String,
    url: String,
    sharedBy: ObjectId,
    sharedAt: Date
  }],
  leaderboard: [{
    userId: ObjectId,
    name: String,
    focusScore: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔑 Key Business Logic

### Focus Score Calculation
```javascript
const completion = elapsedSeconds / (targetMinutes * 60)
const activityRatio = activeSeconds / elapsedSeconds
const distractionPenalty = (tabSwitches * 2) + (idleSeconds / 30)
focusScore = max(0, round(100 * completion * activityRatio - distractionPenalty))
```

### Streak Management
- Increment streak when session status = 'completed'
- Reset if user misses a day (can add lastSessionDate field)

### Group Code Generation
```javascript
const code = Math.random().toString(36).slice(2, 6).toUpperCase()
```

### Activity Tracking
- **Active**: User interaction detected (scroll, click, type)
- **Idle**: No activity for >15 seconds
- Track both active and idle time within sessions

---

## 🔐 Middleware Requirements

### Authentication Middleware (`auth.js`)
- Verify JWT token from headers
- Attach `req.user` with user ID
- Return 401 if invalid/missing

### Error Handler (`errorHandler.js`)
- Catch all errors
- Return formatted JSON responses
- Log errors for debugging

---

## 🚀 Implementation Priority

### Phase 1: Core Features (REQUIRED)
1. ✅ User authentication (register, login, getMe)
2. ✅ Session CRUD with tracking
3. ✅ Content management
4. ✅ Profile management

### Phase 2: Social Features
1. ✅ Groups (create, join, share)
2. ✅ Leaderboard
3. ✅ Analytics

### Phase 3: Enhanced Features
1. Settings/preferences sync
2. Notifications
3. Advanced analytics

---

## 📝 Controller Implementation Examples

### Session Controller
```javascript
// Start Session
export const createSession = async (req, res) => {
  const { contentId, targetMinutes } = req.body
  const session = await Session.create({
    userId: req.user.id,
    contentId,
    targetMinutes,
    startTime: new Date(),
    status: 'active'
  })
  res.json({ session })
}

// Update Session
export const updateSession = async (req, res) => {
  const { elapsedSeconds, activeSeconds, idleSeconds, tabSwitches } = req.body
  const session = await Session.findByIdAndUpdate(
    req.params.id,
    { elapsedSeconds, activeSeconds, idleSeconds, tabSwitches },
    { new: true }
  )
  res.json({ session })
}

// End Session
export const endSession = async (req, res) => {
  const session = await Session.findById(req.params.id)
  session.status = req.body.status || 'completed'
  session.endTime = new Date()
  
  // Calculate focus score
  const completion = session.elapsedSeconds / (session.targetMinutes * 60)
  const activityRatio = session.activeSeconds / (session.elapsedSeconds || 1)
  const penalty = session.tabSwitches * 2 + session.idleSeconds / 30
  session.focusScore = Math.max(0, Math.round(100 * completion * activityRatio - penalty))
  
  await session.save()
  
  // Update user stats
  const user = await User.findById(req.user.id)
  user.focusScore += session.focusScore
  if (session.status === 'completed') user.streak++
  await user.save()
  
  res.json({ session, focusScore: session.focusScore })
}
```

### Group Controller
```javascript
// Create Group
export const createGroup = async (req, res) => {
  const code = Math.random().toString(36).slice(2, 6).toUpperCase()
  const group = await Group.create({
    name: req.body.name,
    code,
    createdBy: req.user.id,
    members: [{ userId: req.user.id, name: req.user.name }]
  })
  res.json({ group })
}

// Join Group
export const joinGroup = async (req, res) => {
  const { code, userName } = req.body
  const group = await Group.findOne({ code: code.toUpperCase() })
  if (!group) return res.status(404).json({ message: 'Group not found' })
  
  // Check if already member
  const isMember = group.members.some(m => m.userId.toString() === req.user.id)
  if (isMember) return res.status(400).json({ message: 'Already a member' })
  
  group.members.push({ userId: req.user.id, name: userName })
  await group.save()
  res.json({ group })
}
```

---

## 🛠️ Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/focusup
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

---

## ✅ Testing Checklist

- [ ] User registration with all fields
- [ ] User login and token generation
- [ ] Create session and track time
- [ ] Update session with activity data
- [ ] End session and calculate score
- [ ] Create and delete content
- [ ] Create group with auto-code
- [ ] Join group by code
- [ ] Share resources to group
- [ ] Update profile and preferences
- [ ] Get analytics data

---

## 🎨 Frontend Integration Notes

The frontend uses **Zustand** for local state management. Most data is stored client-side but should sync with backend:

1. **On mount:** Fetch user, sessions, content, groups from API
2. **On action:** Update backend, then update Zustand store
3. **Real-time tracking:** Send session updates every ~5 seconds
4. **Offline support:** Queue requests if API unavailable

---

## 🔄 Next Steps

1. Review existing controllers and update with new endpoints
2. Add missing routes in route files
3. Test all endpoints with Postman/Thunder Client
4. Update frontend to call backend APIs instead of local storage
5. Add error handling and validation
6. Deploy backend to production

---

**Status:** ✅ Analysis Complete | 🔄 Implementation In Progress | ⏳ Testing Pending
