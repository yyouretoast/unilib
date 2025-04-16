const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3000;

// Basic middleware
app.use(cors());
app.use(express.json());

app.use(express.static('public'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/images', express.static(__dirname + '/images'));


// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'library_db',
    port: 3308
});

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
function getAllBooks(req, res) {
    db.query('SELECT * FROM books', (err, results) => {
        if (err) return handleError(res, err);
        res.json(results);
    });
}

function getBookById(req, res) {
    const id = req.params.bookId;
    db.query('SELECT * FROM books WHERE book_id = ?', [id], (err, results) => {
        if (err) return handleError(res, err);
        if (results.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(results[0]);
    });
}

function addBook(req, res) {
    const { title, author, isbn } = req.body;
    
    if (!title || !author || !isbn) {
        return res.status(400).json({ message: 'Please provide title, author and ISBN' });
    }

    const query = 'INSERT INTO books (title, author, isbn) VALUES (?, ?, ?)';
    db.query(query, [title, author, isbn], (err, result) => {
        if (err) return handleError(res, err);
        res.status(201).json({ message: 'Book added successfully' });
    });
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
app.get('/books', getAllBooks);
app.get('/books/:bookId', getBookById);
app.post('/books', addBook);

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

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});