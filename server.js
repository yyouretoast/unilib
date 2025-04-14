const express = require('express');
const mysql = require('mysql2');
const app = express();
const expressPort = 3000; 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret_key';


app.use(express.json());

const dbConfig = {
    host: 'localhost',        
    user: 'root',            
    password: '',            
    database: 'library_db',    
    port: 3308                
};

// MySQL connection pool
const pool = mysql.createPool(dbConfig).promise();

// db test
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Successfully got a connection from the pool!');
        connection.release();
    } catch (err) {
        console.error('Error getting connection from pool:', err);
        console.error('Connection details:', dbConfig);
    }
};

testConnection();

// handle errors
const handleError = (res, error, message) => {
    console.error(message, error);
    
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Duplicate entry exists.' });
    }
    
    res.status(500).json({ error: message });
};


// Add a new book
const createBook = async (req, res) => {
    const { title, author, isbn, publication_year, genre, quantity } = req.body;
    const available_quantity = quantity;

    if (!title || !author || !isbn || !quantity) {
        return res.status(400).json({ error: 'Title, author, ISBN, and quantity are required.' });
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO Books (title, author, isbn, publication_year, genre, quantity, available_quantity) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, author, isbn, publication_year, genre, quantity, available_quantity]
        );

        console.log('Result of INSERT:', result);
        const newBookId = result.insertId;
        const [rows] = await pool.execute('SELECT * FROM Books WHERE book_id = ?', [newBookId]);
        
        res.status(201).json(rows[0]);
    } catch (error) {
        handleError(res, error, 'Failed to add book.');
    }
};

// Get all books
const getAllBooks = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM Books');
        res.status(200).json(rows);
    } catch (error) {
        handleError(res, error, 'Failed to fetch books.');
    }
};

// Get a book by ID
const getBookById = async (req, res) => {
    const bookId = req.params.bookId;
    try {
        const [rows] = await pool.execute('SELECT * FROM Books WHERE book_id = ?', [bookId]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ error: 'Book not found.' });
        }
    } catch (error) {
        handleError(res, error, 'Failed to fetch book.');
    }
};

// Update a book
const updateBook = async (req, res) => {
    const bookId = req.params.bookId;
    const { title, author, isbn, publication_year, genre, quantity } = req.body;

    if (!title || !author || !isbn || !quantity) {
        return res.status(400).json({ error: 'Title, author, ISBN, and quantity are required.' });
    }

    try {
        const [result] = await pool.execute(
            'UPDATE Books SET title = ?, author = ?, isbn = ?, publication_year = ?, genre = ?, quantity = ? WHERE book_id = ?',
            [title, author, isbn, publication_year, genre, quantity, bookId]
        );

        if (result.affectedRows > 0) {
            const [updatedRows] = await pool.execute('SELECT * FROM Books WHERE book_id = ?', [bookId]);
            res.status(200).json(updatedRows[0]);
        } else {
            res.status(404).json({ error: 'Book not found.' });
        }
    } catch (error) {
        handleError(res, error, 'Failed to update book.');
    }
};

// Delete a book
const deleteBook = async (req, res) => {
    const bookId = req.params.bookId;
    try {
        const [result] = await pool.execute('DELETE FROM Books WHERE book_id = ?', [bookId]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Book not found.' });
        }
    } catch (error) {
        handleError(res, error, 'Failed to delete book.');
    }
};

// Search for books
const searchBooks = async (req, res) => {
    const { title, author, genre } = req.query;
    
    try {
        let query = 'SELECT * FROM Books WHERE 1=1';
        const params = [];
        
        if (title) {
            query += ' AND title LIKE ?';
            params.push(`%${title}%`);
        }
        
        if (author) {
            query += ' AND author LIKE ?';
            params.push(`%${author}%`);
        }
        
        if (genre) {
            query += ' AND genre LIKE ?';
            params.push(`%${genre}%`);
        }
        
        const [rows] = await pool.execute(query, params);
        res.status(200).json(rows);
    } catch (error) {
        handleError(res, error, 'Failed to search books.');
    }
};


