// backend/routes/users.js
const express = require('express');
const User = require('../models/User');
const Server = require('../models/Server');
const auth = require('../middleware/auth');
const router = express.Router();

// Get current user with populated data
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('friends', 'username avatar status');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's servers
    const servers = await Server.find({ members: req.user.userId })
      .populate('ownerId', 'username avatar')
      .populate('channels');
    
    res.json({
      user,
      servers,
      friends: user.friends || []
    });
  } catch (error) {
    console.error('Error fetching user ', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('friends', 'username avatar status');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add friend
router.post('/friends', auth, async (req, res) => {
  try {
    const { friendId } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if already friends
    if (user.friends && user.friends.includes(friendId)) {
      return res.status(400).json({ error: 'Already friends' });
    }
    
    // Add friend to user
    if (!user.friends) {
      user.friends = [];
    }
    user.friends.push(friendId);
    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove friend
router.delete('/friends/:friendId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove friend
    if (user.friends) {
      user.friends = user.friends.filter(id => id.toString() !== req.params.friendId);
      await user.save();
    }
    
    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
