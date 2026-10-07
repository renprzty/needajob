import { supabase } from "../lib/supabaseClient";
import { repairAvatarAuthMetadata } from "./avatarAuthService";

const DOCUMENT_BUCKET = "application-documents";

function fromDatabase(row) {
  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    documentType: row.document_type,
    name: row.name,
    versionLabel: row.version_label,
    fileName: row.file_name,
    storagePath: row.storage_path,
    fileSize: row.file_size,
    mimeType: row.mime_type,
    isArchived: row.is_archived,
    extractedText: row.extracted_text ?? null,
    textExtractedAt: row.text_extracted_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getDocuments({ archived = false } = {}) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("is_archived", archived)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data.map(fromDatabase);
}

export async function getLibraryDocumentViewUrl(storagePath) {
  await repairAvatarAuthMetadata();
  const { data, error } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .createSignedUrl(storagePath, 60);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

export async function updateLibraryDocument({
  id,
  name,
  versionLabel,
  documentType,
}) {
  const { data, error } = await supabase
    .from("documents")
    .update({
      name: name.trim(),
      version_label: versionLabel?.trim() || null,
      document_type: documentType,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return fromDatabase(data);
}

export async function archiveLibraryDocument(id) {
  const { data, error } = await supabase
    .from("documents")
    .update({
      is_archived: true,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return fromDatabase(data);
}

export async function restoreLibraryDocument(id) {
  const { data, error } = await supabase
    .from("documents")
    .update({
      is_archived: false,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return fromDatabase(data);
}

export async function uploadLibraryDocument({
  userId,
  documentType,
  name,
  versionLabel,
  file,
}) {
  if (!file) {
    throw new Error("Please choose a file.");
  }

  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are supported.");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("The file must be 10 MB or smaller.");
  }

  const extension =
    file.name.split(".").pop()?.toLowerCase() || "pdf";

  const uniqueName = `${crypto.randomUUID()}.${extension}`;

  const storagePath = `${userId}/library/${uniqueName}`;

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

  let extractedText = null;
  try {
    // Load PDF.js only when extraction is needed, keeping initial navigation light.
    const { extractPdfText } = await import("../utils/pdfTextExtractor.js");
    extractedText = (await extractPdfText(file)) || null;
  } catch (error) {
    console.warn("PDF text extraction failed:", error);
  }

  const { data, error: databaseError } = await supabase
    .from("documents")
    .insert({
      user_id: userId,
      document_type: documentType,
      name: name.trim(),
      version_label: versionLabel?.trim() || null,
      file_name: file.name,
      storage_path: storagePath,
      file_size: file.size,
      mime_type: file.type,
      extracted_text: extractedText,
      text_extracted_at: extractedText ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (databaseError) {
    await supabase.storage.from(DOCUMENT_BUCKET).remove([storagePath]);
    throw databaseError;
  }

  return fromDatabase(data);
}

export async function extractExistingDocumentText(document) {
  if (document.extractedText?.trim()) return document;
  await repairAvatarAuthMetadata();
  const { data: fileBlob, error: downloadError } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .download(document.storagePath);
  if (downloadError) throw downloadError;

  const { extractPdfText } = await import("../utils/pdfTextExtractor.js");
  const extractedText = await extractPdfText(fileBlob);
  if (!extractedText.trim()) {
    throw new Error("No readable text was found in this PDF. Scanned PDFs need OCR, which is not supported yet.");
  }
  const { data, error } = await supabase.from("documents")
    .update({
      extracted_text: extractedText,
      text_extracted_at: new Date().toISOString(),
    })
    .eq("id", document.id)
    .select()
    .single();
  if (error) throw error;
  return fromDatabase(data);
}

export async function linkDocumentToApplication({
  applicationId,
  documentId,
  userId,
}) {
  const { data, error } = await supabase
    .from("application_document_links")
    .insert({
      application_id: applicationId,
      document_id: documentId,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function unlinkDocumentFromApplication({
  applicationId,
  documentId,
}) {
  await repairAvatarAuthMetadata();
  const { data, error } = await supabase
    .from("application_document_links")
    .delete()
    .eq("application_id", applicationId)
    .eq("document_id", documentId)
    .select("id");

  if (error) {
    throw error;
  }
  if (!data?.length) {
    throw new Error("Document could not be unlinked. Refresh the page and check your access permissions.");
  }
}

export async function getApplicationLinkedDocuments(applicationId) {
  const { data, error } = await supabase
    .from("application_document_links")
    .select(`
      id,
      document_id,
      attached_at,
      documents (
        id,
        user_id,
        document_type,
        name,
        version_label,
        file_name,
        storage_path,
        file_size,
        mime_type,
        is_archived,
        extracted_text,
        text_extracted_at,
        created_at,
        updated_at
      )
    `)
    .eq("application_id", applicationId)
    .order("attached_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data.map((row) => ({
    linkId: row.id,
    attachedAt: row.attached_at,
    document: fromDatabase(row.documents),
  }));
}

export async function getDocumentUsageCounts() {
  const { data, error } = await supabase
    .from("application_document_links")
    .select("document_id");

  if (error) {
    throw error;
  }

  const counts = {};

  for (const row of data) {
    counts[row.document_id] = (counts[row.document_id] || 0) + 1;
  }

  return counts;
}

export async function getAllDocumentLinks() {
  const { data, error } = await supabase
    .from("application_document_links")
    .select(`
      id,
      application_id,
      document_id,
      attached_at
    `);

  if (error) {
    throw error;
  }

  return data.map((row) => ({
    id: row.id,
    applicationId: row.application_id,
    documentId: row.document_id,
    attachedAt: row.attached_at,
  }));
}

export async function deleteLibraryDocument(document) {
  const { count, error: countError } = await supabase
    .from("application_document_links")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("document_id", document.id);

  if (countError) {
    throw countError;
  }

  if (count > 0) {
    throw new Error(
      `This document is still attached to ${count} application${
        count === 1 ? "" : "s"
      }. Unlink it before deleting it.`
    );
  }

  const { error: storageError } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .remove([document.storagePath]);

  if (storageError) {
    throw storageError;
  }

  const { error: databaseError } = await supabase
    .from("documents")
    .delete()
    .eq("id", document.id);

  if (databaseError) {
    throw databaseError;
  }
}
