import { useState } from "react";

import {
  updateLibraryDocument,
} from "../services/documentLibraryService";

export default function EditLibraryDocumentModal({
  document,
  onClose,
  onUpdated,
}) {
  const [name, setName] =
    useState(document.name);

  const [versionLabel, setVersionLabel] =
    useState(
      document.versionLabel || ""
    );

  const [documentType, setDocumentType] =
    useState(
      document.documentType
    );

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError(null);

      const updated =
        await updateLibraryDocument({
          id: document.id,
          name,
          versionLabel,
          documentType,
        });

      onUpdated(updated);
    } catch (error) {
      console.error(error);

      setError(
        "Failed to update document."
      );

      setIsSaving(false);
    }
  }

  return (
    <div className="document-modal-backdrop">
      <div className="document-modal">
        <div className="document-modal-header">
          <div>
            <span className="section-eyebrow">
              Document Library
            </span>

            <h2>Edit Document</h2>
          </div>

          <button
            type="button"
            className="document-modal-close"
            onClick={onClose}
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
              required
            />
          </label>

          <label className="form-field">
            <span>Version</span>

            <input
              value={versionLabel}
              onChange={(event) =>
                setVersionLabel(
                  event.target.value
                )
              }
            />
          </label>

          <label className="form-field">
            <span>Type</span>

            <select
              value={documentType}
              onChange={(event) =>
                setDocumentType(
                  event.target.value
                )
              }
            >
              <option value="resume">
                Resume / CV
              </option>

              <option value="cover_letter">
                Cover Letter
              </option>

              <option value="portfolio">
                Portfolio
              </option>

              <option value="transcript">
                Transcript
              </option>

              <option value="other">
                Other
              </option>
            </select>
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
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
