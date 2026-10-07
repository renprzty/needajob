import { supabase } from "../lib/supabaseClient";

function fromDatabase(row) {
  return {
    id: row.id,
    userId: row.user_id,
    company: row.company,
    position: row.position,
    location: row.location,
    workType: row.work_type,
    status: row.status,
    appliedDate: row.applied_date,
    followUpDate: row.follow_up_date,
    deadline: row.deadline,
    salaryMin: row.salary_min,
    salaryMax: row.salary_max,
    salaryCurrency: row.salary_currency,
    jobUrl: row.job_url,
    jobDescription: row.job_description,
    notes: row.notes,
    isArchived: row.is_archived,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    lastActivityAt: row.last_activity_at,
  };
}

function applicationFields(application) {
  return {
    company: application.company,
    position: application.position,
    location: application.location || null,
    work_type: application.workType,
    status: application.status,
    applied_date: application.appliedDate || null,
    follow_up_date: application.followUpDate || null,
    deadline: application.deadline || null,
    salary_min: application.salaryMin,
    salary_max: application.salaryMax,
    salary_currency: application.salaryCurrency,
    job_url: application.jobUrl || null,
    job_description: application.jobDescription || null,
    notes: application.notes || null,
    is_archived: application.isArchived ?? false,
  };
}

export async function getApplications(userId) {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data.map(fromDatabase);
}

export async function createApplication(
  application,
  userId
) {
  const { data, error } = await supabase
    .from("applications")
    .insert({
      ...applicationFields(application),
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return fromDatabase(data);
}

export async function updateApplication(
  application
) {
  const { data, error } = await supabase
    .from("applications")
    .update(applicationFields(application))
    .eq("id", application.id)
    .select()
    .single();

  if (error) throw error;

  return fromDatabase(data);
}

export async function deleteApplication(id) {
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteApplications(
  ids
) {
  if (!ids.length) {
    return;
  }

  const { error } = await supabase
    .from("applications")
    .delete()
    .in("id", ids);

  if (error) {
    throw error;
  }
}

export async function archiveApplication(
  applicationId
) {
  const { data, error } = await supabase
    .from("applications")
    .update({
      is_archived: true,
    })
    .eq("id", applicationId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return fromDatabase(data);
}

export async function restoreApplication(
  applicationId
) {
  const { data, error } = await supabase
    .from("applications")
    .update({
      is_archived: false,
    })
    .eq("id", applicationId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return fromDatabase(data);
}

export async function archiveApplications(
  ids
) {
  if (!ids.length) return [];

  const { data, error } = await supabase
    .from("applications")
    .update({
      is_archived: true,
    })
    .in("id", ids)
    .select();

  if (error) {
    throw error;
  }

  return data.map(fromDatabase);
}

export async function restoreApplications(
  ids
) {
  if (!ids.length) return [];

  const { data, error } = await supabase
    .from("applications")
    .update({
      is_archived: false,
    })
    .in("id", ids)
    .select();

  if (error) {
    throw error;
  }

  return data.map(fromDatabase);
}

export { fromDatabase, applicationFields };
