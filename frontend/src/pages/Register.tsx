import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api, ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { AuthResponse } from "@mafioo/shared";

export function RegisterPage() {
  const { player, refresh } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (player) return <Navigate to="/city" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      await api.post<AuthResponse>("/auth/register", { username, email, password });
      await refresh();
      navigate("/city");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fields ?? {});
      } else {
        setError("Registration failed");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto" }} className="card">
      <h2>Create your gangster</h2>
      <form onSubmit={onSubmit}>
        <div className="form-row">
          <label>Username</label>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} required />
          {fieldErrors.username && <span className="error-text">{fieldErrors.username}</span>}
        </div>
        <div className="form-row">
          <label>Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {fieldErrors.email && <span className="error-text">{fieldErrors.email}</span>}
        </div>
        <div className="form-row">
          <label>Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="button" type="submit" disabled={submitting} style={{ width: "100%" }}>
          {submitting ? "Creating..." : "Create account"}
        </button>
      </form>
      <p style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
