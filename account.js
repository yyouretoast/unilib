document.addEventListener('DOMContentLoaded', function() {
    // Login form handler
    const loginForm = document.getElementById('loginForm');
    
    loginForm.onsubmit = function(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        if(!username || !password) {
            showMessage('Please fill all fields', 'error');
            return;
        }
        
        // Simple login request
        fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.message === 'Login successful') {
                showMessage('Login successful!', 'success');
                window.location.href = 'home.html';
            } else {
                showMessage('Login failed', 'error');
            }
        })
        .catch(error => {
            showMessage('Error connecting to server', 'error');
        });
    };
    
    // Simple message display
    function showMessage(message, type) {
        const messageDiv = document.getElementById('loginStatus');
        messageDiv.textContent = message;
        messageDiv.className = 'status-message ' + type;
    }
});