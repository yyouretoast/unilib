document.addEventListener('DOMContentLoaded', function() {
    // Load books when page loads
    fetchAllBooks();
    
    // Search button click
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    
    searchButton.addEventListener('click', function() {
        const searchTerm = searchInput.value.trim();
        if (searchTerm === '') {
            fetchAllBooks();
        } else {
            searchBooks(searchTerm);
        }
    });
    
    // Simple fetch function
    function fetchAllBooks() {
        fetch('http://localhost:3000/books')
            .then(response => response.json())
            .then(books => displayBooks(books))
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('booksList').innerHTML = 'Error loading books.';
            });
    }
    
    // Simple search function
    function searchBooks(term) {
        fetch(`http://localhost:3000/books/search?title=${term}`)
            .then(response => response.json())
            .then(books => displayBooks(books))
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('booksList').innerHTML = 'Error searching books.';
            });
    }
    
    // Display books simply
    function displayBooks(books) {
        const booksList = document.getElementById('booksList');
        
        if (books.length === 0) {
            booksList.innerHTML = '<p>No books found.</p>';
            return;
        }
        
        let html = '';
        for(let book of books) {
            html += `
                <div class="book-card">
                    <h3>${book.title}</h3>
                    <p>Author: ${book.author}</p>
                    <p>ISBN: ${book.isbn}</p>
                    <a href="booking.html?bookId=${book.book_id}">
                        <button>Reserve Book</button>
                    </a>
                </div>
            `;
        }
        booksList.innerHTML = html;
    }
});