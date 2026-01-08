import User from '../models/User.js'

// Get profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { name, college, department, language, avatar } = req.body

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, college, department, language, avatar },
      { new: true, runValidators: true }
    )

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user.id).select('+password')

    const isMatch = await user.matchPassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    user.password = newPassword
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Toggle public focus
export const togglePublicFocus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    user.publicFocus = !user.publicFocus
    await user.save()

    res.status(200).json({
      success: true,
      publicFocus: user.publicFocus,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
