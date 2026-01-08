# Group and Username Features Implementation

## Summary of Changes

This document outlines all the changes made to implement working group functionality with code-based joining and real-time username-based search.

### 1. **Backend Changes**

#### 1.1 User Model (`models/User.js`)
- **Added `username` field:**
  - Required, unique, lowercase, trimmed
  - 3-20 characters length requirement
  - Only letters, numbers, hyphens, underscores allowed
  - Validation regex: `/^[a-zA-Z0-9_-]+$/`

#### 1.2 Group Model (`models/Group.js`)
- **Added `code` field:**
  - Unique 8-character alphanumeric code
  - Auto-generated on group creation using `generateGroupCode()` function
  - Uppercase characters
  - Format: e.g., "ABC12DEF"

#### 1.3 Group Controller (`controllers/groupController.js`)
**Enhanced Endpoints:**
- `createGroup()` - Creates group with auto-generated code
- `getGroups()` - Get all groups for current user (created or member)
- `getGroup()` - Get single group details
- **NEW** `joinGroupByCode()` - Join group using the 8-character code
- **NEW** `leaveGroup()` - Leave a group (with admin restrictions)
- `addMember()` - Admin only, add specific user to group
- `removeMember()` - Admin only, remove user from group
- `updateGroup()` - Update group name/description
- `deleteGroup()` - Delete group (creator only)

**Key Features:**
- Duplicate member prevention
- Admin-only member management
- Proper population of user fields (name, email, username, focusScore)
- Error handling for edge cases

#### 1.4 Profile Controller (`controllers/profileController.js`)
- **NEW** `searchUsersByUsername()` endpoint
  - Prefix-based username search (searches usernames starting with query)
  - Case-insensitive matching
  - Returns up to 20 matching users
  - Returns: name, email, username, college, department, role, focusScore

- **Updated** `searchPublicProfiles()` endpoint
  - Now searches by username in addition to name and email
  - Only returns users with `publicFocus: true`

#### 1.5 Auth Controller (`controllers/authController.js`)
- **Updated `register()` endpoint:**
  - Now requires `username` field
  - Validates username (3-20 chars, alphanumeric + hyphens/underscores)
  - Checks for username uniqueness
  - Returns username in response

- **Updated `login()` endpoint:**
  - Returns `username` in user object

#### 1.6 Routes
- **Profile Routes** (`routes/profile.js`):
  - Added `/profile/search-users` endpoint for username search
  
- **Group Routes** (`routes/groups.js`):
  - Added `/groups/join/code` POST endpoint for code-based joining
  - Added `/:id/leave` POST endpoint for leaving groups

#### 1.7 Migration Script
- **Created** `scripts/addUsernameToExistingUsers.js`
  - Run this once if you have existing users without usernames
  - Generates unique usernames based on user names
  - Command: `node scripts/addUsernameToExistingUsers.js`

---

### 2. **Frontend Changes**

#### 2.1 API Service (`src/services/api.js`)
**New Group API Methods:**
```javascript
groupAPI = {
  createGroup(groupData)        // Create a new group
  getUserGroups()               // Get all user's groups
  getGroup(groupId)             // Get single group
  joinGroup(groupData)          // Join group by code
  leaveGroup(groupId)           // Leave a group
  updateGroup(groupId, updates) // Update group info
  deleteGroup(groupId)          // Delete group
  addMember(groupId, userId)    // Add member (admin)
  removeMember(groupId, userId) // Remove member (admin)
}
```

**Updated Profile API:**
```javascript
searchUsersByUsername(query)    // NEW: Search users by username with suggestions
```

#### 2.2 Search Component (`src/pages/Search.jsx`)
**Major Enhancements:**
- **Real-time Username Suggestions:**
  - Shows suggestions dropdown as user types
  - 300ms debounce to prevent excessive API calls
  - Displays user name, username (@), and focus score in suggestions
  - Click suggestion to view user profile
  
- **Updated Placeholder:**
  - Now says "Search by name, email, or username..."
  
- **Profile Display:**
  - Added `@username` display in search results
  - Added username in user profile modal
  - Shows public profile status
  
