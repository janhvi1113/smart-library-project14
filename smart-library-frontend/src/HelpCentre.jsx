import React, { useMemo, useState } from "react";
import {
  Search,
  HelpCircle,
  BookOpen,
  CalendarClock,
  RotateCcw,
  Bell,
  MessageCircle,
  ChevronDown,
  LibraryBig
} from "lucide-react";
import "./HelpCentre.css";

const faqs = [
  {
    category: "Books",
    question: "How do I search for a book?",
    answer:
      "Go to the Book Catalog from the sidebar. You can search using the book title, author, category or ISBN. The catalog also shows the current availability of each book."
  },
  {
    category: "Books",
    question: "What does Available mean?",
    answer:
      "Available means that at least one physical copy of the book is currently available for borrowing."
  },
  {
    category: "Books",
    question: "What happens if a book is unavailable?",
    answer:
      "If all copies are issued, you can reserve the book. You will be added to the reservation queue and notified when a copy becomes available."
  },
  {
    category: "Reservations",
    question: "How do I reserve a book?",
    answer:
      "Open the Book Catalog and select an unavailable book. Click Reserve to join the queue. You can track your reservation from My Reservations."
  },
  {
    category: "Reservations",
    question: "How can I check my reservation position?",
    answer:
      "Open My Reservations from the sidebar. Your reservation status and queue position will be displayed there."
  },
  {
    category: "Reservations",
    question: "What does READY mean?",
    answer:
      "READY means a copy has been allocated to your reservation and is waiting for you to collect or borrow it."
  },
  {
    category: "Loans",
    question: "How long can I keep a borrowed book?",
    answer:
      "The current system gives a standard borrowing period of 7 days. The exact due date is displayed in My Loans."
  },
  {
    category: "Loans",
    question: "How do I return a book?",
    answer:
      "Open My Loans and find the active loan. Click the Return Book button to return it through the library system."
  },
  {
    category: "Loans",
    question: "What happens if my book is overdue?",
    answer:
      "An overdue notification will appear in Notifications. The system also shows how many days the book is overdue."
  },
  {
    category: "Notifications",
    question: "Where can I see library notifications?",
    answer:
      "Open Notifications from the sidebar. You can see due-date alerts, overdue notifications, reservation-ready messages and reminders from the librarian."
  },
  {
    category: "Notifications",
    question: "How do I read a librarian reminder?",
    answer:
      "Open Notifications and look under Messages from Librarian. Unread reminders are marked as NEW. You can click Mark as Read after viewing them."
  },
  {
    category: "Account",
    question: "How do I update my profile?",
    answer:
      "Open Profile from the sidebar to view your account information and available profile options."
  },
  {
    category: "Account",
    question: "I forgot what to do. Can I contact the librarian?",
    answer:
      "Yes. Use the Chat with Librarian option from the sidebar to directly send a message to the library staff."
  }
];

const categories = [
  { name: "All", icon: LibraryBig },
  { name: "Books", icon: BookOpen },
  { name: "Reservations", icon: CalendarClock },
  { name: "Loans", icon: RotateCcw },
  { name: "Notifications", icon: Bell },
  { name: "Account", icon: HelpCircle }
];

function HelpCentre() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState(null);

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return faqs.filter((faq) => {
      const categoryMatch =
        activeCategory === "All" || faq.category === activeCategory;

      const searchMatch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query);

      return categoryMatch && searchMatch;
    });
  }, [search, activeCategory]);

  const handleCategory = (category) => {
    setActiveCategory(category);
    setOpenIndex(null);
  };

  return (
    <div className="help-centre-page">
      <div className="help-hero">
        <div className="help-hero-icon">
          <HelpCircle size={32} />
        </div>

        <div>
          <span className="help-eyebrow">SMART LIBRARY SUPPORT</span>
          <h1>How can we help?</h1>
          <p>
            Find quick answers about books, reservations, loans and your
            library account.
          </p>
        </div>
      </div>

      <div className="help-search-box">
        <Search size={22} />
        <input
          type="text"
          placeholder="Search your question..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")}>Clear</button>
        )}
      </div>

      <div className="help-categories">
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <button
              key={category.name}
              className={
                activeCategory === category.name
                  ? "help-category active"
                  : "help-category"
              }
              onClick={() => handleCategory(category.name)}
            >
              <Icon size={18} />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      <div className="quick-help-grid">
        <div className="quick-help-card">
          <BookOpen size={25} />
          <div>
            <h3>Find a Book</h3>
            <p>Search the catalog and check availability.</p>
          </div>
        </div>

        <div className="quick-help-card">
          <CalendarClock size={25} />
          <div>
            <h3>Reservations</h3>
            <p>Check your queue position and reservation status.</p>
          </div>
        </div>

        <div className="quick-help-card">
          <Bell size={25} />
          <div>
            <h3>Notifications</h3>
            <p>Check reminders, due dates and alerts.</p>
          </div>
        </div>
      </div>

      <div className="faq-header">
        <div>
          <span className="help-eyebrow">FAQ</span>
          <h2>Frequently Asked Questions</h2>
        </div>

        <span className="faq-count">
          {filteredFaqs.length} question
          {filteredFaqs.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="faq-list">
        {filteredFaqs.length === 0 ? (
          <div className="no-faqs">
            <HelpCircle size={42} />
            <h3>No matching questions</h3>
            <p>Try another search or select a different category.</p>
          </div>
        ) : (
          filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                className={isOpen ? "faq-item open" : "faq-item"}
                key={`${faq.category}-${faq.question}`}
              >
                <button
                  className="faq-question"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <div>
                    <span className="faq-category">{faq.category}</span>
                    <h3>{faq.question}</h3>
                  </div>

                  <ChevronDown
                    size={21}
                    className={isOpen ? "faq-chevron rotated" : "faq-chevron"}
                  />
                </button>

                {isOpen && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="ask-librarian-card">
        <div className="ask-icon">
          <MessageCircle size={28} />
        </div>

        <div className="ask-content">
          <span className="help-eyebrow">NEED MORE HELP?</span>
          <h2>Ask the Librarian</h2>
          <p>
            Can't find the answer you're looking for? Send a message directly
            to the librarian.
          </p>
        </div>

        <button
          className="ask-librarian-button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("open-librarian-chat"));
          }}
        >
          <MessageCircle size={18} />
          Chat with Librarian
        </button>
      </div>
    </div>
  );
}

export default HelpCentre;