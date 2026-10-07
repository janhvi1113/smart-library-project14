import { useEffect, useState } from "react";
import {
  ShoppingCart,
  RefreshCw,
  BookOpen,
  TrendingUp,
  Clock3,
  PackagePlus,
  AlertCircle
} from "lucide-react";

import { getAcquisitionSuggestions } from "./api";
import "./Acquisition.css";

function Acquisition() {

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSuggestions();
  }, []);

  async function loadSuggestions() {

    try {

      setLoading(true);
      setError("");

      const data = await getAcquisitionSuggestions();

      setSuggestions(data);

    } catch (err) {

      console.error(err);
      setError(err.message || "Unable to load acquisition suggestions.");

    } finally {

      setLoading(false);
    }
  }

  function getDemandClass(level) {

    if (level === "HIGH") {
      return "acquisition-demand high";
    }

    if (level === "MEDIUM") {
      return "acquisition-demand medium";
    }

    return "acquisition-demand low";
  }

  return (
    <div className="acquisition-page">

      <div className="acquisition-header">

        <div>

          <span className="eyebrow">
            LIBRARY INTELLIGENCE
          </span>

          <h1>Acquisition Suggestions</h1>

          <p>
            Identify books that may require additional copies based on
            circulation demand and reservation queues.
          </p>

        </div>

        <button
          className="acquisition-refresh glass-small"
          onClick={loadSuggestions}
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {error && (
        <div className="acquisition-error glass">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (

        <div className="acquisition-empty glass">

          <ShoppingCart size={40} />

          <h3>
            Analysing library demand...
          </h3>

          <p>
            Preparing acquisition recommendations.
          </p>

        </div>

      ) : suggestions.length === 0 ? (

        <div className="acquisition-empty glass">

          <BookOpen size={40} />

          <h3>
            No acquisition data
          </h3>

        </div>

      ) : (

        <div className="acquisition-grid">

          {suggestions.map((book) => (

            <div
              className="acquisition-card glass"
              key={book.bookId}
            >

              <div className="acquisition-card-top">

                <div className="acquisition-book-icon">
                  <BookOpen size={28} />
                </div>

                <span
                  className={getDemandClass(book.demandLevel)}
                >
                  {book.demandLevel} DEMAND
                </span>

              </div>

              <h2>
                {book.title}
              </h2>

              <p className="acquisition-author">
                {book.author}
              </p>

              <div className="acquisition-metrics">

                <div>
                  <TrendingUp size={17} />
                  <span>Circulations</span>
                  <strong>
                    {book.circulationCount}
                  </strong>
                </div>

                <div>
                  <Clock3 size={17} />
                  <span>Waiting</span>
                  <strong>
                    {book.waitingReservations}
                  </strong>
                </div>

                <div>
                  <PackagePlus size={17} />
                  <span>Available</span>
                  <strong>
                    {book.availableCopies}
                  </strong>
                </div>

                <div>
                  <ShoppingCart size={17} />
                  <span>Demand Score</span>
                  <strong>
                    {book.demandScore}
                  </strong>
                </div>

              </div>

              <div className="acquisition-copies">

                <div>

                  <span>
                    Current Collection
                  </span>

                  <strong>
                    {book.totalCopies} copies
                  </strong>

                </div>

                <div className="suggested-copy">

                  <span>
                    Suggested Addition
                  </span>

                  <strong>
                    +{book.suggestedAdditionalCopies}
                  </strong>

                </div>

              </div>

              <div className="acquisition-reason">

                <strong>
                  Recommendation
                </strong>

                <p>
                  {book.recommendationReason}
                </p>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default Acquisition;