// Add a new member
const createMember = async (req, res) => {
    const { name, contact_info, address } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Member name is required.' });
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO Members (name, contact_info, address) VALUES (?, ?, ?)',
            [name, contact_info, address]
        );

        const newMemberId = result.insertId;
        const [rows] = await pool.execute('SELECT * FROM Members WHERE member_id = ?', [newMemberId]);
        
        res.status(201).json(rows[0]);
    } catch (error) {
        handleError(res, error, 'Failed to add member.');
    }
};

// Get all members
const getAllMembers = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM Members');
        res.status(200).json(rows);
    } catch (error) {
        handleError(res, error, 'Failed to fetch members.');
    }
};

// Get a member by ID
const getMemberById = async (req, res) => {
    const memberId = req.params.memberId;
    try {
        const [rows] = await pool.execute('SELECT * FROM Members WHERE member_id = ?', [memberId]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ error: 'Member not found.' });
        }
    } catch (error) {
        handleError(res, error, 'Failed to fetch member.');
    }
};

// Update a member
const updateMember = async (req, res) => {
    const memberId = req.params.memberId;
    const { name, contact_info, address } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Member name is required.' });
    }

    try {
        const [result] = await pool.execute(
            'UPDATE Members SET name = ?, contact_info = ?, address = ? WHERE member_id = ?',
            [name, contact_info, address, memberId]
        );

        if (result.affectedRows > 0) {
            const [updatedRows] = await pool.execute('SELECT * FROM Members WHERE member_id = ?', [memberId]);
            res.status(200).json(updatedRows[0]);
        } else {
            res.status(404).json({ error: 'Member not found.' });
        }
    } catch (error) {
        handleError(res, error, 'Failed to update member.');
    }
};

// Delete a member
const deleteMember = async (req, res) => {
    const memberId = req.params.memberId;
    try {
        const [result] = await pool.execute('DELETE FROM Members WHERE member_id = ?', [memberId]);
        if (result.affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Member not found.' });
        }
    } catch (error) {
        handleError(res, error, 'Failed to delete member.');
    }
};

// User registration
const registerUser = async (req, res) => {
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Username, password, and email are required.' });
    }
    
    try {
        // Check if username already exists
        const [existingUsers] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        
        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'Username already exists.' });
        }
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert new user as librarian (default role)
        const [result] = await pool.execute(
            'INSERT INTO users (username, password, role) VALUES (?, ?, "librarian")',
            [username, hashedPassword]
        );
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        handleError(res, error, 'Registration failed.');
    }
};

