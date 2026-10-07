import {
  useEffect,
  useState,
} from "react";

import {
  archiveLibraryDocument,
  deleteLibraryDocument,
  extractExistingDocumentText,
  getDocuments,
  getDocumentUsageCounts,
  getLibraryDocumentViewUrl,
  restoreLibraryDocument,
} from "../services/documentLibraryService";

import DocumentLibraryModal from "../components/DocumentLibraryModal";
import EditLibraryDocumentModal from "../components/EditLibraryDocumentModal";

export default function Documents({
  user,
}) {
  const [documents, setDocuments] =
    useState([]);

  const [usageCounts, setUsageCounts] =
    useState({});

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [isAddOpen, setIsAddOpen] =
    useState(false);

  const [editingDocument, setEditingDocument] =
    useState(null);

  const [extractingIds, setExtractingIds] = useState({});
  const [extractionErrors, setExtractionErrors] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [displayMode, setDisplayMode] = useState(() =>
    localStorage.getItem("needajob:documents-display-mode") === "compact" ? "compact" : "cards"
  );

  function toggleSelection(id) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function deleteSelected() {
    const selected = visibleDocuments.filter((item) => selectedIds.includes(item.id));
    if (!selected.length || !window.confirm(`Permanently delete ${selected.length} selected document${selected.length === 1 ? "" : "s"}?\n\nDocuments attached to applications cannot be deleted. This cannot be undone.`)) return;
    setIsDeleting(true);
    setActionError(null);
    const deleted = [];
    const failures = [];
    for (const document of selected) {
      try {
        await deleteLibraryDocument(document);
        deleted.push(document.id);
      } catch (error) {
        failures.push(`${document.name}: ${error.message || "Deletion failed."}`);
      }
    }
    setDocuments((current) => current.filter((item) => !deleted.includes(item.id)));
    setSelectedIds((current) => current.filter((id) => !deleted.includes(id)));
    if (failures.length) setActionError(failures.join("\n"));
    setIsDeleting(false);
  }

  async function handleExtractText(document) {
    setExtractingIds((current) => ({ ...current, [document.id]: true }));
    setExtractionErrors((current) => ({ ...current, [document.id]: null }));
    try {
      const updated = await extractExistingDocumentText(document);
      setDocuments((current) => current.map((item) =>
        item.id === updated.id ? { ...item, extractedText: updated.extractedText, textExtractedAt: updated.textExtractedAt } : item
      ));
    } catch (error) {
      setExtractionErrors((current) => ({
        ...current,
        [document.id]: error.message || "Failed to extract resume text.",
      }));
    } finally {
      setExtractingIds((current) => ({ ...current, [document.id]: false }));
    }
  }

  const [typeFilter, setTypeFilter] =
    useState("all");

  const [libraryView, setLibraryView] =
    useState("active");

  useEffect(() => {
    async function loadDocuments() {
      try {
        setError(null);
        setIsLoading(true);

        const [data, counts] =
          await Promise.all([
            getDocuments({
              archived:
                libraryView === "archived",
            }),
            getDocumentUsageCounts(),
          ]);

        setDocuments(data);
        setUsageCounts(counts);
      } catch (error) {
        console.error(error);

        setError(
          "Failed to load documents."
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (user?.id) {
      loadDocuments();
    }
  }, [user?.id, libraryView]);

  const visibleDocuments =
    documents.filter(
      (document) =>
        typeFilter === "all" ||
        document.documentType ===
          typeFilter
    );

  return (
    <div className="documents-page">
      <header className="documents-library-header page-header">
        <div>
          <span className="section-eyebrow">
            Library
          </span>

          <h1>Documents</h1>

          <p>
            Manage reusable resumes,
            cover letters, portfolios,
            and supporting files.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() =>
            setIsAddOpen(true)
          }
        >
          + Add Document
        </button>
      </header>

      <div className="document-library-controls">
        <div className="application-display-toggle">
          <button
            type="button"
            className={
              libraryView === "active"
                ? "is-active"
                : ""
            }
            disabled={isDeleting}
            onClick={() =>
              { setLibraryView("active"); setSelectedIds([]); }
            }
          >
            Active
          </button>

          <button
            type="button"
            className={
              libraryView === "archived"
                ? "is-active"
                : ""
            }
            disabled={isDeleting}
            onClick={() =>
              { setLibraryView("archived"); setSelectedIds([]); }
            }
          >
            Archived
          </button>
        </div>

        <div className="document-library-filters">
          {[
            ["all", "All"],
            ["resume", "Resume"],
            ["cover_letter", "Cover Letter"],
            ["portfolio", "Portfolio"],
            ["transcript", "Transcript"],
            ["other", "Other"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              disabled={isDeleting}
              className={
                typeFilter === value
                  ? "is-active"
                  : ""
              }
              onClick={() =>
                { setTypeFilter(value); setSelectedIds([]); }
              }
            >
              {label}
            </button>
          ))}
        </div>
        <div className="application-display-toggle document-view-toggle">
          {[ ["cards", "\u25a6 Cards"], ["compact", "\u2630 Compact"] ].map(([mode, label]) => (
            <button key={mode} type="button" aria-pressed={displayMode === mode}
              className={displayMode === mode ? "is-active" : ""}
              onClick={() => { setDisplayMode(mode); localStorage.setItem("needajob:documents-display-mode", mode); }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {!isLoading && !error && visibleDocuments.some((item) => selectedIds.includes(item.id)) && (
        <div className="selection-toolbar document-selection-toolbar">
          <label className="select-all-control">
            <input type="checkbox" disabled={isDeleting}
              checked={visibleDocuments.every((item) => selectedIds.includes(item.id))}
              onChange={() => setSelectedIds((current) => visibleDocuments.every((item) => current.includes(item.id))
                ? [] : visibleDocuments.map((item) => item.id))} />
            <span>Select all visible</span>
          </label>
          {visibleDocuments.some((item) => selectedIds.includes(item.id)) && (
            <div className="selection-actions">
              <span>{visibleDocuments.filter((item) => selectedIds.includes(item.id)).length} selected</span>
              <button type="button" className="danger-button" disabled={isDeleting} onClick={deleteSelected}>
                {isDeleting ? "Deleting..." : "Delete Selected"}
              </button>
            </div>
          )}
        </div>
      )}
      {actionError && <p className="form-error document-bulk-error" role="alert">{actionError}</p>}

      {isLoading ? (
        <p>Loading documents...</p>
      ) : error ? (
        <p className="form-error">
          {error}
        </p>
      ) : visibleDocuments.length === 0 ? (
        <div className="empty-state">
          <h3>
            No{" "}
            {libraryView === "archived"
              ? "archived"
              : ""}{" "}
            documents found
          </h3>
          <p>
            {libraryView === "archived"
              ? "Archived documents will appear here."
              : "Upload reusable resumes and cover letters to your library."}
          </p>
        </div>
      ) : (
        <div className={displayMode === "compact" ? "document-compact-list application-compact-table" : "document-library-grid"}>
          {displayMode === "compact" && (
            <div className="document-compact-heading application-compact-header">
              <span></span><span>Document / File</span><span>Type / Version</span><span>Usage</span><span>Actions / Text Status</span>
            </div>
          )}
          {visibleDocuments.map(
            (document) => (
              <article
                key={document.id}
                inert={isDeleting}
                className={`document-library-card ${displayMode === "compact" ? "document-compact-row application-compact-row" : "aero-panel"} ${selectedIds.includes(document.id) ? "is-selected" : ""}`}
              >
                <label className="document-select">
                  <input type="checkbox" checked={selectedIds.includes(document.id)} disabled={isDeleting}
                    onChange={() => toggleSelection(document.id)} aria-label={`Select ${document.name}`} />
                </label>
                <div className="document-card-top">
                  <span className="document-type">
                    {
                      document.documentType
                    }
                  </span>

                  {document.versionLabel && (
                    <span className="document-version">
                      {
                        document.versionLabel
                      }
                    </span>
                  )}
                </div>

                <h2>
                  {document.name}
                </h2>

                <p className="document-filename">
                  {document.fileName}
                </p>

                <p className="document-usage">
                  Used in{" "}
                  {usageCounts[
                    document.id
                  ] || 0}{" "}
                  application
                  {(usageCounts[
                    document.id
                  ] || 0) === 1
                    ? ""
                    : "s"}
                </p>

                <div className="document-library-actions">
                  {document.documentType === "resume" && !document.extractedText && (
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={Boolean(extractingIds[document.id])}
                      onClick={() => handleExtractText(document)}
                    >
                      {extractingIds[document.id] ? "Extracting..." : "Extract Text"}
                    </button>
                  )}
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={async () => {
                      const url =
                        await getLibraryDocumentViewUrl(
                          document.storagePath
                        );

                      window.open(
                        url,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }}
                  >
                    View
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      setEditingDocument(
                        document
                      )
                    }
                  >
                    Edit
                  </button>

                  {libraryView ===
                  "active" ? (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={async () => {
                        await archiveLibraryDocument(
                          document.id
                        );

                        setDocuments(
                          (current) =>
                            current.filter(
                              (item) =>
                                item.id !==
                                document.id
                            )
                        );
                      }}
                    >
                      Archive
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="primary-button"
                        onClick={async () => {
                          await restoreLibraryDocument(
                            document.id
                          );

                          setDocuments(
                            (current) =>
                              current.filter(
                                (item) =>
                                  item.id !==
                                  document.id
                              )
                          );
                        }}
                      >
                        Restore
                      </button>

                      <button
                        type="button"
                        className="document-delete-button"
                        onClick={async () => {
                          const confirmed =
                            window.confirm(
                              `Permanently delete "${document.name}"?\n\nThis cannot be undone.`
                            );

                          if (!confirmed) {
                            return;
                          }

                          try {
                            await deleteLibraryDocument(
                              document
                            );

                            setDocuments(
                              (current) =>
                                current.filter(
                                  (item) =>
                                    item.id !==
                                    document.id
                                )
                            );
                          } catch (error) {
                            console.error(error);

                            window.alert(
                              error.message ||
                                "Failed to delete document."
                            );
                          }
                        }}
                      >
                        Delete Permanently
                      </button>
                    </>
                  )}
                </div>
                {document.documentType === "resume" && (
                  <span
                    role="status"
                    className={document.extractedText ? "text-extraction-ready" : "text-extraction-missing"}
                  >
                    {document.extractedText ? "Text ready" : "Text not extracted"}
                  </span>
                )}
                {extractionErrors[document.id] && (
                  <p className="document-card-error" role="alert">{extractionErrors[document.id]}</p>
                )}
              </article>
            )
          )}
        </div>
      )}

      {isAddOpen && (
        <DocumentLibraryModal
          user={user}
          onClose={() =>
            setIsAddOpen(false)
          }
          onCreated={(document) => {
            if (libraryView === "active") {
              setDocuments(
                (current) => [
                  document,
                  ...current,
                ]
              );
            }

            setIsAddOpen(false);
          }}
        />
      )}

      {editingDocument && (
        <EditLibraryDocumentModal
          document={editingDocument}
          onClose={() =>
            setEditingDocument(null)
          }
          onUpdated={(updated) => {
            setDocuments((current) =>
              current.map((document) =>
                document.id === updated.id
                  ? updated
                  : document
              )
            );

            setEditingDocument(null);
          }}
        />
      )}
    </div>
  );
}
