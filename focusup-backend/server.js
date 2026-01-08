import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import { errorHandler } from './middleware/errorHandler.js'
import initSessionSocket from './realtime/sessionSocket.js'

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

// Connect to Database (don't await here, let it connect in background)
connectDB().catch(err => console.error('DB connection failed:', err))

// Root route
app.get('/', (req, res) => {
  res.json({ message: '✅ Backend is working' })
})

// Health route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// Mount routes with logs
console.log('Loading routes...')
app.use('/api/auth', authRoutes);         console.log('✅ auth routes loaded')
app.use('/api/sessions', sessionRoutes);  console.log('✅ sessions routes loaded')
app.use('/api/groups', groupRoutes);      console.log('✅ groups routes loaded')
app.use('/api/content', contentRoutes);   console.log('✅ content routes loaded')
app.use('/api/analytics', analyticsRoutes); console.log('✅ analytics routes loaded')
app.use('/api/profile', profileRoutes);   console.log('✅ profile routes loaded')
console.log('✅ Routes loaded successfully')

// Debug endpoint: List ALL registered routes
app.get('/debug/routes', (req, res) => {
  const routes = []
  
  function extractRoutes(stack, basePath = '') {
    stack.forEach((middleware) => {
      if (middleware.route) {
        // Direct route
        const methods = Object.keys(middleware.route.methods).map(m => m.toUpperCase()).join(', ')
        routes.push({
          method: methods,
          path: basePath + middleware.route.path,
          type: 'route'
        })
      } else if (middleware.name === 'router' && middleware.handle.stack) {
        // Nested router - extract base path from regexp
        const regexpSource = middleware.regexp.source
        let routerPath = basePath
        
        // Extract path from regexp like /^\/api\/auth\/?(?=\/|$)/i
        const match = regexpSource.match(/^\^\\\/(.+?)\\\//);
        if (match) {
          routerPath = '/' + match[1].replace(/\\\//g, '/')
        }
        
        // Recursively extract routes from nested router
        extractRoutes(middleware.handle.stack, routerPath)
      }
    })
  }
  
  extractRoutes(app._router.stack)
  
  // Sort by path
  routes.sort((a, b) => a.path.localeCompare(b.path))
  
  res.json({
    totalRoutes: routes.length,
    routes: routes,
    summary: {
      public: routes.filter(r => r.path === '/' || r.path.startsWith('/api/health') || r.path.startsWith('/api/auth')).length,
      protected: routes.filter(r => !['/', '/api/health', '/debug/routes'].includes(r.path) && !r.path.startsWith('/api/auth')).length,
      debug: routes.filter(r => r.path.startsWith('/debug')).length
    }
  })
})

// 404 handler MUST be before error handler
app.use((req, res) => {
  console.error(`❌ Route not found: ${req.method} ${req.path}`)
  res.status(404).json({ message: 'Route not found', path: req.path, method: req.method })
})

// Error handling MUST be last
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  initSessionSocket(server)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err)
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err)
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
