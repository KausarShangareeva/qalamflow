const Book = require("../models/Book");

// GET /api/books — all books for current user
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/books/:id
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, userId: req.user.id });
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/books
exports.createBook = async (req, res) => {
  try {
    const { title, author, level, status, pages } = req.body;
    const book = await Book.create({
      userId: req.user.id,
      title,
      author,
      level,
      status,
      pages,
    });
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/books/:id
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/books/:id
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Book deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
