import { useEffect, useState } from "react";
import {
  BookOpen,
  UserRound,
  CalendarDays,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

import {
  getUsers,
  getBooks,
  getBookCopies,
  issueBook,
  returnBook,
  getAllCirculation
} from "./api";

import "./Circulation.css";

function Circulation() {

  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [copies, setCopies] = useState([]);
  const [circulation, setCirculation] = useState([]);

  const [selectedUser, setSelectedUser] =
    useState("");

  const [selectedBook, setSelectedBook] =
    useState("");

  const [selectedCopy, setSelectedCopy] =
    useState("");

  const [dueDate, setDueDate] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [issuing, setIssuing] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

    try {

      setLoading(true);
      setError("");

      const [
        userData,
        bookData,
        circulationData
      ] = await Promise.all([
        getUsers(),
        getBooks(),
        getAllCirculation()
      ]);

      setUsers(userData);
      setBooks(bookData);
      setCirculation(
        circulationData
      );

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to load circulation data."
      );

    } finally {

      setLoading(false);

    }
  }

  async function handleBookChange(
    event
  ) {

    const bookId = event.target.value;

    setSelectedBook(bookId);
    setSelectedCopy("");

    if (!bookId) {

      setCopies([]);
      return;

    }

    try {

      const data =
        await getBookCopies(bookId);

      setCopies(data);

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to load book copies."
      );

    }
  }

  async function handleIssue(
    event
  ) {

    event.preventDefault();

    setMessage("");
    setError("");

    if (
      !selectedUser ||
      !selectedCopy ||
      !dueDate
    ) {

      setError(
        "Please select a student, book copy and due date."
      );

      return;
    }

    try {

      setIssuing(true);

      await issueBook(
        selectedUser,
        selectedCopy,
        dueDate
      );

      setMessage(
        "Book issued successfully!"
      );

      setSelectedUser("");
      setSelectedBook("");
      setSelectedCopy("");
      setDueDate("");
      setCopies([]);

      await loadData();

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to issue book."
      );

    } finally {

      setIssuing(false);

    }
  }

  async function handleReturn(
    circulationId
  ) {

    const confirmed =
      window.confirm(
        "Are you sure you want to return this book?"
      );

    if (!confirmed) {
      return;
    }

    try {

      setMessage("");
      setError("");

      await returnBook(
        circulationId
      );

      setMessage(
        "Book returned successfully!"
      );

      await loadData();

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to return book."
      );
    }
  }

  function formatDate(date) {

    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  }

  const students =
    users.filter(
      (user) =>
        user.role === "STUDENT"
    );

  const availableCopies =
    copies.filter(
      (copy) =>
        copy.status === "AVAILABLE"
    );

  return (
    <div className="circulation-page">

      <div className="circulation-header">

        <div>

          <span className="eyebrow">
            LIBRARY OPERATIONS
          </span>

          <h1>
            Circulation
          </h1>

          <p>
            Issue, return and track library books.
          </p>

        </div>

        <button
          className="circulation-refresh glass-small"
          onClick={loadData}
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {message && (

        <div className="circulation-success glass">

          <CheckCircle2 size={18} />

          {message}

        </div>

      )}

      {error && (

        <div className="circulation-error glass">

          <AlertCircle size={18} />

          {error}

        </div>

      )}

      <div className="circulation-grid">

        <section className="issue-card glass">

          <div className="section-heading">

            <div>

              <span className="eyebrow">
                NEW TRANSACTION
              </span>

              <h2>
                Issue Book
              </h2>

            </div>

            <div className="issue-icon">
              <BookOpen size={22} />
            </div>

          </div>

          <form
            className="issue-form"
            onSubmit={handleIssue}
          >

            <label>
              Student
            </label>

            <div className="select-wrapper">

              <UserRound size={17} />

              <select
                value={selectedUser}
                onChange={(event) =>
                  setSelectedUser(
                    event.target.value
                  )
                }
              >

                <option value="">
                  Select student
                </option>

                {students.map(
                  (user) => (

                    <option
                      key={user.id}
                      value={user.id}
                    >
                      {user.name} — {user.email}
                    </option>

                  )
                )}

              </select>

            </div>

            <label>
              Book
            </label>

            <div className="select-wrapper">

              <BookOpen size={17} />

              <select
                value={selectedBook}
                onChange={
                  handleBookChange
                }
              >

                <option value="">
                  Select book
                </option>

                {books.map(
                  (book) => (

                    <option
                      key={book.id}
                      value={book.id}
                    >

                      {book.title}
                      {" "}
                      ({book.availableCopies}
                      {" "}available)

                    </option>

                  )
                )}

              </select>

            </div>

            <label>
              Book Copy
            </label>

            <div className="select-wrapper">

              <BookOpen size={17} />

              <select
                value={selectedCopy}
                onChange={(event) =>
                  setSelectedCopy(
                    event.target.value
                  )
                }
                disabled={
                  !selectedBook
                }
              >

                <option value="">
                  {selectedBook
                    ? "Select available copy"
                    : "Select a book first"}
                </option>

                {availableCopies.map(
                  (copy) => (

                    <option
                      key={copy.id}
                      value={copy.id}
                    >
                      {copy.copyCode}
                    </option>

                  )
                )}

              </select>

            </div>

            <label>
              Due Date
            </label>

            <div className="date-wrapper">

              <CalendarDays size={17} />

              <input
                type="date"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(
                    event.target.value
                  )
                }
              />

            </div>

            <button
              type="submit"
              className="issue-button"
              disabled={
                issuing ||
                loading
              }
            >

              <BookOpen size={17} />

              {issuing
                ? "Issuing..."
                : "Issue Book"}

            </button>

          </form>

        </section>

        <section className="summary-card glass">

          <div className="summary-icon">
            <RotateCcw size={25} />
          </div>

          <span className="eyebrow">
            CIRCULATION SUMMARY
          </span>

          <h2>
            Library Activity
          </h2>

          <div className="summary-stats">

            <div>

              <strong>
                {
                  circulation.filter(
                    (item) =>
                      item.status ===
                      "ISSUED"
                  ).length
                }
              </strong>

              <span>
                Active Loans
              </span>

            </div>

            <div>

              <strong>
                {
                  circulation.filter(
                    (item) =>
                      item.status ===
                      "RETURNED"
                  ).length
                }
              </strong>

              <span>
                Returned
              </span>

            </div>

            <div>

              <strong>
                {students.length}
              </strong>

              <span>
                Students
              </span>

            </div>

            <div>

              <strong>
                {books.length}
              </strong>

              <span>
                Books
              </span>

            </div>

          </div>

        </section>

      </div>

      <section className="history-card glass">

        <div className="section-heading">

          <div>

            <span className="eyebrow">
              TRANSACTION HISTORY
            </span>

            <h2>
              Circulation History
            </h2>

          </div>

          <span className="record-count">
            {circulation.length}
            {" "}records
          </span>

        </div>

        {loading ? (

          <div className="history-empty">
            Loading circulation records...
          </div>

        ) : circulation.length === 0 ? (

          <div className="history-empty">
            No circulation records found.
          </div>

        ) : (

          <div className="circulation-table-wrapper">

            <table className="circulation-table">

              <thead>

                <tr>

                  <th>
                    Student
                  </th>

                  <th>
                    Book
                  </th>

                  <th>
                    Copy
                  </th>

                  <th>
                    Issue Date
                  </th>

                  <th>
                    Due Date
                  </th>

                  <th>
                    Return Date
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {circulation.map(
                  (item) => (

                    <tr
                      key={item.id}
                    >

                      <td>

                        <div className="student-cell">

                          <div className="mini-avatar">
                            {item.user?.name
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>

                          <div>

                            <strong>
                              {item.user?.name ||
                                "Unknown"}
                            </strong>

                            <span>
                              {item.user?.email ||
                                ""}
                            </span>

                          </div>

                        </div>

                      </td>

                      <td>

                        <strong>
                          {item.bookCopy
                            ?.book
                            ?.title ||
                            "Unknown"}
                        </strong>

                      </td>

                      <td>

                        <span className="copy-code">
                          {item.bookCopy
                            ?.copyCode ||
                            "—"}
                        </span>

                      </td>

                      <td>
                        {formatDate(
                          item.issueDate
                        )}
                      </td>

                      <td>
                        {formatDate(
                          item.dueDate
                        )}
                      </td>

                      <td>
                        {formatDate(
                          item.returnDate
                        )}
                      </td>

                      <td>

                        <span
                          className={`table-status ${
                            item.status ===
                            "ISSUED"
                              ? "table-issued"
                              : "table-returned"
                          }`}
                        >

                          {item.status}

                        </span>

                      </td>

                      <td>

                        {item.status ===
                          "ISSUED" ? (

                          <button
                            className="return-button"
                            onClick={() =>
                              handleReturn(
                                item.id
                              )
                            }
                          >

                            <RotateCcw
                              size={15}
                            />

                            Return

                          </button>

                        ) : (

                          <span className="returned-label">

                            <CheckCircle2
                              size={15}
                            />

                            Returned

                          </span>

                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}

export default Circulation;