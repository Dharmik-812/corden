"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect } from "react";

export function Navbar() {
  const { user, hydrate, signOut } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        <Logo size={26} />
      </Link>

      <ul className="navbar-links">
        <li>
          <Link href="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link href="/pricing">Pricing</Link>
        </li>
      </ul>

      <div className="navbar-actions">
        <ThemeToggle />
        {user ? (
          <>
            <Link href="/profile" className="btn btn-ghost">
              {user.display_name}
            </Link>
            <button className="btn btn-outline" onClick={signOut}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-ghost">
              Log in
            </Link>
            <Link href="/signup" className="btn btn-primary">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
