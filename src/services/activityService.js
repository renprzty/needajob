import { supabase } from "../lib/supabaseClient";

function fromDatabase(row) {
  return {
    id: row.id,
    applicationId: row.application_id,
    userId: row.user_id,
    activityType: row.activity_type,
    oldValue: row.old_value,
    newValue: row.new_value,
    description: row.description,
    createdAt: row.created_at,
  };
}

export async function getApplicationActivities(
  applicationId
) {
  const { data, error } = await supabase
    .from("application_activities")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return data.map(fromDatabase);
}

export async function getUserActivities(
  userId
) {
  const { data, error } = await supabase
    .from("application_activities")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: true,
    });

  if (error) throw error;

  return data.map(fromDatabase);
}
