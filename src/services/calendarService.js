import { supabase } from "../lib/supabaseClient";

function fromDatabase(row) {
  return {
    id: row.id,
    userId: row.user_id,
    applicationId: row.application_id,
    title: row.title,
    reminderDate: row.reminder_date,
    reminderTime: row.reminder_time,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getReminders() {
  const { data, error } = await supabase
    .from("calendar_reminders")
    .select("*")
    .order("reminder_date", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data.map(fromDatabase);
}

export async function createReminder({
  userId,
  applicationId,
  title,
  reminderDate,
  reminderTime,
  notes,
}) {
  const { data, error } = await supabase
    .from("calendar_reminders")
    .insert({
      user_id: userId,
      application_id: applicationId || null,
      title,
      reminder_date: reminderDate,
      reminder_time: reminderTime || null,
      notes: notes || null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return fromDatabase(data);
}

export async function deleteReminder(reminderId) {
  const { error } = await supabase
    .from("calendar_reminders")
    .delete()
    .eq("id", reminderId);

  if (error) {
    throw error;
  }
}

export async function updateReminder({
  id,
  applicationId,
  title,
  reminderDate,
  reminderTime,
  notes,
}) {
  const { data, error } = await supabase
    .from("calendar_reminders")
    .update({
      application_id: applicationId || null,
      title,
      reminder_date: reminderDate,
      reminder_time: reminderTime || null,
      notes: notes || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return fromDatabase(data);
}
