import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import { errorHandler } from './middleware/errorHandler.js'

// Routes
import authRoutes from './routes/auth.js'
import sessionRoutes from './routes/sessions.js'
import groupRoutes from './routes/groups.js'
import contentRoutes from './routes/content.js'
import analyticsRoutes from './routes/analytics.js'
import profileRoutes from './routes/profile.js'

dotenv.config()

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}))

// Connect to Database
connectDB()

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/groups', groupRoutes)
app.use('/api/content', contentRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/profile', profileRoutes)

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error.message)
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please free the port or use a different one.`)
  }
  process.exit(1)
})

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message)
  server.close(() => process.exit(1))
})
