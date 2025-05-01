const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

// Update CORS configuration to allow all origins in development
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
}));
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'library_db',
    port: 3306
}).promise();

// Test database connection
db.connect(err => {
    if (err) {
        console.error('Failed to connect', err);
        return;
    }
    console.log('Connected successfully!');
});

// Simple error handler
function handleError(res, err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Something went wrong' });
}

// Book functions
async function getAllBooks(req, res) {
    try {
        const [books] = await db.query(`
            SELECT b.*, 
                   COALESCE(AVG(br.rating), 0.00) as average_rating,
                   COUNT(br.review_id) as review_count
            FROM books b
            LEFT JOIN book_reviews br ON b.book_id = br.book_id
            GROUP BY b.book_id
            ORDER BY b.date_added DESC`);
        res.json(books);
    } catch (err) {
        handleError(res, err);
    }
}

async function getBookById(req, res) {
    const id = req.params.bookId;
    try {
        const [books] = await db.query(`
            SELECT b.*, 
                   COALESCE(AVG(br.rating), 0.00) as average_rating,
                   COUNT(br.review_id) as review_count
            FROM books b
            LEFT JOIN book_reviews br ON b.book_id = br.book_id
            WHERE b.book_id = ?
            GROUP BY b.book_id`, [id]);

        if (books.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(books[0]);
    } catch (err) {
        handleError(res, err);
    }
}

async function addBook(req, res) {
    const { 
        title, author, isbn, publication_year, quantity, genre, 
        description, language, publisher, page_count 
    } = req.body;
    
    if (!title || !author || !isbn) {
        return res.status(400).json({ message: 'Please provide title, author and ISBN' });
    }

    try {
        const [existing] = await db.query('SELECT book_id FROM books WHERE isbn = ?', [isbn]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'A book with this ISBN already exists' });
        }

        const query = `
            INSERT INTO books (
                title, author, isbn, publication_year, quantity, 
                available_quantity, genre, description, language, 
                publisher, page_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const [result] = await db.query(query, [
            title, author, isbn, publication_year, quantity,
            quantity, // initially available_quantity equals quantity
            genre || null,
            description || null,
            language || 'English',
            publisher || null,
            page_count || null
        ]);

        res.status(201).json({ 
            message: 'Book added successfully',
            bookId: result.insertId,
            book: {
                book_id: result.insertId,
                title,
                author,
                isbn,
                publication_year,
                quantity,
                available_quantity: quantity,
                genre,
                description,
                language,
                publisher,
                page_count
            }
        });
    } catch (error) {
        console.error('Error adding book:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ message: 'A book with this ISBN already exists' });
        } else {
            res.status(500).json({ message: 'Error adding book', error: error.message });
        }
    }
}

async function updateBook(req, res) {
    const id = req.params.bookId;
    const { 
        title, author, isbn, publication_year, quantity, genre,
        description, language, publisher, page_count 
    } = req.body;
    
    try {
        // Check if book exists
        const [existing] = await db.query('SELECT * FROM books WHERE book_id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Calculate new available quantity
        const quantityDiff = quantity - existing[0].quantity;
        const newAvailableQuantity = existing[0].available_quantity + quantityDiff;
        
        if (newAvailableQuantity < 0) {
            return res.status(400).json({ message: 'Cannot reduce quantity below number of borrowed books' });
        }

        const query = `
            UPDATE books 
            SET title=?, author=?, isbn=?, publication_year=?, 
                quantity=?, available_quantity=?, genre=?, description=?, 
                language=?, publisher=?, page_count=?,
                last_updated=NOW()
            WHERE book_id=?`;

        await db.query(query, [
            title, author, isbn, publication_year,
            quantity, newAvailableQuantity, genre, description,
            language, publisher, page_count,
            id
        ]);

        res.json({ 
            message: 'Book updated successfully',
            book: {
                book_id: id,
                title,
                author,
                isbn,
                publication_year,
                quantity,
                available_quantity: newAvailableQuantity,
                genre,
                description,
                language,
                publisher,
                page_count
            }
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ message: 'A book with this ISBN already exists' });
        } else {
            handleError(res, err);
        }
    }
}

async function deleteBook(req, res) {
    const id = req.params.bookId;
    try {
        // Check if book is currently borrowed
        const [loans] = await db.query(
            'SELECT COUNT(*) as active_loans FROM loans WHERE book_id = ? AND return_date IS NULL',
            [id]
        );

        if (loans[0].active_loans > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete book while it has active loans'
            });
        }

        await db.query('DELETE FROM books WHERE book_id = ?', [id]);
        res.json({ message: 'Book deleted successfully' });
    } catch (err) {
        handleError(res, err);
    }
}

// Member functions
function getAllMembers(req, res) {
    db.query('SELECT * FROM members', (err, results) => {
        if (err) return handleError(res, err);
        res.json(results);
    });
}

function addMember(req, res) {
    const { name, contact_info } = req.body;
    
    if (!name || !contact_info) {
        return res.status(400).json({ message: 'Please provide name and contact info' });
    }

    const query = 'INSERT INTO members (name, contact_info) VALUES (?, ?)';
    db.query(query, [name, contact_info], (err, result) => {
        if (err) return handleError(res, err);
        res.status(201).json({ message: 'Member added successfully' });
    });
}

// Loan functions
function borrowBook(req, res) {
    const { book_id, member_id } = req.body;
    
    if (!book_id || !member_id) {
        return res.status(400).json({ message: 'Please provide book and member ID' });
    }

    const query = 'INSERT INTO loans (book_id, member_id, loan_date) VALUES (?, ?, NOW())';
    db.query(query, [book_id, member_id], (err, result) => {
        if (err) return handleError(res, err);
        res.status(201).json({ message: 'Book borrowed successfully' });
    });
}

function returnBook(req, res) {
    const loan_id = req.params.loanId;
    
    const query = 'UPDATE loans SET return_date = NOW() WHERE loan_id = ?';
    db.query(query, [loan_id], (err, result) => {
        if (err) return handleError(res, err);
        res.json({ message: 'Book returned successfully' });
    });
}

// User functions
function loginUser(req, res) {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide username and password' });
    }

    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) return handleError(res, err);
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        res.json({ message: 'Login successful' });
    });
}

// Routes
app.post('/login', loginUser);

// Book routes
app.get('/books', async (req, res) => {
    try {
        const [books] = await db.query('SELECT * FROM books');
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Error loading books', error: error.message });
    }
});
app.get('/books/:bookId', getBookById);
app.get('/books', getAllBooks);
app.post('/books', addBook);
app.put('/books/:bookId', updateBook);
app.delete('/books/:bookId', deleteBook);

// Member routes
app.get('/members', getAllMembers);
app.post('/members', addMember);

// Loan routes
app.post('/loans', borrowBook);
app.put('/loans/:loanId/return', returnBook);

// Welcome route
app.get('/', (req, res) => {
    res.send('Welcome to Library Management System');
});

app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        // Check if user exists
        const [existingUsers] = await db.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Insert new user
        const [result] = await db.query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, password, 'student'] // Default role as student
        );

        res.status(201).json({
            message: 'User created successfully',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            message: 'Error creating user',
            error: error.message 
        });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide username and password' });
    }

    try {
        const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
        const [results] = await db.execute(query, [username, password]);
        
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const user = results[0];
        res.json({ 
            message: 'Login successful',
            user_id: user.user_id,
            username: user.username,
            role: user.role,
            token: 'dummy-token' // In production, use proper JWT token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});