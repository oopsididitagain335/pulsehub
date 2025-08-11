// DOM Elements
const serversContainer = document.getElementById('servers-container');
const createServerBtn = document.getElementById('create-server');
const serverHeader = document.getElementById('server-header');

// Load servers
async function loadServers() {
    try {
        const response = await fetch('/api/servers', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            servers = await response.json();
            renderServers();
        }
    } catch (error) {
        console.error('Error loading servers:', error);
    }
}

// Render servers
function renderServers() {
    serversContainer.innerHTML = '';
    
    servers.forEach(server => {
        const serverEl = document.createElement('div');
        serverEl.className = 'server';
        serverEl.dataset.serverId = server._id;
        
        if (window.currentServer && server._id === window.currentServer._id) {
            serverEl.classList.add('active');
        }
        
        // Use first letter of server name as icon
        const icon = document.createElement('div');
        icon.className = 'server-icon';
        icon.textContent = server.name.charAt(0).toUpperCase();
        serverEl.appendChild(icon);
        
        serverEl.addEventListener('click', () => {
            window.currentServer = server;
            document.querySelectorAll('.server').forEach(el => {
                el.classList.remove('active');
            });
            serverEl.classList.add('active');
            serverHeader.textContent = server.name;
            loadChannels(server._id);
        });
        
        serversContainer.appendChild(serverEl);
    });
}

// Create server
createServerBtn.addEventListener('click', async () => {
    const serverName = prompt('Enter server name:');
    
    if (serverName && serverName.trim()) {
        try {
            const response = await fetch('/api/servers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ name: serverName.trim() })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                loadServers();
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('An error occurred while creating the server.');
        }
    }
});
