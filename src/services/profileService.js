import { supabase } from "../lib/supabaseClient";
import { avatarAuthUrl, repairAvatarAuthMetadata } from "./avatarAuthService";

export function resizeImageToDataUrl(file, maxSize = 256, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image."));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const { width, height } = img;
        const minDim = Math.min(width, height);
        const startX = (width - minDim) / 2;
        const startY = (height - minDim) / 2;

        const targetDim = Math.min(minDim, maxSize);
        canvas.width = targetDim;
        canvas.height = targetDim;

        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(
          img,
          startX,
          startY,
          minDim,
          minDim,
          0,
          0,
          targetDim,
          targetDim
        );

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadAvatarImage(file, userId) {
  if (!file) {
    throw new Error("No file selected.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file (PNG, JPG, WebP, GIF).");
  }

  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Image file size must be less than 8 MB.");
  }

  // 1. Client-side square crop and optimize to 256x256 (~12-18KB)
  const resizedDataUrl = await resizeImageToDataUrl(file, 256, 0.85);

  // 2. Attempt uploading to Supabase Storage if bucket exists & permits
  if (userId) {
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const storagePath = `${userId}/avatar/profile-avatar.${extension}`;

      const res = await fetch(resizedDataUrl);
      const blob = await res.blob();

      const { error: uploadError } = await supabase.storage
        .from("application-documents")
        .upload(storagePath, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicData } = supabase.storage
          .from("application-documents")
          .getPublicUrl(storagePath);

        if (publicData?.publicUrl) {
          return `${publicData.publicUrl}?t=${Date.now()}`;
        }
      }
    } catch (storageErr) {
      console.warn("Storage upload fallback to data URL:", storageErr);
    }
  }

  // Seamless fallback to optimized data URL
  return resizedDataUrl;
}

function fromDatabase(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url || null,
    university: row.university,
    major: row.major,
    graduationYear: row.graduation_year,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getProfile() {
  await repairAvatarAuthMetadata();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  const profile = fromDatabase(data);
  if (profile && !profile.avatarUrl) {
    profile.avatarUrl = localStorage.getItem(`needajob:avatar:${profile.id}`);
  }
  return profile;
}

export async function updateProfile(profile, newAvatarUrl) {
  await repairAvatarAuthMetadata();
  const avatarToPersist =
    newAvatarUrl !== undefined ? newAvatarUrl : (profile.avatarUrl || null);

  // 1. Always update Supabase Auth user_metadata so avatar is immediately synced in auth session
  if (avatarToPersist !== undefined) {
    try {
      await supabase.auth.updateUser({
        data: {
          avatar_url: avatarAuthUrl(avatarToPersist),
        },
      });
    } catch (authError) {
      console.warn("Could not update auth user_metadata:", authError);
    }
  }

  // 2. Update profiles table
  const updatePayload = {
    display_name: profile.displayName,
    university: profile.university || null,
    major: profile.major || null,
    graduation_year: profile.graduationYear
      ? Number(profile.graduationYear)
      : null,
    updated_at: new Date().toISOString(),
  };

  let rowData;

  // Try updating with avatar_url first (if column exists)
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updatePayload,
        avatar_url: avatarToPersist || null,
      })
      .eq("id", profile.id)
      .select()
      .single();

    if (error) {
      if (error.code === "42703") {
        throw error; // Column does not exist, jump to fallback
      }
      throw error;
    }
    rowData = data;
  } catch {
    // Fallback: update without avatar_url
    const { data, error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", profile.id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    rowData = data;
  }

  const result = fromDatabase(rowData);
  if (avatarToPersist) {
    localStorage.setItem(`needajob:avatar:${profile.id}`, avatarToPersist);
  } else {
    localStorage.removeItem(`needajob:avatar:${profile.id}`);
  }
  if (avatarToPersist !== undefined) {
    result.avatarUrl = avatarToPersist;
  }

  return result;
}

export async function updateAvatar(avatarUrl) {
  await repairAvatarAuthMetadata();
  const { data: authData, error: authError } = await supabase.auth.updateUser({
    data: {
      avatar_url: avatarAuthUrl(avatarUrl),
    },
  });

  if (authError) {
    throw authError;
  }

  try {
    await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl || null,
      })
      .eq("id", authData.user.id);
  } catch {
    // Ignore if column doesn't exist yet
  }

  return authData.user;
}
