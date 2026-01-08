# Technical Implementation Details

## Backend Architecture

### 1. Database Schema Changes

#### User Schema (models/User.js)
```javascript
{
  name: String,              // User's full name
  username: String,          // UNIQUE - lowercase, 3-20 chars
  email: String,             // UNIQUE - email address
  password: String,          // Hashed password
  college: String,           // Optional
  department: String,        // Optional
  studentId: String,         // Optional, unique
  role: Enum,               // 'student' or 'faculty'
  publicFocus: Boolean,      // Whether to show focus score publicly
  focusScore: Number,        // User's focus score
  streak: Number,            // Current streak
  totalFocusMinutes: Number, // Total focus minutes
  avatar: String,            // Avatar URL
  language: String,          // Language preference
  createdAt: Date,
  updatedAt: Date
}
```

#### Group Schema (models/Group.js)
```javascript
{
  name: String,              // Group name
  code: String,              // UNIQUE - 8-char auto-generated code
  description: String,       // Optional group description
  createdBy: ObjectId,       // Reference to User (admin)
  members: [{
    userId: ObjectId,        // Reference to User
    role: Enum,             // 'admin' or 'member'
    joinedAt: Date
  }],
  resources: [{...}],        // Learning resources
  leaderboard: [{...}],      // Group leaderboard
  isPublic: Boolean,         // Public/private group
  createdAt: Date,
  updatedAt: Date
}
```

---

### 2. API Endpoints

#### Authentication Endpoints

**POST /api/auth/register**
- **Body**: 
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "StrongPass123!",
  "college": "MIT",
  "department": "CS",
  "role": "student",
  "studentId": "2024123"
}
```
- **Response**: 
```json
{
  "success": true,
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "student"
  }
}
```
- **Validation**:
  - Username must be 3-20 chars, alphanumeric + hyphens/underscores
  - Email must be valid email format
  - Password must be 8+ chars with uppercase, number, special char
  - Username and email must be unique

**POST /api/auth/login**
- **Body**: 
```json
{
  "email": "john@example.com",
  "password": "StrongPass123!"
}
```
- **Response**: Returns same as register with username included

---

#### Group Endpoints

**POST /api/groups**
- **Auth**: Required
- **Body**: 
```json
{
  "name": "Study Group",
  "description": "CSE101 Study Group",
  "isPublic": false
}
```
- **Response**: 
```json
{
  "success": true,
  "group": {
    "_id": "group_id",
    "code": "ABC12DEF",
    "name": "Study Group",
    "members": [{ userId: {...}, role: "admin" }],
    "createdBy": {...}
  }
}
```

**GET /api/groups**
- **Auth**: Required
- **Response**: 
```json
{
  "success": true,
  "count": 5,
  "groups": [...]
}
```

**POST /api/groups/join/code**
- **Auth**: Required
- **Body**: 
```json
{
  "code": "ABC12DEF"
}
```
- **Response**: Updated group object with user added to members
- **Error Cases**:
  - Code doesn't exist: 404 "Invalid group code"
  - Already a member: 400 "Already a member"

**POST /api/groups/:id/leave**
- **Auth**: Required
- **Response**: Updated group without user
- **Error Cases**:
  - Creator with members: 400 "Must delete group"
  - Not a member: 400 "Not a member"

**DELETE /api/groups/:id**
- **Auth**: Required
- **Permissions**: Creator only
- **Response**: Success message

**PUT /api/groups/:id**
- **Auth**: Required
- **Permissions**: Creator only
- **Body**: 
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "isPublic": true
}
```

**POST /api/groups/:id/add-member**
- **Auth**: Required
- **Permissions**: Admin only
- **Body**: 
```json
{
  "userId": "target_user_id"
}
```

**POST /api/groups/:id/remove-member**
- **Auth**: Required
- **Permissions**: Admin only
- **Body**: 
```json
{
  "userId": "target_user_id"
}
```

---

#### Profile & Search Endpoints

**GET /api/profile/search-users?query=john**
- **Auth**: Not required (public)
- **Query Params**: 
  - `query`: String to search for usernames
- **Response**: 
```json
{
  "success": true,
  "count": 3,
  "users": [{
    "_id": "user_id",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "college": "MIT",
    "department": "CS",
    "role": "student",
    "focusScore": 85,
    "avatar": "url"
  }]
}
```
- **Behavior**:
  - Prefix search: "j" returns users with username starting with "j"
  - Case-insensitive: "John" = "john" = "JOHN"
  - Returns max 20 results
  - Returns all users (regardless of publicFocus)

**GET /api/profile/search?query=john**
- **Auth**: Not required (public)
- **Response**: Same as above but only users with `publicFocus: true`
- **Searches**: name, email, AND username

**GET /api/profile/public/:userId**
- **Auth**: Not required
- **Response**: 
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "focusScore": 85,
    "streak": 7,
    "totalFocusMinutes": 1250,
    "publicFocus": true
  }
}
```
- **Error**: 403 if user has `publicFocus: false`

---

### 3. Validation Rules

#### Username Validation
```javascript
// Pattern: letters, numbers, hyphens, underscores
/^[a-zA-Z0-9_-]+$/

// Length: 3-20 characters
minlength: 3
maxlength: 20

