document.addEventListener('DOMContentLoaded', function() {
    // Get book ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('bookId');
    
    // If bookId exists, fetch and display book details
    if (bookId) {
        document.getElementById('bookId').value = bookId;
        fetchBookDetails(bookId);
    } else {
        document.getElementById('selectedBook').innerHTML = '<p>No book selected. Please return to the library and select a book.</p>';
        document.getElementById('reserveButton').disabled = true;
    }
    
    // Setup form submission
    const reservationForm = document.getElementById('reservationForm');
    reservationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        submitReservation();
    });
    
    // Function to fetch book details
    function fetchBookDetails(bookId) {
        fetch(`http://localhost:3000/api/books/${bookId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Book not found');
                }
                return response.json();
            })
            .then(book => {
                displayBookDetails(book);
            })
            .catch(error => {
                console.error('Error fetching book details:', error);
                document.getElementById('selectedBook').innerHTML = '<p>Error loading book details. Please try again.</p>';
                document.getElementById('reserveButton').disabled = true;
            });
    }
    
    // Function to display book details
    function displayBookDetails(book) {
        const selectedBookElement = document.getElementById('selectedBook');
        
        if (book.available_quantity <= 0) {
            selectedBookElement.innerHTML = `
                <p class="book-title">${book.title}</p>
                <p class="book-author">by ${book.author}</p>
                <p class="book-status error">This book is currently unavailable for reservation.</p>
            `;
            document.getElementById('reserveButton').disabled = true;
        } else {
            selectedBookElement.innerHTML = `
                <p class="book-title">${book.title}</p>
                <p class="book-author">by ${book.author}</p>
                <p class="book-genre">${book.genre || 'Uncategorized'}</p>
                <p class="book-status success">Available for reservation</p>
            `;
            document.getElementById('reserveButton').disabled = false;
        }
    }
    
    // Function to submit reservation
    function submitReservation() {
        const bookId = document.getElementById('bookId').value;
        const memberName = document.getElementById('memberName').value;
        const memberEmail = document.getElementById('memberEmail').value;
        const memberContact = document.getElementById('memberContact').value;
        
        // First, create or get member
        fetch('http://localhost:3000/api/members', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: memberName,
                contact_info: memberContact + ' | ' + memberEmail,
                address: ''
            })
        })
        .then(response => response.json())
        .then(member => {
            // Now create the loan/reservation
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14); // 2 weeks loan period
            
            return fetch('http://localhost:3000/api/loans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    book_id: bookId,
                    member_id: member.member_id,
                    due_date: dueDate.toISOString().split('T')[0]
                })
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Reservation failed');
            }
            return response.json();
        })
        .then(loan => {
            const statusElement = document.getElementById('reservationStatus');
            statusElement.classList.add('success');
            statusElement.innerHTML = 'Book reserved successfully! Please pick up your book within 24 hours.';
            
            // Reset the form
            document.getElementById('reservationForm').reset();
            
            // Disable the button to prevent multiple submissions
            document.getElementById('reserveButton').disabled = true;
        })
        .catch(error => {
            console.error('Error making reservation:', error);
            const statusElement = document.getElementById('reservationStatus');
            statusElement.classList.add('error');
            statusElement.innerHTML = 'Error making reservation. Please try again later.';
        });
    }
});