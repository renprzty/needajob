import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function AppLayout({ profile, user }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return (
      localStorage.getItem("needajob:sidebar-collapsed") === "true"
    );
  });

  function handleSidebarToggle() {
    setIsSidebarCollapsed((current) => {
      const next = !current;
      localStorage.setItem("needajob:sidebar-collapsed", String(next));
      return next;
    });
  }

  return (
    <div
      className={`app-layout ${
        isSidebarCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
      <Sidebar
        profile={profile}
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggle={handleSidebarToggle}
      />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
