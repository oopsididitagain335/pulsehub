// Global variables
let currentUser = null;
let currentServer = null;
let currentChannel = null;
let servers = [];
let channels = [];
let messages = [];
let friends = [];
let dms = [];

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const mainApp = document.getElementById('main-app');
const homeScreen = document.getElementById('home-screen');
const serverView = document.getElementById('server-view');

// Socket.IO connection
const socket = io();

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check for saved token
    const token = localStorage.getItem('token');
    if (token) {
        // Verify token and get user data
        fetch('/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Token verification failed');
        })
        .then(data => {
            currentUser = data.user;
            servers = data.servers;
            friends = data.friends;
            showHomeScreen();
            loadHomeData();
        })
        .catch(() => {
            localStorage.removeItem('token');
            showAuthScreen();
        });
    } else {
        showAuthScreen();
    }
});

function showAuthScreen() {
    authScreen.classList.add('active');
    mainApp.classList.remove('active');
    homeScreen.style.display = 'none';
    serverView.style.display = 'none';
}

function showHomeScreen() {
    authScreen.classList.remove('active');
    mainApp.classList.add('active');
    homeScreen.style.display = 'flex';
    serverView.style.display = 'none';
}

function showServerView() {
    authScreen.classList.remove('active');
    mainApp.classList.add('active');
    homeScreen.style.display = 'none';
    serverView.style.display = 'flex';
}
