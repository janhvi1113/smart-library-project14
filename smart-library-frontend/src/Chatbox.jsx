import { useEffect, useRef, useState } from "react";

import {
  Send,
  MessageCircle,
  RefreshCw,
  UserRound,
  Bot,
  AlertCircle,
  BookOpen
} from "lucide-react";

import {
  getMyChatMessages,
  sendChatMessage,
  sendAIMessage
} from "./api";

import "./Chatbox.css";

function Chatbox() {

  const user =
    JSON.parse(
      localStorage.getItem("user") || "null"
    );

  const [messages, setMessages] =
    useState([]);

  const [message, setMessage] =
    useState("");

    const [aiMode, setAiMode] =
  useState(true);

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const messagesEndRef =
    useRef(null);

  const librarianId = 4;

  useEffect(() => {

  if (aiMode) {
    setLoading(false);
    return;
  }

  loadMessages();

  const interval =
    setInterval(
      loadMessages,
      5000
    );

  return () =>
    clearInterval(interval);

}, [aiMode]);

  useEffect(() => {
  const openChatHandler = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  window.addEventListener("open-librarian-chat", openChatHandler);

  return () => {
    window.removeEventListener("open-librarian-chat", openChatHandler);
  };
}, []);

  async function loadMessages() {

    try {

      const data =
        await getMyChatMessages();

      setMessages(data || []);

      setError("");

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

 async function handleSend(e) {

  e.preventDefault();

  if (!message.trim()) {
    return;
  }

  const currentMessage = message.trim();

  try {

    setSending(true);
    setError("");

    if (aiMode) {

      const userMessage = {
        id: Date.now(),
        message: currentMessage,
        sender: {
          id: user?.id
        },
        createdAt: new Date().toISOString(),
        ai: false
      };

      setMessages((current) => [
        ...current,
        userMessage
      ]);

      setMessage("");

      const aiResponse =
        await sendAIMessage(currentMessage);
        

      const aiMessage = {
  id: Date.now() + 1,
  message:
    aiResponse.reply ||
    "Sorry, I could not generate a response.",
  sender: {
    id: "ai"
  },
  createdAt: new Date().toISOString(),
  ai: true,
  recommendedBooks:
    aiResponse.recommendedBooks || []
};

      setMessages((current) => [
        ...current,
        aiMessage
      ]);

    } else {

      const newMessage =
        await sendChatMessage(
          librarianId,
          currentMessage
        );

      setMessages((current) => [
        ...current,
        newMessage
      ]);

      setMessage("");
    }

  } catch (err) {

    console.error(err);

    setError(
      err.message ||
      "Unable to send message."
    );
   

                               
  } finally {

    setSending(false);                                          

  }
}
  function isMine(chatMessage) {

  return (
    chatMessage.sender?.id === user?.id
  );

}
function formatAIMessage(text) {

  if (!text) {
    return "";
  }

  const parts = text.split("**");

  return parts.map((part, index) => {

    if (index % 2 === 1) {
      return (
        <strong key={index}>
          {part}
        </strong>
      );
    }

    return (
      <span key={index}>
        {part}
      </span>
    );

  });
}

  return (
    <div className="chatbox-page">

      <div className="chatbox-header">

        <div>

          <span className="eyebrow">
            LIBRARY SUPPORT
          </span>

          <h1>
            Chat with Librarian
          </h1>

          <p>
            Ask questions about books,
            reservations, borrowing and
            library services.
          </p>

        </div>

        <button
          className="chat-refresh"
          onClick={loadMessages}
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      <div className="chatbox-card glass">

<div className="chat-mode-switch">

  <button
    type="button"
    className={aiMode ? "active" : ""}
    onClick={() => setAiMode(true)}
  >
    🤖 AI Assistant
  </button>

  <button
    type="button"
    className={!aiMode ? "active" : ""}
    onClick={() => setAiMode(false)}
  >
    👩‍💼 Librarian
  </button>

</div>
        <div className="chatbox-top">

          <div className="chat-support-avatar">
            <MessageCircle size={21} />
          </div>

          <div>

            <strong>
              Library Librarian
            </strong>

            <span>
              Student Support
            </span>

          </div>

          <div className="chat-online">
            <span></span>
            Available
          </div>

        </div>

        <div className="chat-messages">

          {loading ? (

            <div className="chat-loading">
              <RefreshCw size={30} />
              <p>
                Loading conversation...
              </p>
            </div>

          ) : messages.length === 0 ? (

            <div className="chat-empty">

              <MessageCircle size={45} />

              <h3>
                Start a conversation
              </h3>

              <p>
                Have a question? Send a
                message to the librarian.
              </p>

            </div>

          ) : (

            messages.map((chatMessage) => {

              const mine =
                isMine(chatMessage);

              return (
                <div
                  key={chatMessage.id}
                  className={`chat-message-row ${
                    mine
                      ? "mine"
                      : "theirs"
                  }`}
                >

                  {!mine && (
                    <div className="chat-message-avatar">
                      <Bot size={17} />
                    </div>
                  )}

                  <div
                    className={`chat-bubble ${
                      mine
                        ? "mine"
                        : "theirs"
                    }`}
                  >

                 <p className={chatMessage.ai ? "ai-message-text" : ""}>
  {chatMessage.ai
    ? formatAIMessage(chatMessage.message)
    : chatMessage.message}
</p>

{chatMessage.ai &&
  chatMessage.recommendedBooks &&
  chatMessage.recommendedBooks.length > 0 && (

    <div className="ai-recommended-books">

      {chatMessage.recommendedBooks.map((book) => (

        <div
          className="ai-book-card"
          key={book.id}
        >

          <div className="ai-book-cover">

            {book.coverImageUrl ? (
              <img
                src={book.coverImageUrl}
                alt={`${book.title} cover`}
              />
            ) : (
              <BookOpen size={30} />
            )}

          </div>

          <div className="ai-book-info">

            <strong>
              {book.title}
            </strong>

            <span>
              {book.author}
            </span>

            <span className="ai-book-availability">
              {book.availableCopies > 0
                ? `${book.availableCopies} copies available`
                : "Currently unavailable"}
            </span>

          </div>

        </div>

      ))}

    </div>

)}

                    <small>
                      {chatMessage.createdAt
                        ? new Date(
                            chatMessage.createdAt
                          ).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit"
                            }
                          )
                        : ""}
                    </small>

                  </div>

                  {mine && (
                    <div className="chat-message-avatar student">
                      <UserRound size={17} />
                    </div>
                  )}

                </div>
              );

            })

          )}

          <div
            ref={messagesEndRef}
          />

        </div>

        {error && (

          <div className="chat-error">

            <AlertCircle size={17} />

            {error}

          </div>

        )}

        <form
          className="chat-input-area"
          onSubmit={handleSend}
        >

          <input
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            placeholder="Type your message..."
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
              <Send size={19} />
            )}

          </button>

        </form>

      </div>

    </div>
  );
}

export default Chatbox;