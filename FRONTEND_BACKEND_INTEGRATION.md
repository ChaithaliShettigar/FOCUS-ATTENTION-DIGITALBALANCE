# Frontend-Backend Authentication Integration Guide

## ✅ Integration Complete!

The authentication system has been successfully connected between the frontend and backend.

## 📋 What Was Implemented

### 1. API Service Layer (`src/services/api.js`)
- **Base Configuration**: Uses `http://localhost:5000/api` as the backend URL
- **Token Management**: Automatic JWT token storage in localStorage
- **Auto Token Refresh**: Automatically refreshes expired access tokens using refresh tokens
- **Error Handling**: Catches and displays proper error messages

#### Available API Methods:

**Authentication APIs** (`authAPI`):
- `register(userData)` - Register new user
- `login(email, password)` - Login user
- `logout()` - Logout user
- `getCurrentUser()` - Get current user info
- `changePassword(current, new, confirm)` - Change password
- `deleteAccount(password, confirmDelete)` - Delete account
- `refreshToken()` - Refresh access token

**Profile APIs** (`profileAPI`):
- `getProfile()` - Get user profile
- `updateProfile(updates)` - Update profile fields
- `updatePassword(current, new, confirm)` - Update password
- `togglePublicFocus()` - Toggle focus score visibility
- `deleteProfile(password, confirmDelete)` - Delete profile

### 2. Updated Components

#### Auth.jsx (`src/pages/Auth.jsx`)
**Changes:**
- ✅ Added `useNavigate` from React Router for redirects
- ✅ Added `loading` state for form submission
- ✅ Integrated `authAPI.login()` and `authAPI.register()`
- ✅ Added Student ID field for registration (optional)
- ✅ Added password requirements hint (8+ chars, uppercase, number, special)
- ✅ Shows proper error messages from backend
- ✅ Redirects to `/dashboard` on successful login/register
- ✅ Stores tokens and user data in localStorage

**Registration Fields:**
- Name (required)
- Email (required)
- Password (required - 8+ chars with uppercase, number, special char)
- Student ID (optional)
- Role (student/faculty)
- College (optional)
- Department (optional)

#### Profile.jsx (`src/pages/Profile.jsx`)
**Changes:**
- ✅ Added `useNavigate` for redirects after account deletion
- ✅ Integrated `profileAPI.updateProfile()` for saving profile changes
- ✅ Integrated `profileAPI.updatePassword()` for password changes
- ✅ Integrated `profileAPI.togglePublicFocus()` for privacy settings
- ✅ Integrated `authAPI.deleteAccount()` for account deletion
- ✅ Added `loading` states for all actions
- ✅ Shows proper success/error messages
- ✅ Clears auth on account deletion and redirects to `/auth`

**Profile Features:**
- Update personal information (name, college, department, role, student ID)
- Change password with validation
- Toggle focus score visibility (public/private)
- Delete account permanently

#### NavBar.jsx (`src/components/NavBar.jsx`)
**Changes:**
- ✅ Added logout button (visible when authenticated)
- ✅ Integrated `authAPI.logout()` function
- ✅ Shows Login link when not authenticated
- ✅ Clears tokens and user data on logout
- ✅ Redirects to `/auth` after logout

#### Zustand Store (`src/store/useFocusStore.js`)
**Changes:**
- ✅ Loads user from localStorage on app initialization
- ✅ Checks authentication status from localStorage
- ✅ Updates localStorage when user data changes
- ✅ Syncs with API service layer

### 3. Environment Configuration

Created `.env` file in `focusup-frontend/`:
```
VITE_API_URL=http://localhost:5000/api
```

## 🚀 How to Test

### Prerequisites
1. **Backend must be running** on `http://localhost:5000`
2. **MongoDB connection** must be active
3. **Frontend must be running** on `http://localhost:5173`

### Test Steps

#### 1. Start Backend Server
```powershell
cd focusup-backend
node server.js
```
Expected output: "✅ Server running on port 5000" and "✅ MongoDB connected"

#### 2. Start Frontend Server
```powershell
cd focusup-frontend
npm run dev
```
Expected output: Server running on `http://localhost:5173`

#### 3. Test Registration
1. Open browser to `http://localhost:5173/auth`
2. Click "Register" tab
3. Fill in the form:
   - Name: "Test User"
   - Email: "testuser@example.com"
   - Password: "Test@1234" (must have uppercase, number, special char)
   - Student ID: "STU12345" (optional)
   - Role: Student
   - College: "Test College" (optional)
   - Department: "Computer Science" (optional)
4. Click "Register" button
5. ✅ Should show success message and redirect to dashboard
6. ✅ Check browser localStorage: should have `accessToken`, `refreshToken`, and `user`

#### 4. Test Duplicate Email Detection
1. Try to register again with same email
2. ✅ Should show error: "Email already exists"

#### 5. Test Login
1. Go to `/auth` page
2. Enter:
   - Email: "testuser@example.com"
   - Password: "Test@1234"
