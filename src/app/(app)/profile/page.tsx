"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, signOut, hydrate } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!user) {
    return (
      <main className="dashboard" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>You are not signed in.</p>
          <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
        </div>
      </main>
    );
  }

  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  const displayName = user.display_name || "Draftsman";
  const membershipTier = user.membership_tier || "free";

  return (
    <main className="dashboard">
      <div className="dashboard-header">
        <h2>Your Profile</h2>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'var(--accent-primary-light)',
                border: '1px solid var(--accent-primary-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                flexShrink: 0,
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ marginBottom: '0.25rem' }}>{displayName}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{user.email}</p>
              <span className={`badge ${membershipTier === 'pro' ? 'badge-pro' : 'badge-free'}`}>
                {membershipTier}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-secondary)' }}>
            <button className="btn btn-outline w-full" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
