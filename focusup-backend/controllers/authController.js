import User from '../models/User.js'
import { generateToken } from '../utils/jwt.js'
import { validateEmail, validatePassword, validateName } from '../utils/validators.js'

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password, college, department, role } = req.body

    // Validation
    if (!validateName(name)) {
      return res.status(400).json({ message: 'Please provide a valid name' })
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email' })
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    // Check if user exists
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
      college,
      department,
      role: role || 'student',
    })

    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        department: user.department,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' })
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check password
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(user._id)

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        department: user.department,
        role: user.role,
        focusScore: user.focusScore,
        streak: user.streak,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
