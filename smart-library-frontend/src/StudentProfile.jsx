import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Hash,
  CheckCircle2
} from "lucide-react";
import "./StudentProfile.css";

function StudentProfile() {
  const [user, setUser] = useState({});

  useEffect(() => {
    const savedUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    setUser(savedUser);
  }, []);

  function getInitials() {
    if (!user.name) {
      return "S";
    }

    return user.name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    <div className="student-profile-page">

      <div className="profile-header">

        <div className="profile-heading">

          <span className="eyebrow">
            MY LIBRARY
          </span>

          <h1>
            Student Profile
          </h1>

          <p>
            View your account and library information.
          </p>

        </div>

      </div>

      <div className="profile-layout">

        <div className="profile-main-card glass">

          <div className="profile-avatar">
            {getInitials()}
          </div>

          <h2>
            {user.name || "Student"}
          </h2>

          <p className="profile-email">
            {user.email || "No email available"}
          </p>

          <div className="profile-role">
            <GraduationCap size={16} />
            Student
          </div>

          <div className="profile-status">
            <CheckCircle2 size={16} />
            Library Account Active
          </div>

        </div>

        <div className="profile-info-card glass">

          <div className="profile-card-heading">
            <div className="profile-card-icon">
              <UserRound size={21} />
            </div>

            <div>
              <h2>
                Profile Information
              </h2>

              <p>
                Your registered account details
              </p>
            </div>
          </div>

          <div className="profile-info-grid">

            <div className="profile-info-item">

              <div className="profile-info-icon">
                <UserRound size={18} />
              </div>

              <div>
                <span>
                  Full Name
                </span>

                <strong>
                  {user.name || "Not available"}
                </strong>
              </div>

            </div>

            <div className="profile-info-item">

              <div className="profile-info-icon">
                <Mail size={18} />
              </div>

              <div>
                <span>
                  Email Address
                </span>

                <strong>
                  {user.email || "Not available"}
                </strong>
              </div>

            </div>

            <div className="profile-info-item">

              <div className="profile-info-icon">
                <GraduationCap size={18} />
              </div>

              <div>
                <span>
                  Account Type
                </span>

                <strong>
                  Student
                </strong>
              </div>

            </div>

            <div className="profile-info-item">

              <div className="profile-info-icon">
                <ShieldCheck size={18} />
              </div>

              <div>
                <span>
                  Account Status
                </span>

                <strong className="active-text">
                  Active
                </strong>
              </div>

            </div>

            <div className="profile-info-item">

              <div className="profile-info-icon">
                <Hash size={18} />
              </div>

              <div>
                <span>
                  Student ID
                </span>

                <strong>
                  {user.id || "Not available"}
                </strong>
              </div>

            </div>

            <div className="profile-info-item">

              <div className="profile-info-icon">
                <BookOpen size={18} />
              </div>

              <div>
                <span>
                  Library Access
                </span>

                <strong>
                  Borrow & Reserve
                </strong>
              </div>

            </div>

          </div>

        </div>

      </div>

      <div className="profile-note glass">

        <div className="profile-note-icon">
          <BookOpen size={20} />
        </div>

        <div>
          <h3>
            Smart Library Account
          </h3>

          <p>
            Use your account to browse books, borrow
            available copies, reserve unavailable books
            and track your library activity.
          </p>
        </div>

      </div>

    </div>
  );
}

export default StudentProfile;