// DOM Elements
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message');

// Load messages
async function loadMessages(channelId) {
    try {
        const response = await fetch(`/api/messages/channel/${channelId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            window.messages = await response.json();
            renderMessages();
            scrollToBottom();
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Render messages
function renderMessages() {
    messagesContainer.innerHTML = '';
    
    window.messages.forEach(message => {
        addMessage(message);
    });
}

// Add a single message
function addMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = 'message';
    
    // Avatar
    const avatar = document.createElement('img');
    avatar.className = 'avatar';
    avatar.src = message.author.avatar || 'https://via.placeholder.com/40';
    avatar.alt = message.author.username;
    messageEl.appendChild(avatar);
    
    // Content
    const content = document.createElement('div');
    content.className = 'message-content';
    
    // Header
    const header = document.createElement('div');
    header.className = 'message-header';
    
    const username = document.createElement('span');
    username.className = 'username';
    username.textContent = message.author.username;
    header.appendChild(username);
    
    const timestamp = document.createElement('span');
    timestamp.className = 'timestamp';
    timestamp.textContent = formatTimestamp(message.createdAt);
    header.appendChild(timestamp);
    
    if (message.editedAt) {
        const edited = document.createElement('span');
        edited.className = 'edited';
        edited.textContent = '(edited)';
        header.appendChild(edited);
    }
    
    content.appendChild(header);
    
    // Body
    const body = document.createElement('div');
    body.className = 'message-body';
    body.textContent = message.content;
    content.appendChild(body);
    
    messageEl.appendChild(content);
    messagesContainer.appendChild(messageEl);
}

// Format timestamp
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Scroll to bottom
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send message
sendMessageBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

async function sendMessage() {
    const content = messageInput.value.trim();
    
    if (content && window.currentChannel) {
        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    content,
                    channel: window.currentChannel._id,
                    server: window.currentServer._id
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                messageInput.value = '';
                // Message will be received via socket
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
}

// Socket.IO event listeners
window.addEventListener('load', () => {
    if (window.socket) {
        window.socket.on('newMessage', (message) => {
            if (message.channel === window.currentChannel?._id) {
                addMessage(message);
                scrollToBottom();
            }
        });
    }
});
