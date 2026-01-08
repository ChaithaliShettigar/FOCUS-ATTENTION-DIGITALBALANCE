import Group from '../models/Group.js'
import User from '../models/User.js'

// Create group
export const createGroup = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Group name is required' })
    }

    const group = await Group.create({
      name,
      description,
      createdBy: req.user.id,
      isPublic: isPublic || false,
      members: [{ userId: req.user.id, role: 'admin' }],
    })

    await group.populate('createdBy', 'name email username')
    await group.populate('members.userId', 'name email username focusScore')

    // Emit real-time event for group creation
    if (req.io) {
      req.io.emit('groupCreated', {
        group,
        createdBy: req.user.username
      })
    }

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
    })
      .populate('createdBy', 'name email username')
      .populate('members.userId', 'name email username focusScore')

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
      .populate('createdBy', 'name email username')
      .populate('members.userId', 'name email username focusScore')

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

// Join group by code
export const joinGroupByCode = async (req, res) => {
  try {
    const { code } = req.body

    if (!code || code.trim().length === 0) {
      return res.status(400).json({ message: 'Group code is required' })
    }

    const group = await Group.findOne({ code: code.toUpperCase() })

    if (!group) {
      return res.status(404).json({ message: 'Invalid group code. Group not found' })
    }

    // Check if user is already a member
    const isMember = group.members.some((m) => m.userId.toString() === req.user.id)
    if (isMember) {
      return res.status(400).json({ message: 'You are already a member of this group' })
    }

    // Add user to group
    group.members.push({ userId: req.user.id, role: 'member' })
    await group.save()

    // Populate after saving
    await group.populate('createdBy', 'name email username')
    await group.populate('members.userId', 'name email username focusScore')

    // Emit real-time event for group join
    if (req.io) {
      req.io.to(`group_${group._id}`).emit('memberJoinedGroup', {
        group,
        newMember: {
          userId: req.user.id,
          username: req.user.username,
          name: req.user.name,
          focusScore: req.user.focusScore
        }
      })
    }

    res.status(200).json({
      success: true,
      message: 'Successfully joined the group',
      group,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Leave group
export const leaveGroup = async (req, res) => {
  try {
    const groupId = req.params.id
    const userId = req.user.id

    const group = await Group.findById(groupId)

    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }

    // Check if user is a member
    const memberIndex = group.members.findIndex((m) => m.userId.toString() === userId)
    if (memberIndex === -1) {
      return res.status(400).json({ message: 'You are not a member of this group' })
    }

    // Prevent admin from leaving if they're the creator
    if (group.createdBy.toString() === userId && group.members[memberIndex].role === 'admin') {
      if (group.members.length > 1) {
        return res.status(400).json({ message: 'As the group creator, you must delete the group to leave it. Or transfer admin rights first.' })
      }
    }

    group.members.splice(memberIndex, 1)
    await group.save()

    await group.populate('createdBy', 'name email username')
    await group.populate('members.userId', 'name email username focusScore')

    // Emit real-time event for group leave
    if (req.io) {
      req.io.to(`group_${groupId}`).emit('memberLeftGroup', {
        group,
        leftMember: {
          userId: userId,
          username: req.user.username
        }
      })
    }

    res.status(200).json({
      success: true,
      message: 'Successfully left the group',
      group,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Add member to group (admin only)
export const addMember = async (req, res) => {
  try {
    const { userId } = req.body
    const groupId = req.params.id

    const group = await Group.findById(groupId)

    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }

    // Check if current user is admin
    const userMember = group.members.find((m) => m.userId.toString() === req.user.id)
    if (!userMember || userMember.role !== 'admin') {
      return res.status(403).json({ message: 'Only group admins can add members' })
    }

    // Check if user is already a member
    const isMember = group.members.some((m) => m.userId.toString() === userId)
    if (isMember) {
      return res.status(400).json({ message: 'User already in group' })
    }

    group.members.push({ userId, role: 'member' })
    await group.save()

    await group.populate('createdBy', 'name email username')
    await group.populate('members.userId', 'name email username focusScore')

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

    // Check if current user is admin
    const userMember = group.members.find((m) => m.userId.toString() === req.user.id)
    if (!userMember || userMember.role !== 'admin') {
      return res.status(403).json({ message: 'Only group admins can remove members' })
    }

    group.members = group.members.filter((m) => m.userId.toString() !== userId)
    await group.save()

    await group.populate('createdBy', 'name email username')
    await group.populate('members.userId', 'name email username focusScore')

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

    await group.populate('createdBy', 'name email username')
    await group.populate('members.userId', 'name email username focusScore')

    res.status(200).json({
      success: true,
      group,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Add resource to group
export const addResource = async (req, res) => {
  try {
    const { title, link, type, content } = req.body
    const groupId = req.params.id

    const group = await Group.findById(groupId)

    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }

    // Check if user is a member
    const isMember = group.members.some((m) => m.userId.toString() === req.user.id)
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' })
    }

    const resource = {
      id: Date.now().toString(),
      title,
      link,
      type,
      content,
      addedBy: req.user.id,
      addedAt: new Date()
    }

    group.resources.push(resource)
    await group.save()

    await group.populate('createdBy', 'name email username')
    await group.populate('members.userId', 'name email username focusScore')

    // Emit real-time event for new resource
    if (req.io) {
      req.io.to(`group_${groupId}`).emit('resourceAdded', {
        group,
        resource,
        addedBy: req.user.username
      })
    }

    res.status(201).json({
      success: true,
      group,
      resource
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get group resources
export const getGroupResources = async (req, res) => {
  try {
    const groupId = req.params.id

    const group = await Group.findById(groupId)
      .populate('createdBy', 'name email username')
      .populate('members.userId', 'name email username focusScore')

    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }

    // Check if user is a member
    const isMember = group.members.some((m) => m.userId.toString() === req.user.id)
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' })
    }

    res.status(200).json({
      success: true,
      resources: group.resources
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete resource from group
export const deleteResource = async (req, res) => {
  try {
    const { resourceId } = req.params
    const groupId = req.params.id

    const group = await Group.findById(groupId)

    if (!group) {
      return res.status(404).json({ message: 'Group not found' })
    }

    // Check if user is a member
    const isMember = group.members.some((m) => m.userId.toString() === req.user.id)
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' })
    }

    const resourceIndex = group.resources.findIndex((r) => r.id === resourceId)
    if (resourceIndex === -1) {
      return res.status(404).json({ message: 'Resource not found' })
    }

    const resource = group.resources[resourceIndex]

    // Check if user is the one who added the resource or is admin
    const userMember = group.members.find((m) => m.userId.toString() === req.user.id)
    const isResourceOwner = resource.addedBy.toString() === req.user.id
    const isAdmin = userMember && userMember.role === 'admin'

    if (!isResourceOwner && !isAdmin) {
      return res.status(403).json({ message: 'You can only delete resources you added or be an admin' })
    }

    group.resources.splice(resourceIndex, 1)
    await group.save()

    await group.populate('createdBy', 'name email username')
    await group.populate('members.userId', 'name email username focusScore')

    // Emit real-time event for resource deletion
    if (req.io) {
      req.io.to(`group_${groupId}`).emit('resourceDeleted', {
        group,
        resourceId,
        deletedBy: req.user.username
      })
    }

    res.status(200).json({
      success: true,
      group,
      message: 'Resource deleted successfully'
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
