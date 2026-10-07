import { useState } from "react";
import {
  BookOpen,
  Lock,
  Mail,
  Sparkles
} from "lucide-react";
import { login } from "./api";
import "./Login.css";

function Login({ onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await login(email, password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      onLogin(data);

    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">

      <div className="login-decoration decoration-one"></div>
      <div className="login-decoration decoration-two"></div>

      <div className="login-card glass-login">

        <div className="login-logo">
          <BookOpen size={30} />
        </div>

        <div className="login-heading">
          <span className="login-eyebrow">
            SMART LIBRARY
          </span>

          <h1>Welcome back</h1>

          <p>
            Sign in to manage your library intelligence.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <label>Email</label>

          <div className="login-input">
            <Mail size={18} />

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <label>Password</label>

          <div className="login-input">
            <Lock size={18} />

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
            <Sparkles size={17} />
          </button>

        </form>

        <div className="login-register">
          Don't have an account?

          <button onClick={onRegister}>
            Create account
          </button>
        </div>

        <div className="login-footer">
          Project 14 · Demand-Sensing Smart Library
        </div>

      </div>
    </div>
  );
}

export default Login;