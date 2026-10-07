import { useState } from "react";

import {
  uploadLibraryDocument,
} from "../services/documentLibraryService";

const DOCUMENT_TYPES = [
  {
    value: "resume",
    label: "Resume / CV",
  },
  {
    value: "cover_letter",
    label: "Cover Letter",
  },
  {
    value: "portfolio",
    label: "Portfolio",
  },
  {
    value: "transcript",
    label: "Transcript",
  },
  {
    value: "other",
    label: "Other",
  },
];

export default function DocumentLibraryModal({
  user,
  onClose,
  onCreated,
}) {
  const [name, setName] =
    useState("");

  const [versionLabel, setVersionLabel] =
    useState("");

  const [documentType, setDocumentType] =
    useState("resume");

  const [file, setFile] =
    useState(null);

  const [error, setError] =
    useState(null);

  const [isUploading, setIsUploading] =
    useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError(
        "Document name is required."
      );
      return;
    }

    if (!file) {
      setError(
        "Please choose a PDF file."
      );
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const document =
        await uploadLibraryDocument({
          userId: user.id,
          documentType,
          name,
          versionLabel,
          file,
        });

      onCreated(document);
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to upload document."
      );

      setIsUploading(false);
    }
  }

  return (
    <div className="document-modal-backdrop">
      <div
        className="document-modal"
        role="dialog"
        aria-modal="true"
      >
        <div className="document-modal-header">
          <div>
            <span className="section-eyebrow">
              Document Library
            </span>

            <h2>Add Document</h2>

            <p>
              Upload once and reuse it
              across applications.
            </p>
          </div>

          <button
            type="button"
            className="document-modal-close"
            onClick={onClose}
            disabled={isUploading}
          >
            ×
          </button>
        </div>

        <form
          className="document-upload-form"
          onSubmit={handleSubmit}
        >
          <label className="form-field">
            <span>Name</span>

            <input
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="Frontend Resume"
              required
            />
          </label>

          <label className="form-field">
            <span>Version label</span>

            <input
              value={versionLabel}
              onChange={(event) =>
                setVersionLabel(
                  event.target.value
                )
              }
              placeholder="v3"
            />
          </label>

          <label className="form-field">
            <span>Document type</span>

            <select
              value={documentType}
              onChange={(event) =>
                setDocumentType(
                  event.target.value
                )
              }
            >
              {DOCUMENT_TYPES.map(
                (type) => (
                  <option
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </option>
                )
              )}
            </select>
          </label>

          <label className="document-drop-zone">
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) =>
                setFile(
                  event.target.files?.[0] ||
                    null
                )
              }
            />

            <div className="document-drop-orb">
              PDF
            </div>

            {file ? (
              <>
                <strong>
                  {file.name}
                </strong>

                <span>
                  Ready to upload
                </span>
              </>
            ) : (
              <>
                <strong>
                  Choose PDF
                </strong>

                <span>
                  Maximum 10 MB
                </span>
              </>
            )}
          </label>

          {error && (
            <div className="documents-error">
              {error}
            </div>
          )}

          <div className="document-modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={isUploading}
            >
              {isUploading
                ? "Uploading..."
                : "Add Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
