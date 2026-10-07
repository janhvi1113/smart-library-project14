import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  Clock3,
  Package,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

import { getDemandDashboard } from "./api";
import "./Dashboard.css";

function Dashboard() {
  const [demandData, setDemandData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const data = await getDemandDashboard();
      setDemandData(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  const totalBooks = demandData.length;

  const totalAvailable = demandData.reduce(
    (sum, book) => sum + (book.availableCopies || 0),
    0
  );

  const totalCirculations = demandData.reduce(
    (sum, book) => sum + (book.circulationCount || 0),
    0
  );

  const totalWaiting = demandData.reduce(
    (sum, book) => sum + (book.waitingReservations || 0),
    0
  );

  const highDemand = demandData.filter(
    (book) => book.demandLevel === "HIGH"
  ).length;

  const mediumDemand = demandData.filter(
    (book) => book.demandLevel === "MEDIUM"
  ).length;

  const lowDemand = demandData.filter(
    (book) => book.demandLevel === "LOW"
  ).length;

  const sortedBooks = [...demandData].sort(
    (a, b) => (b.demandScore || 0) - (a.demandScore || 0)
  );

  function getDemandClass(level) {
    if (level === "HIGH") return "dashboard-demand high";
    if (level === "MEDIUM") return "dashboard-demand medium";
    return "dashboard-demand low";
  }

  function getDemandIcon(level) {
    if (level === "HIGH") return <TrendingUp size={15} />;
    if (level === "MEDIUM") return <BarChart3 size={15} />;
    return <CheckCircle2 size={15} />;
  }

  return (
    <div className="dashboard-page">

      <div className="dashboard-header">

        <div className="dashboard-heading">
          <span className="eyebrow">LIBRARY INTELLIGENCE</span>

          <h1>Librarian Dashboard</h1>

          <p>
            Monitor circulation activity, reservation demand
            and collection requirements.
          </p>
        </div>

        <button
          className="dashboard-refresh glass-small"
          onClick={loadDashboard}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "spin" : ""}
          />

          {loading ? "Refreshing..." : "Refresh"}
        </button>

      </div>

      {error && (
        <div className="dashboard-error glass">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (

        <div className="dashboard-loading glass">

          <BarChart3 size={42} />

          <h3>Loading dashboard...</h3>

          <p>
            Analysing current library demand.
          </p>

        </div>

      ) : (

        <>

          <div className="dashboard-stats">

            <div className="dashboard-stat-card glass">
              <div className="dashboard-stat-icon books">
                <BookOpen size={22} />
              </div>

              <div>
                <span>Total Books</span>
                <strong>{totalBooks}</strong>
              </div>
            </div>

            <div className="dashboard-stat-card glass">
              <div className="dashboard-stat-icon available">
                <Package size={22} />
              </div>

              <div>
                <span>Available Copies</span>
                <strong>{totalAvailable}</strong>
              </div>
            </div>

            <div className="dashboard-stat-card glass">
              <div className="dashboard-stat-icon circulation">
                <TrendingUp size={22} />
              </div>

              <div>
                <span>Total Circulations</span>
                <strong>{totalCirculations}</strong>
              </div>
            </div>

            <div className="dashboard-stat-card glass">
              <div className="dashboard-stat-icon reservations">
                <Clock3 size={22} />
              </div>

              <div>
                <span>Waiting Reservations</span>
                <strong>{totalWaiting}</strong>
              </div>
            </div>

          </div>

          <div className="dashboard-demand-summary">

            <div className="dashboard-summary-card glass">
              <div className="summary-icon high">
                <TrendingUp size={21} />
              </div>

              <div>
                <span>High Demand</span>
                <strong>{highDemand}</strong>
              </div>
            </div>

            <div className="dashboard-summary-card glass">
              <div className="summary-icon medium">
                <BarChart3 size={21} />
              </div>

              <div>
                <span>Medium Demand</span>
                <strong>{mediumDemand}</strong>
              </div>
            </div>

            <div className="dashboard-summary-card glass">
              <div className="summary-icon low">
                <CheckCircle2 size={21} />
              </div>

              <div>
                <span>Low Demand</span>
                <strong>{lowDemand}</strong>
              </div>
            </div>

          </div>

          <div className="dashboard-main-card glass">

            <div className="dashboard-card-header">

              <div className="dashboard-card-title">

                <div className="dashboard-card-icon">
                  <BarChart3 size={20} />
                </div>

                <div>
                  <h2>Book Demand Analysis</h2>

                  <p>
                    Demand calculated from circulation,
                    reservations and available copies.
                  </p>
                </div>

              </div>

              <span className="dashboard-book-count">
                {demandData.length} books
              </span>

            </div>

            {sortedBooks.length === 0 ? (

              <div className="dashboard-empty">

                <BookOpen size={40} />

                <h3>No demand data available</h3>

                <p>
                  Add books and circulation activity
                  to generate demand insights.
                </p>

              </div>

            ) : (

              <div className="dashboard-table-wrapper">

                <table className="dashboard-table">

                  <thead>
                    <tr>
                      <th>Book</th>
                      <th>Circulations</th>
                      <th>Waiting</th>
                      <th>Available</th>
                      <th>Demand Score</th>
                      <th>Demand Level</th>
                    </tr>
                  </thead>

                  <tbody>

                    {sortedBooks.map((book) => (

                      <tr key={book.bookId}>

                        <td>

                          <div className="dashboard-book-cell">

                            <div className="dashboard-book-icon">
                              <BookOpen size={18} />
                            </div>

                            <div>
                              <strong>{book.title}</strong>

                              <span>
                                Book ID: {book.bookId}
                              </span>
                            </div>

                          </div>

                        </td>

                        <td>
                          <strong>
                            {book.circulationCount}
                          </strong>
                        </td>

                        <td>
                          <strong>
                            {book.waitingReservations}
                          </strong>
                        </td>

                        <td>
                          <strong>
                            {book.availableCopies}
                          </strong>
                        </td>

                        <td>

                          <div className="score-cell">

                            <strong>
                              {book.demandScore}
                            </strong>

                            <div className="score-bar">
                              <div
                                className="score-fill"
                                style={{
                                  width: `${Math.min(
                                    book.demandScore * 5,
                                    100
                                  )}%`
                                }}
                              ></div>
                            </div>

                          </div>

                        </td>

                        <td>

                          <span
                            className={getDemandClass(
                              book.demandLevel
                            )}
                          >
                            {getDemandIcon(
                              book.demandLevel
                            )}

                            {book.demandLevel}
                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </>

      )}

    </div>
  );
}

export default Dashboard;