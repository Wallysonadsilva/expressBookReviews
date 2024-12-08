const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  if(!username || !password){
    return res.status(400).json({message: "Username and password are required"});
  }

  const user = users.find(user => user.username === username && user.password === password);

  if(!user){
    return res.status(401).json({message: "Invalid user name or password"});
  }

  const token = jwt.sign({username}, "access", {expiresIn: "1h"});

  req.session.authorization = {
    accessToken: token,
    username: username
  }

  return res.status(200).json({message: "Login successfull"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const review = req.body.review;
    const username = req.session.authorization?.username;

    if(!username){
        return res.status(401).json({message: "User not authenticated"});
    }

    if(!review){
        return res.status(400).json({message: "Review content is required"});
    }

    if(!books[isbn]){
        return res.status(404).json({message: "Book not found"});
    }

    if(!books[isbn].reviews){
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added successfully", review:books[isbn].reviews
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req,res) => {
    const { isbn } = req.params;
    const username = req.session.authorization?.username;

    if(!username){
        return res.status(404).json({message: "User not authenticated"});
    }

    if(!books[isbn]){
        return res.status(404).json({message: " Book not found"});
    }

    if(!books[isbn].reviews || !books[isbn].reviews[username]){
        return res.status(404).json({message: "No review found for the user on this book"});
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({message: "Review deleted successfully", review: books[isbn].reviews});
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
