const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the username already exists
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Register the new user
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. You can now log in." });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify(books, null, 4));
});

// function to simulate async database operation
const findBooks = async (criteria) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(books);
        }, 100);
    });
};

// Get all books (using async/await)
public_users.get('/', async (req, res) => {
    try {
        const allBooks = await findBooks();
        return res.status(200).json(allBooks);
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving books", error: error.message });
    }
});

// Get book by ISBN (using Promises)
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    
    findBooks()
        .then(books => {
            const book = books[isbn];
            if (book) {
                return res.status(200).json(book);
            }
            return res.status(404).json({ message: "Book not found" });
        })
        .catch(error => {
            return res.status(500).json({ message: "Error retrieving book", error: error.message });
        });
});

// Search books by author (using Promises)
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author.toLowerCase();
    
    findBooks()
        .then(books => {
            const booksByAuthor = Object.values(books).filter(
                book => book.author.toLowerCase().includes(author)
            );
            
            if (booksByAuthor.length > 0) {
                return res.status(200).json(booksByAuthor);
            }
            return res.status(404).json({ message: "No books found for this author" });
        })
        .catch(error => {
            return res.status(500).json({ message: "Error searching books", error: error.message });
        });
});

// Search books by title (using Promises)
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title.toLowerCase();
    
    findBooks()
        .then(books => {
            const booksByTitle = Object.values(books).filter(
                book => book.title.toLowerCase().includes(title)
            );
            
            if (booksByTitle.length > 0) {
                return res.status(200).json(booksByTitle);
            }
            return res.status(404).json({ message: "No books found with this title" });
        })
        .catch(error => {
            return res.status(500).json({ message: "Error searching books", error: error.message });
        });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if(book){
        const reviews = book.reviews;

        if(Object.keys(reviews).length > 0){
            return res.status(200).json(reviews);
        } else {
            return res.status(403).json({message: " No reviews available for this book"});
        }
    } else {
        return res.status(404).json({message: "Book not found"});
    }
});

module.exports.general = public_users;
