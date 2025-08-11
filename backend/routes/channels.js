const express = require('express');
const Channel = require('../models/Channel');
const Server = require('../models/Server');
const auth = require('../middleware/auth');
const router = express.Router();

// Get channels for a server
router.get('/server/:serverId', auth, async (req, res) => {
  try {
    const channels = await Channel.find({ server: req.params.serverId }).sort('position');
    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new channel
router.post('/', auth, async (req, res) => {
  try {
    const { name, type, serverId } = req.body;
    
    // Verify user has access to the server
    const server = await Server.findById(serverId);
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }
    
    if (!server.members.includes(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Create channel
    const channel = new Channel({
      name,
      type,
      server: serverId
    });
    
    await channel.save();
    
    // Add channel to server
    server.channels.push(channel._id);
    await server.save();
    
    res.status(201).json(channel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update channel
router.patch('/:id', auth, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id).populate('server');
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    // Check if user is a member of the server
    if (!channel.server.members.includes(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { name, type } = req.body;
    if (name) channel.name = name;
    if (type) channel.type = type;
    
    await channel.save();
    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete channel
router.delete('/:id', auth, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id).populate('server');
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    
    // Check if user is a member of the server
    if (!channel.server.members.includes(req.user.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Remove channel from server
    channel.server.channels = channel.server.channels.filter(
      id => id.toString() !== channel._id.toString()
    );
    await channel.server.save();
    
    // Delete the channel
    await channel.deleteOne();
    
    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
