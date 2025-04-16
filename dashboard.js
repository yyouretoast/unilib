document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
        window.location.href = 'account.html';
        return;
    }

    // Load user data and dashboard content
    loadUserProfile();
    loadBorrowedBooks();
    loadReservations();
    loadNotifications();

    // Tab navigation
    const navLinks = document.querySelectorAll('.dashboard-nav a');
    const sections = document.querySelectorAll('.dashboard-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            
            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            e.target.classList.add('active');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Load user profile data
    async function loadUserProfile() {
        try {
            const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const userData = await response.json();
            
            document.getElementById('userName').textContent = userData.username;
            document.getElementById('userGreeting').textContent = userData.username;
            document.getElementById('userRole').textContent = userData.role;
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    // Load borrowed books
    async function loadBorrowedBooks() {
        try {
            const response = await fetch(`http://localhost:3000/api/loans/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const loans = await response.json();
            
            document.getElementById('borrowedCount').textContent = loans.length;
            
            // Update borrowed books list if it exists
            const borrowedList = document.getElementById('borrowedBooksList');
            if (borrowedList && loans.length > 0) {
                borrowedList.innerHTML = loans.map(loan => `
                    <div class="book-item">
                        <h4>${loan.book_title}</h4>
                        <p>Due Date: ${new Date(loan.due_date).toLocaleDateString()}</p>
                        <p>Status: ${loan.loan_status}</p>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading borrowed books:', error);
        }
    }

    // Load reservations
    async function loadReservations() {
        try {
            const response = await fetch(`http://localhost:3000/api/reservations/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const reservations = await response.json();
            
            document.getElementById('reservationsCount').textContent = reservations.length;
            
            // Update reservations list if it exists
            const reservationsList = document.getElementById('reservationsList');
            if (reservationsList && reservations.length > 0) {
                reservationsList.innerHTML = reservations.map(reservation => `
                    <div class="reservation-item">
                        <h4>${reservation.book_title}</h4>
                        <p>Reserved Until: ${new Date(reservation.expiry_date).toLocaleDateString()}</p>
                        <p>Status: ${reservation.status}</p>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading reservations:', error);
        }
    }

    // Load notifications
    async function loadNotifications() {
        try {
            const response = await fetch(`http://localhost:3000/api/notifications/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const notifications = await response.json();
            
            const badge = document.querySelector('.notification-badge');
            if (badge) {
                badge.textContent = notifications.filter(n => !n.is_read).length;
            }
            
            // Update notifications list if it exists
            const notificationsList = document.getElementById('notificationsList');
            if (notificationsList && notifications.length > 0) {
                notificationsList.innerHTML = notifications.map(notification => `
                    <div class="notification-item ${notification.is_read ? '' : 'unread'}">
                        <h4>${notification.title}</h4>
                        <p>${notification.message}</p>
                        <small>${new Date(notification.created_at).toLocaleString()}</small>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        window.location.href = 'account.html';
    });
});