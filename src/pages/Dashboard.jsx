import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PrototypeBetaNotice from "../components/PrototypeBetaNotice";
import { useNavigate } from "react-router-dom";
import ActionCenter from "../components/ActionCenter";
import { getActionCenterData } from "../utils/actionCenterUtils";
import { getReminders } from "../services/calendarService";
import { buildCalendarEvents } from "../utils/calendarUtils";
import UpcomingCalendar from "../components/UpcomingCalendar";
import Modal from "../components/Modal";
import { SettingsIcon, SignOutIcon, SearchGlassIcon } from "../components/AeroIcons";
import { signOut } from "../services/authService";

function getTomorrowDate() {
  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();

  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");

  const day = String(tomorrow.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

function Dashboard({ applications, onUpdateApplication, profile, user }) {
  const betaNoticeKey = `needajob:prototype-beta-dismissed:${user?.id || "guest"}`;
  const [showBetaNotice, setShowBetaNotice] = useState(() => {
    try {
      return localStorage.getItem(betaNoticeKey) !== "true";
    } catch {
      return true;
    }
  });
  const dismissBetaNotice = useCallback(() => {
    try {
      localStorage.setItem(betaNoticeKey, "true");
    } catch {
      // The notice can still be dismissed when browser storage is unavailable.
    }
    setShowBetaNotice(false);
  }, [betaNoticeKey]);
  const [calendarReminders, setCalendarReminders] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();

  const avatarUrl =
    profile?.avatarUrl ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    "";

  const displayName =
    profile?.displayName ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const initial = displayName?.charAt(0).toUpperCase() || "U";

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    async function loadCalendarReminders() {
      if (!user?.id) {
        return;
      }

      try {
        const reminders = await getReminders();
        setCalendarReminders(reminders);
      } catch (error) {
        console.error(error);
      }
    }

    loadCalendarReminders();
  }, [user?.id]);

  const activeCount = applications.filter(
    (application) => !application.isArchived
  ).length;

  const interviewCount = applications.filter(
    (application) =>
      !application.isArchived && application.status === "Interview"
  ).length;

  const offerCount = applications.filter(
    (application) => !application.isArchived && application.status === "Offer"
  ).length;

  const actionData = useMemo(
    () => getActionCenterData(applications),
    [applications]
  );

  const calendarEvents = useMemo(
    () => buildCalendarEvents(applications, calendarReminders),
    [applications, calendarReminders]
  );

  async function handleSnooze(application) {
    await onUpdateApplication({
      ...application,
      followUpDate: getTomorrowDate(),
    });
  }

  async function handleCompleteFollowUp(application) {
    await onUpdateApplication({
      ...application,
      followUpDate: null,
    });
  }

  return (
    <div className="dashboard-page">
      {showBetaNotice && <PrototypeBetaNotice onDismiss={dismissBetaNotice} />}
      <header className="dashboard-welcome">
        <div className="dashboard-welcome-main">
          <h1>
            {getGreeting()}
            {profile?.displayName ? `, ${profile.displayName}` : ""}
          </h1>

          <p>Here's what's happening with your job search.</p>
        </div>

        {/* Top-Right Profile Widget */}
        <div className="dashboard-profile-widget" ref={profileMenuRef}>
          <button
            type="button"
            className="dashboard-profile-trigger"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
            title="Profile Menu"
            aria-label="Open profile menu"
          >
            <div className="dashboard-profile-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} />
              ) : (
                <span>{initial}</span>
              )}
            </div>
          </button>

          {isMenuOpen && (
            <div className="dashboard-profile-dropdown aero-panel" role="menu">
              <div className="profile-dropdown-user">
                <div
                  className="profile-dropdown-avatar"
                  onClick={() => {
                    setIsPreviewOpen(true);
                    setIsMenuOpen(false);
                  }}
                  title="Click to preview profile photo"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} />
                  ) : (
                    <span>{initial}</span>
                  )}
                  <span className="avatar-zoom-icon" aria-hidden="true"><SearchGlassIcon size={12} className="profile-menu-svg" /></span>
                </div>
                <div className="profile-dropdown-details">
                  <strong>{displayName}</strong>
                  <span className="profile-dropdown-email">{user?.email}</span>
                  {profile?.university && (
                    <span className="profile-dropdown-school">
                      {profile.university}
                    </span>
                  )}
                </div>
              </div>

              <div className="profile-dropdown-divider" />

              <div className="profile-dropdown-actions">
                <button
                  type="button"
                  className="profile-dropdown-action-btn"
                  onClick={() => {
                    navigate("/profile");
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="profile-dropdown-action-icon" aria-hidden="true"><SettingsIcon size={22} className="profile-menu-svg" /></span>
                  <span>Profile Settings</span>
                </button>

                <div className="profile-dropdown-divider" />

                <button
                  type="button"
                  className="profile-dropdown-action-btn profile-dropdown-signout"
                  onClick={async () => {
                    try {
                      await signOut();
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                >
                  <span className="profile-dropdown-action-icon" aria-hidden="true"><SignOutIcon size={22} className="profile-menu-svg" /></span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <span>Total Applications</span>
          <strong>{applications.length}</strong>
        </div>

        <div className="stat-card">
          <span>Active</span>
          <strong>{activeCount}</strong>
        </div>

        <div className="stat-card">
          <span>Interviews</span>
          <strong>{interviewCount}</strong>
        </div>

        <div className="stat-card">
          <span>Offers</span>
          <strong>{offerCount}</strong>
        </div>
      </div>

      <div className="dashboard-grid">
        <ActionCenter
          actionData={actionData}
          onSnooze={handleSnooze}
          onCompleteFollowUp={handleCompleteFollowUp}
        />

        <UpcomingCalendar events={calendarEvents} />
      </div>

      {isPreviewOpen && (
        <Modal onClose={() => setIsPreviewOpen(false)}>
          <div className="profile-preview-dialog">
            <div className="profile-preview-dialog-header">
              <span className="section-eyebrow">Profile Photo</span>
              <h2>Profile Preview</h2>
              <p>Your account photo and details</p>
            </div>

            <div className="profile-preview-dialog-orb">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="profile-preview-dialog-img"
                />
              ) : (
                <div className="profile-preview-large-initial">{initial}</div>
              )}
            </div>

            <div className="profile-preview-dialog-info">
              <h3>{displayName}</h3>
              <p className="profile-preview-dialog-email">{user?.email}</p>
              {profile?.university && (
                <p className="profile-preview-dialog-extra">
                  {profile.university}{" "}
                  {profile.major ? `· ${profile.major}` : ""}
                </p>
              )}
            </div>

            <div className="profile-preview-dialog-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setIsPreviewOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  setIsPreviewOpen(false);
                  navigate("/profile");
                }}
              >
                Profile Settings ↗
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Dashboard;
