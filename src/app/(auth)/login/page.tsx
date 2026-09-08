"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { AUTH_DATA } from "@/data/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn(email.trim(), password);
      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        // Hard navigate so Next.js router cache is refreshed with fresh session cookies
        window.location.href = "/dashboard";
      }
    } catch {
      setError("An unexpected network error occurred.");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-card-header">
        <h1 className="auth-title">{AUTH_DATA.login.title}</h1>
        <p className="auth-subtitle">{AUTH_DATA.login.subtitle}</p>
      </div>

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form auth-form--modern">
        {/* Email Input Field */}
        <div className="auth-field">
          <label className="auth-label" htmlFor="email">
            {AUTH_DATA.login.emailLabel}
          </label>
          <div className="auth-input-wrap">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="auth-input-icon"
              aria-hidden="true"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <input
              className="auth-input"
              name="email"
              id="email"
              type="email"
              placeholder={AUTH_DATA.login.emailPlaceholder}
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Password Input Field */}
        <div className="auth-field">
          <div className="auth-label-row">
            <label className="auth-label" htmlFor="password">
              {AUTH_DATA.login.passwordLabel}
            </label>
          </div>
          <div className="auth-input-wrap">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="auth-input-icon"
              aria-hidden="true"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              className="auth-input auth-input--password"
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              placeholder={AUTH_DATA.login.passwordPlaceholder}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" x2="22" y1="2" y2="22" />
                </svg>
              ) : (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Primary Submit CTA */}
        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="auth-spinner"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span>{AUTH_DATA.login.signingIn}</span>
            </>
          ) : (
            <>
              <span>{AUTH_DATA.login.cta}</span>
              <span aria-hidden="true">→</span>
            </>
          )}
        </button>
      </form>

      {/* Structured Divider */}
      <div className="auth-divider">
        <span>{AUTH_DATA.login.newToCorden}</span>
      </div>

      {/* Secondary Action */}
      <div className="auth-footer auth-footer--modern">
        <Link href="/signup" className="auth-secondary-link">
          {AUTH_DATA.login.createAccount}
        </Link>
      </div>

      {/* Trust Indicator */}
      <p className="auth-trust-row">
        <span className="auth-trust-dot" />
        <span>{AUTH_DATA.login.trustBadge}</span>
      </p>
    </>
  );
}
