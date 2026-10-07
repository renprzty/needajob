import { supabase } from "../lib/supabaseClient";

export function avatarAuthUrl(value) {
  // Auth metadata is embedded in every access token. Keep image bytes out.
  return typeof value === "string" && value.length <= 2048 && /^https?:\/\//i.test(value)
    ? value
    : null;
}

let repairPromise;

export async function repairAvatarAuthMetadata() {
  if (repairPromise) return repairPromise;

  repairPromise = (async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    const avatar = session?.user?.user_metadata?.avatar_url;
    if (!avatar || avatarAuthUrl(avatar)) return;

    // Retain the existing image locally until it can be saved in profiles.
    localStorage.setItem(`needajob:avatar:${session.user.id}`, avatar);
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: null },
    });
    if (updateError) throw updateError;
    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) throw refreshError;
  })();

  try {
    await repairPromise;
  } finally {
    repairPromise = undefined;
  }
}
