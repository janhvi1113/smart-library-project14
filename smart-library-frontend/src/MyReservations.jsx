import { useEffect, useState } from "react";
import {
  BookOpen,
  Clock3,
  RefreshCw,
  CheckCircle2,
  Hourglass
} from "lucide-react";
import { getMyReservations } from "./api";
import "./MyReservations.css";

function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReservations();
  }, []);

  async function loadReservations() {
    try {
      setLoading(true);
      setError("");

      const data = await getMyReservations();
      setReservations(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load reservations.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date) {
    if (!date) return "—";

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
    if (status === "READY") {
      return "reservation-status ready";
    }

    if (status === "FULFILLED") {
      return "reservation-status fulfilled";
    }

    return "reservation-status waiting";
  }

  function getStatusIcon(status) {
    if (
      status === "READY" ||
      status === "FULFILLED"
    ) {
      return <CheckCircle2 size={16} />;
    }

    return <Hourglass size={16} />;
  }

  return (
    <div className="reservations-page">

      <div className="reservations-header">

        <div className="reservations-heading">

          <span className="eyebrow">
            MY LIBRARY
          </span>

          <h1>
            My Reservations
          </h1>

          <p>
            Track your book reservations and queue positions.
          </p>

        </div>

        <button
          className="reservation-refresh glass-small"
          onClick={loadReservations}
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {error && (
        <div className="reservation-error glass">
          {error}
        </div>
      )}

      {loading ? (

        <div className="reservation-empty glass">
          <Clock3 size={35} />
          <h3>
            Loading reservations...
          </h3>
        </div>

      ) : reservations.length === 0 ? (

        <div className="reservation-empty glass">

          <BookOpen size={40} />

          <h3>
            No reservations yet
          </h3>

          <p>
            When you reserve an unavailable book,
            it will appear here.
          </p>

        </div>

      ) : (

        <div className="reservation-list">

          {reservations
            .slice()
            .sort(
              (a, b) =>
                new Date(b.reservationDate) -
                new Date(a.reservationDate)
            )
            .map((reservation) => (

              <div
                className="reservation-card glass"
                key={reservation.id}
              >

                <div className="reservation-book-icon">
                  <BookOpen size={27} />
                </div>

                <div className="reservation-main">

                  <div className="reservation-title-row">

                    <div>

                      <h2>
                        {reservation.book?.title || "Book"}
                      </h2>

                      <p>
                        {reservation.book?.author ||
                          "Unknown author"}
                      </p>

                    </div>

                    <div
                      className={getStatusClass(
                        reservation.status
                      )}
                    >
                      {getStatusIcon(
                        reservation.status
                      )}

                      {reservation.status}
                    </div>

                  </div>

                  <div className="reservation-details">

                    <div className="reservation-detail">
                      <span>
                        Queue Position
                      </span>

                      <strong>
                        #{reservation.queuePosition}
                      </strong>
                    </div>

                    <div className="reservation-detail">
                      <span>
                        Reserved On
                      </span>

                      <strong>
                        {formatDate(
                          reservation.reservationDate
                        )}
                      </strong>
                    </div>

                    <div className="reservation-detail">
                      <span>
                        Category
                      </span>

                      <strong>
                        {reservation.book?.category ||
                          "—"}
                      </strong>
                    </div>

                    <div className="reservation-detail">
                      <span>
                        ISBN
                      </span>

                      <strong>
                        {reservation.book?.isbn || "—"}
                      </strong>
                    </div>

                  </div>

                  {reservation.status === "READY" && (
                    <div className="ready-message">
                      <CheckCircle2 size={18} />

                      <span>
                        Your book is ready for collection.
                      </span>
                    </div>
                  )}

                  {reservation.status === "WAITING" && (
                    <div className="waiting-message">
                      <Hourglass size={18} />

                      <span>
                        You are currently waiting
                        in the reservation queue.
                      </span>
                    </div>
                  )}

                </div>

              </div>

            ))}

        </div>

      )}

    </div>
  );
}

export default MyReservations;