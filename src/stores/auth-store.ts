/**
 * Auth store — now backed by real API endpoints.
 * The store shape is identical to the old mock version so all
 * existing UI components work without any changes.
 */
import { create } from "zustand";

export interface MockUser {
  id: string;
  email: string;
  display_name: string;
  membership_tier: "free" | "pro";
  created_at: string;
}

interface AuthState {
  user: MockUser | null;
  isLoading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  upgradeToPro: () => Promise<void>;
  updateProfile: (data: { display_name?: string; email?: string }) => Promise<{ error?: string }>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  // ── hydrate ─────────────────────────────────────────────────────────────
  hydrate: async () => {
    try {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      set({ user: json.user ?? null, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  // ── sign up ─────────────────────────────────────────────────────────────
  signUp: async (email, password, displayName) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
      });
      const json = await res.json();
      if (!res.ok) return { error: json.error ?? "Sign-up failed." };
      set({ user: json });
      return {};
    } catch {
      return { error: "Network error. Please try again." };
    }
  },

  // ── sign in ─────────────────────────────────────────────────────────────
  signIn: async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) return { error: json.error ?? "Sign-in failed." };
      set({ user: json });
      return {};
    } catch {
      return { error: "Network error. Please try again." };
    }
  },

  // ── sign out ─────────────────────────────────────────────────────────────
  signOut: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ user: null });
  },

  // ── upgrade to pro ───────────────────────────────────────────────────────
  upgradeToPro: async () => {
    try {
      const res = await fetch("/api/auth/upgrade", { method: "POST" });
      const json = await res.json();
      if (res.ok && json.user) set({ user: json.user });
    } catch {
      // silently fail — the UI shows a toast separately
    }
  },

  // ── update profile ────────────────────────────────────────────────────────
  updateProfile: async (data) => {
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) return { error: json.error ?? "Update failed." };
      set({ user: json.user });
      return {};
    } catch {
      return { error: "Network error. Please try again." };
    }
  },
}));
