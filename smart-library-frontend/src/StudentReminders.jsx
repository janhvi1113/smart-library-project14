import { useEffect, useState } from "react";
import {
  BellRing,
  Send,
  Search,
  RefreshCw,
  X
} from "lucide-react";

import {
  getUsers,
  sendReminder
} from "./api";

import "./StudentReminders.css";

function StudentReminders() {

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [title, setTitle] =
    useState("Library Reminder");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {

    try {

      setLoading(true);
      setError("");

      const data = await getUsers();

      const studentList =
        (data || []).filter(
          (user) =>
            user.role === "STUDENT"
        );

      setStudents(studentList);

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Failed to load students."
      );

    } finally {

      setLoading(false);

    }
  }

  function openReminder(student) {

    setSelectedStudent(student);

    setTitle("Library Reminder");

    setMessage("");

    setSuccess("");

    setError("");
  }

  function closeReminder() {

    setSelectedStudent(null);

    setMessage("");

    setError("");
  }

  async function handleSendReminder(e) {

    e.preventDefault();

    if (!selectedStudent) {
      return;
    }

    if (!message.trim()) {

      setError(
        "Please enter a reminder message."
      );

      return;
    }

    try {

      setSending(true);

      setError("");
      setSuccess("");

      await sendReminder(
        selectedStudent.id,
        title,
        message
      );

      setSuccess(
        `Reminder sent to ${selectedStudent.name}.`
      );

      setSelectedStudent(null);

      setMessage("");

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Failed to send reminder."
      );

    } finally {

      setSending(false);

    }
  }

  const filteredStudents =
    students.filter((student) => {

      const value =
        search.toLowerCase();

      return (
        student.name
          ?.toLowerCase()
          .includes(value) ||
        student.email
          ?.toLowerCase()
          .includes(value)
      );
    });

  return (
    <div className="student-reminders-page">

      <div className="reminders-header">

        <div>

          <span className="eyebrow">
            LIBRARIAN MENU
          </span>

          <h1>
            Student Reminders
          </h1>

          <p>
            Send important library reminders
            directly to students.
          </p>

        </div>

        <button
          className="reminders-refresh"
          onClick={loadStudents}
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {success && (
        <div className="reminder-success">
          ✓ {success}
        </div>
      )}

      {error && (
        <div className="reminder-error">
          ⚠ {error}
        </div>
      )}

      <div className="reminders-search glass">

        <Search size={19} />

        <input
          placeholder="Search student by name or email..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      {loading ? (

        <div className="reminders-empty glass">

          <RefreshCw size={38} />

          <h3>
            Loading students...
          </h3>

        </div>

      ) : filteredStudents.length === 0 ? (

        <div className="reminders-empty glass">

          <BellRing size={42} />

          <h3>
            No students found
          </h3>

          <p>
            Register a student account first.
          </p>

        </div>

      ) : (

        <div className="student-reminder-grid">

          {filteredStudents.map(
            (student) => (

              <div
                className="student-reminder-card glass"
                key={student.id}
              >

                <div className="student-reminder-icon">
                  {student.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div className="student-reminder-info">

                  <h2>
                    {student.name}
                  </h2>

                  <p>
                    {student.email}
                  </p>

                </div>

                <button
                  className="send-reminder-button"
                  onClick={() =>
                    openReminder(student)
                  }
                >
                  <Send size={17} />
                  Send Reminder
                </button>

              </div>

            )
          )}

        </div>
      )}

      {selectedStudent && (

        <div className="reminder-modal-overlay">

          <div className="reminder-modal">

            <button
              className="reminder-modal-close"
              onClick={closeReminder}
            >
              <X size={20} />
            </button>

            <div className="reminder-modal-icon">
              <BellRing size={25} />
            </div>

            <h2>
              Send Reminder
            </h2>

            <p>
              Sending reminder to{" "}
              <strong>
                {selectedStudent.name}
              </strong>
            </p>

            <form
              onSubmit={handleSendReminder}
            >

              <label>
                Reminder Title
              </label>

              <input
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                required
              />

              <label>
                Message
              </label>

              <textarea
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                placeholder="Example: Your book is due tomorrow. Please return it to the library."
                rows="5"
                required
              />

              <button
                className="send-reminder-submit"
                disabled={sending}
              >

                <Send size={18} />

                {sending
                  ? "Sending..."
                  : "Send Reminder"}

              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default StudentReminders;