- **Improved UX:**
  - Click outside to close suggestions dropdown
  - Visual feedback for suggestion selection
  - Better organized profile information

---

### 3. **How to Use**

#### 3.1 User Registration
```
POST /api/auth/register
Body: {
  "name": "John Doe",
  "username": "johndoe",        // NEW: Required
  "email": "john@example.com",
  "password": "StrongPass123!",
  "college": "MIT",
  "department": "Computer Science",
  "role": "student"
}
```

#### 3.2 Create a Group
```
POST /api/groups
Body: {
  "name": "Study Group",
  "description": "CSE101 Study Group"
}
Response includes: { code: "ABC12DEF" }
```

#### 3.3 Join Group by Code
```
POST /api/groups/join/code
Body: {
  "code": "ABC12DEF"    // 8-character code
}
```

#### 3.4 Search for Users
```
GET /api/profile/search-users?query=john
Response: {
  "success": true,
  "count": 5,
  "users": [
    {
      "_id": "...",
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "focusScore": 85,
      ...
    }
  ]
}
```

---

### 4. **Frontend Features**

#### 4.1 Real-time Search Suggestions
- Type any letter and see matching usernames
- Example: Type "j" → sees all users starting with "j"
- Click on a suggestion to view that user's profile
- Suggestions disappear when you press search or click away

#### 4.2 Group Management UI
- Create groups with auto-generated codes
- Join groups using 8-character code
- View group members with their focus scores
- Copy group code to clipboard
- Leave groups or delete (if creator)
- Add/remove members (admin only)

---

### 5. **Validation & Error Handling**

**Username Validation:**
- 3-20 characters
- Only `a-z, A-Z, 0-9, -, _`
- Must be unique
- Error message: "Username can only contain letters, numbers, hyphens and underscores"

**Group Code Validation:**
- 8 characters, alphanumeric
- Case-insensitive during join (converted to uppercase)
- Error: "Invalid group code. Group not found"

**Member Management:**
- Prevents duplicate members
- Only admins can add/remove members
- Creator cannot leave if last member (must delete group)

---

### 6. **Database Considerations**

#### Indexes to Add (Optional for Performance)
```javascript
// In User model
userSchema.index({ username: 1 })  // Speeds up username searches

// In Group model  
groupSchema.index({ code: 1 })     // Speeds up code-based lookups
```

---

### 7. **Migration Steps for Existing Users**

If you have existing users without usernames:

1. **Backup your database** (highly recommended)
2. **Run migration script:**
   ```bash
   node scripts/addUsernameToExistingUsers.js
   ```
3. **Verify users have usernames:**
   - Check MongoDB for username field populated
   - All usernames should be unique

---

### 8. **Testing Checklist**

- [ ] Register new user with username
- [ ] Try registering with duplicate username (should fail)
- [ ] Login with email/password
- [ ] Create a group (verify code is generated)
- [ ] Copy group code
- [ ] Share code with another user
- [ ] Other user joins using code
- [ ] Verify user appears in group members
- [ ] Search for user by typing username
- [ ] See real-time suggestions in dropdown
- [ ] Click suggestion to view user profile
- [ ] Leave group
- [ ] Delete group (if creator)
- [ ] Try joining non-existent code (should fail)

---

### 9. **Known Limitations & Future Improvements**

- Group codes are random (not human-readable)
- No group roles beyond admin/member yet
- No group messages/chat
- No group leaderboard/analytics
- Could add: Group invites, role management, activity feeds

---

## File Modifications Summary

| File | Changes |
|------|---------|
| `models/User.js` | Added unique `username` field |
| `models/Group.js` | Added auto-generated `code` field |
| `controllers/groupController.js` | Added joinGroupByCode, leaveGroup, enhanced others |
| `controllers/profileController.js` | Added searchUsersByUsername |
| `controllers/authController.js` | Updated register/login for username |
| `routes/groups.js` | Added new endpoints |
| `routes/profile.js` | Added search-users endpoint |
| `src/services/api.js` | Added groupAPI + search methods |
| `src/pages/Search.jsx` | Added real-time suggestions |
| `scripts/addUsernameToExistingUsers.js` | NEW: Migration utility |

