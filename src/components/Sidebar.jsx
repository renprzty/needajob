import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import { signOut } from "../services/authService";
import {
  ApplicationsIcon,
  PipelineIcon,
  AnalyticsIcon,
  CalendarIcon,
  DocumentsIcon,
  SettingsIcon,
  SignOutIcon,
} from "./AeroIcons";

export default function Sidebar({ isCollapsed, onToggle, profile, user }) {
  const avatarUrl = profile?.avatarUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayName = profile?.displayName || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  return (
    <aside className="sidebar">
      <NavLink to="/profile" className="mobile-profile-link" aria-label="Open profile settings" title="Profile Settings">
        <div className="dashboard-profile-avatar">
          {avatarUrl ? <img src={avatarUrl} alt={displayName} /> : <span>{displayName.charAt(0).toUpperCase()}</span>}
        </div>
      </NavLink>
      <div className="sidebar-brand-row">
        <NavLink
          to="/"
          end
          className="sidebar-brand-link"
          aria-label="NeedaJob — Dashboard"
          title="Dashboard"
        >
          {isCollapsed ? (
            <img className="sidebar-mini-brand" src={logo} alt="NeedaJob" width={48} height={48} />
          ) : (
            <h2 className="sidebar-brand">NeedaJob</h2>
          )}
        </NavLink>

        <button
          type="button"
          className="sidebar-toggle"
          onClick={onToggle}
          aria-label={
            isCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          title={
            isCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {isCollapsed ? "›" : "‹"}
        </button>
      </div>

      <nav>
        <NavLink
          to="/applications"
          title={isCollapsed ? "Applications" : undefined}
        >
          <span className="nav-icon"><ApplicationsIcon /></span>
          <span className="nav-label">Applications</span>
        </NavLink>
        <NavLink to="/pipeline" title={isCollapsed ? "Pipeline" : undefined}>
          <span className="nav-icon"><PipelineIcon /></span>
          <span className="nav-label">Pipeline</span>
        </NavLink>
        <NavLink to="/analytics" title={isCollapsed ? "Analytics" : undefined}>
          <span className="nav-icon"><AnalyticsIcon /></span>
          <span className="nav-label">Analytics</span>
        </NavLink>
        <NavLink to="/calendar" title={isCollapsed ? "Calendar" : undefined}>
          <span className="nav-icon"><CalendarIcon /></span>
          <span className="nav-label">Calendar</span>
        </NavLink>
        <NavLink to="/documents" title={isCollapsed ? "Documents" : undefined}>
          <span className="nav-icon"><DocumentsIcon /></span>
          <span className="nav-label">Documents</span>
        </NavLink>
        <NavLink to="/settings" title={isCollapsed ? "Settings" : undefined}>
          <span className="nav-icon"><SettingsIcon /></span>
          <span className="nav-label">Settings</span>
        </NavLink>
      </nav>

      <button
        type="button"
        className="sidebar-signout"
        onClick={async () => {
          try {
            await signOut();
          } catch (error) {
            console.error(error);
          }
        }}
        title={isCollapsed ? "Sign Out" : undefined}
        aria-label="Sign Out"
      >
        <span className="nav-icon"><SignOutIcon /></span>
        {!isCollapsed && <span>Sign Out</span>}
      </button>
    </aside>
  );
}
