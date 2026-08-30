// Offline mock auth store — no Supabase needed
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
  signOut: () => void;
  upgradeToPro: () => void;
  updateProfile: (data: { display_name?: string; email?: string }) => { error?: string };
  hydrate: () => void;
}

const STORAGE_KEY = "corden-auth-user";
const USERS_KEY = "corden-auth-users";

function getStoredUsers(): Record<string, { password: string; user: MockUser }> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, { password: string; user: MockUser }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  hydrate: () => {
    if (typeof window === "undefined") {
      set({ isLoading: false });
      return;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ user: JSON.parse(stored), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  signUp: async (email, password, displayName) => {
    const users = getStoredUsers();
    if (users[email]) {
      return { error: "An account with this email already exists." };
    }

    const newUser: MockUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      email,
      display_name: displayName,
      membership_tier: "free",
      created_at: new Date().toISOString(),
    };

    users[email] = { password, user: newUser };
    saveUsers(users);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    set({ user: newUser });
    return {};
  },

  signIn: async (email, password) => {
    const users = getStoredUsers();
    const entry = users[email];
    if (!entry) {
      return { error: "No account found with this email." };
    }
    if (entry.password !== password) {
      return { error: "Invalid password." };
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry.user));
    set({ user: entry.user });
    return {};
  },

  signOut: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null });
  },

  upgradeToPro: () => {
    const { user } = get();
    if (!user) return;
    const upgraded = { ...user, membership_tier: "pro" as const };
    // Update session
    localStorage.setItem(STORAGE_KEY, JSON.stringify(upgraded));
    // Update users store
    const users = getStoredUsers();
    if (users[user.email]) {
      users[user.email].user = upgraded;
      saveUsers(users);
    }
    set({ user: upgraded });
  },

  updateProfile: (data) => {
    const { user } = get();
    if (!user) return { error: "Not logged in" };

    const users = getStoredUsers();
    
    // If email is changing, check if new email exists
    if (data.email && data.email !== user.email && users[data.email]) {
      return { error: "Email already in use." };
    }

    const updatedUser = { ...user, ...data };
    const oldEmail = user.email;

    // Update session
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    
    // Update users store
    if (users[oldEmail]) {
      const entry = users[oldEmail];
      entry.user = updatedUser;
      
      if (data.email && data.email !== oldEmail) {
        users[data.email] = entry;
        delete users[oldEmail];
      }
      saveUsers(users);
    }

    set({ user: updatedUser });
    return {};
  },
}));
