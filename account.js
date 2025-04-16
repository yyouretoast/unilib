document.addEventListener('DOMContentLoaded', function() {
    // Toggle functionality
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const forms = document.querySelectorAll('.auth-form');
    const statusMessage = document.getElementById('statusMessage');

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active classes
            toggleBtns.forEach(b => b.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            
            // Add active class to clicked button and form
            btn.classList.add('active');
            const formId = btn.getAttribute('data-form') + 'Form';
            document.getElementById(formId).classList.add('active');
            
            // Clear status message and form fields when switching
            statusMessage.textContent = '';
            forms.forEach(form => form.reset());
        });
    });

    // Form handling
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusMessage = document.getElementById('statusMessage');
        statusMessage.textContent = 'Signing up...'; // Add loading message
        statusMessage.className = 'status-message info';
    
        try {
            const response = await fetch('http://localhost:3000/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: document.getElementById('signupUsername').value,
                    email: document.getElementById('signupEmail').value,
                    password: document.getElementById('signupPassword').value
                })
            });
    
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }
    
            statusMessage.textContent = 'Sign up successful! Please login.';
            statusMessage.className = 'status-message success';
            signupForm.reset();
            // Switch to login form
            document.querySelector('[data-form="login"]').click();
        } catch (error) {
            console.error('Signup error:', error);
            statusMessage.textContent = error.message;
            statusMessage.className = 'status-message error';
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
    
        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (response.ok) {
                statusMessage.textContent = 'Login successful!';
                statusMessage.className = 'status-message success';
                // Store auth token
                localStorage.setItem('authToken', data.token);
                // Redirect to library page
                setTimeout(() => {
                    window.location.href = 'unilib.html';
                }, 1000);
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            statusMessage.textContent = error.message;
            statusMessage.className = 'status-message error';
        }
    });
});