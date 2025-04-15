document.addEventListener('DOMContentLoaded', function() {
    // Get book ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('bookId');
    
    if (!bookId) {
        showError('No book selected');
        return;
    }
    
    // Handle form submission
    const reservationForm = document.getElementById('reservationForm');
    
    reservationForm.onsubmit = function(e) {
        e.preventDefault();
        
        const name = document.getElementById('memberName').value;
        const contact = document.getElementById('memberContact').value;
        
        if(!name || !contact) {
            showError('Please fill all fields');
            return;
        }
        
        // Simple reservation request
        fetch('http://localhost:3000/loans', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                book_id: bookId,
                member_name: name,
                contact_info: contact
            })
        })
        .then(response => response.json())
        .then(data => {
            showSuccess('Book reserved successfully!');
            reservationForm.reset();
        })
        .catch(error => {
            showError('Could not reserve book');
        });
    };
    
    // Simple message functions
    function showError(message) {
        const statusDiv = document.getElementById('reservationStatus');
        statusDiv.textContent = message;
        statusDiv.className = 'status-message error';
    }
    
    function showSuccess(message) {
        const statusDiv = document.getElementById('reservationStatus');
        statusDiv.textContent = message;
        statusDiv.className = 'status-message success';
    }
});