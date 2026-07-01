import type { AuthUser, StoredUser } from "./types";

const USERS_KEY = "sehi-auth-users";

async function hashPassword(password: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function loadUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function registerUser(
  email: string,
  name: string,
  password: string
): Promise<AuthUser> {
  const normalized = email.trim().toLowerCase();
  const users = loadUsers();

  if (users.some((u) => u.email === normalized)) {
    throw new Error("EMAIL_EXISTS");
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    email: normalized,
    name: name.trim(),
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  saveUsers([...users, user]);
  return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt };
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const normalized = email.trim().toLowerCase();
  const users = loadUsers();
  const user = users.find((u) => u.email === normalized);
  if (!user) return null;

  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) return null;

  return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt };
}

export function getUserById(id: string): AuthUser | null {
  const user = loadUsers().find((u) => u.id === id);
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt };
}
