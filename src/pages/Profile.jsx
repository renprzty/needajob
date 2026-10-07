import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  getProfile,
  updateProfile,
  uploadAvatarImage,
} from "../services/profileService";
import { CameraIcon } from "../components/AeroIcons";

export default function Profile({ user, onProfileUpdated }) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setError(null);
        const data = await getProfile();
        setProfile(data);
        const initialAvatar =
          data?.avatarUrl ||
          user?.user_metadata?.avatar_url ||
          user?.user_metadata?.picture ||
          "";
        setAvatarPreview(initialAvatar);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setIsLoading(false);
      }
    }

    if (user?.id) {
      loadProfile();
    }
  }, [user]);

  function handleChange(event) {
    const { name, value } = event.target;
    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      setError(null);
      setMessage("");

      const photoUrl = await uploadAvatarImage(file, user?.id);
      setAvatarPreview(photoUrl);
      setMessage("New photo selected! Click 'Save Profile' to save changes.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to process image.");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleApplyUrl(e) {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    setAvatarPreview(customUrlInput.trim());
    setShowUrlInput(false);
    setCustomUrlInput("");
    setMessage("Photo URL applied! Click 'Save Profile' to save changes.");
  }

  function handleRemoveAvatar() {
    setAvatarPreview("");
    setMessage("Photo removed. Click 'Save Profile' to confirm.");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSaving(true);
      setMessage("");
      setError(null);

      const updated = await updateProfile(profile, avatarPreview);

      setProfile(updated);
      onProfileUpdated?.(updated);
      setMessage("Profile and photo saved successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p>Loading profile...</p>;
  }

  if (!profile) {
    return <p>Profile could not be loaded.</p>;
  }

  const initial =
    profile.displayName?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "U";

  return (
    <div className="profile-page">
      <header className="profile-header">
        <Link to="/" className="profile-back-link secondary-button">
          ← Dashboard
        </Link>
        <h1>Your Profile</h1>
      </header>

      <form className="profile-card aero-panel" onSubmit={handleSubmit}>
        {/* Profile Avatar & Photo Options */}
        <div className="profile-avatar-section">
          <div
            className="profile-avatar-wrapper"
            onClick={() => fileInputRef.current?.click()}
            title="Click to choose a photo"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                fileInputRef.current?.click();
              }
            }}
          >
            <div className="profile-avatar">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  className="profile-avatar-img"
                />
              ) : (
                initial
              )}
            </div>

            <div className="profile-avatar-badge" title="Change Photo">
              <CameraIcon size={16} />
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/webp,image/gif"
            style={{ display: "none" }}
          />

          <div className="profile-avatar-controls">
            <button
              type="button"
              className="secondary-button profile-photo-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto || isSaving}
            >
              <CameraIcon size={15} />
              {isUploadingPhoto ? "Processing..." : "Change Photo"}
            </button>

            <button
              type="button"
              className="secondary-button profile-photo-btn"
              onClick={() => setShowUrlInput((prev) => !prev)}
              disabled={isUploadingPhoto || isSaving}
            >
              {showUrlInput ? "Cancel URL" : "Photo URL"}
            </button>

            {avatarPreview && (
              <button
                type="button"
                className="secondary-button profile-photo-btn profile-photo-remove-btn"
                onClick={handleRemoveAvatar}
                disabled={isUploadingPhoto || isSaving}
              >
                Remove
              </button>
            )}
          </div>

          {showUrlInput && (
            <div className="profile-url-input-row">
              <input
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="profile-url-input"
              />
              <button
                type="button"
                className="secondary-button profile-url-apply-btn"
                onClick={handleApplyUrl}
              >
                Apply
              </button>
            </div>
          )}

          <p className="profile-avatar-hint">
            Supports JPG, PNG, or WebP. Centered and cropped automatically.
          </p>
        </div>

        <div className="profile-fields">
          <label className="form-field">
            <span>Name</span>
            <input
              name="displayName"
              value={profile.displayName || ""}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-field">
            <span>Email</span>
            <input value={user?.email || ""} disabled />
          </label>

          <label className="form-field">
            <span>University</span>
            <input
              name="university"
              value={profile.university || ""}
              onChange={handleChange}
            />
          </label>

          <label className="form-field">
            <span>Major</span>
            <input
              name="major"
              value={profile.major || ""}
              onChange={handleChange}
            />
          </label>

          <label className="form-field">
            <span>Graduation year</span>
            <input
              name="graduationYear"
              type="number"
              min="2000"
              max="2100"
              value={profile.graduationYear || ""}
              onChange={handleChange}
            />
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-success">{message}</p>}

        <div className="profile-actions">
          <button
            type="submit"
            className="primary-button"
            disabled={isSaving || isUploadingPhoto}
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
