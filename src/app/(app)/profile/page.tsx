"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, Mail, Crown, Edit2, Save, X } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, signOut, hydrate, updateProfile } = useAuthStore();
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  if (!user) {
    return (
      <div className="page-shell page-shell--dashboard dashboard-hero-bg">
        <main className="page-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
          <div className="panel" style={{ textAlign: "center", padding: "3rem", maxWidth: 400 }}>
            <User size={48} style={{ margin: "0 auto 1.5rem", color: "var(--text-tertiary)" }} />
            <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Not signed in</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Log in to view your profile settings.</p>
            <Link href="/login" className="btn btn-primary">Go to Login</Link>
          </div>
        </main>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  const handleSave = async () => {
    setError("");
    if (!displayName.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    
    const res = await updateProfile({ display_name: displayName, email });
    if (res.error) {
      setError(res.error);
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDisplayName(user.display_name || "");
    setEmail(user.email || "");
    setError("");
  };

  const membershipTier = user.membership_tier || "free";
  const isPro = membershipTier === "pro";

  return (
    <div className="page-shell page-shell--dashboard dashboard-hero-bg">
      <div className="page-mesh" aria-hidden />

      <main className="page-content page-content--dashboard" style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "4rem" }}>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel" 
          style={{ width: "100%", maxWidth: "560px", overflow: "hidden", padding: 0 }}
        >
          {/* Header background banner */}
          <div style={{
            height: "120px",
            background: isPro 
              ? "linear-gradient(135deg, rgba(85,155,255,0.15) 0%, rgba(142,84,233,0.15) 100%)" 
              : "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
            borderBottom: "1px solid var(--border-primary)",
            position: "relative"
          }}>
            {isPro && (
              <div style={{ position: "absolute", top: 16, right: 16 }}>
                <span style={{ 
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "rgba(142,84,233,0.2)", color: "#b68aff",
                  border: "1px solid rgba(142,84,233,0.4)",
                  padding: "4px 12px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600,
                  boxShadow: "0 0 20px rgba(142,84,233,0.2)"
                }}>
                  <Crown size={14} /> PRO
                </span>
              </div>
            )}
          </div>

          <div style={{ padding: "0 2rem 2rem", position: "relative" }}>
            {/* Avatar */}
            <div style={{
              width: "88px", height: "88px",
              borderRadius: "50%",
              background: "var(--bg-panel)",
              border: "1px solid var(--border-primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2.2rem", fontWeight: 700,
              color: "var(--accent-primary)",
              marginTop: "-44px",
              marginBottom: "1.5rem",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.1)",
              position: "relative", zIndex: 10
            }}>
              {user.display_name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
              <div>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "4px" }}>
                  Your Profile
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  Manage your personal details and account settings.
                </p>
              </div>
              
              {!isEditing && (
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={14} /> Edit Profile
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden" }}
                >
                  {error && (
                    <div style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", padding: "12px", borderRadius: 8, fontSize: "0.85rem", marginBottom: 16, border: "1px solid rgba(239,68,68,0.3)" }}>
                      {error}
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: 500 }}>
                        Display Name
                      </label>
                      <div style={{ position: "relative" }}>
                        <User size={16} style={{ position: "absolute", left: 14, top: 14, color: "var(--text-tertiary)" }} />
                        <input
                          type="text"
                          className="input"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          style={{ paddingLeft: "42px" }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: 500 }}>
                        Email Address
                      </label>
                      <div style={{ position: "relative" }}>
                        <Mail size={16} style={{ position: "absolute", left: 14, top: 14, color: "var(--text-tertiary)" }} />
                        <input
                          type="email"
                          className="input"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          style={{ paddingLeft: "42px" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                    <button className="btn btn-outline" onClick={handleCancel}>
                      <X size={16} /> Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSave}>
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="view"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid var(--border-primary)" }}>
                      <User size={18} style={{ color: "var(--text-tertiary)" }} />
                      <div>
                        <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-tertiary)", marginBottom: 2 }}>Display Name</div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--text-primary)" }}>{user.display_name}</div>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid var(--border-primary)" }}>
                      <Mail size={18} style={{ color: "var(--text-tertiary)" }} />
                      <div>
                        <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-tertiary)", marginBottom: 2 }}>Email Address</div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--text-primary)" }}>{user.email}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ paddingTop: "2rem", borderTop: "1px solid var(--border-secondary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-tertiary)" }}>
                      Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : ""}
                    </span>
                    <button className="btn btn-outline" style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.2)" }} onClick={handleSignOut}>
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
