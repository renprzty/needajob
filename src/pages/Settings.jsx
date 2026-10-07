import { useEffect, useState } from "react";
import { LightModeIcon, DarkModeIcon } from "../components/AeroIcons";
import { getInitialTheme, applyTheme } from "../utils/themeUtils";

export default function Settings() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function handleSelectTheme(newTheme) {
    setTheme(newTheme);
    applyTheme(newTheme);
    setSaveStatus(
      newTheme === "dark"
        ? "Dark Mode (Obsidian Aero) enabled."
        : "Light Mode (Classic Aero) enabled."
    );
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <span className="section-eyebrow">Preferences</span>
        <h1>Settings</h1>
        <p>Manage your visual appearance and workspace preferences.</p>
      </header>

      <section className="settings-section aero-panel">
        <div className="settings-section-header">
          <h2>Appearance & Theme</h2>
          <p>
            Choose your preferred Frutiger Aero visual theme for the
            application.
          </p>
        </div>

        <div className="theme-options-grid">
          {/* Light Theme Card */}
          <div
            className={`theme-card aero-panel ${
              theme === "light" ? "active" : ""
            }`}
            onClick={() => handleSelectTheme("light")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleSelectTheme("light");
              }
            }}
          >
            <div className="theme-card-icon-orb light-orb">
              <LightModeIcon size={36} />
            </div>

            <div className="theme-card-content">
              <div className="theme-card-title-row">
                <h3>Light Mode</h3>
                {theme === "light" && (
                  <span className="theme-badge-active">Active</span>
                )}
              </div>
              <p>
                Classic Frutiger Aero with crystal sky-blue glass, organic
                emerald accents, and luminous specular gloss.
              </p>
            </div>

            <div className="theme-card-preview light-preview">
              <div className="preview-sky" />
              <div className="preview-grass" />
            </div>
          </div>

          {/* Dark Theme Card */}
          <div
            className={`theme-card aero-panel ${
              theme === "dark" ? "active" : ""
            }`}
            onClick={() => handleSelectTheme("dark")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleSelectTheme("dark");
              }
            }}
          >
            <div className="theme-card-icon-orb dark-orb">
              <DarkModeIcon size={36} />
            </div>

            <div className="theme-card-content">
              <div className="theme-card-title-row">
                <h3>Dark Mode</h3>
                {theme === "dark" && (
                  <span className="theme-badge-active">Active</span>
                )}
              </div>
              <p>
                Obsidian Aero with smoked sapphire glass, deep midnight
                vistas, and vibrant cyan aurora edge lighting.
              </p>
            </div>

            <div className="theme-card-preview dark-preview">
              <div className="preview-night" />
              <div className="preview-aurora" />
            </div>
          </div>
        </div>

        {saveStatus && (
          <div className="settings-status-banner">{saveStatus}</div>
        )}
      </section>

      <section className="settings-section aero-panel">
        <div className="settings-section-header">
          <h2>Application Information</h2>
          <p>System and release details.</p>
        </div>

        <div className="settings-info-grid">
          <div className="settings-info-item">
            <span className="info-label">Created by</span>
            <strong className="info-value">Rendy Prasetyo</strong>
          </div>
          <div className="settings-info-item">
            <span className="info-label">Current Version</span>
            <strong className="info-value">v1.2.0 (Aero Edition)</strong>
          </div>
          <div className="settings-info-item">
            <span className="info-label">Copyright</span>
            <strong className="info-value">&copy; 2026 Rendy Prasetyo. All rights reserved.</strong>
          </div>
        </div>
      </section>
    </div>
  );
}
