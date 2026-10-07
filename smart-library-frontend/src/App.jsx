import { useState, useEffect } from "react";
import {
  BookOpen,
  CalendarClock,
  History,
  UserRound,
  LogOut,
  Menu,
  X,
  GraduationCap,
  LayoutDashboard,
  RotateCcw,
  ShoppingCart,
  UsersRound,
  Bell,
  LibraryBig,
  MessageCircle,
  HelpCircle
} from "lucide-react";

import Login from "./Login";
import Register from "./Register";

import BookCatalog from "./BookCatalog";
import MyReservations from "./MyReservations";
import MyLoans from "./MyLoans";
import StudentProfile from "./StudentProfile";

import Dashboard from "./Dashboard";
import Circulation from "./Circulation";
import Acquisition from "./Acquisition";
import Users from "./Users";
import Notifications from "./Notifications";
import BookManagement from "./BookManagement";
import StudentReminders from "./StudentReminders";

import "./App.css";
import Chatbox from "./Chatbox";
import LibrarianChat from "./LibrarianChat.jsx";
import HelpCentre from "./HelpCentre";

function App() {
  const savedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const [user, setUser] = useState(savedUser);
  const [showRegister, setShowRegister] = useState(false);

  const [activePage, setActivePage] = useState(
    savedUser?.role === "LIBRARIAN"
      ? "dashboard"
      : "catalog"
  );
  useEffect(() => {
  const openChatHandler = () => {
    setActivePage("chat");
  };

  window.addEventListener("open-librarian-chat", openChatHandler);

  return () => {
    window.removeEventListener("open-librarian-chat", openChatHandler);
  };
}, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogin(data) {
    localStorage.setItem(
      "token",
      data.token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(data)
    );

    setUser(data);

    setActivePage(
      data.role === "LIBRARIAN"
        ? "dashboard"
        : "catalog"
    );

    setSidebarOpen(false);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setSidebarOpen(false);
  }

  function handleNavigation(page) {
    setActivePage(page);
    setSidebarOpen(false);
  }

  function renderPage() {
    if (user?.role === "LIBRARIAN") {

      if (activePage === "dashboard") {
        return <Dashboard />;
      }

      if (activePage === "circulation") {
        return <Circulation />;
      }

      if (activePage === "acquisition") {
        return <Acquisition />;
      }

      if (activePage === "book-management") {
        return <BookManagement />;
      }
      if (activePage === "student-reminders") {
  return <StudentReminders />;
}
if (activePage === "librarian-chat") {
  return <LibrarianChat />;
}


      if (activePage === "catalog") {
        return <BookCatalog />;
      }

      if (activePage === "users") {
        return <Users />;
      }

      return <Dashboard />;
    }

    if (activePage === "catalog") {
      return <BookCatalog />;
    }

    if (activePage === "notifications") {
      return <Notifications />;
    }
    if (activePage === "chat") {
  return <Chatbox />;
}
if (activePage === "help") {
  return <HelpCentre />;
}

    if (activePage === "reservations") {
      return <MyReservations />;
    }

    if (activePage === "loans") {
      return <MyLoans />;
    }

    if (activePage === "profile") {
      return <StudentProfile />;
    }

    return <BookCatalog />;
  }

  if (!user) {

    if (showRegister) {
      return (
        <Register
          onRegisterSuccess={() => {
            setShowRegister(false);
          }}
          onLogin={() => {
            setShowRegister(false);
          }}
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onRegister={() =>
          setShowRegister(true)
        }
      />
    );
  }

  const studentNavigation = [
    {
      id: "catalog",
      label: "Book Catalog",
      icon: BookOpen
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell
    },
    {
      id: "reservations",
      label: "My Reservations",
      icon: CalendarClock
    },
    {
      id: "loans",
      label: "My Loans",
      icon: History
    },
    {
  id: "help",
  label: "Help Centre",
  icon: HelpCircle
},
    {
      id: "profile",
      label: "My Profile",
      icon: UserRound
    },
    {
  id: "chat",
  label: "Chat with Librarian",
  icon: MessageCircle
}
  ];

  const librarianNavigation = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard
    },
    {
      id: "circulation",
      label: "Circulation",
      icon: RotateCcw
    },
    {
      id: "acquisition",
      label: "Acquisition",
      icon: ShoppingCart
    },
    {
      id: "book-management",
      label: "Book Management",
      icon: LibraryBig
    },
    {
  id: "student-reminders",
  label: "Student Reminders",
  icon: Bell
},
    {
      id: "catalog",
      label: "Book Catalog",
      icon: BookOpen
    },
    {
  id: "librarian-chat",
  label: "Chat Inbox",
  icon: MessageCircle
},
    {
      id: "users",
      label: "Users",
      icon: UsersRound
    }
  ];

  const navigation =
    user.role === "LIBRARIAN"
      ? librarianNavigation
      : studentNavigation;

  const currentPage =
    navigation.find(
      (item) => item.id === activePage
    );

  const initials =
    user.name
      ? user.name
          .split(" ")
          .map((part) =>
            part.charAt(0)
          )
          .join("")
          .substring(0, 2)
          .toUpperCase()
      : user.role === "LIBRARIAN"
        ? "L"
        : "S";

  const isLibrarian =
    user.role === "LIBRARIAN";

  return (
    <div className="app-shell">

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        ></div>
      )}

      <aside
        className={`sidebar ${
          sidebarOpen
            ? "sidebar-open"
            : ""
        }`}
      >

        <div className="sidebar-brand">

          <div className="brand-icon">
            <BookOpen size={25} />
          </div>

          <div>
            <h2>
              Smart Library
            </h2>

            <span>
              Project 14
            </span>
          </div>

          <button
            className="mobile-close-button"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <X size={20} />
          </button>

        </div>

        <div className="sidebar-section-title">

          {isLibrarian
            ? "LIBRARIAN MENU"
            : "LIBRARY"}

        </div>

        <nav className="sidebar-navigation">

          {navigation.map(
            (item) => {

              const Icon =
                item.icon;

              return (
                <button
                  key={item.id}
                  className={`sidebar-nav-item ${
                    activePage === item.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleNavigation(
                      item.id
                    )
                  }
                >

                  <Icon size={19} />

                  <span>
                    {item.label}
                  </span>

                </button>
              );

            }
          )}

        </nav>

        <div className="sidebar-bottom">

          <div className="sidebar-user-card">

            <div className="sidebar-user-avatar">
              {initials}
            </div>

            <div className="sidebar-user-info">

              <strong>
                {user.name ||
                  (isLibrarian
                    ? "Librarian"
                    : "Student")}
              </strong>

              <span>
                {user.email || ""}
              </span>

            </div>

          </div>

          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >

            <LogOut size={18} />

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>

      <div className="main-area">

        <header className="topbar">

          <div className="topbar-left">

            <button
              className="mobile-menu-button"
              onClick={() =>
                setSidebarOpen(true)
              }
            >
              <Menu size={22} />
            </button>

            <div className="topbar-page-info">

              <span>
                SMART LIBRARY
              </span>

              <strong>
                {currentPage?.label ||
                  "Smart Library"}
              </strong>

            </div>

          </div>

          <div className="topbar-user">

            <div className="topbar-user-icon">

              {isLibrarian ? (
                <UsersRound
                  size={18}
                />
              ) : (
                <GraduationCap
                  size={18}
                />
              )}

            </div>

            <div>

              <strong>
                {user.name ||
                  (isLibrarian
                    ? "Librarian"
                    : "Student")}
              </strong>

              <span>
                {isLibrarian
                  ? "Librarian"
                  : "Student"}
              </span>

            </div>

          </div>

        </header>

        <main className="main-content">

          {renderPage()}

        </main>

      </div>

    </div>
  );
}

export default App;