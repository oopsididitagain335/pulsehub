// DOM Elements
const channelsContainer = document.getElementById('channels-container');
const chatHeader = document.getElementById('chat-header');

// Load channels
async function loadChannels(serverId) {
    try {
        const response = await fetch(`/api/channels/server/${serverId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            window.channels = await response.json();
            renderChannels();
            
            // Load first channel by default
            if (window.channels.length > 0) {
                const firstChannel = window.channels[0];
                openChannel(firstChannel);
            }
        }
    } catch (error) {
        console.error('Error loading channels:', error);
    }
}

// Render channels
function renderChannels() {
    channelsContainer.innerHTML = '';
    
    const textChannels = window.channels.filter(c => c.type === 'text');
    if (textChannels.length > 0) {
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'channel-category';
        categoryHeader.textContent = 'Text Channels';
        channelsContainer.appendChild(categoryHeader);
        
        textChannels.forEach(channel => {
            const channelEl = document.createElement('div');
            channelEl.className = 'channel';
            channelEl.dataset.channelId = channel._id;
            
            if (window.currentChannel && channel._id === window.currentChannel._id) {
                channelEl.classList.add('active');
            }
            
            const icon = document.createElement('span');
            icon.className = 'icon';
            icon.textContent = '#';
            channelEl.appendChild(icon);
            
            const name = document.createElement('span');
            name.textContent = channel.name;
            channelEl.appendChild(name);
            
            channelEl.addEventListener('click', () => {
                openChannel(channel);
            });
            
            channelsContainer.appendChild(channelEl);
        });
    }
    
    const voiceChannels = window.channels.filter(c => c.type === 'voice');
    if (voiceChannels.length > 0) {
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'channel-category';
        categoryHeader.textContent = 'Voice Channels';
        channelsContainer.appendChild(categoryHeader);
        
        voiceChannels.forEach(channel => {
            const channelEl = document.createElement('div');
            channelEl.className = 'channel';
            channelEl.dataset.channelId = channel._id;
            
            const icon = document.createElement('span');
            icon.className = 'icon';
            icon.textContent = '🔊';
            channelEl.appendChild(icon);
            
            const name = document.createElement('span');
            name.textContent = channel.name;
            channelEl.appendChild(name);
            
            channelEl.addEventListener('click', () => {
                openChannel(channel);
            });
            
            channelsContainer.appendChild(channelEl);
        });
    }
}

// Open channel
async function openChannel(channel) {
    window.currentChannel = channel;
    
    // Update active channel
    document.querySelectorAll('.channel').forEach(el => {
        if (el.dataset.channelId === channel._id) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
    
    // Update chat header
    chatHeader.innerHTML = '';
    const icon = document.createElement('span');
    icon.className = 'channel-icon';
    icon.textContent = '#';
    chatHeader.appendChild(icon);
    
    const title = document.createElement('h2');
    title.textContent = channel.name;
    chatHeader.appendChild(title);
    
    // Load messages
    await loadMessages(channel._id);
    
    // Join socket room
    if (window.socket) {
        window.socket.emit('joinChannel', channel._id, window.currentUser.id);
    }
}
