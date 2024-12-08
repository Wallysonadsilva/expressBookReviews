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

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  
  const book = books[isbn];

  if(book){
    return res.status(200).json(book);
  }else {
    return res.status(404).JSON({message: "Book not found"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
  
    const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());
  
    if (booksByAuthor.length > 0) {
      return res.status(200).json(booksByAuthor);
    } else {
      return res.status(404).json({message: "No books found for the specified author"});
    }
  });

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const booksBytitle = Object.values(books).filter(book => book.title.toLocaleLowerCase() === title.toLocaleLowerCase());

    if(booksBytitle.length > 0){
        return res.status(200).json(booksBytitle);
    } else {
        return res.status(404).json({message: "No books found for the specifeid title"});
    }
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
