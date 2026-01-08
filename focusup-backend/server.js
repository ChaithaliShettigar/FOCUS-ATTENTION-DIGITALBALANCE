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
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
