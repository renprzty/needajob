import { useEffect, useState } from "react";
import {
  getApplicationLinkedDocuments,
  getLibraryDocumentViewUrl,
  linkDocumentToApplication,
  unlinkDocumentFromApplication,
} from "../services/documentLibraryService";
import DocumentLibraryPicker from "./DocumentLibraryPicker";
import DocumentLibraryModal from "./DocumentLibraryModal";

const DOCUMENT_TYPES = [
  { value: "resume", label: "Resume / CV" },
  { value: "cover_letter", label: "Cover Letter" },
  { value: "portfolio", label: "Portfolio" },
  { value: "transcript", label: "Transcript" },
  { value: "other", label: "Other" },
];

const getDocumentTypeLabel = (type) =>
  DOCUMENT_TYPES.find((d) => d.value === type)?.label ?? "Document";

export default function ApplicationDocuments({
  application,
  user,
  onDocumentsChanged,
}) {
  const [linkedDocuments, setLinkedDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [pendingActions, setPendingActions] = useState({});

  async function handleViewDocument(linkId, document) {
    setError(null);
    // Open during the click so browsers don't block the tab after the request.
    const tab = window.open("about:blank", "_blank");
    if (!tab) {
      setError("Please allow pop-ups for this site to view documents.");
      return;
    }
    tab.opener = null;
    setPendingActions((current) => ({ ...current, [linkId]: "view" }));
    try {
      const url = await getLibraryDocumentViewUrl(document.storagePath);
      tab.location.replace(url);
    } catch (err) {
      tab.close();
      setError(`Failed to open document: ${err.message || "Please try again."}`);
    } finally {
      setPendingActions((current) => ({ ...current, [linkId]: null }));
    }
  }

  async function handleUnlinkDocument(linkId, document) {
    setError(null);
    setPendingActions((current) => ({ ...current, [linkId]: "unlink" }));
    try {
      await unlinkDocumentFromApplication({
        applicationId: application.id,
        documentId: document.id,
      });
      setLinkedDocuments((current) => current.filter((item) => item.linkId !== linkId));
      onDocumentsChanged?.();
    } catch (err) {
      setError(`Failed to unlink document: ${err.message || "Please try again."}`);
    } finally {
      setPendingActions((current) => ({ ...current, [linkId]: null }));
    }
  }

  async function loadLinkedDocuments() {
    try {
      setError(null);
      const data = await getApplicationLinkedDocuments(application.id);
      setLinkedDocuments(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load documents.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLinkedDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application.id]);

  async function handleLibraryDocumentCreated(document) {
    try {
      await linkDocumentToApplication({
        applicationId: application.id,
        documentId: document.id,
        userId: user.id,
      });

      await loadLinkedDocuments();
      setIsUploadOpen(false);
      onDocumentsChanged?.();
    } catch (err) {
      console.error(err);
      setError("Failed to link new document.");
    }
  }

  return (
    <>
      <section className="application-documents aero-panel">
        <div className="documents-header">
          <div>
            <h2>Documents</h2>
            <p>Keep the exact documents used for this application.</p>
          </div>
          <div className="documents-header-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setIsLibraryOpen(true)}
            >
              Choose from Library
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => setIsUploadOpen(true)}
            >
              Upload New to Library
            </button>
          </div>
        </div>

        {error && <div className="documents-error" role="alert">{error}</div>}

        {isLoading ? (
          <div className="documents-loading">Loading documents...</div>
        ) : linkedDocuments.length === 0 ? (
          <div className="documents-empty">
            <div className="documents-empty-icon">PDF</div>
            <h3>No documents yet</h3>
            <p>
              Attach a resume, cover letter, or other PDF from your library or
              upload a new one.
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "center",
                marginTop: "1rem",
              }}
            >
              <button
                type="button"
                className="secondary-button"
                onClick={() => setIsLibraryOpen(true)}
              >
                Choose from Library
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => setIsUploadOpen(true)}
              >
                Upload New to Library
              </button>
            </div>
          </div>
        ) : (
          <div className="documents-list">
            {linkedDocuments.map(({ linkId, document }) => (
              <article key={linkId} className="document-card">
                <div className="document-card-main">
                  <div className="document-file-icon">PDF</div>
                  <div className="document-info">
                    <span className="document-type">
                      {getDocumentTypeLabel(document.documentType)}
                    </span>
                    <h3>
                      {document.name}
                      {document.versionLabel
                        ? ` · ${document.versionLabel}`
                        : ""}
                    </h3>
                    <p>{document.fileName}</p>
                  </div>
                </div>

                <div className="document-card-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={Boolean(pendingActions[linkId])}
                    onClick={() => handleViewDocument(linkId, document)}
                  >
                    {pendingActions[linkId] === "view" ? "Opening..." : "View"}
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    disabled={Boolean(pendingActions[linkId])}
                    onClick={() => handleUnlinkDocument(linkId, document)}
                  >
                    {pendingActions[linkId] === "unlink" ? "Unlinking..." : "Unlink"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {isUploadOpen && (
        <DocumentLibraryModal
          user={user}
          onClose={() => setIsUploadOpen(false)}
          onCreated={handleLibraryDocumentCreated}
        />
      )}

      {isLibraryOpen && (
        <DocumentLibraryPicker
          application={application}
          user={user}
          linkedDocumentIds={linkedDocuments
            .map((item) => item.document?.id)
            .filter(Boolean)}
          onClose={() => setIsLibraryOpen(false)}
          onLinked={() => {
            loadLinkedDocuments();
            setIsLibraryOpen(false);
            onDocumentsChanged?.();
          }}
        />
      )}
    </>
  );
}
