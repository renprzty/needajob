import {
  useEffect,
  useState,
} from "react";

import {
  getDocuments,
  linkDocumentToApplication,
} from "../services/documentLibraryService";

export default function DocumentLibraryPicker({
  application,
  user,
  linkedDocumentIds,
  onClose,
  onLinked,
}) {
  const [documents, setDocuments] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [linkingId, setLinkingId] =
    useState(null);

  useEffect(() => {
    async function loadDocuments() {
      try {
        const data =
          await getDocuments();

        setDocuments(data);
      } catch (error) {
        console.error(error);

        setError(
          "Failed to load library."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadDocuments();
  }, []);

  async function handleAttach(
    document
  ) {
    try {
      setLinkingId(document.id);
      setError(null);

      await linkDocumentToApplication({
        applicationId:
          application.id,

        documentId:
          document.id,

        userId:
          user.id,
      });

      onLinked(document);
    } catch (error) {
      console.error(error);

      setError(
        "Failed to attach document."
      );

      setLinkingId(null);
    }
  }

  return (
    <div className="document-modal-backdrop">
      <div className="document-modal document-library-picker">
        <div className="document-modal-header">
          <div>
            <span className="section-eyebrow">
              Document Library
            </span>

            <h2>
              Choose Document
            </h2>

            <p>
              Attach an existing file
              without uploading another copy.
            </p>
          </div>

          <button
            type="button"
            className="document-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="documents-error">
            {error}
          </div>
        )}

        {isLoading ? (
          <p>Loading library...</p>
        ) : (
          <div className="document-picker-list">
            {documents.map(
              (document) => {
                const alreadyLinked =
                  linkedDocumentIds.includes(
                    document.id
                  );

                return (
                  <div
                    key={document.id}
                    className="document-picker-item"
                  >
                    <div>
                      <span className="document-type">
                        {
                          document.documentType
                        }
                      </span>

                      <strong>
                        {document.name}
                      </strong>

                      {document.versionLabel && (
                        <span>
                          {
                            document.versionLabel
                          }
                        </span>
                      )}

                      <small>
                        {
                          document.fileName
                        }
                      </small>
                    </div>

                    <button
                      type="button"
                      className={
                        alreadyLinked
                          ? "secondary-button"
                          : "primary-button"
                      }
                      disabled={
                        alreadyLinked ||
                        linkingId ===
                          document.id
                      }
                      onClick={() =>
                        handleAttach(
                          document
                        )
                      }
                    >
                      {alreadyLinked
                        ? "Attached"
                        : linkingId ===
                            document.id
                          ? "Attaching..."
                          : "Attach"}
                    </button>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}
