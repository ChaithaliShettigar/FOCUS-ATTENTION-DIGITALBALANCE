import Group from '../models/Group.js'
import User from '../models/User.js'

// Create group
export const createGroup = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Group name is required' })
    }

    // Generate unique 4-character code
    const code = Math.random().toString(36).slice(2, 6).toUpperCase()

    const group = await Group.create({
      name,
      description,
      code,
      createdBy: req.user.id,
      isPublic: isPublic || false,
      members: [{ userId: req.user.id, role: 'admin' }],
    })

    res.status(201).json({
      success: true,
      group,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all groups for user
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      $or: [
        { createdBy: req.user.id },
        { 'members.userId': req.user.id },
      ],
    }).populate('createdBy', 'name email')

    res.status(200).json({
      success: true,
      count: groups.length,
      groups,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get single group
export const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email')

    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }

    res.status(200).json({
      success: true,
      group,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Add member to group
export const addMember = async (req, res) => {
  try {
    const { userId } = req.body
    const groupId = req.params.id

    const group = await Group.findById(groupId)

    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }

    // Check if user is member
    const isMember = group.members.some((m) => m.userId.toString() === userId)
    if (isMember) {
      return res.status(400).json({ message: 'User already in group' })
    }

    group.members.push({ userId, role: 'member' })
    await group.save()

    res.status(200).json({
      success: true,
      group,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Remove member from group
export const removeMember = async (req, res) => {
  try {
    const { userId } = req.body
    const groupId = req.params.id

    const group = await Group.findById(groupId)

    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }

    group.members = group.members.filter((m) => m.userId.toString() !== userId)
    await group.save()

    res.status(200).json({
      success: true,
      group,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update group
export const updateGroup = async (req, res) => {
  try {
    const groupId = req.params.id
    const { name, description, isPublic } = req.body

    let group = await Group.findById(groupId)

    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }

    if (group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this group' })
    }

    if (name) group.name = name
    if (description) group.description = description
    if (isPublic !== undefined) group.isPublic = isPublic

    await group.save()

    res.status(200).json({
      success: true,
      group,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete group
export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)

    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }

    if (group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    await Group.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Group deleted',
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Join group by code
export const joinGroupByCode = async (req, res) => {
  try {
    const { code, userName } = req.body

    if (!code) {
      return res.status(400).json({ message: 'Group code is required' })
    }

    const group = await Group.findOne({ code: code.toUpperCase() })

    if (!group) {
      return res.status(404).json({ message: 'Group not found with that code' })
    }

    // Check if already a member
    const isMember = group.members.some((m) => m.userId.toString() === req.user.id)
    if (isMember) {
      return res.status(400).json({ message: 'You are already a member of this group' })
    }

    // Add member
    group.members.push({
      userId: req.user.id,
      role: 'member',
    })

    await group.save()

    res.status(200).json({
      success: true,
      group,
      message: `Successfully joined ${group.name}`,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Share resource to group
export const shareResource = async (req, res) => {
  try {
    const { contentId, title, type, url } = req.body
    const groupId = req.params.id

    const group = await Group.findById(groupId)

    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }

    // Check if user is member
    const isMember = group.members.some((m) => m.userId.toString() === req.user.id)
    if (!isMember) {
      return res.status(403).json({ message: 'You must be a member to share resources' })
    }

    // Add resource
    group.resources.push({
      id: contentId,
      title,
      link: url,
      type,
      addedBy: req.user.id,
    })

    await group.save()

    res.status(200).json({
      success: true,
      group,
      message: 'Resource shared successfully',
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get group leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const groupId = req.params.id

    const group = await Group.findById(groupId).populate('leaderboard.userId', 'name focusScore')

    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }

    // Sort leaderboard by focus score
    const sortedLeaderboard = group.leaderboard.sort((a, b) => b.focusScore - a.focusScore)

    res.status(200).json({
      success: true,
      leaderboard: sortedLeaderboard,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

