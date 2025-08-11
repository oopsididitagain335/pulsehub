// DOM Elements
const usernameElement = document.getElementById('username');
const serversList = document.getElementById('servers-list');
const friendsList = document.getElementById('friends-list');
const dmsList = document.getElementById('dms-list');
const addFriendBtn = document.getElementById('add-friend-btn');
const addFriendModal = document.getElementById('add-friend-modal');
const closeModal = document.querySelector('.close-modal');

// Load home data
async function loadHomeData() {
    if (!currentUser) return;
    
    // Update username
    usernameElement.textContent = currentUser.username;
    
    // Render servers
    renderServers();
    
    // Render friends
    renderFriends();
    
    // Render DMs
    renderDMs();
}

// Render servers
function renderServers() {
    serversList.innerHTML = '';
    
    (servers || []).forEach(server => {
        const serverEl = document.createElement('div');
        serverEl.className = 'list-item';
        serverEl.dataset.serverId = server._id;
        
        const icon = document.createElement('i');
        icon.className = 'fas fa-hashtag icon';
        serverEl.appendChild(icon);
        
        const name = document.createElement('span');
        name.className = 'name';
        name.textContent = server.name;
        serverEl.appendChild(name);
        
        serverEl.addEventListener('click', () => {
            openServer(server);
        });
        
        serversList.appendChild(serverEl);
    });
}

// Render friends
function renderFriends() {
    friendsList.innerHTML = '';
    
    (friends || []).forEach(friend => {
        const friendEl = document.createElement('div');
        friendEl.className = 'list-item';
        friendEl.dataset.friendId = friend._id;
        
        const status = document.createElement('span');
        status.className = `status ${friend.status || 'offline'}`;
        friendEl.appendChild(status);
        
        const avatar = document.createElement('img');
        avatar.className = 'avatar';
        avatar.src = friend.avatar || 'https://i.pravatar.cc/150?img=6';
        avatar.alt = friend.username;
        friendEl.appendChild(avatar);
        
        const name = document.createElement('span');
        name.className = 'name';
        name.textContent = friend.username;
        friendEl.appendChild(name);
        
        friendEl.addEventListener('click', () => {
            openDM(friend);
        });
        
        friendsList.appendChild(friendEl);
    });
}

// Render DMs
function renderDMs() {
    dmsList.innerHTML = '';
    
    (friends || []).forEach(friend => {
        const dmEl = document.createElement('div');
        dmEl.className = 'list-item';
        dmEl.dataset.friendId = friend._id;
        
        const status = document.createElement('span');
        status.className = `status ${friend.status || 'offline'}`;
        dmEl.appendChild(status);
        
        const avatar = document.createElement('img');
        avatar.className = 'avatar';
        avatar.src = friend.avatar || 'https://i.pravatar.cc/150?img=6';
        avatar.alt = friend.username;
        dmEl.appendChild(avatar);
        
        const name = document.createElement('span');
        name.className = 'name';
        name.textContent = friend.username;
        dmEl.appendChild(name);
        
        dmEl.addEventListener('click', () => {
            openDM(friend);
        });
        
        dmsList.appendChild(dmEl);
    });
}

// Open server
function openServer(server) {
    window.currentServer = server;
    showServerView();
    loadServerData(server._id);
}

// Open DM
function openDM(friend) {
    // In a real app, you would create a DM channel
    // For now, just show a message
    alert(`Opening DM with ${friend.username}`);
}

// Add friend button
addFriendBtn.addEventListener('click', () => {
    addFriendModal.style.display = 'flex';
});

// Close modal
closeModal.addEventListener('click', () => {
    addFriendModal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === addFriendModal) {
        addFriendModal.style.display = 'none';
    }
});

// Add friend form
document.getElementById('add-friend-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('friend-username').value;
    
    try {
        const response = await fetch('/api/users/friends', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ username })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            addFriendModal.style.display = 'none';
            // Refresh friends list
            const userData = await fetch('/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }).then(res => res.json());
            
            friends = userData.friends || [];
            renderFriends();
            renderDMs();
        } else {
            alert(data.error || 'Could not add friend');
        }
    } catch (error) {
        alert('An error occurred while adding friend.');
    }
});
