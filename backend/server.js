const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Routes
const authRoutes = require('./routes/auth');
const serverRoutes = require('./routes/servers');
const channelRoutes = require('./routes/channels');
const messageRoutes = require('./routes/messages');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: "*", // In production, replace with your frontend URL
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pulsehub', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

// Socket.IO Logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a channel
  socket.on('joinChannel', (channelId, userId) => {
    socket.join(channelId);
    console.log(`User ${userId} joined channel ${channelId}`);
  });

  // Leave a channel
  socket.on('leaveChannel', (channelId, userId) => {
    socket.leave(channelId);
    console.log(`User ${userId} left channel ${channelId}`);
  });

  // Send message
  socket.on('sendMessage', async (messageData) => {
    try {
      const { channelId, content, author, serverId } = messageData;
      
      // Create and save message
      const Message = require('./models/Message');
      const newMessage = new Message({
        content,
        author,
        channel: channelId,
        server: serverId
      });
      
      const savedMessage = await newMessage.save();
      
      // Populate author data
      const populatedMessage = await Message.findById(savedMessage._id)
        .populate('author', 'username avatar')
        .exec();
        
      // Emit message to all users in the channel
      io.to(channelId).emit('newMessage', populatedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`PulseHub server running on port ${PORT}`);
});

module.exports = { app, io };