// Uniqueness: Database unique index
unique: true
```

#### Group Code Generation
```javascript
function generateGroupCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
// Output: 8 uppercase alphanumeric characters
// Example: "ABC12DEF", "ZXCV1234"
```

---

## Frontend Architecture

### 1. Components & Hooks

#### Search Component (src/pages/Search.jsx)
**State Management**:
- `searchQuery`: Current search input value
- `searchResults`: Array of search results
- `suggestions`: Real-time dropdown suggestions
- `selectedUser`: Currently viewed user profile
- `showSuggestions`: Dropdown visibility toggle
- `loading`: Search operation status

**Key Functions**:
- `handleSearchInputChange()`: Debounced input handler
- `handleSearch()`: Full search submission
- `handleViewProfile()`: Load individual profile
- `handleSuggestionClick()`: Select from suggestions dropdown

**Features**:
- 300ms debounce on input
- Click-outside detection to close suggestions
- Real-time suggestions with min 1 char
- Separate full search results view

#### Groups Component (src/pages/Groups.jsx)
**State Management**:
- `groups`: User's groups array
- `showCreateModal`: Create group modal visibility
- `showJoinModal`: Join group modal visibility
- `groupCode`: Join code input
- `selectedGroupForDetails`: Currently viewed group

**Key Functions**:
- `handleCreateGroup()`: Create new group
- `handleJoinGroup()`: Join by code
- `handleLeaveGroup()`: Leave group
- `handleDeleteGroup()`: Delete group
- `copyToClipboard()`: Copy code to clipboard

---

### 2. API Service Layer (src/services/api.js)

#### Group API Methods
```javascript
export const groupAPI = {
  // Create a new group
  createGroup: async (groupData) => {...}
  
  // Get all user's groups
  getUserGroups: async () => {...}
  
  // Get single group details
  getGroup: async (groupId) => {...}
  
  // Join group using code
  joinGroup: async ({ code }) => {...}
  
  // Leave group
  leaveGroup: async (groupId) => {...}
  
  // Update group info
  updateGroup: async (groupId, updates) => {...}
  
  // Delete group
  deleteGroup: async (groupId) => {...}
  
  // Add member (admin)
  addMember: async (groupId, userId) => {...}
  
  // Remove member (admin)
  removeMember: async (groupId, userId) => {...}
}
```

#### Profile API Updates
```javascript
export const profileAPI = {
  // ... existing methods ...
  
  // NEW: Search users by username
  searchUsersByUsername: async (query) => {...}
  
  // UPDATED: Now searches by username too
  searchPublicProfiles: async (query) => {...}
}
```

---

### 3. HTTP Request Flow

#### Example: Join Group
1. **Frontend**: User enters code and clicks "Join"
2. **Frontend**: `groupAPI.joinGroup({ code: "ABC12DEF" })`
3. **HTTP**: `POST /api/groups/join/code` with auth header
4. **Backend**: Validates code, adds user to group
5. **Response**: Returns updated group object
6. **Frontend**: Updates state, shows success toast

#### Example: Search Suggestions
1. **Frontend**: User types "j" in search box
2. **Frontend**: Debounce timer starts (300ms)
3. **Frontend**: `profileAPI.searchUsersByUsername("j")`
4. **HTTP**: `GET /api/profile/search-users?query=j` (no auth needed)
5. **Backend**: Returns users with username starting with "j"
6. **Frontend**: Updates suggestions dropdown
7. **UX**: User sees matching names as they type

---

### 4. Error Handling

#### Common Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "message": "Username already exists. Please use a different username."
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Please login to continue"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Not authorized to update this group"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Invalid group code. Group not found"
}
```

---

## Development Workflow

### Adding a New Feature

1. **Database**: Update schema (models/)
2. **Backend**: Create controller logic (controllers/)
3. **Backend**: Add routes (routes/)
4. **Frontend**: Add API service method (services/api.js)
5. **Frontend**: Update UI component (pages/)
6. **Test**: Use Postman/curl for API testing
7. **Test**: Test UI in browser

### Testing Checklist

- [ ] Register new user with unique username
- [ ] Attempt duplicate username registration
- [ ] Login successfully
- [ ] Create group (verify auto-generated code)
- [ ] View group code
- [ ] Copy group code
- [ ] Join group with valid code
- [ ] Join with invalid code (should fail)
- [ ] Search by typing username
- [ ] See real-time suggestions
- [ ] Click suggestion to view profile
- [ ] View group members with usernames
- [ ] Leave group
- [ ] Delete group (creator only)

---

## Performance Considerations

### Optimization Techniques Implemented

1. **Debounced Search**: 300ms delay prevents excessive API calls
2. **Limit Results**: Max 20 suggestions, max 50 search results
3. **Population Optimization**: Only populate necessary fields
4. **Index Suggestions**: Username and code fields should have indexes

### Recommended Database Indexes

```javascript
// User collection
db.users.createIndex({ username: 1 })
db.users.createIndex({ email: 1 })

// Group collection
db.groups.createIndex({ code: 1 })
db.groups.createIndex({ createdBy: 1 })
```

---

## Security Considerations

1. **Username Validation**: Whitelist approach (only allowed characters)
2. **Code Randomness**: 8 random chars = 36^8 ≈ 2.8 trillion combinations
3. **Member Permissions**: Admin checks before add/remove
4. **Authentication**: All group endpoints require login
5. **Authorization**: Creator checks for sensitive operations

---

## Future Enhancements

1. **Human-readable codes**: Combine words for easier sharing
2. **Invite system**: Send invites instead of sharing codes
3. **Role management**: More granular permissions
4. **Audit logging**: Track group activities
5. **Group messaging**: Real-time communication
6. **Webhooks**: Notify external systems of group events

