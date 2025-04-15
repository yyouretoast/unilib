document.addEventListener('DOMContentLoaded', function() {
    // Handle signup form submission
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('signupUsername').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        
        // Send data to server
        fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Registration failed');
            }
            return response.json();
        })
        .then(data => {
            const statusElement = document.getElementById('signupStatus');
            statusElement.classList.add('success');
            statusElement.textContent = 'Registration successful! You can now login.';
            
            // Reset the form
            signupForm.reset();
        })
        .catch(error => {
            console.error('Error during registration:', error);
            const statusElement = document.getElementById('signupStatus');
            statusElement.classList.add('error');
            statusElement.textContent = 'Registration failed. Please try again.';
        });
    });
    
    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        // Send data to server
        fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Login failed');
            }
            return response.json();
        })
        .then(data => {
            // Store user data in localStorage for session management
            localStorage.setItem('user', JSON.stringify({
                username: data.username,
                role: data.role,
                token: data.token
            }));
            
            // Redirect to appropriate page based on role
            if (data.role === 'administrator' || data.role === 'librarian') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'user-dashboard.html';
            }
        })
        .catch(error => {
            console.error('Error during login:', error);
            const statusElement = document.getElementById('loginStatus');
            statusElement.classList.add('error');
            statusElement.textContent = 'Login failed. Please check your credentials.';
        });
    });
});