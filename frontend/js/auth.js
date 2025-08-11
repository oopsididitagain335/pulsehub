// DOM Elements
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authError = document.getElementById('auth-error');

// Tab switching
loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    authError.textContent = '';
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
    authError.textContent = '';
});

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const [email, password] = Array.from(loginForm.querySelectorAll('input')).map(el => el.value);
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            window.currentUser = data.user;
            showHomeScreen();
            loadHomeData();
        } else {
            authError.textContent = data.error || 'Login failed';
        }
    } catch (error) {
        authError.textContent = 'An error occurred. Please try again.';
    }
});

// Register form submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const [username, email, password] = Array.from(registerForm.querySelectorAll('input')).map(el => el.value);
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            window.currentUser = data.user;
            showHomeScreen();
            loadHomeData();
        } else {
            authError.textContent = data.error || 'Registration failed';
        }
    } catch (error) {
        authError.textContent = 'An error occurred. Please try again.';
    }
});
