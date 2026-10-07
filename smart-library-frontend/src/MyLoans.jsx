import { useEffect, useState } from "react";
import {
  BookOpen,
  RefreshCw,
  CheckCircle2,
  Clock3,
  AlertCircle,
  RotateCcw
} from "lucide-react";
import { getMyLoans, returnStudentBook } from "./api";
import "./MyLoans.css";

function MyLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [returningId, setReturningId] = useState(null);

  useEffect(() => {
    loadLoans();
  }, []);

  async function loadLoans() {
    try {
      setLoading(true);
      setError("");

      const data = await getMyLoans();
      setLoans(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load your loans.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReturn(loan) {
    const confirmed = window.confirm(
      `Return "${loan.bookCopy?.book?.title || "this book"}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setReturningId(loan.id);
      setError("");
      setMessage("");

      await returnStudentBook(loan.id);

      setMessage("Book returned successfully!");

      await loadLoans();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to return book.");
    } finally {
      setReturningId(null);
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

  function getStatusClass(status) {
    if (status === "ISSUED") {
      return "loan-status issued";
    }

    if (status === "RETURNED") {
      return "loan-status returned";
    }

    if (status === "OVERDUE") {
      return "loan-status overdue";
    }

    return "loan-status";
  }

  function getStatusIcon(status) {
    if (status === "RETURNED") {
      return <CheckCircle2 size={16} />;
    }

    if (status === "OVERDUE") {
      return <AlertCircle size={16} />;
    }

    return <Clock3 size={16} />;
  }

  function isOverdue(loan) {
    if (
      loan.status !== "ISSUED" ||
      !loan.dueDate
    ) {
      return false;
    }

    return new Date(loan.dueDate) < new Date();
  }

  return (
    <div className="loans-page">

      <div className="loans-header">

        <div className="loans-heading">

          <span className="eyebrow">
            MY LIBRARY
          </span>

          <h1>
            My Loans
          </h1>

          <p>
            View your borrowed books, due dates and
            circulation history.
          </p>

        </div>

        <button
          className="loans-refresh glass-small"
          onClick={loadLoans}
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {message && (
        <div className="loan-success glass">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      {error && (
        <div className="loan-error glass">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (

        <div className="loan-empty glass">
          <BookOpen size={38} />
          <h3>
            Loading your loans...
          </h3>
        </div>

      ) : loans.length === 0 ? (

        <div className="loan-empty glass">
          <BookOpen size={42} />

          <h3>
            No loan records
          </h3>

          <p>
            Books you borrow will appear here.
          </p>
        </div>

      ) : (

        <div className="loan-list">

          {loans
            .slice()
            .sort(
              (a, b) =>
                new Date(b.issueDate) -
                new Date(a.issueDate)
            )
            .map((loan) => {

              const overdue = isOverdue(loan);

              const displayStatus =
                overdue
                  ? "OVERDUE"
                  : loan.status;

              const returning =
                returningId === loan.id;

              return (
                <div
                  className="loan-card glass"
                  key={loan.id}
                >

                  <div className="loan-book-icon">
                    <BookOpen size={28} />
                  </div>

                  <div className="loan-main">

                    <div className="loan-title-row">

                      <div>

                        <h2>
                          {loan.bookCopy?.book?.title ||
                            "Book"}
                        </h2>

                        <p>
                          {loan.bookCopy?.book?.author ||
                            "Unknown author"}
                        </p>

                      </div>

                      <div
                        className={getStatusClass(
                          displayStatus
                        )}
                      >
                        {getStatusIcon(
                          displayStatus
                        )}

                        {displayStatus}
                      </div>

                    </div>

                    <div className="loan-details">

                      <div className="loan-detail">
                        <span>
                          Issue Date
                        </span>

                        <strong>
                          {formatDate(
                            loan.issueDate
                          )}
                        </strong>
                      </div>

                      <div className="loan-detail">
                        <span>
                          Due Date
                        </span>

                        <strong>
                          {formatDate(
                            loan.dueDate
                          )}
                        </strong>
                      </div>

                      <div className="loan-detail">
                        <span>
                          Return Date
                        </span>

                        <strong>
                          {formatDate(
                            loan.returnDate
                          )}
                        </strong>
                      </div>

                      <div className="loan-detail">
                        <span>
                          Copy Code
                        </span>

                        <strong>
                          {loan.bookCopy?.copyCode ||
                            "—"}
                        </strong>
                      </div>

                    </div>

                    {overdue && (
                      <div className="overdue-message">
                        <AlertCircle size={18} />

                        <span>
                          This book is overdue.
                          Please return it.
                        </span>
                      </div>
                    )}

                    {!overdue &&
                      loan.status === "ISSUED" && (
                        <div className="active-loan-message">
                          <Clock3 size={18} />

                          <span>
                            This book is currently
                            issued to you.
                          </span>
                        </div>
                      )}

                    {loan.status === "RETURNED" && (
                      <div className="returned-message">
                        <CheckCircle2 size={18} />

                        <span>
                          This book has been returned.
                        </span>
                      </div>
                    )}

                    {loan.status === "ISSUED" && (
                      <button
                        className="student-return-button"
                        onClick={() =>
                          handleReturn(loan)
                        }
                        disabled={returning}
                      >
                        <RotateCcw size={17} />

                        {returning
                          ? "Returning..."
                          : "Return Book"}
                      </button>
                    )}

                  </div>

                </div>
              );
            })}

        </div>

      )}

    </div>
  );
}

export default MyLoans;