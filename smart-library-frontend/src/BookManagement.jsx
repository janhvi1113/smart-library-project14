import { useEffect, useState } from "react";
import {
  BookPlus,
  PackagePlus,
  Pencil,
  RefreshCw,
  Search,
  X
} from "lucide-react";
import {
  getBooks,
  addBook,
  addBookCopies,
  updateBook
} from "./api";
import "./BookManagement.css";

function BookManagement() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showAddBook, setShowAddBook] = useState(false);
  const [showCopies, setShowCopies] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [selectedBook, setSelectedBook] = useState(null);

  const [bookForm, setBookForm] = useState({
    isbn: "",
    title: "",
    author: "",
    category: "",
    description: "",
    totalCopies: 1
  });

  const [copies, setCopies] = useState(1);

  const [editForm, setEditForm] = useState({
    title: "",
    author: "",
    category: "",
    description: ""
  });

  useEffect(() => {
    loadBooks();
  }, []);

  async function loadBooks() {
    try {
      setLoading(true);
      setError("");

      const data = await getBooks();
      setBooks(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load books.");
    } finally {
      setLoading(false);
    }
  }

  function openAddBook() {
    setMessage("");
    setError("");

    setBookForm({
      isbn: "",
      title: "",
      author: "",
      category: "",
      description: "",
      totalCopies: 1
    });

    setShowAddBook(true);
  }

  function openCopies(book) {
    setSelectedBook(book);
    setCopies(1);
    setMessage("");
    setError("");
    setShowCopies(true);
  }

  function openEdit(book) {
    setSelectedBook(book);

    setEditForm({
      title: book.title || "",
      author: book.author || "",
      category: book.category || "",
      description: book.description || ""
    });

    setMessage("");
    setError("");
    setShowEdit(true);
  }

  async function handleAddBook(e) {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      await addBook({
        isbn: bookForm.isbn,
        title: bookForm.title,
        author: bookForm.author,
        category: bookForm.category,
        description: bookForm.description,
        totalCopies: Number(bookForm.totalCopies),
        availableCopies: Number(bookForm.totalCopies)
      });

      setMessage("Book added successfully.");
      setShowAddBook(false);
      await loadBooks();

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add book.");
    }
  }

  async function handleAddCopies(e) {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      await addBookCopies(selectedBook.id, Number(copies));

      setMessage(`${copies} copy/copies added successfully.`);
      setShowCopies(false);
      await loadBooks();

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add copies.");
    }
  }

  async function handleEditBook(e) {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      await updateBook(selectedBook.id, editForm);

      setMessage("Book updated successfully.");
      setShowEdit(false);
      await loadBooks();

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update book.");
    }
  }

  const filteredBooks = books.filter((book) => {
    const value = search.toLowerCase();

    return (
      book.title?.toLowerCase().includes(value) ||
      book.author?.toLowerCase().includes(value) ||
      book.isbn?.toLowerCase().includes(value) ||
      book.category?.toLowerCase().includes(value)
    );
  });

  return (
    <div className="book-management-page">

      <div className="book-management-header">
       
        <div>
          <span className="eyebrow">LIBRARIAN MENU</span>
          <h1>Book Management</h1>
          <p>Add books, manage copies and update catalog information.</p>
        </div>

        <div className="book-management-actions">
          <button
            className="glass-small"
            onClick={loadBooks}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            className="primary-book-button"
            onClick={openAddBook}
          >
            <BookPlus size={18} />
            Add New Book
          </button>
        </div>
      </div>

      {message && (
        <div className="book-success">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="book-error">
          ⚠ {error}
        </div>
      )}

      <div className="book-search glass">
        <Search size={19} />
        <input
          type="text"
          placeholder="Search by title, author, ISBN or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="book-empty glass">
          <RefreshCw size={38} />
          <h3>Loading books...</h3>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="book-empty glass">
          <BookPlus size={42} />
          <h3>No books found</h3>
          <p>Try another search or add a new book.</p>
        </div>
      ) : (
        <div className="management-book-grid">
          {filteredBooks.map((book) => (
            <div className="management-book-card glass" key={book.id}>

              <div className="management-book-top">
                <div className="management-book-icon">
                  <BookPlus size={25} />
                </div>

                <span className="management-category">
                  {book.category || "General"}
                </span>
              </div>

              <h2>{book.title}</h2>

              <p className="management-author">
                {book.author || "Unknown Author"}
              </p>

              <p className="management-isbn">
                ISBN: {book.isbn}
              </p>

              <div className="copy-stat-row">

                <div className="copy-stat">
                  <span>Total</span>
                  <strong>{book.totalCopies ?? 0}</strong>
                </div>

                <div className="copy-stat">
                  <span>Available</span>
                  <strong>{book.availableCopies ?? 0}</strong>
                </div>

                <div className="copy-stat">
                  <span>Issued</span>
                  <strong>
                    {(book.totalCopies ?? 0) -
                      (book.availableCopies ?? 0)}
                  </strong>
                </div>

              </div>

              <div className="management-card-actions">

                <button
                  className="management-action"
                  onClick={() => openEdit(book)}
                >
                  <Pencil size={16} />
                  Edit
                </button>

                <button
                  className="management-action add-copy-action"
                  onClick={() => openCopies(book)}
                >
                  <PackagePlus size={16} />
                  Add Copies
                </button>

              </div>

            </div>
          ))}
        </div>
      )}

      {showAddBook && (
        <div className="book-modal-overlay">

          <div className="book-modal">

            <button
              className="modal-close"
              onClick={() => setShowAddBook(false)}
            >
              <X size={20} />
            </button>

            <div className="modal-icon">
              <BookPlus size={25} />
            </div>

            <h2>Add New Book</h2>
            <p>Add a new title to the library catalog.</p>

            <form onSubmit={handleAddBook}>

              <label>ISBN</label>
              <input
                required
                value={bookForm.isbn}
                onChange={(e) =>
                  setBookForm({
                    ...bookForm,
                    isbn: e.target.value
                  })
                }
                placeholder="9780134685991"
              />

              <label>Book Title</label>
              <input
                required
                value={bookForm.title}
                onChange={(e) =>
                  setBookForm({
                    ...bookForm,
                    title: e.target.value
                  })
                }
                placeholder="Enter book title"
              />

              <label>Author</label>
              <input
                value={bookForm.author}
                onChange={(e) =>
                  setBookForm({
                    ...bookForm,
                    author: e.target.value
                  })
                }
                placeholder="Enter author"
              />

              <label>Category</label>
              <input
                value={bookForm.category}
                onChange={(e) =>
                  setBookForm({
                    ...bookForm,
                    category: e.target.value
                  })
                }
                placeholder="Technology"
              />

              <label>Description</label>
              <textarea
                value={bookForm.description}
                onChange={(e) =>
                  setBookForm({
                    ...bookForm,
                    description: e.target.value
                  })
                }
                placeholder="Short description..."
              />

              <label>Total Copies</label>
              <input
                type="number"
                min="1"
                required
                value={bookForm.totalCopies}
                onChange={(e) =>
                  setBookForm({
                    ...bookForm,
                    totalCopies: e.target.value
                  })
                }
              />

              <button className="modal-submit">
                <BookPlus size={18} />
                Add Book
              </button>

            </form>

          </div>
        </div>
      )}

      {showCopies && selectedBook && (
        <div className="book-modal-overlay">

          <div className="book-modal small-modal">

            <button
              className="modal-close"
              onClick={() => setShowCopies(false)}
            >
              <X size={20} />
            </button>

            <div className="modal-icon">
              <PackagePlus size={25} />
            </div>

            <h2>Add Copies</h2>

            <p>
              Add copies for <strong>{selectedBook.title}</strong>.
            </p>

            <form onSubmit={handleAddCopies}>

              <label>Number of Copies</label>

              <input
                type="number"
                min="1"
                required
                value={copies}
                onChange={(e) => setCopies(e.target.value)}
              />

              <button className="modal-submit">
                <PackagePlus size={18} />
                Add Copies
              </button>

            </form>

          </div>
        </div>
      )}

      {showEdit && selectedBook && (
        <div className="book-modal-overlay">

          <div className="book-modal">

            <button
              className="modal-close"
              onClick={() => setShowEdit(false)}
            >
              <X size={20} />
            </button>

            <div className="modal-icon">
              <Pencil size={25} />
            </div>

            <h2>Edit Book</h2>

            <p>
              Update information for <strong>{selectedBook.title}</strong>.
            </p>

            <form onSubmit={handleEditBook}>

              <label>Book Title</label>
              <input
                required
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    title: e.target.value
                  })
                }
              />

              <label>Author</label>
              <input
                value={editForm.author}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    author: e.target.value
                  })
                }
              />

              <label>Category</label>
              <input
                value={editForm.category}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    category: e.target.value
                  })
                }
              />

              <label>Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    description: e.target.value
                  })
                }
              />

              <button className="modal-submit">
                <Pencil size={18} />
                Save Changes
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default BookManagement;