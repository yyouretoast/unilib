document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('role');
    
    if (!userId) {
        window.location.href = 'account.html?redirect=booking';
        return;
    }

    // Get book ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('bookId');
    
    if (!bookId) {
        showError('No book selected');
        return;
    }

    // Fetch book details and member info
    Promise.all([
        fetch(`http://localhost:3000/books/${bookId}`),
        fetch(`http://localhost:3000/members/user/${userId}`)
    ])
    .then(responses => Promise.all(responses.map(r => r.json())))
    .then(([book, member]) => {
        // Display book details
        document.getElementById('bookDetails').innerHTML = `
            <div class="book-card">
                <img src="${book.cover_image || 'default-book-cover.jpg'}" alt="${book.title}" class="book-cover">
                <h3>${book.title}</h3>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>ISBN:</strong> ${book.isbn}</p>
                <p><strong>Genre:</strong> ${book.genre}</p>
                <p><strong>Available Copies:</strong> ${book.available_quantity}/${book.quantity}</p>
                <p><strong>Language:</strong> ${book.language}</p>
                <div class="book-description">${book.description}</div>
            </div>
        `;

        // Pre-fill member information if available
        if (member) {
            document.getElementById('memberName').value = member.student_id || '';
            document.getElementById('memberContact').value = member.phone || '';
            document.getElementById('memberDepartment').value = member.department || '';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showError('Error loading details');
    });

    // Handle form submission
    const reservationForm = document.getElementById('reservationForm');
    
    reservationForm.onsubmit = async function(e) {
        e.preventDefault();
        
        const studentId = document.getElementById('memberName').value;
        const contact = document.getElementById('memberContact').value;
        const department = document.getElementById('memberDepartment').value;
        
        if(!studentId || !contact || !department) {
            showError('Please fill all required fields');
            return;
        }

        try {
            // First check if user can borrow more books
            const memberResponse = await fetch(`http://localhost:3000/members/user/${userId}`);
            const memberData = await memberResponse.json();

            if (memberData.current_borrowed >= memberData.max_books) {
                throw new Error('You have reached your maximum book limit');
            }

            // Create reservation
            const response = await fetch('http://localhost:3000/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    book_id: bookId,
                    user_id: userId,
                    member_id: memberData.member_id,
                    student_id: studentId,
                    contact: contact,
                    department: department
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Reservation failed');
            }

            showSuccess('Book reserved successfully! Please collect within 48 hours.');
            reservationForm.reset();

            // Redirect after successful reservation
            setTimeout(() => {
                window.location.href = 'unilib.html';
            }, 2000);

        } catch (error) {
            showError(error.message || 'Could not reserve book');
        }
    };
    
    // Status message functions
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

    // Add cancel button handler
    document.getElementById('cancelButton').addEventListener('click', () => {
        window.location.href = 'unilib.html';
    });
});