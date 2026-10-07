import { useEffect, useState } from "react";
import {
  UsersRound,
  RefreshCw,
  Search,
  ShieldCheck,
  GraduationCap,
  UserRound,
  Mail,
  AlertCircle
} from "lucide-react";

import { getUsers } from "./api";
import "./Users.css";

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers();

      setUsers(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter((user) => {
    const text = `
      ${user.name || ""}
      ${user.email || ""}
      ${user.role || ""}
    `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const students = users.filter(
    (user) => user.role === "STUDENT"
  ).length;

  const librarians = users.filter(
    (user) => user.role === "LIBRARIAN"
  ).length;

  function getRoleClass(role) {
    return role === "LIBRARIAN"
      ? "user-role librarian"
      : "user-role student";
  }

  return (
    <div className="users-page">

      <div className="users-header">

        <div className="users-heading">

          <span className="eyebrow">
            USER MANAGEMENT
          </span>

          <h1>
            Users
          </h1>

          <p>
            View registered students and library administrators.
          </p>

        </div>

        <button
          className="users-refresh glass-small"
          onClick={loadUsers}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "users-spin" : ""}
          />

          {loading ? "Refreshing..." : "Refresh"}
        </button>

      </div>

      {error && (
        <div className="users-error glass">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="users-summary">

        <div className="users-summary-card glass">

          <div className="users-summary-icon total">
            <UsersRound size={22} />
          </div>

          <div>
            <span>Total Users</span>
            <strong>{users.length}</strong>
          </div>

        </div>

        <div className="users-summary-card glass">

          <div className="users-summary-icon student">
            <GraduationCap size={22} />
          </div>

          <div>
            <span>Students</span>
            <strong>{students}</strong>
          </div>

        </div>

        <div className="users-summary-card glass">

          <div className="users-summary-icon librarian">
            <ShieldCheck size={22} />
          </div>

          <div>
            <span>Librarians</span>
            <strong>{librarians}</strong>
          </div>

        </div>

      </div>

      <div className="users-card glass">

        <div className="users-card-header">

          <div className="users-card-title">

            <div className="users-card-icon">
              <UsersRound size={20} />
            </div>

            <div>
              <h2>
                Registered Users
              </h2>

              <p>
                Manage and review library accounts.
              </p>
            </div>

          </div>

          <span className="users-count">
            {filteredUsers.length} users
          </span>

        </div>

        <div className="users-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        {loading ? (

          <div className="users-empty">

            <UsersRound size={40} />

            <h3>
              Loading users...
            </h3>

          </div>

        ) : filteredUsers.length === 0 ? (

          <div className="users-empty">

            <UsersRound size={40} />

            <h3>
              No users found
            </h3>

            <p>
              Try a different search.
            </p>

          </div>

        ) : (

          <div className="users-table-wrapper">

            <table className="users-table">

              <thead>

                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>User ID</th>
                </tr>

              </thead>

              <tbody>

                {filteredUsers.map((user) => (

                  <tr key={user.id}>

                    <td>

                      <div className="user-cell">

                        <div className="user-avatar">
                          {user.name
                            ? user.name
                                .split(" ")
                                .map((part) =>
                                  part.charAt(0)
                                )
                                .join("")
                                .substring(0, 2)
                                .toUpperCase()
                            : "U"}
                        </div>

                        <div>

                          <strong>
                            {user.name || "Unknown User"}
                          </strong>

                          <span>
                            Library Account
                          </span>

                        </div>

                      </div>

                    </td>

                    <td>

                      <div className="email-cell">

                        <Mail size={15} />

                        {user.email || "—"}

                      </div>

                    </td>

                    <td>

                      <span
                        className={getRoleClass(
                          user.role
                        )}
                      >

                        {user.role === "LIBRARIAN" ? (
                          <ShieldCheck size={15} />
                        ) : (
                          <GraduationCap size={15} />
                        )}

                        {user.role || "STUDENT"}

                      </span>

                    </td>

                    <td>

                      <span className="user-id">
                        #{user.id}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Users;