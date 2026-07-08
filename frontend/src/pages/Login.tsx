import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api, ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { AuthResponse } from "@mafioo/shared";

export function LoginPage() {
  const { player, refresh } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (player) return <Navigate to="/city" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post<AuthResponse>("/auth/login", { username, password });
      await refresh();
      navigate("/city");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto" }} className="card">
      <h2>Sign in to Mafioo</h2>
      <form onSubmit={onSubmit}>
        <div className="form-row">
          <label>Username</label>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="button" type="submit" disabled={submitting} style={{ width: "100%" }}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p style={{ marginTop: 12 }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
