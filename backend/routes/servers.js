const express = require('express');
const Server = require('../models/Server');
const User = require('../models/User');
const Channel = require('../models/Channel');
const auth = require('../middleware/auth');
const router = express.Router();

// Get user's servers
router.get('/', auth, async (req, res) => {
  try {
    const servers = await Server.find({ members: req.user.userId })
      .populate('ownerId', 'username avatar')
      .populate('channels');
    
    res.json(servers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new server
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    
    // Create server
    const server = new Server({
      name,
      ownerId: req.user.userId,
      members: [req.user.userId]
    });
    
    await server.save();
    
    // Create default channel
    const defaultChannel = new Channel({
      name: 'general',
      type: 'text',
      server: server._id
    });
    
    await defaultChannel.save();
    
    // Add channel to server
    server.channels.push(defaultChannel._id);
    await server.save();
    
    res.status(201).json(server);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get server by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const server = await Server.findById(req.params.id)
      .populate('ownerId', 'username avatar')
      .populate('channels');
    
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }
    
    // Check if user is a member
    if (!server.members.includes(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(server);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update server
router.patch('/:id', auth, async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }
    
    // Check if user is the owner
    if (server.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { name, icon } = req.body;
    if (name) server.name = name;
    if (icon) server.icon = icon;
    
    await server.save();
    res.json(server);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete server
router.delete('/:id', auth, async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }
    
    // Check if user is the owner
    if (server.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Delete all channels
    await Channel.deleteMany({ server: server._id });
    
    // Delete server
    await server.deleteOne();
    
    res.json({ message: 'Server deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add member to server
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { userId } } = req.body;
    const server = await Server.findById(req.params.id);
    
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }
    
    // Check if user is a member (to invite)
    if (!server.members.includes(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Add user to server
    if (!server.members.includes(userId)) {
      server.members.push(userId);
      await server.save();
    }
    
    res.json(server);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove member from server
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }
    
    // Check if user is the owner or removing themselves
    if (server.ownerId.toString() !== req.user.userId && req.params.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Remove user from server
    server.members = server.members.filter(id => id.toString() !== req.params.userId);
    await server.save();
    
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
