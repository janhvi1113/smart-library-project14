import { useEffect, useMemo, useRef, useState } from "react";

import {
  MessageCircle,
  Send,
  RefreshCw,
  UserRound,
  Search,
  CheckCheck,
  AlertCircle
} from "lucide-react";

import {
  getAllChatMessages,
  getChatStudents,
  sendChatMessage
} from "./api";

import "./LibrarianChat.css";

function LibrarianChat() {

  const [students, setStudents] =
    useState([]);

  const [messages, setMessages] =
    useState([]);

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const messagesEndRef =
    useRef(null);

  const librarian =
    JSON.parse(
      localStorage.getItem("user") || "null"
    );

  useEffect(() => {
    loadChat();

    const interval =
      setInterval(
        loadChat,
        5000
      );

    return () =>
      clearInterval(interval);
  }, []);

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });

  }, [
    selectedStudent,
    messages
  ]);

  async function loadChat() {

    try {

      setError("");

      const [
        studentData,
        messageData
      ] = await Promise.all([
        getChatStudents(),
        getAllChatMessages()
      ]);

      setStudents(
        studentData || []
      );

      setMessages(
        messageData || []
      );

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to load chat."
      );

    } finally {

      setLoading(false);

    }
  }

  const studentsWithMessages =
    useMemo(() => {

      const studentIds =
        new Set();

      messages.forEach(
        (chatMessage) => {

          if (
            chatMessage.sender?.role ===
            "STUDENT"
          ) {
            studentIds.add(
              chatMessage.sender.id
            );
          }

          if (
            chatMessage.receiver?.role ===
            "STUDENT"
          ) {
            studentIds.add(
              chatMessage.receiver.id
            );
          }

        }
      );

      return students.filter(
        (student) =>
          studentIds.has(student.id)
      );

    }, [
      students,
      messages
    ]);

  const filteredStudents =
    studentsWithMessages.filter(
      (student) => {

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
      }
    );

  const selectedMessages =
    selectedStudent
      ? messages.filter(
          (chatMessage) =>
            (
              chatMessage.sender?.id ===
                selectedStudent.id &&
              chatMessage.receiver?.id ===
                librarian?.id
            ) ||
            (
              chatMessage.sender?.id ===
                librarian?.id &&
              chatMessage.receiver?.id ===
                selectedStudent.id
            )
        )
      : [];

  async function handleSend(e) {

    e.preventDefault();

    if (
      !selectedStudent ||
      !message.trim()
    ) {
      return;
    }

    try {

      setSending(true);
      setError("");

      const newMessage =
        await sendChatMessage(
          selectedStudent.id,
          message.trim()
        );

      setMessages(
        (current) => [
          ...current,
          newMessage
        ]
      );

      setMessage("");

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to send reply."
      );

    } finally {

      setSending(false);

    }
  }

  function getLastMessage(studentId) {

    const studentMessages =
      messages.filter(
        (chatMessage) =>
          chatMessage.sender?.id ===
            studentId ||
          chatMessage.receiver?.id ===
            studentId
      );

    if (
      studentMessages.length === 0
    ) {
      return "No messages yet";
    }

    return studentMessages[
      studentMessages.length - 1
    ].message;
  }

  function hasUnread(studentId) {

    return messages.some(
      (chatMessage) =>
        chatMessage.sender?.id ===
          studentId &&
        chatMessage.receiver?.id ===
          librarian?.id &&
        !chatMessage.readStatus
    );
  }

  return (
    <div className="librarian-chat-page">

      <div className="librarian-chat-header">

        <div>

          <span className="eyebrow">
            LIBRARIAN SUPPORT
          </span>

          <h1>
            Chat Inbox
          </h1>

          <p>
            Respond to student questions
            and provide library assistance.
          </p>

        </div>

        <button
          className="librarian-chat-refresh"
          onClick={loadChat}
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {error && (

        <div className="librarian-chat-error">

          <AlertCircle size={17} />

          {error}

        </div>

      )}

      <div className="librarian-chat-layout">

        <aside className="chat-student-panel">

          <div className="chat-panel-heading">

            <strong>
              Student Messages
            </strong>

            <span>
              {studentsWithMessages.length}
            </span>

          </div>

          <div className="chat-student-search">

            <Search size={17} />

            <input
              placeholder="Search students..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          <div className="chat-student-list">

            {loading ? (

              <div className="chat-panel-empty">

                <RefreshCw size={25} />

                <p>
                  Loading...
                </p>

              </div>

            ) : filteredStudents.length === 0 ? (

              <div className="chat-panel-empty">

                <MessageCircle
                  size={35}
                />

                <p>
                  No student messages yet.
                </p>

              </div>

            ) : (

              filteredStudents.map(
                (student) => (

                  <button
                    className={`chat-student-item ${
                      selectedStudent?.id ===
                      student.id
                        ? "selected"
                        : ""
                    }`}
                    key={student.id}
                    onClick={() =>
                      setSelectedStudent(
                        student
                      )
                    }
                  >

                    <div className="chat-student-avatar">

                      {student.name
                        ?.charAt(0)
                        .toUpperCase()}

                    </div>

                    <div className="chat-student-info">

                      <div className="chat-student-name-row">

                        <strong>
                          {student.name}
                        </strong>

                        {hasUnread(
                          student.id
                        ) && (
                          <span className="unread-dot"></span>
                        )}

                      </div>

                      <p>
                        {getLastMessage(
                          student.id
                        )}
                      </p>

                    </div>

                  </button>

                )
              )

            )}

          </div>

        </aside>

        <section className="librarian-conversation">

          {!selectedStudent ? (

            <div className="conversation-empty">

              <MessageCircle
                size={55}
              />

              <h2>
                Select a student
              </h2>

              <p>
                Choose a student from the
                left panel to view the
                conversation.
              </p>

            </div>

          ) : (

            <>

              <div className="conversation-header">

                <div className="conversation-user-avatar">

                  {selectedStudent.name
                    ?.charAt(0)
                    .toUpperCase()}

                </div>

                <div>

                  <strong>
                    {selectedStudent.name}
                  </strong>

                  <span>
                    {selectedStudent.email}
                  </span>

                </div>

              </div>

              <div className="conversation-messages">

                {selectedMessages.length ===
                0 ? (

                  <div className="conversation-empty-small">

                    <MessageCircle
                      size={35}
                    />

                    <p>
                      No messages yet.
                    </p>

                  </div>

                ) : (

                  selectedMessages.map(
                    (chatMessage) => {

                      const mine =
                        chatMessage.sender?.id ===
                        librarian?.id;

                      return (

                        <div
                          key={
                            chatMessage.id
                          }
                          className={`librarian-message-row ${
                            mine
                              ? "mine"
                              : "student"
                          }`}
                        >

                          {!mine && (

                            <div className="conversation-avatar-small">

                              <UserRound
                                size={16}
                              />

                            </div>

                          )}

                          <div
                            className={`librarian-message-bubble ${
                              mine
                                ? "mine"
                                : "student"
                            }`}
                          >

                            <p>
                              {chatMessage.message}
                            </p>

                            <small>

                              {chatMessage.createdAt
                                ? new Date(
                                    chatMessage.createdAt
                                  ).toLocaleString(
                                    [],
                                    {
                                      hour:
                                        "2-digit",
                                      minute:
                                        "2-digit"
                                    }
                                  )
                                : ""}

                              {mine && (
                                <CheckCheck
                                  size={13}
                                />
                              )}

                            </small>

                          </div>

                        </div>

                      );

                    }
                  )

                )}

                <div
                  ref={messagesEndRef}
                />

              </div>

              <form
                className="librarian-chat-input"
                onSubmit={handleSend}
              >

                <input
                  value={message}
                  onChange={(e) =>
                    setMessage(
                      e.target.value
                    )
                  }
                  placeholder={`Reply to ${selectedStudent.name}...`}
                  disabled={sending}
                />

                <button
                  type="submit"
                  disabled={
                    sending ||
                    !message.trim()
                  }
                >

                  {sending ? (
                    <RefreshCw
                      size={19}
                    />
                  ) : (
                    <Send
                      size={19}
                    />
                  )}

                </button>

              </form>

            </>

          )}

        </section>

      </div>

    </div>
  );
}

export default LibrarianChat;