3. Click "Login"
4. ✅ Should login successfully and redirect to dashboard

#### 6. Test Profile Update
1. Navigate to `/profile`
2. Update any field (name, college, department)
3. Click "Save Profile Changes"
4. ✅ Should show success message
5. Refresh page - changes should persist

#### 7. Test Password Change
1. On profile page, scroll to "Security & Password"
2. Click "Change Password"
3. Enter:
   - Current Password: "Test@1234"
   - New Password: "NewTest@1234"
   - Confirm: "NewTest@1234"
4. Click "Update Password"
5. ✅ Should show success message
6. Try to login with new password - should work

#### 8. Test Privacy Toggle
1. On profile page, find "Focus Score Visibility"
2. Click "Public/Private" button
3. ✅ Should toggle between states
4. ✅ Should show success message

#### 9. Test Logout
1. Click "Logout" button in navbar
2. ✅ Should redirect to `/auth`
3. ✅ Check localStorage: tokens and user should be cleared
4. ✅ Should show "Logged out successfully" message

#### 10. Test Token Persistence
1. Login to the app
2. Close the browser tab
3. Reopen `http://localhost:5173`
4. ✅ Should still be logged in (tokens loaded from localStorage)

## 🔐 Security Features Implemented

1. **Password Requirements**: 8+ characters, uppercase, number, special character
2. **JWT Tokens**: Access token (7 days) + Refresh token (30 days)
3. **Auto Token Refresh**: Expired tokens automatically refreshed
4. **Duplicate Prevention**: Email and Student ID uniqueness enforced
5. **Password Hashing**: bcryptjs with 10 salt rounds
6. **Protected Routes**: All profile/auth endpoints require valid JWT
7. **Secure Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)

## 📝 API Endpoints Used

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/change-password` - Change password (protected)
- `DELETE /api/auth/account` - Delete account (protected)

### Profile
- `GET /api/profile` - Get user profile (protected)
- `PUT /api/profile` - Update profile (protected)
- `PUT /api/profile/password` - Update password (protected)
- `POST /api/profile/toggle-public-focus` - Toggle visibility (protected)
- `DELETE /api/profile` - Delete profile (protected)

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error
**Error**: "Access to fetch blocked by CORS policy"
**Solution**: Ensure backend CORS is configured for `http://localhost:5173`
```javascript
// In backend server.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
```

### Issue 2: 401 Unauthorized
**Error**: "Unauthorized" on protected routes
**Solution**: 
- Check if token exists in localStorage
- Try logging in again
- Check backend JWT_SECRET matches

### Issue 3: Password Validation Error
**Error**: "Password must be at least 8 characters..."
**Solution**: Ensure password has:
- At least 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character (@$!%*?&)

### Issue 4: Backend Not Responding
**Error**: "Failed to fetch" or network errors
**Solution**:
- Verify backend is running: `netstat -ano | findstr :5000`
- Check MongoDB connection is active
- Verify `.env` file exists in `focusup-backend/`

### Issue 5: Frontend Not Updating After Login
**Solution**:
- Check browser console for errors
- Verify `useFocusStore` is updating correctly
- Clear browser cache and localStorage
- Restart frontend dev server

## 🎯 What's Next?

The authentication system is fully functional! Here's what you can do next:

1. **Add Protected Routes**: Create route guards to prevent unauthenticated access
2. **Email Verification**: Implement email verification for new users
3. **Forgot Password**: Add password reset functionality
4. **Session Management**: Add "Remember Me" functionality
5. **Social Login**: Add Google/GitHub OAuth integration
6. **Profile Pictures**: Add avatar upload functionality
7. **Activity Logs**: Track login history and device management

## 📞 Testing Checklist

- [x] User registration with all fields
- [x] Duplicate email detection
- [x] Duplicate student ID detection
- [x] Login with email and password
- [x] Password validation (8+ chars, uppercase, number, special)
- [x] Token storage in localStorage
- [x] Auto token refresh on expiry
- [x] Profile information update
- [x] Password change
- [x] Public/private focus toggle
- [x] Logout functionality
- [x] Account deletion
- [x] Session persistence across page reloads
- [x] Error message display
- [x] Loading states during API calls
- [x] Navigation redirects after auth actions

## 📄 Files Modified/Created

### Created:
- `focusup-frontend/src/services/api.js` - API service layer
- `focusup-frontend/.env` - Environment configuration
- `FRONTEND_BACKEND_INTEGRATION.md` - This guide

### Modified:
- `focusup-frontend/src/pages/Auth.jsx` - Added real authentication
- `focusup-frontend/src/pages/Profile.jsx` - Added backend integration
- `focusup-frontend/src/components/NavBar.jsx` - Added logout functionality
- `focusup-frontend/src/store/useFocusStore.js` - Added localStorage sync

---

**Integration Status**: ✅ **COMPLETE**

**Backend Status**: ✅ Running on port 5000
**Frontend Status**: ✅ Running on port 5173
**Database Status**: ✅ MongoDB connected
