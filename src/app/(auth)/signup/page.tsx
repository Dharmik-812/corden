"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { AUTH_DATA } from "@/data/auth";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signUp(email.trim(), password, displayName.trim());
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
        <h1 className="auth-title">{AUTH_DATA.signup.title}</h1>
        <p className="auth-subtitle">{AUTH_DATA.signup.subtitle}</p>
      </div>

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form auth-form--modern">
        {/* Display Name Field */}
        <div className="auth-field">
          <label className="auth-label" htmlFor="display_name">
            {AUTH_DATA.signup.nameLabel}
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
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              className="auth-input"
              name="display_name"
              id="display_name"
              placeholder={AUTH_DATA.signup.namePlaceholder}
              required
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="auth-field">
          <label className="auth-label" htmlFor="email">
            {AUTH_DATA.signup.emailLabel}
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
              placeholder={AUTH_DATA.signup.emailPlaceholder}
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="auth-field">
          <label className="auth-label" htmlFor="password">
            {AUTH_DATA.signup.passwordLabel}
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
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              className="auth-input auth-input--password"
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              placeholder={AUTH_DATA.signup.passwordPlaceholder}
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

        {/* Submit Primary CTA */}
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
              <span>{AUTH_DATA.signup.creatingAccount}</span>
            </>
          ) : (
            <>
              <span>{AUTH_DATA.signup.cta}</span>
              <span aria-hidden="true">→</span>
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="auth-divider">
        <span>{AUTH_DATA.signup.alreadyHaveAccount}</span>
      </div>

      {/* Secondary Action */}
      <div className="auth-footer auth-footer--modern">
        <Link href="/login" className="auth-secondary-link">
          {AUTH_DATA.signup.signIn}
        </Link>
      </div>

      {/* Trust Indicator */}
      <p className="auth-trust-row">
        <span className="auth-trust-dot" />
        <span>{AUTH_DATA.signup.trustBadge}</span>
      </p>
    </>
  );
}
