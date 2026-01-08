import Content from '../models/Content.js'

// Create content
export const createContent = async (req, res) => {
  try {
    const { title, description, type, url, tags, category, isPublic } = req.body

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: 'Title is required' })
    }

    if (!type || !['link', 'upload', 'note'].includes(type)) {
      return res.status(400).json({ message: 'Invalid content type' })
    }

    const content = await Content.create({
      userId: req.user.id,
      title,
      description,
      type,
      url,
      tags: tags || [],
      category: category || 'general',
      isPublic: isPublic || false,
    })

    res.status(201).json({
      success: true,
      content,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all content for user
export const getContent = async (req, res) => {
  try {
    const content = await Content.find({ userId: req.user.id }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: content.length,
      content,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get single content
export const getSingleContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)

    if (!content) {
      return res.status(404).json({ message: 'Content not found' })
    }

    if (content.userId.toString() !== req.user.id && !content.isPublic) {
      return res.status(403).json({ message: 'Not authorized to access this content' })
    }

    res.status(200).json({
      success: true,
      content,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update content
export const updateContent = async (req, res) => {
  try {
    let content = await Content.findById(req.params.id)

    if (!content) {
      return res.status(404).json({ message: 'Content not found' })
    }

    if (content.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    content = await Content.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      content,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete content
export const deleteContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)

    if (!content) {
      return res.status(404).json({ message: 'Content not found' })
    }

    if (content.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    await Content.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Content deleted',
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
