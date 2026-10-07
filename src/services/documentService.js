import { supabase } from "../lib/supabaseClient";
import { repairAvatarAuthMetadata } from "./avatarAuthService";

const DOCUMENT_BUCKET = "application-documents";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = ["application/pdf"];

function fromDatabase(row) {
  return {
    id: row.id,
    applicationId: row.application_id,
    userId: row.user_id,
    documentType: row.document_type,
    fileName: row.file_name,
    storagePath: row.storage_path,
    fileSize: row.file_size,
    mimeType: row.mime_type,
    createdAt: row.created_at,
  };
}

export function validateDocument(file) {
  if (!file) {
    return "Please choose a file.";
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Only PDF files are currently supported.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "The file must be 10 MB or smaller.";
  }

  if (file.size === 0) {
    return "The selected file is empty.";
  }

  return null;
}

export async function getApplicationDocuments(applicationId) {
  const { data, error } = await supabase
    .from("application_documents")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data.map(fromDatabase);
}

export async function uploadDocument({
  applicationId,
  userId,
  documentType,
  file,
}) {
  const validationError = validateDocument(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const extension =
    file.name.split(".").pop()?.toLowerCase() || "pdf";

  const uniqueName = `${crypto.randomUUID()}.${extension}`;

  const storagePath = `${userId}/${applicationId}/${uniqueName}`;

  await repairAvatarAuthMetadata();

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data, error: databaseError } = await supabase
    .from("application_documents")
    .insert({
      application_id: applicationId,
      user_id: userId,
      document_type: documentType,
      file_name: file.name,
      storage_path: storagePath,
      file_size: file.size,
      mime_type: file.type,
    })
    .select()
    .single();

  if (databaseError) {
    // Compensating action: remove the uploaded file so it isn't orphaned.
    await supabase.storage
      .from(DOCUMENT_BUCKET)
      .remove([storagePath]);

    throw databaseError;
  }

  return fromDatabase(data);
}

export async function getDocumentViewUrl(storagePath) {
  const { data, error } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .createSignedUrl(storagePath, 60);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

export async function deleteDocument(document) {
  const { error: storageError } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .remove([document.storagePath]);

  if (storageError) {
    throw storageError;
  }

  const { error: databaseError } = await supabase
    .from("application_documents")
    .delete()
    .eq("id", document.id);

  if (databaseError) {
    throw databaseError;
  }
}