// User login
const loginUser = async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }
    
    try {
        // Find user by username
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        
        const user = users[0];
        
        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        
        // Update last login time
        await pool.execute(
            'UPDATE users SET last_login = NOW() WHERE user_id = ?',
            [user.user_id]
        );
        
        // Generate JWT token
        const token = jwt.sign(
            { user_id: user.user_id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(200).json({
            message: 'Login successful',
            username: user.username,
            role: user.role,
            token: token
        });
    } catch (error) {
        handleError(res, error, 'Login failed.');
    }
};

// Borrow a book
const borrowBook = async (req, res) => {
    const { book_id, member_id, due_date } = req.body;
    
    if (!book_id || !member_id || !due_date) {
        return res.status(400).json({ error: 'Book ID, member ID, and due date are required.' });
    }
    
    try {
        // Begin transaction
        await pool.execute('START TRANSACTION');
        
        // Check if book exists and is available
        const [bookRows] = await pool.execute(
            'SELECT available_quantity FROM Books WHERE book_id = ?', 
            [book_id]
        );
        
        if (bookRows.length === 0) {
            await pool.execute('ROLLBACK');
            return res.status(404).json({ error: 'Book not found.' });
        }
        
        if (bookRows[0].available_quantity <= 0) {
            await pool.execute('ROLLBACK');
            return res.status(400).json({ error: 'Book is not available for borrowing.' });
        }
        
        // Check if member exists
        const [memberRows] = await pool.execute(
            'SELECT * FROM Members WHERE member_id = ?', 
            [member_id]
        );
        
        if (memberRows.length === 0) {
            await pool.execute('ROLLBACK');
            return res.status(404).json({ error: 'Member not found.' });
        }
        
        // Decrease available quantity
        await pool.execute(
            'UPDATE Books SET available_quantity = available_quantity - 1 WHERE book_id = ?',
            [book_id]
        );
        
        // Create loan record
        const [result] = await pool.execute(
            'INSERT INTO Loans (book_id, member_id, due_date, loan_status) VALUES (?, ?, ?, "borrowed")',
            [book_id, member_id, due_date]
        );
        
        // Commit transaction
        await pool.execute('COMMIT');
        
        const loan_id = result.insertId;
        const [loanRows] = await pool.execute('SELECT * FROM Loans WHERE loan_id = ?', [loan_id]);
        
        res.status(201).json(loanRows[0]);
    } catch (error) {
        await pool.execute('ROLLBACK');
        handleError(res, error, 'Failed to borrow book.');
    }
};

// Return a book
const returnBook = async (req, res) => {
    const loanId = req.params.loanId;
    
    try {
        // Begin transaction
        await pool.execute('START TRANSACTION');
        
        // Check if loan exists and is not already returned
        const [loanRows] = await pool.execute(
            'SELECT * FROM Loans WHERE loan_id = ? AND loan_status = "borrowed"', 
            [loanId]
        );
        
        if (loanRows.length === 0) {
            await pool.execute('ROLLBACK');
            return res.status(404).json({ error: 'Active loan not found.' });
        }
        
        const loan = loanRows[0];
        
        // Increase available quantity
        await pool.execute(
            'UPDATE Books SET available_quantity = available_quantity + 1 WHERE book_id = ?',
            [loan.book_id]
        );
        
        // Update loan status
        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await pool.execute(
            'UPDATE Loans SET return_date = ?, loan_status = "returned" WHERE loan_id = ?',
            [currentDate, loanId]
        );
        
        // Commit transaction
        await pool.execute('COMMIT');
        
        const [updatedLoan] = await pool.execute('SELECT * FROM Loans WHERE loan_id = ?', [loanId]);
        
        res.status(200).json(updatedLoan[0]);
    } catch (error) {
        await pool.execute('ROLLBACK');
        handleError(res, error, 'Failed to return book.');
    }
};

// Get all loans
const getAllLoans = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT l.*, b.title AS book_title, m.name AS member_name 
            FROM Loans l
            JOIN Books b ON l.book_id = b.book_id
            JOIN Members m ON l.member_id = m.member_id
        `);
        res.status(200).json(rows);
    } catch (error) {
        handleError(res, error, 'Failed to fetch loans.');
    }
};

// Get loans by member ID
const getLoansByMember = async (req, res) => {
    const memberId = req.params.memberId;
    try {
        const [rows] = await pool.execute(`
            SELECT l.*, b.title AS book_title 
            FROM Loans l
            JOIN Books b ON l.book_id = b.book_id
            WHERE l.member_id = ?
        `, [memberId]);
        res.status(200).json(rows);
    } catch (error) {
        handleError(res, error, 'Failed to fetch member loans.');
    }
};

// login
app.post('/api/register', registerUser);
app.post('/api/login', loginUser);

// Book
app.post('/api/books', createBook);
app.get('/api/books', getAllBooks);
app.get('/api/books/search', searchBooks);
app.get('/api/books/:bookId', getBookById);
app.put('/api/books/:bookId', updateBook);
app.delete('/api/books/:bookId', deleteBook);

// Member
app.post('/api/members', createMember);
app.get('/api/members', getAllMembers);
app.get('/api/members/:memberId', getMemberById);
app.put('/api/members/:memberId', updateMember);
app.delete('/api/members/:memberId', deleteMember);

// Loan
app.post('/api/loans', borrowBook);
app.put('/api/loans/:loanId/return', returnBook);
app.get('/api/loans', getAllLoans);
app.get('/api/members/:memberId/loans', getLoansByMember);

// Welcome
app.get('/', (req, res) => {
    res.send('Hello World! This is your library management system backend.');
});

// Express server
app.listen(expressPort, () => {
    console.log(`Express server is running on http://localhost:${expressPort}`);
});