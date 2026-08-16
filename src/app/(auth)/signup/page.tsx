"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signUp(email, password, displayName);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <>
      <div className="auth-card-header">
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start drafting in 2D and 3D — free to get started.</p>
      </div>

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form auth-form--modern">
        <div className="auth-field">
          <label className="auth-label" htmlFor="display_name">Display name</label>
          <div className="auth-input-wrap">
            <User size={16} className="auth-input-icon" />
            <input
              className="auth-input"
              name="display_name"
              id="display_name"
              placeholder="Architect_01"
              required
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="email">Email</label>
          <div className="auth-input-wrap">
            <Mail size={16} className="auth-input-icon" />
            <input
              className="auth-input"
              name="email"
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="password">Password</label>
          <div className="auth-input-wrap">
            <Lock size={16} className="auth-input-icon" />
            <input
              className="auth-input auth-input--password"
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              placeholder="At least 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={18} className="auth-spinner" />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="auth-divider">
        <span>Already have an account?</span>
      </div>

      <div className="auth-footer auth-footer--modern">
        <Link href="/signup" className="auth-secondary-link">
          Sign in instead
        </Link>
      </div>

      <p className="auth-trust-row">
        <span className="auth-trust-dot" />
        Free forever · No credit card
      </p>
    </>
  );
}
