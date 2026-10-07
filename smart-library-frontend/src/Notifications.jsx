import { useEffect, useState } from "react";
import {
  Bell,
  AlertCircle,
  Clock3,
  CheckCircle2,
  RefreshCw,
  BellRing
} from "lucide-react";

import {
  getNotifications,
  getMyReminders,
  markReminderAsRead
} from "./api";

import "./Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [reminders, setReminders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");

      const [notificationData, reminderData] =
        await Promise.all([
          getNotifications(),
          getMyReminders()
        ]);

      setNotifications(notificationData || []);
      setReminders(reminderData || []);

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleReminderRead(id) {
    try {
      await markReminderAsRead(id);

      setReminders((current) =>
        current.map((reminder) =>
          reminder.id === id
            ? {
                ...reminder,
                readStatus: true
              }
            : reminder
        )
      );

    } catch (err) {
      console.error(err);
    }
  }

  function getNotificationClass(type) {
    if (type === "OVERDUE") {
      return "notification-card overdue";
    }

    if (type === "DUE_SOON") {
      return "notification-card due-soon";
    }

    if (type === "RESERVATION_READY") {
      return "notification-card ready";
    }

    return "notification-card";
  }

  function getIcon(type) {
    if (type === "OVERDUE") {
      return <AlertCircle size={24} />;
    }

    if (type === "DUE_SOON") {
      return <Clock3 size={24} />;
    }

    if (type === "RESERVATION_READY") {
      return <CheckCircle2 size={24} />;
    }

    return <Bell size={24} />;
  }

  function getStatusLabel(status) {
    if (status === "URGENT") {
      return "URGENT";
    }

    if (status === "WARNING") {
      return "WARNING";
    }

    if (status === "SUCCESS") {
      return "READY";
    }

    return status;
  }

  return (
    <div className="notifications-page">

      <div className="notifications-header">

        <div className="notifications-heading">

          <span className="eyebrow">
            MY LIBRARY
          </span>

          <h1>
            Notifications
          </h1>

          <p>
            Stay updated about due dates,
            overdue books, reservations and
            librarian reminders.
          </p>

        </div>

        <button
          className="notifications-refresh glass-small"
          onClick={loadNotifications}
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {error && (
        <div className="notification-error glass">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (

        <div className="notification-empty glass">

          <Bell size={42} />

          <h3>
            Loading notifications...
          </h3>

          <p>
            Checking your library activity.
          </p>

        </div>

      ) : (
        <>
          {reminders.length > 0 && (

            <div className="reminders-section">

              <div className="section-heading">

                <div>
                  <span className="eyebrow">
                    LIBRARIAN
                  </span>

                  <h2>
                    Messages from Librarian
                  </h2>
                </div>

              </div>

              <div className="notifications-list">

                {reminders.map((reminder) => (

                  <div
                    className={`notification-card librarian-reminder ${
                      reminder.readStatus
                        ? "reminder-read"
                        : "reminder-unread"
                    }`}
                    key={`reminder-${reminder.id}`}
                  >

                    <div className="notification-icon">
                      <BellRing size={24} />
                    </div>

                    <div className="notification-content">

                      <div className="notification-title-row">

                        <div>

                          <h2>
                            {reminder.title}
                          </h2>

                          <p>
                            {reminder.message}
                          </p>

                          <small>
                            {reminder.createdAt
                              ? new Date(
                                  reminder.createdAt
                                ).toLocaleString()
                              : ""}
                          </small>

                        </div>

                        <span className="notification-status">
                          {reminder.readStatus
                            ? "READ"
                            : "NEW"}
                        </span>

                      </div>

                      {!reminder.readStatus && (

                        <button
                          className="mark-reminder-read"
                          onClick={() =>
                            handleReminderRead(
                              reminder.id
                            )
                          }
                        >
                          Mark as Read
                        </button>

                      )}

                    </div>

                  </div>

                ))}

              </div>

            </div>
          )}

          {notifications.length > 0 && (

            <div className="regular-notifications-section">

              <div className="section-heading">

                <div>
                  <span className="eyebrow">
                    LIBRARY ACTIVITY
                  </span>

                  <h2>
                    Library Notifications
                  </h2>
                </div>

              </div>

              <div className="notifications-list">

                {notifications.map(
                  (notification, index) => (

                    <div
                      className={getNotificationClass(
                        notification.type
                      )}
                      key={
                        `${notification.type}-${notification.referenceId}-${index}`
                      }
                    >

                      <div className="notification-icon">
                        {getIcon(
                          notification.type
                        )}
                      </div>

                      <div className="notification-content">

                        <div className="notification-title-row">

                          <div>

                            <h2>
                              {notification.title}
                            </h2>

                            <p>
                              {notification.message}
                            </p>

                          </div>

                          <span className="notification-status">
                            {getStatusLabel(
                              notification.status
                            )}
                          </span>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>
          )}

          {reminders.length === 0 &&
            notifications.length === 0 && (

              <div className="notification-empty glass">

                <CheckCircle2 size={45} />

                <h3>
                  You're all caught up!
                </h3>

                <p>
                  You don't have any new library
                  notifications right now.
                </p>

              </div>
            )}
        </>
      )}

    </div>
  );
}

export default Notifications;