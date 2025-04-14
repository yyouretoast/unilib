document.addEventListener('DOMContentLoaded', function() {
    // Load all books when page loads
    fetchAllBooks();
    
    // Setup search functionality
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    
    searchButton.addEventListener('click', function() {
        performSearch();
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Function to fetch all books
    function fetchAllBooks() {
        fetch('http://localhost:3000/api/books')
            .then(response => response.json())
            .then(books => {
                displayBooks(books);
            })
            .catch(error => {
                console.error('Error fetching books:', error);
                document.getElementById('booksList').innerHTML = '<p>Error loading books. Please try again later.</p>';
            });
    }
    
    // Function to search books
    function performSearch() {
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm === '') {
            fetchAllBooks();
            return;
        }
        
        // Query the API with search term
        fetch(`http://localhost:3000/api/books/search?title=${encodeURIComponent(searchTerm)}`)
            .then(response => response.json())
            .then(books => {
                displayBooks(books);
            })
            .catch(error => {
                console.error('Error searching books:', error);
                document.getElementById('booksList').innerHTML = '<p>Error searching books. Please try again later.</p>';
            });
    }
    
    // Function to display books
    function displayBooks(books) {
        const booksListElement = document.getElementById('booksList');
        
        if (books.length === 0) {
            booksListElement.innerHTML = '<p>No books found matching your search.</p>';
            return;
        }
        
        let booksHTML = '';
        books.forEach(book => {
            booksHTML += `
                <div class="book-card">
                    <div class="book-cover">
                        <img src="/api/placeholder/120/180" alt="${book.title} cover">
                    </div>
                    <div class="book-info">
                        <h3>${book.title}</h3>
                        <p class="author">by ${book.author}</p>
                        <p class="genre">${book.genre || 'Uncategorized'}</p>
                        <p class="status ${book.available_quantity > 0 ? 'available' : 'unavailable'}">
                            ${book.available_quantity > 0 ? 'Available' : 'Unavailable'}
                        </p>
                        <a href="booking.html?bookId=${book.book_id}" class="reserve-btn">Reserve</a>
                    </div>
                </div>
            `;
        });
        
        booksListElement.innerHTML = booksHTML;
    }
});