const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return username && !users.find(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    return users.find(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Validate the username and password
    if (authenticatedUser(username, password)) {
        const accessToken = jwt.sign({ username }, "access", { expiresIn: '1h' });

        req.session.authorization = { accessToken }; // Save the token in session
        return res.status(200).json({ message: "User logged in successfully", accessToken });
    } else {
        return res.status(401).json({ message: "Invalid username or password." });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;  
    const username = req.user?.username; // The username from the session

    // Ensure the user is logged in
    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    // Ensure the review is provided
    if (!review) {
        return res.status(400).json({ message: "Review text is required" });
    }

    // Ensure the book exists
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // If the reviews object doesn't exist, create it
    if (!book.reviews) {
        book.reviews = {};
    }

    // Add or modify the review based on the user's username
    book.reviews[username] = review;

    return res.status(200).json({ 
        message: "Review added/updated successfully", 
        reviews: book.reviews 
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Extract ISBN from the route parameter
    const username = req.user.username; // Get the username from the session (JWT)

    // Find the book by ISBN
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user has a review for the book
    if (book.reviews && book.reviews[username]) {
        delete book.reviews[username]; // Delete the user's review
        return res.status(200).json({
            message: "Review deleted successfully",
            reviews: book.reviews // Return the updated reviews for the book
        });
    } else {
        return res.status(404).json({ message: "No review found for this user on this book" });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
