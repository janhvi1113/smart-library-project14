import { useState } from "react";
import {
  BookOpen,
  User,
  Mail,
  Lock,
  Sparkles
} from "lucide-react";
import { registerUser } from "./api";
import "./Register.css";

function Register({ onRegisterSuccess, onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await registerUser(name, email, password);

      setSuccess("Registration successful! You can now login.");

      setName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        onRegisterSuccess();
      }, 1200);

    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">

      <div className="register-decoration decoration-one"></div>
      <div className="register-decoration decoration-two"></div>

      <div className="register-card glass-register">

        <div className="register-logo">
          <BookOpen size={30} />
        </div>

        <div className="register-heading">

          <span className="register-eyebrow">
            SMART LIBRARY
          </span>

          <h1>Create account</h1>

          <p>
            Join the library and discover smarter reading.
          </p>

        </div>

        <form onSubmit={handleSubmit}>

          <label>Full Name</label>

          <div className="register-input">

            <User size={18} />

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
            />

          </div>

          <label>Email</label>

          <div className="register-input">

            <Mail size={18} />

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />

          </div>

          <label>Password</label>

          <div className="register-input">

            <Lock size={18} />

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              minLength={6}
            />

          </div>

          {error && (
            <div className="register-error">
              {error}
            </div>
          )}

          {success && (
            <div className="register-success">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create account"}

            <Sparkles size={17} />

          </button>

        </form>

        <div className="register-login">

          Already have an account?

          <button
            type="button"
            onClick={onLogin}
          >
            Sign in
          </button>

        </div>

        <div className="register-footer">
          Project 14 · Demand-Sensing Smart Library
        </div>

      </div>

    </div>
  );
}

export default Register;