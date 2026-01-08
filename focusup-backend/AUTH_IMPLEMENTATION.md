# 🔐 Authentication & User Management - Complete Implementation

## ✅ Implementation Summary

A secure, production-ready authentication and user management system has been implemented using the MERN stack with the following features:

### Security Features Implemented:
✅ **Password Hashing** - bcryptjs with salt (10 rounds)
✅ **Strict Password Validation** - Min 8 chars, 1 uppercase, 1 number, 1 special char (@$!%*?&)
✅ **JWT Authentication** - Access tokens (7d) + Refresh tokens (30d)
✅ **Email Uniqueness** - No duplicate emails allowed
✅ **Student ID Uniqueness** - No duplicate student IDs allowed
✅ **Duplicate Detection** - Before registration with clear error messages
✅ **Protected Routes** - All sensitive endpoints require authentication
✅ **Error Handling** - Comprehensive error messages with proper HTTP status codes
✅ **Middleware Protection** - Auth middleware validates all requests
✅ **CORS Configuration** - Frontend URL: http://localhost:5173

---

## 📋 API ENDPOINTS

### 1️⃣ PUBLIC ENDPOINTS (No Authentication Required)

#### **POST /api/auth/register**
Register a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123@",
  "college": "MIT",
  "department": "Computer Science",
  "studentId": "STU123456",
  "role": "student"  // optional: student or faculty
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "college": "MIT",
    "department": "Computer Science",
    "studentId": "STU123456",
    "role": "student",
    "publicFocus": false
  }
}
```

**Error Responses:**
- 400: Invalid email format, weak password, missing fields
- 400: Email already exists
- 400: Student ID already exists

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 number (0-9)
- At least 1 special character (@$!%*?&)

---

#### **POST /api/auth/login**
Login with email and password

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123@"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "college": "MIT",
    "department": "Computer Science",
    "studentId": "STU123456",
    "role": "student",
    "focusScore": 0,
    "streak": 0,
    "publicFocus": false
  }
}
```

**Error Responses:**
- 401: Invalid email or password

---

#### **POST /api/auth/refresh-token**
Get a new access token using refresh token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- 400: Refresh token is required
- 401: Refresh token is invalid or expired
- 404: User not found

---

### 2️⃣ PROTECTED ENDPOINTS (Requires: Bearer Token in Authorization Header)

#### **GET /api/auth/me**
Get current authenticated user

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "college": "MIT",
    "department": "Computer Science",
    "studentId": "STU123456",
    "role": "student",
    "publicFocus": false,
    "focusScore": 100,
    "streak": 5,
    "totalFocusMinutes": 480,
    "language": "en",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### **POST /api/auth/change-password**
Change user password

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "currentPassword": "SecurePass123@",
  "newPassword": "NewSecurePass456@",
  "confirmPassword": "NewSecurePass456@"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**
- 400: Missing fields, passwords don't match, same as current password
- 400: New password doesn't meet requirements
- 401: Current password is incorrect
- 404: User not found

---

#### **POST /api/auth/logout**
Logout user

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### **DELETE /api/auth/account**
Delete user account permanently

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "password": "SecurePass123@",
  "confirmDelete": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Error Responses:**
- 400: Missing password or confirmDelete
- 401: Password is incorrect
- 404: User not found

---

### 3️⃣ PROFILE ENDPOINTS (Requires: Bearer Token)

#### **GET /api/profile**
Get user profile

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "user": { ... }
}
```

---

#### **PUT /api/profile**
Update user profile

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "name": "John Updated Doe",
  "college": "Stanford",
  "department": "AI & ML",
  "studentId": "STU123457",
  "language": "hi",
  "avatar": "https://...",
  "publicFocus": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

**Error Responses:**
- 400: Empty name, duplicate studentId
- 404: User not found

---

#### **PUT /api/profile/password**
Update password (alias for /api/auth/change-password)

Same as POST /api/auth/change-password

---

#### **POST /api/profile/toggle-public-focus**
Toggle public focus visibility

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Public focus enabled",
  "publicFocus": true
}
```

---

#### **DELETE /api/profile**
Delete user profile

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "password": "SecurePass123@",
  "confirmDelete": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile deleted successfully"
}
```

---

## 🗄️ DATABASE SCHEMA

### User Model
```javascript
{
  _id: ObjectId,
  name: String (required, trimmed),
  email: String (required, unique, lowercase, validated),
  password: String (required, hashed, min 8 chars),
  college: String (optional),
  department: String (optional),
  studentId: String (optional, unique),
  role: Enum ['student', 'faculty'] (default: 'student'),
  publicFocus: Boolean (default: false),
  focusScore: Number (default: 0),
  streak: Number (default: 0),
  totalFocusMinutes: Number (default: 0),
  avatar: String (optional),
  language: Enum ['en', 'hi', 'es', 'fr', 'de'] (default: 'en'),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔑 JWT Configuration

**Environment Variables:**
```
JWT_SECRET=your_super_secure_jwt_secret_64_chars_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_64_chars_here
JWT_REFRESH_EXPIRE=30d
```

**Token Usage:**
1. Access Token: Include in every authenticated request
   - Expires in 7 days
   - Sent in Authorization header: `Bearer <accessToken>`

2. Refresh Token: Used to get new access token
   - Expires in 30 days
   - Sent in POST body to /api/auth/refresh-token

---

## 🛡️ Security Measures Implemented

### Password Security
- ✅ Bcrypt hashing with 10 salt rounds
- ✅ Minimum 8 characters
- ✅ Must include uppercase, number, and special character
- ✅ Never returned in API responses

### Authentication Security
- ✅ JWT tokens with expiration
- ✅ Separate access and refresh tokens
- ✅ Bearer token validation on protected routes
- ✅ Protected password fields (select: false)

### Data Validation
- ✅ Email format validation
- ✅ Email uniqueness enforcement
- ✅ Student ID uniqueness enforcement
- ✅ Input sanitization and trimming
- ✅ Name cannot be empty

### Error Handling
- ✅ Meaningful error messages
- ✅ Proper HTTP status codes
- ✅ Duplicate key detection (code 11000)
- ✅ Validation error handling
- ✅ JWT token validation errors

### CORS Configuration
- ✅ Frontend URL: http://localhost:5173
- ✅ Credentials enabled
- ✅ Origin validation

---

## 📝 Testing the API

### Using cURL:

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123@",
    "college": "MIT",
    "department": "CS",
    "studentId": "STU123456"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123@"
  }'
```

**Get Current User (with token):**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🚀 Starting the Server

```bash
cd focusup-backend
npm install  # If not already installed
npm start    # Start the server on port 5000
```

Server will run on: **http://localhost:5000**

---

## ⚠️ Important Notes

1. **Never commit credentials** to Git. The .env file with MongoDB URL and JWT secret is configured.

2. **Password must satisfy ALL requirements:**
   - Length: 8+ characters
   - Uppercase: At least one (A-Z)
   - Number: At least one (0-9)
   - Special Char: At least one (@$!%*?&)

3. **Email and Student ID are unique** - Second registrations with same email/studentId will be rejected

4. **Always use HTTPS in production** - JWT tokens should only be transmitted over secure connections

5. **Token expiration** - Access tokens expire in 7 days, use refresh token to get new one

6. **Database connection** - Ensure MongoDB is connected and credentials are correct

---

✅ **All authentication and user management features are production-ready!**
