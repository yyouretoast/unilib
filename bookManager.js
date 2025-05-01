document.addEventListener('DOMContentLoaded', function() {
    loadBooks();

    // Close modal handlers
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    document.getElementById('addBookForm').addEventListener('submit', handleAddBook);
    document.getElementById('editBookForm').addEventListener('submit', handleEditBook);

    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    });

    async function loadBooks() {
        try {
            const response = await fetch('http://localhost:3000/books');
            if (!response.ok) throw new Error('Failed to fetch books');
            const books = await response.json();
            displayBooks(books);
        } catch (error) {
            showNotification('error', 'Failed to load books');
        }
    }

    function displayBooks(books) {
        const booksList = document.getElementById('booksList');
        booksList.innerHTML = books.map(book => `
            <div class="book-card" data-book-id="${book.book_id}">
                <h3>${book.title}</h3>
                <p>Author: ${book.author}</p>
                <p>ISBN: ${book.isbn}</p>
                <p>Available: ${book.available_quantity || 0}/${book.quantity || 0}</p>
                <div class="book-actions">
                    <button onclick="editBook(${book.book_id})" class="btn-edit">Edit</button>
                    <button onclick="deleteBook(${book.book_id})" class="btn-delete">Delete</button>
                </div>
            </div>
        `).join('');
    }

    async function handleAddBook(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const bookData = Object.fromEntries(formData);

        try {
            const response = await fetch('http://localhost:3000/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add book');
            }

            showNotification('success', 'Book added successfully');
            form.reset();
            document.getElementById('addBookModal').style.display = 'none';
            await loadBooks(); // Refresh the books list
        } catch (error) {
            showNotification('error', error.message);
        }
    }

    async function handleEditBook(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const bookData = Object.fromEntries(formData);
        const bookId = bookData.book_id;

        try {
            const response = await fetch(`http://localhost:3000/books/${bookId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update book');
            }

            showNotification('success', 'Book updated successfully');
            document.getElementById('editModal').style.display = 'none';
            await loadBooks();
        } catch (error) {
            showNotification('error', error.message);
        }
    }

    function showNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    window.editBook = async function(bookId) {
        try {
            const response = await fetch(`http://localhost:3000/books/${bookId}`);
            if (!response.ok) throw new Error('Failed to fetch book details');
            
            const book = await response.json();
            
            // Populate all fields in edit form
            document.getElementById('editBookId').value = book.book_id;
            document.getElementById('editTitle').value = book.title;
            document.getElementById('editAuthor').value = book.author;
            document.getElementById('editIsbn').value = book.isbn;
            document.getElementById('editPublicationYear').value = book.publication_year || '';
            document.getElementById('editQuantity').value = book.quantity;
            document.getElementById('editGenre').value = book.genre || '';
            document.getElementById('editDescription').value = book.description || '';
            document.getElementById('editLanguage').value = book.language || 'English';
            document.getElementById('editPublisher').value = book.publisher || '';
            document.getElementById('editPageCount').value = book.page_count || '';

            document.getElementById('editModal').style.display = 'block';
        } catch (error) {
            showNotification('error', 'Error loading book details');
        }
    };

    window.deleteBook = async function(bookId) {
        if (!confirm('Are you sure you want to delete this book?')) return;
        
        try {
            const response = await fetch(`http://localhost:3000/books/${bookId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete book');
            }
            
            showNotification('success', 'Book deleted successfully');
            await loadBooks();
        } catch (error) {
            showNotification('error', error.message);
        }
    };
});
