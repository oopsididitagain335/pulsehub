// backend/routes/messages.js
const express = require('express');
const Message = require('../models/Message');
const Channel = require('../models/Channel');
const auth = require('../middleware/auth');
const router = express.Router();

// Get messages for a channel
router.get('/channel/:channelId', auth, async (req, res) => {
  try {
    const { limit = 50, before } = req.query;
    
    // Verify user has access to the channel
    const channel = await Channel.findById(req.params.channelId).populate('server');
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    if (!channel.server.members.includes(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Build query
    const query = { channel: req.params.channelId };
    if (before) {
      query._id = { $lt: before };
    }
    
    // Get messages
    const messages = await Message.find(query)
      .populate('author', 'username avatar')
      .sort({ _id: -1 })
      .limit(parseInt(limit))
      .lean();
    
    // Reverse to chronological order
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new message
router.post('/', auth, async (req, res) => {
  try {
    const { content, channel, server, repliesTo } = req.body;
    
    // Verify user has access to the channel
    const channelDoc = await Channel.findById(channel).populate('server');
    if (!channelDoc) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    if (!channelDoc.server.members.includes(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Create message
    const message = new Message({
      content,
      author: req.user.userId,
      channel,
      server,
      repliesTo: repliesTo || null
    });
    
    await message.save();
    
    // Populate author data
    const populatedMessage = await Message.findById(message._id)
      .populate('author', 'username avatar');
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit a message
router.patch('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Check if user is the author
    if (message.author.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { content } = req.body;
    message.content = content;
    message.editedAt = new Date();
    
    await message.save();
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a message
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Check if user is the author or has permission
    if (message.author.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await message.deleteOne();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
