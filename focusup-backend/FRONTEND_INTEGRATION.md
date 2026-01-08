# 🚀 QUICK START - Frontend Integration Guide

## Backend Server Status
```
✅ Running on: http://localhost:5000
✅ MongoDB: Connected
✅ All endpoints: Ready
```

---

## 📲 Frontend Integration Examples

### 1. Register User

```javascript
async function registerUser() {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123@',
      college: 'MIT',
      department: 'Computer Science',
      studentId: 'STU123456',
      role: 'student'
    })
  });

  const data = await response.json();
  
  if (data.success) {
    // Save tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    console.log('User:', data.user);
  } else {
    console.error('Error:', data.message);
  }
}
```

### 2. Login User

```javascript
async function loginUser() {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'john@example.com',
      password: 'SecurePass123@'
    })
  });

  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    console.log('Logged in:', data.user);
  }
}
```

### 3. Get Current User (Protected Route)

```javascript
async function getCurrentUser() {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:5000/api/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('User:', data.user);
  } else if (response.status === 401) {
    console.log('Token expired, refresh needed');
  }
}
```

### 4. Refresh Access Token

```javascript
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('http://localhost:5000/api/auth/refresh-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refreshToken: refreshToken
    })
  });

  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('accessToken', data.accessToken);
  }
}
```

### 5. Change Password

```javascript
async function changePassword() {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:5000/api/auth/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      currentPassword: 'SecurePass123@',
      newPassword: 'NewSecurePass456@',
      confirmPassword: 'NewSecurePass456@'
    })
  });

  const data = await response.json();
  console.log(data.message);
}
```

### 6. Update Profile

```javascript
async function updateProfile() {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:5000/api/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'John Updated',
      college: 'Stanford',
      department: 'AI',
      studentId: 'STU654321',
      language: 'hi',
      publicFocus: true
    })
  });

  const data = await response.json();
  console.log(data.message);
}
```

### 7. Logout

```javascript
async function logoutUser() {
  const token = localStorage.getItem('accessToken');
  
  await fetch('http://localhost:5000/api/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  // Clear tokens
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}
```

### 8. Delete Account

```javascript
async function deleteAccount() {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:5000/api/auth/account', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      password: 'SecurePass123@',
      confirmDelete: true
    })
  });

  const data = await response.json();
  
  if (data.success) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    console.log('Account deleted');
  }
}
```

---

## 🔐 Helper Function for Authenticated Requests

```javascript
async function apiCall(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('accessToken');
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`http://localhost:5000${endpoint}`, options);
  const data = await response.json();

  // If token expired, try to refresh
  if (response.status === 401 && data.code === 'TOKEN_EXPIRED') {
    await refreshAccessToken();
    // Retry the request with new token
    return apiCall(endpoint, method, body);
  }

  return data;
}

// Usage:
const user = await apiCall('/api/auth/me');
const result = await apiCall('/api/profile', 'PUT', { name: 'New Name' });
```

---

## ⚠️ Password Requirements

Users must use passwords with:
- ✅ Minimum 8 characters
- ✅ At least 1 UPPERCASE letter (A-Z)
- ✅ At least 1 number (0-9)
- ✅ At least 1 special character (@$!%*?&)

**Valid Example:** `SecurePass123@`  
**Invalid Examples:**  
- `password123` ❌ (no uppercase or special char)
- `Password@` ❌ (no number)
- `Pass1@` ❌ (too short, only 6 chars)

---

## 📋 Error Codes & Messages

### Registration Errors
```
400: "Email is required"
400: "Name is required"
400: "Password is required"
400: "Please provide a valid email address"
400: "Password must be at least 8 characters with 1 uppercase letter..."
400: "Email already exists. Please use a different email."
400: "Student ID already exists. Please use a different student ID."
```

### Login Errors
```
400: "Please provide email and password"
401: "Invalid email or password"
```

### Protected Route Errors
```
401: "Not authorized to access this route"
401: "Token is not valid"
401: "Token expired"
404: "User not found"
```

---

## 🎯 Integration Checklist

- [ ] Backend server running on port 5000
- [ ] MongoDB connected
- [ ] Auth routes tested with curl/Postman
- [ ] Frontend login component created
- [ ] Frontend registration component created
- [ ] Token storage implemented (localStorage)
- [ ] Protected route middleware created
- [ ] Token refresh logic implemented
- [ ] Logout functionality added
- [ ] Profile update page created
- [ ] Password change page created
- [ ] Account deletion with confirmation added

---

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "accessToken": "token...",
  "refreshToken": "token..."
}
```

### Error Response
```json
{
  "success": false,
  "message": "Specific error message"
}
```

---

## 🔗 Useful Links

- **API Documentation:** See `AUTH_IMPLEMENTATION.md`
- **Implementation Summary:** See `IMPLEMENTATION_SUMMARY.md`
- **Backend Server:** http://localhost:5000
- **MongoDB:** atlas.mongodb.com (your account)

---

## ❓ Common Issues & Solutions

### Issue: "Token expired"
**Solution:** Call `/api/auth/refresh-token` with the refresh token to get a new access token

### Issue: "Email already exists"
**Solution:** User is already registered. Ask user to login instead

### Issue: "Student ID already exists"
**Solution:** Another user has registered with that student ID. Use a different ID

### Issue: "Invalid email or password"
**Solution:** Email doesn't exist or password is incorrect. Check both

### Issue: CORS Error
**Solution:** Frontend URL must be http://localhost:5173 (already configured)

---

🚀 **Happy coding! The backend is ready for integration!**
