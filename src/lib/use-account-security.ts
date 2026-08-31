import { supabase } from "@/lib/supabase";

// Supabase's client-side Auth API covers password/email changes, TOTP MFA,
// and revoking sessions — no custom table needed for any of it. What it
// deliberately does NOT cover: listing a user's other active
// sessions/devices, which needs the Admin API (service-role key). That key
// must never ship to the client, so a "connected sessions" list isn't
// buildable here — "sign out of all other devices" (global scope) is the
// closest safe equivalent, and it's what's exposed below.

export function useAccountSecurity() {
  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  const updateEmail = async (email: string) => {
    const { error } = await supabase.auth.updateUser({ email });
    return { error };
  };

  const signOutOtherDevices = async () => {
    const { error } = await supabase.auth.signOut({ scope: "global" });
    return { error };
  };

  const listMfaFactors = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    return { factors: data?.totp ?? [], error };
  };

  const enrollMfa = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    return { data, error };
  };

  const verifyMfa = async (factorId: string, code: string) => {
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError || !challenge) return { error: challengeError };
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
    return { error };
  };

  const unenrollMfa = async (factorId: string) => {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    return { error };
  };

  return { updatePassword, updateEmail, signOutOtherDevices, listMfaFactors, enrollMfa, verifyMfa, unenrollMfa };
}
