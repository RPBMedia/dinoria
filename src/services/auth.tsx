"use client";

/** Player identity.
 *
 * Everyone starts as a GUEST with a locally-stored explorer name — play is
 * never blocked behind sign-in (PRD). When Firebase is configured, players can
 * upgrade to a real account (email/password or Google) which unlocks the
 * global leaderboard now and cloud saves/achievements in later milestones.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { firebaseApp, firebaseConfigured } from "@/config/firebase";
import type { User } from "firebase/auth";

const GUEST_NAME_KEY = "dinoria.guestName";

const GUEST_NAMES = [
  "Brave Explorer",
  "Fossil Finder",
  "Junior Ranger",
  "Dino Tracker",
  "Egg Hunter",
  "Trail Blazer",
];

export interface Player {
  /** Stable id: Firebase uid, or "guest". */
  uid: string;
  name: string;
  isGuest: boolean;
}

interface AuthApi {
  player: Player;
  /** True while Firebase restores a session on load. */
  loading: boolean;
  /** Accounts are possible only when Firebase is configured. */
  accountsAvailable: boolean;
  setGuestName(name: string): void;
  signInWithGoogle(): Promise<string | null>;
  signInWithEmail(email: string, password: string): Promise<string | null>;
  signUpWithEmail(email: string, password: string): Promise<string | null>;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthApi | null>(null);

function randomGuestName(): string {
  return GUEST_NAMES[Math.floor(Math.random() * GUEST_NAMES.length)];
}

function readGuestName(): string {
  try {
    const stored = localStorage.getItem(GUEST_NAME_KEY);
    if (stored) return stored;
    const fresh = randomGuestName();
    localStorage.setItem(GUEST_NAME_KEY, fresh);
    return fresh;
  } catch {
    return "Explorer";
  }
}

function humanError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  if (code.includes("invalid-credential") || code.includes("wrong-password"))
    return "That email and password don't match.";
  if (code.includes("email-already-in-use"))
    return "That email already has an account — try signing in.";
  if (code.includes("weak-password"))
    return "Password is too weak — use at least 6 characters.";
  if (code.includes("invalid-email")) return "That email doesn't look right.";
  if (code.includes("popup-closed-by-user")) return "Sign-in was cancelled.";
  return "Something went wrong — please try again.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [guestName, setGuestNameState] = useState("Explorer");
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(firebaseConfigured);

  useEffect(() => {
    setGuestNameState(readGuestName());
  }, []);

  useEffect(() => {
    const app = firebaseApp();
    if (!app) return;
    let unsub = () => {};
    void import("firebase/auth").then(({ getAuth, onAuthStateChanged }) => {
      unsub = onAuthStateChanged(getAuth(app), (user) => {
        setFirebaseUser(user);
        setLoading(false);
      });
    });
    return () => unsub();
  }, []);

  const setGuestName = useCallback((name: string) => {
    const trimmed = name.trim().slice(0, 24) || "Explorer";
    setGuestNameState(trimmed);
    try {
      localStorage.setItem(GUEST_NAME_KEY, trimmed);
    } catch {
      /* private mode — keep in memory */
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const app = firebaseApp();
    if (!app) return "Accounts aren't available yet.";
    try {
      const { getAuth, GoogleAuthProvider, signInWithPopup } = await import(
        "firebase/auth"
      );
      await signInWithPopup(getAuth(app), new GoogleAuthProvider());
      return null;
    } catch (e) {
      return humanError(e);
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const app = firebaseApp();
    if (!app) return "Accounts aren't available yet.";
    try {
      const { getAuth, signInWithEmailAndPassword } = await import(
        "firebase/auth"
      );
      await signInWithEmailAndPassword(getAuth(app), email, password);
      return null;
    } catch (e) {
      return humanError(e);
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const app = firebaseApp();
    if (!app) return "Accounts aren't available yet.";
    try {
      const { getAuth, createUserWithEmailAndPassword } = await import(
        "firebase/auth"
      );
      await createUserWithEmailAndPassword(getAuth(app), email, password);
      return null;
    } catch (e) {
      return humanError(e);
    }
  }, []);

  const signOut = useCallback(async () => {
    const app = firebaseApp();
    if (!app) return;
    const { getAuth, signOut: fbSignOut } = await import("firebase/auth");
    await fbSignOut(getAuth(app));
  }, []);

  const value = useMemo<AuthApi>(() => {
    const player: Player = firebaseUser
      ? {
          uid: firebaseUser.uid,
          name:
            firebaseUser.displayName ||
            firebaseUser.email?.split("@")[0] ||
            "Explorer",
          isGuest: false,
        }
      : { uid: "guest", name: guestName, isGuest: true };
    return {
      player,
      loading,
      accountsAvailable: firebaseConfigured,
      setGuestName,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
    };
  }, [
    firebaseUser,
    guestName,
    loading,
    setGuestName,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
