import { getSupabaseSecretKey, getSupabaseUrl } from "./env";

function adminHeaders(): HeadersInit {
  const secret = getSupabaseSecretKey();
  if (!secret) throw new Error("SUPABASE_SECRET_KEY is not configured");
  return {
    apikey: secret,
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/json",
  };
}

export interface AdminCreateUserResult {
  id: string;
  email: string;
}

/** Create a user with email already confirmed (no inbox verification needed). */
export async function adminCreateUser(
  email: string,
  password: string,
  displayName: string
): Promise<AdminCreateUserResult> {
  const res = await fetch(`${getSupabaseUrl()}/auth/v1/admin/users`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName.trim() },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = (data.msg as string | undefined) ?? (data.message as string | undefined) ?? "Signup failed";
    if (msg.toLowerCase().includes("already") || data.error_code === "email_exists") {
      throw new Error("EMAIL_EXISTS");
    }
    throw new Error(msg);
  }

  return { id: data.id as string, email: data.email as string };
}

export async function adminConfirmUser(userId: string): Promise<void> {
  const res = await fetch(`${getSupabaseUrl()}/auth/v1/admin/users/${userId}`, {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify({ email_confirm: true }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data.msg as string) ?? "Failed to confirm user");
  }
}
