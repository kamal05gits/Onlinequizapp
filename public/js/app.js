document.addEventListener('DOMContentLoaded', () => {
    const registerBtn = document.getElementById('registerBtn');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const createQuizBtn = document.getElementById('createQuizBtn');
    const takeQuizBtn = document.getElementById('takeQuizBtn');
    const welcomeSection = document.getElementById('welcome-section');

    const authModal = document.getElementById('auth-modal');
    const closeButton = authModal.querySelector('.close-button');
    const authTitle = document.getElementById('auth-title');
    const authForm = document.getElementById('auth-form');
    const authUsernameInput = document.getElementById('auth-username');
    const authPasswordInput = document.getElementById('auth-password');
    const authSubmitBtn = document.getElementById('auth-submit');
    const authMessage = document.getElementById('auth-message');
    const toggleAuthMode = document.getElementById('toggleAuthMode'); // ADDED

    const API_BASE_URL = window.location.origin;

    function updateAuthUI() {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');

        if (token && username) {
            registerBtn.style.display = 'none';
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            usernameDisplay.style.display = 'inline-block';
            usernameDisplay.textContent = `Welcome, ${username}!`;
            welcomeSection.style.display = 'block'; // Show welcome section if logged in
            authModal.style.display = 'none'; // Ensure modal is closed if already logged in
        } else {
            registerBtn.style.display = 'inline-block';
            loginBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
            usernameDisplay.style.display = 'none';
            usernameDisplay.textContent = '';
            welcomeSection.style.display = 'none'; // Hide welcome section if not logged in
            // CHANGED: Instead of clicking loginBtn, directly open modal and set mode
            authModal.style.display = 'flex'; // Use flex to center immediately
            authTitle.textContent = 'Login'; // Default to Login
            authSubmitBtn.textContent = 'Login';
            authForm.dataset.mode = 'login';
            authMessage.textContent = '';
            toggleAuthMode.textContent = 'New user? Register here.'; // Initial toggle text
        }
    }

    // Event Listeners for Home Page
    registerBtn.addEventListener('click', () => {
        authTitle.textContent = 'Register';
        authSubmitBtn.textContent = 'Register';
        authForm.dataset.mode = 'register';
        authMessage.textContent = '';
        toggleAuthMode.textContent = 'Already have an account? Login here.'; // Set toggle text for register mode
        authModal.style.display = 'block';
    });

    loginBtn.addEventListener('click', () => {
        authTitle.textContent = 'Login';
        authSubmitBtn.textContent = 'Login';
        authForm.dataset.mode = 'login';
        authMessage.textContent = '';
        toggleAuthMode.textContent = 'New user? Register here.'; // Set toggle text for login mode
        authModal.style.display = 'block';
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        alert('Logged out successfully!');
        updateAuthUI(); // This will now re-open the login modal
    });

    closeButton.addEventListener('click', () => {
        authModal.style.display = 'none';
        authForm.reset();
        authMessage.textContent = '';
        // If not logged in, ensure login modal is shown again on close unless navigating away
        if (!localStorage.getItem('token')) {
            // CHANGED: Re-open the modal directly instead of simulating click
            authModal.style.display = 'flex';
            authTitle.textContent = 'Login';
            authSubmitBtn.textContent = 'Login';
            authForm.dataset.mode = 'login';
            toggleAuthMode.textContent = 'New user? Register here.';
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target == authModal) {
            authModal.style.display = 'none';
            authForm.reset();
            authMessage.textContent = '';
            if (!localStorage.getItem('token')) {
                // CHANGED: Re-open the modal directly instead of simulating click
                authModal.style.display = 'flex';
                authTitle.textContent = 'Login';
                authSubmitBtn.textContent = 'Login';
                authForm.dataset.mode = 'login';
                toggleAuthMode.textContent = 'New user? Register here.';
            }
        }
    });

    // ADDED: Toggle between Login and Register modes within the modal
    toggleAuthMode.addEventListener('click', (e) => {
        e.preventDefault();
        authMessage.textContent = ''; // Clear previous messages
        if (authForm.dataset.mode === 'login') {
            authTitle.textContent = 'Register';
            authSubmitBtn.textContent = 'Register';
            authForm.dataset.mode = 'register';
            toggleAuthMode.textContent = 'Already have an account? Login here.';
        } else {
            authTitle.textContent = 'Login';
            authSubmitBtn.textContent = 'Login';
            authForm.dataset.mode = 'login';
            toggleAuthMode.textContent = 'New user? Register here.';
        }
    });

    // Authentication Form Submission
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = authUsernameInput.value;
        const password = authPasswordInput.value;
        const mode = authForm.dataset.mode;

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/${mode}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                authMessage.style.color = 'green';
                authMessage.textContent = data.msg;
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('username', data.username);
                setTimeout(() => {
                    authModal.style.display = 'none';
                    authForm.reset();
                    updateAuthUI(); // This will now show the welcome section
                }, 1000);
            } else {
                authMessage.style.color = 'red';
                authMessage.textContent = data.msg || 'Something went wrong!';
            }
        } catch (error) {
                console.error('Error during authentication:', error);
                authMessage.style.color = 'red';
                authMessage.textContent = 'Network error. Please try again.';
            }
        });

        createQuizBtn.addEventListener('click', () => {
            if (localStorage.getItem('token')) {
                window.location.href = '/create-quiz.html';
            } else {
                alert('Please login or register to create a quiz.');
                // Changed: Open modal directly
                authModal.style.display = 'flex';
                authTitle.textContent = 'Login';
                authSubmitBtn.textContent = 'Login';
                authForm.dataset.mode = 'login';
                toggleAuthMode.textContent = 'New user? Register here.';
            }
        });

        takeQuizBtn.addEventListener('click', () => {
            window.location.href = '/quiz-list.html';
        });

    // Initial UI update - crucial for checking login status on load
    updateAuthUI();
});