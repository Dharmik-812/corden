"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-container">
      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <ThemeToggle />
      </div>
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link href="/" className="navbar-brand" style={{ justifyContent: 'center' }}>
            <span>Corden</span>—the Atelier
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
