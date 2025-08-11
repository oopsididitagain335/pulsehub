// Global variables
let currentUser = null;
let currentServer = null;
let currentChannel = null;
let servers = [];
let channels = [];
let messages = [];
let members = [];

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const mainApp = document.getElementById('main-app');

// Socket.IO connection
const socket = io();

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check for saved token
    const token = localStorage.getItem('token');
    if (token) {
        // Verify token and get user data
        fetch('/api/auth/me', {
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
        .then(user => {
            currentUser = user;
            showMainApp();
            loadServers();
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
}

function showMainApp() {
    authScreen.classList.remove('active');
    mainApp.classList.add('active');
}
