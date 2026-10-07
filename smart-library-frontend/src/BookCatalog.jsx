import { useEffect, useState } from "react";
import {
  BookOpen,
  Search,
  RefreshCw,
  Clock3,
  ShoppingBag,
  CheckCircle2,
  Sparkles
} from "lucide-react";

import {
  getBooks,
  borrowBook,
  createReservation,
  semanticSearchBooks
} from "./api";

import "./BookCatalog.css";

function BookCatalog() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [actionBook, setActionBook] = useState(null);
  const [semanticMode, setSemanticMode] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isStudent = user.role === "STUDENT";

  useEffect(() => {
    loadBooks();
  }, []);

  async function loadBooks() {
    try {
      setLoading(true);
      setError("");

      const data = await getBooks();

      setBooks(Array.isArray(data) ? data : []);
      setSearchResults([]);
      setSemanticMode(false);
    } catch (err) {
      console.error("Load books error:", err);
      setError(err.message || "Unable to load books.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(event) {
    const value = event.target.value;

    setSearch(value);
    setError("");
    setMessage("");

    if (!value.trim()) {
      setSearchResults([]);
      setSemanticMode(false);
      return;
    }

    try {
      setSearching(true);

      const response = await semanticSearchBooks(value);

      console.log("Semantic search raw response:", response);

      let results = [];

      if (Array.isArray(response)) {
        results = response;
      } else if (Array.isArray(response?.results)) {
        results = response.results;
      } else if (Array.isArray(response?.data)) {
        results = response.data;
      }

      console.log("Semantic search processed results:", results);

      setSearchResults(results);
      setSemanticMode(true);
    } catch (err) {
      console.error("Semantic search error:", err);

      setSearchResults([]);
      setSemanticMode(false);

      setError(
        err?.message ||
        "Semantic search is temporarily unavailable."
      );
    } finally {
      setSearching(false);
    }
  }

  async function handleBorrow(book) {
    try {
      setActionBook(book.id);
      setError("");
      setMessage("");

      await borrowBook(book.id);

      setMessage(`"${book.title}" borrowed successfully!`);

      await loadBooks();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to borrow book.");
    } finally {
      setActionBook(null);
    }
  }

  async function handleReserve(book) {
    try {
      setActionBook(book.id);
      setError("");
      setMessage("");

      await createReservation(book.id);

      setMessage(
        `You are now in the reservation queue for "${book.title}".`
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to reserve book.");
    } finally {
      setActionBook(null);
    }
  }

  const normalSearchResults = books.filter((book) => {
    const text = `
      ${book.title}
      ${book.author}
      ${book.category}
      ${book.isbn}
    `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const displayedBooks = semanticMode
    ? searchResults
        .map((result) => {
          const book = result?.book;

          if (!book) {
            return null;
          }

          return {
            ...book,
            similarityScore: Number(
              result.similarityScore ?? 0
            )
          };
        })
        .filter(Boolean)
    : normalSearchResults;

  return (
    <div className="catalog-page">

      <div className="catalog-header">

        <div className="catalog-heading">

          <span className="eyebrow">
            LIBRARY CATALOG
          </span>

          <h1>Book Catalog</h1>

          <p>
            Browse, borrow and reserve books in the library.
          </p>

        </div>

        <button
          className="refresh-button glass-small"
          onClick={loadBooks}
          disabled={loading}
        >
          <RefreshCw size={17} />

          {loading ? "Loading..." : "Refresh"}
        </button>

      </div>

      <div className="catalog-search glass">

        <Search size={19} />

        <input
          type="text"
          placeholder="Search books using natural language..."
          value={search}
          onChange={handleSearch}
        />

        {searching && (
          <RefreshCw
            size={18}
            className="semantic-search-spinner"
          />
        )}

      </div>

      {semanticMode && !searching && (
        <div className="semantic-search-info glass">

          <Sparkles size={17} />

          <span>
            AI semantic search results for{" "}
            <strong>"{search}"</strong>
          </span>

        </div>
      )}

      {message && (
        <div className="catalog-success glass">

          <CheckCircle2 size={18} />

          <span>{message}</span>

        </div>
      )}

      {error && (
        <div className="error-message glass">
          {error}
        </div>
      )}

      {loading ? (

        <div className="catalog-empty glass">

          <BookOpen size={35} />

          <h3>
            Loading books...
          </h3>

        </div>

      ) : searching ? (

        <div className="catalog-empty glass">

          <Sparkles size={35} />

          <h3>
            Finding relevant books...
          </h3>

          <p>
            AI semantic search is analyzing the catalog.
          </p>

        </div>

      ) : displayedBooks.length === 0 ? (

        <div className="catalog-empty glass">

          <BookOpen size={35} />

          <h3>
            No books found
          </h3>

          <p>
            Try a different search.
          </p>

        </div>

      ) : (

        <div className="book-grid">

          {displayedBooks.map((book) => {

            const available =
              book.availableCopies > 0;

            const processing =
              actionBook === book.id;

            return (
              <div
                className="book-card glass"
                key={book.id}
              >

                {/* BOOK COVER */}

            {/* BOOK COVER */}

<div className="book-cover-wrapper">

  {book.coverImageUrl ? (
    <img
      src={book.coverImageUrl}
      alt={`${book.title} cover`}
      className="book-cover-image"
    />
  ) : (
    <div className="book-cover-fallback">
      <BookOpen size={38} />
    </div>
  )}

</div>

                {/* BOOK STATUS */}

                <div className="book-card-top">

                  <span
                    className={
                      available
                        ? "availability available"
                        : "availability unavailable"
                    }
                  >
                    {available
                      ? "Available"
                      : "Unavailable"}
                  </span>

                </div>

                {/* BOOK INFORMATION */}

                <h2>
                  {book.title}
                </h2>

                <p className="book-author">
                  {book.author}
                </p>

                <span className="book-category">
                  {book.category}
                </span>

                {semanticMode &&
                  book.similarityScore !== undefined && (

                    <div className="semantic-score">

                      <Sparkles size={14} />

                      <span>
                        Relevance:{" "}
                        {Math.round(
                          book.similarityScore * 100
                        )}
                        %
                      </span>

                    </div>

                  )}

                <div className="book-details">

                  <div>

                    <span>
                      ISBN
                    </span>

                    <strong>
                      {book.isbn}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Copies
                    </span>

                    <strong>
                      {book.availableCopies} /{" "}
                      {book.totalCopies}
                    </strong>

                  </div>

                </div>

                <p className="book-description">
                  {book.description}
                </p>

                {isStudent && (

                  <div className="book-action-area">

                    {available ? (

                      <button
                        className="borrow-book-button"
                        onClick={() =>
                          handleBorrow(book)
                        }
                        disabled={processing}
                      >

                        <ShoppingBag size={17} />

                        {processing
                          ? "Borrowing..."
                          : "Borrow Book"}

                      </button>

                    ) : (

                      <button
                        className="reserve-book-button"
                        onClick={() =>
                          handleReserve(book)
                        }
                        disabled={processing}
                      >

                        <Clock3 size={17} />

                        {processing
                          ? "Reserving..."
                          : "Reserve Book"}

                      </button>

                    )}

                  </div>

                )}

              </div>
            );
          })}

        </div>

      )}

    </div>
  );
}

export default BookCatalog;