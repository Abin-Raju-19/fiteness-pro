import { Router } from 'express'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'
import { Message } from '../models/Message.js'
import { User } from '../models/User.js'

export const messagesRouter = Router()

// Get contacts (people to chat with)
messagesRouter.get('/contacts', requireAuth, async (req: AuthedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })

  const currentUser = await User.findById(req.user.id)
  if (!currentUser) return res.status(404).json({ error: 'User not found' })

  let query = {}
  
  if (currentUser.role === 'user') {
    // Users can see Trainers and Admins
    query = { role: { $in: ['trainer', 'admin'] } }
  } else if (currentUser.role === 'trainer') {
    // Trainers can see Users and Admins
    query = { role: { $in: ['user', 'admin'] } }
  } else {
    // Admins can see everyone
    query = { _id: { $ne: currentUser._id } }
  }

  const contacts = await User.find(query).select('name email role')
  res.json({ contacts })
})

// Get conversation with a specific user
messagesRouter.get('/:otherUserId', requireAuth, async (req: AuthedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
  
  const { otherUserId } = req.params
  const myId = req.user.id

  const messages = await Message.find({
    $or: [
      { sender: myId, recipient: otherUserId },
      { sender: otherUserId, recipient: myId }
    ]
  }).sort({ createdAt: 1 })

  res.json({ messages })
})

// Send a message
messagesRouter.post('/', requireAuth, async (req: AuthedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' })

  const { recipientId, content } = req.body
  
  if (!recipientId || !content) {
    return res.status(400).json({ error: 'Recipient and content required' })
  }

  const message = await Message.create({
    sender: req.user.id,
    recipient: recipientId,
    content
  })

  res.json({ message })
})
