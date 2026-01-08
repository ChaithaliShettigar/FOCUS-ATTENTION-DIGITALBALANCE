# FocusUp Backend

Node.js/Express/MongoDB backend for FocusUp - Focus Attention & Digital Balance platform.

## Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone or create the backend folder
2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB URI and other config

### Running

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Sessions
- `POST /api/sessions` - Create focus session
- `GET /api/sessions` - Get all user sessions
- `GET /api/sessions/:id` - Get single session
- `PUT /api/sessions/:id` - Update session
- `PUT /api/sessions/:id/end` - End session
- `DELETE /api/sessions/:id` - Delete session

### Groups
- `POST /api/groups` - Create group
- `GET /api/groups` - Get user's groups
- `GET /api/groups/:id` - Get single group
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/add-member` - Add member to group
- `POST /api/groups/:id/remove-member` - Remove member from group

### Content
- `POST /api/content` - Create content
- `GET /api/content` - Get user's content
- `GET /api/content/:id` - Get single content
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content

### Analytics
- `GET /api/analytics` - Get user analytics
- `GET /api/analytics/daily` - Get daily analytics (7 days)

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `PUT /api/profile/password` - Change password
- `POST /api/profile/toggle-public-focus` - Toggle public focus status

## Project Structure

```
focusup-backend/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/           # Route logic
│   ├── authController.js
│   ├── sessionController.js
│   ├── groupController.js
│   ├── contentController.js
│   ├── analyticsController.js
│   └── profileController.js
├── models/               # Mongoose schemas
│   ├── User.js
│   ├── Session.js
│   ├── Group.js
│   ├── Content.js
│   └── Analytics.js
├── routes/              # API routes
│   ├── auth.js
│   ├── sessions.js
│   ├── groups.js
│   ├── content.js
│   ├── analytics.js
│   └── profile.js
├── middleware/          # Express middleware
│   ├── auth.js         # JWT verification
│   └── errorHandler.js
├── utils/              # Helper functions
│   ├── jwt.js
│   └── validators.js
├── server.js           # Entry point
├── package.json
├── .env.example
└── README.md
```

## Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

Tokens are issued on login/register and expire in 7 days (configurable via JWT_EXPIRE).

## Database Models

### User
- Email & password (hashed with bcryptjs)
- Profile info (name, college, department, role)
- Stats (focusScore, streak, totalFocusMinutes)
- Settings (language, publicFocus)

### Session
- User reference
- Focus target & actual minutes
- Tab switch count
- Focus score calculation
- Status tracking (active, paused, completed, abandoned)

### Group
- Creator & members
- Resources & leaderboard
- Public/private visibility

### Content
- User's links, uploads, notes
- Tags & categories
- Public/private sharing

### Analytics
- Daily & weekly focus statistics
- Performance tracking
- Trend analysis

## Error Handling

API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request / Validation error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `500` - Server error

Error response format:
```json
{
  "message": "Error description"
}
```

## Environment Variables

See `.env.example` for all available configuration options.
