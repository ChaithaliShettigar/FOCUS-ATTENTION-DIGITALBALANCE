# FocusUp - Focus, Attention & Digital Balance Platform

> A comprehensive digital wellness platform designed to help students and professionals improve their focus, track productivity, and maintain healthy digital habits through gamified learning and community engagement.

## 🎯 Problem Statement

In today's hyper-connected digital world, maintaining focus and attention has become increasingly challenging. Students and professionals face:

- **Digital Distractions**: Constant notifications, social media, and digital interruptions disrupting deep work
- **Lack of Focus Tracking**: No systematic way to monitor and improve concentration levels
- **Attention Span Decline**: Reduced ability to sustain attention on important tasks
- **Poor Digital Habits**: Unhealthy screen time patterns and multitasking behaviors
- **Isolation in Learning**: Limited community support for building better focus habits
- **No Gamified Motivation**: Absence of engaging, reward-based systems to encourage consistent practice

## 💡 Solution Overview

**FocusUp** addresses these challenges through a comprehensive platform that combines:

### 🧠 Focus & Attention Training
- **Focus Sessions**: Timed productivity sessions with distraction blocking
- **Attention Exercises**: Scientifically-designed cognitive training modules
- **Progress Tracking**: Real-time focus score calculations and streak monitoring
- **Mini-Breaks**: Guided mindfulness and relaxation exercises

### 📊 Digital Balance Analytics
- **Usage Monitoring**: Track and analyze digital habits and screen time patterns
- **Productivity Insights**: Detailed analytics on focus sessions and improvement trends
- **Goal Setting**: Personal targets for daily focus minutes and digital wellness
- **Health Metrics**: Monitor the correlation between digital habits and productivity

### 🎮 Gamified Experience
- **Focus Score System**: Points-based progression with achievement unlocking
- **Streaks & Badges**: Daily consistency rewards and milestone celebrations
- **Leaderboards**: Friendly competition within study groups and communities
- **Challenges**: Weekly and monthly focus improvement challenges

### 👥 Community Features
- **Study Groups**: Create and join focus-oriented learning communities
- **Real-time Collaboration**: Multi-user synchronized study sessions
- **Peer Support**: Share progress, tips, and motivation with fellow users
- **Group Challenges**: Collaborative focus goals and team achievements

### 🌐 Cross-Platform Accessibility
- **Multi-Device Sync**: Seamless experience across all devices and browsers
- **Real-time Updates**: Live synchronization of progress and group activities
- **Offline Mode**: Continue tracking focus even without internet connection
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB Atlas** account or local MongoDB installation
- **Git** for version control

### 1. Clone the Repository
```bash
git clone https://github.com/ChaithaliShettigar/FOCUS-ATTENTION-DIGITALBALANCE.git
cd FOCUS-ATTENTION-DIGITALBALANCE
```

### 2. Backend Setup
```bash
cd focusup-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure your MongoDB connection in .env
# MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/focusup
```

**Important**: Update the `.env` file with your actual MongoDB Atlas credentials:
```env
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/focusup
JWT_SECRET=your_secure_jwt_secret_here
JWT_REFRESH_SECRET=your_secure_refresh_secret_here
```

### 3. Frontend Setup
```bash
cd ../focusup-frontend

# Install dependencies
npm install
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd focusup-backend
npm run dev
```
Backend will start on: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd focusup-frontend
npm run dev
```
Frontend will start on: `http://localhost:5173`

### 5. Access the Application
Open your browser and navigate to `http://localhost:5173`

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** authentication system
- **Socket.IO** for real-time communication
- **bcryptjs** for secure password hashing

### Frontend
- **React 18** with modern hooks
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **Zustand** for state management
- **React Router** for navigation
- **Axios** for API communication
- **React Hot Toast** for notifications

## 📱 Key Features

### 🎯 Focus Management
- ⏱️ Customizable focus session timers
- 📈 Real-time focus score calculation
- 🔥 Daily streak tracking
- 📊 Detailed progress analytics

### 👥 Group Collaboration
- 🏢 Create and manage study groups
- 👋 Join groups via unique codes
- 🏆 Group leaderboards and rankings
- 💬 Real-time group communication

### 🔍 User Discovery
- 🔎 Search users by username
- 👤 View public profiles and focus scores
- 🌟 Follow and connect with other users
- 📈 Compare progress with peers

### 🎨 User Experience
- 🌙 Dark/Light mode support
- 🌍 Multi-language support (English, Hindi, Spanish, French, German)
- 📱 Fully responsive design
- ♿ Accessibility-focused interface

## 👥 Team Details

### **Team Name**: Fourth Cortex

### **Team Members**:
- **Gowthami** - Frontend Developer & UI/UX Designer
- **Harshita Buddu Harikantra** - Backend Developer & Database Architect  
- **Darsha B Shetty** - Full-Stack Developer & API Integration
- **Chaithali R Shettigar** - Project Lead & System Architecture

## 📋 Project Structure

```
FOCUS-ATTENTION-DIGITALBALANCE/
├── focusup-backend/          # Node.js Express Backend
│   ├── controllers/          # Business logic controllers
│   ├── models/              # MongoDB data models
│   ├── routes/              # API route definitions
│   ├── middleware/          # Authentication & validation
│   ├── config/              # Database configuration
│   └── utils/               # Helper utilities
├── focusup-frontend/        # React Frontend Application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Main application pages
│   │   ├── services/        # API service layer
│   │   ├── hooks/           # Custom React hooks
│   │   └── store/           # State management
│   └── public/              # Static assets
└── docs/                    # Project documentation
```

## 🔒 Security Features

- **JWT Authentication** with access and refresh tokens
- **Password Encryption** using bcryptjs with salt rounds
- **Input Validation** and sanitization on all endpoints
- **CORS Protection** with configured origins
- **Environment Variables** for sensitive configuration
- **Rate Limiting** to prevent API abuse

## 📖 API Documentation

The backend provides RESTful APIs for:

- **Authentication**: Register, login, logout, token refresh
- **User Management**: Profile CRUD, password management
- **Focus Sessions**: Session tracking, analytics, progress
- **Groups**: Create, join, manage study groups
- **User Discovery**: Search users, view profiles

Detailed API documentation is available in the `focusup-backend/` directory.

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or need help setting up the project:

1. Check the existing [Issues](https://github.com/ChaithaliShettigar/FOCUS-ATTENTION-DIGITALBALANCE/issues)
2. Create a new issue with detailed description
3. Contact the development team

## 🎉 Acknowledgments

- Thanks to all contributors and testers
- Inspired by digital wellness research and mindfulness practices
- Built with modern web development best practices

---

**Happy Focusing! 🧠✨**

*Built with ❤️ by Team Fourth Cortex*