document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const genreFilter = document.getElementById('genreFilter');
    const sortSelect = document.getElementById('sortBy');
    const booksList = document.getElementById('booksList');
    
    let allBooks = []; // Store all books

    // Initial load
    fetchAllBooks();
    
    // Event Listeners
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    genreFilter.addEventListener('change', filterAndDisplayBooks);
    sortSelect.addEventListener('change', filterAndDisplayBooks);

    // Fetch books
    async function fetchAllBooks() {
        try {
            showLoading();
            const response = await fetch('http://localhost:3000/books');
            if (!response.ok) throw new Error('Network response was not ok');
            allBooks = await response.json();
            filterAndDisplayBooks();
        } catch (error) {
            console.error('Error:', error);
            showError('Error loading books. Please try again.');
        }
    }

    // Handle search
    function handleSearch() {
        filterAndDisplayBooks();
    }

    // Filter and display books
    function filterAndDisplayBooks() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const selectedGenre = genreFilter.value;
        const sortBy = sortSelect.value;

        let filteredBooks = [...allBooks];

        // Apply search filter
        if (searchTerm) {
            filteredBooks = filteredBooks.filter(book => 
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm) ||
                book.isbn.includes(searchTerm)
            );
        }

        // Apply genre filter
        if (selectedGenre) {
            filteredBooks = filteredBooks.filter(book => 
                book.genre === selectedGenre
            );
        }

        // Apply sorting
        filteredBooks.sort((a, b) => {
            switch(sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'author':
                    return a.author.localeCompare(b.author);
                case 'year':
                    return (b.publication_year || 0) - (a.publication_year || 0);
                default:
                    return 0;
            }
        });

        displayBooks(filteredBooks);
    }

    // Display books
    function displayBooks(books) {
        if (!books || books.length === 0) {
            booksList.innerHTML = '<div class="no-results">No books found matching your criteria.</div>';
            return;
        }

        booksList.innerHTML = books.map(book => `
            <div class="book-card">
                <span class="book-status ${book.available_quantity > 0 ? 'available' : 'borrowed'}">
                    ${book.available_quantity > 0 ? 'Available' : 'Borrowed'}
                </span>
                <h3>${book.title}</h3>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>ISBN:</strong> ${book.isbn}</p>
                <p><strong>Genre:</strong> ${book.genre || 'Not specified'}</p>
                <p><strong>Available Copies:</strong> ${book.available_quantity}</p>
                <button 
                    onclick="window.location.href='booking.html?bookId=${book.book_id}'"
                    ${book.available_quantity === 0 ? 'disabled' : ''}>
                    ${book.available_quantity > 0 ? 'Reserve Book' : 'Not Available'}
                </button>
            </div>
        `).join('');
    }

    // Utility functions
    function showLoading() {
        booksList.innerHTML = '<div class="loading-spinner">Loading books...</div>';
    }

    function showError(message) {
        booksList.innerHTML = `<div class="error">${message}</div>`;
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});