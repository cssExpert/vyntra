import { storefrontFetch } from "@/lib/storefrontApi";

export async function requestPasswordReset(orgId: string, email: string) {
  return storefrontFetch<{ success: true; message: string }>(orgId, "/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email, resetUrlBase: `${window.location.origin}/account/reset-password` }),
  });
}

export async function resetPassword(orgId: string, token: string, newPassword: string) {
  return storefrontFetch<{ success: true }>(orgId, "/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}
