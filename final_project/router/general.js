const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Check if a user with the given username already exists
const doesExist = (username) => {
    return new Promise((resolve, reject) => {
        const usersWithSameName = users.filter((user) => user.username === username);
        if (usersWithSameName.length > 0) {
            resolve(true);
        } else {
            resolve(false);
        }
    });
};

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
    return new Promise((resolve, reject) => {
        const validUsers = users.filter((user) => user.username === username && user.password === password);
        if (validUsers.length > 0) {
            resolve(true);
        } else {
            resolve(false);
        }
    });
};

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        doesExist(username)
            .then((exists) => {
                if (!exists) {
                    users.push({ "username": username, "password": password });
                    res.status(200).json({
                        message: "User successfully registered. Now you can login",
                        user: { username, password },
                    });
                } else {
                    res.status(404).json({ message: "User already exists!" });
                }
            })
            .catch((err) => res.status(500).json({ message: "An error occurred", error: err }));
    } else {
        res.status(400).json({ message: "Unable to register user. Username or password is missing." });
    }
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {
    return new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject("Books not available.");
        }
    })
        .then((bookList) => res.status(200).json(bookList))
        .catch((err) => res.status(500).json({ message: err }));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    return new Promise((resolve, reject) => {
        const book = Object.values(books).find(book => book.isbn === isbn);
        if (book) {
            resolve(book);
        } else {
            reject("Book not found");
        }
    })
        .then((book) => res.status(200).json(book))
        .catch((err) => res.status(404).json({ message: err }));
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author;

    return new Promise((resolve, reject) => {
        const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase().includes(author.toLowerCase()));
        if (booksByAuthor.length > 0) {
            resolve(booksByAuthor);
        } else {
            reject("No books found by this author");
        }
    })
        .then((books) => res.status(200).json(books))
        .catch((err) => res.status(404).json({ message: err }));
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title;

    return new Promise((resolve, reject) => {
        const book = Object.values(books).find(book => book.title === title);
        if (book) {
            resolve(book);
        } else {
            reject("Book not found");
        }
    })
        .then((book) => res.status(200).json(book))
        .catch((err) => res.status(404).json({ message: err }));
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    return new Promise((resolve, reject) => {
        const book = Object.values(books).find(book => book.isbn === isbn);
        if (book) {
            resolve(book.reviews);
        } else {
            reject("Book not found");
        }
    })
        .then((reviews) => res.status(200).json(reviews))
        .catch((err) => res.status(404).json({ message: err }));
});

module.exports.general = public_users;
