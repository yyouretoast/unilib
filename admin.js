document.addEventListener('DOMContentLoaded', function() {
    // Check admin authentication
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('role');
    
    if (!token || userRole !== 'administrator') {
        window.location.href = 'account.html';
        return;
    }

    // Handle sidebar navigation
    const navLinks = document.querySelectorAll('.admin-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            e.target.closest('a').classList.add('active');
            
            // Handle section display based on href
            const targetId = e.target.closest('a').getAttribute('href').substring(1);
            showSection(targetId);
        });
    });

    // Add Book Button Handler
    document.getElementById('addBookBtn').addEventListener('click', () => {
        // Implement your add book logic here
        console.log('Add book clicked');
    });

    // Edit Book Handler
    window.editBook = function(bookId) {
        // Implement your edit book logic here
        console.log('Edit book:', bookId);
    };

    // Delete Book Handler
    window.deleteBook = function(bookId) {
        if (confirm('Are you sure you want to delete this book?')) {
            // Implement your delete book logic here
            console.log('Delete book:', bookId);
        }
    };

    // Logout Handler
    document.getElementById('logoutBtn').addEventListener('click', () => {
        // Clear all local storage items
        localStorage.clear();
        // Redirect to login page
        window.location.href = 'account.html';
    });

    // Initial load
    loadDashboardStats();
});

async function loadDashboardStats() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/stats', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load stats');
        }

        const stats = await response.json();
        
        // Update dashboard numbers
        document.getElementById('totalBooks').textContent = stats.totalBooks || '0';
        document.getElementById('activeUsers').textContent = stats.activeUsers || '0';
        document.getElementById('currentLoans').textContent = stats.currentLoans || '0';
        document.getElementById('overdueLoans').textContent = stats.overdueLoans || '0';
    } catch (error) {
        console.error('Error loading stats:', error);
        // Show error message to user
    }
}

function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.admin-content section');
    sections.forEach(section => section.style.display = 'none');
    
    // Show selected section
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
    }
}