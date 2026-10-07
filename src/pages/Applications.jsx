import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ApplicationCard from "../components/ApplicationCard";
import ApplicationCompactList from "../components/ApplicationCompactList";
import Modal from "../components/Modal";
import ApplicationForm from "../components/ApplicationForm";
import { exportApplicationsCsv } from "../utils/exportApplicationsCsv";
import { SearchGlassIcon } from "../components/AeroIcons";

function Applications({
  applications,
  onAddApplication,
  onDeleteApplications,
  onArchiveApplication,
  onRestoreApplication,
  onArchiveApplications,
  onRestoreApplications,
  isLoading,
  isRefreshing,
  error,
}) {
  const [searchParams] = useSearchParams();
  const addDate = searchParams.get("addDate");
  const [isModalOpen, setIsModalOpen] = useState(() => Boolean(addDate));

  useEffect(() => {
    if (addDate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsModalOpen(true);
    }
  }, [addDate]);

  const [viewMode, setViewMode] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [workTypeFilter, setWorkTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedApplicationIds, setSelectedApplicationIds] = useState([]);
  const [displayMode, setDisplayMode] = useState(() => {
    return (
      localStorage.getItem(
        "needajob:applications-display-mode"
      ) || "cards"
    );
  });

  function handleDisplayModeChange(mode) {
    setDisplayMode(mode);

    localStorage.setItem(
      "needajob:applications-display-mode",
      mode
    );
  }

  const totalApplications = applications.length;

  const activeCount = applications.filter(
    (application) => !application.isArchived
  ).length;

  const archivedCount = applications.filter(
    (application) => application.isArchived
  ).length;

  useEffect(() => {
    const existingIds = new Set(
      applications.map((application) => application.id)
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedApplicationIds((currentIds) =>
      currentIds.filter((id) => existingIds.has(id))
    );
  }, [applications]);

  const visibleApplications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = applications.filter((application) => {
      const matchesArchiveView =
        viewMode === "archived"
          ? application.isArchived
          : !application.isArchived;

      const matchesSearch =
        !query ||
        application.company?.toLowerCase().includes(query) ||
        application.position?.toLowerCase().includes(query) ||
        application.location?.toLowerCase().includes(query);

      let matchesStatus = true;

      if (statusFilter === "Terminal") {
        matchesStatus = [
          "Rejected",
          "Withdrawn",
        ].includes(application.status);
      } else if (statusFilter === "Active") {
        matchesStatus = ![
          "Rejected",
          "Withdrawn",
        ].includes(application.status);
      } else if (statusFilter !== "All") {
        matchesStatus = application.status === statusFilter;
      }

      const matchesWorkType =
        workTypeFilter === "All" || application.workType === workTypeFilter;

      return (
        matchesArchiveView &&
        matchesSearch &&
        matchesStatus &&
        matchesWorkType
      );
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);

        case "company":
          return a.company.localeCompare(b.company);

        case "position":
          return a.position.localeCompare(b.position);

        case "deadline": {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline) - new Date(b.deadline);
        }

        case "newest":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }, [
    applications,
    viewMode,
    searchQuery,
    statusFilter,
    workTypeFilter,
    sortBy,
  ]);

  const visibleIds = visibleApplications.map((application) => application.id);

  const areAllVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedApplicationIds.includes(id));

  function handleToggleSelection(applicationId) {
    setSelectedApplicationIds((currentIds) =>
      currentIds.includes(applicationId)
        ? currentIds.filter((id) => id !== applicationId)
        : [...currentIds, applicationId]
    );
  }

  function handleToggleSelectAll() {
    if (areAllVisibleSelected) {
      setSelectedApplicationIds((currentIds) =>
        currentIds.filter((id) => !visibleIds.includes(id))
      );
      return;
    }

    setSelectedApplicationIds((currentIds) => [
      ...new Set([...currentIds, ...visibleIds]),
    ]);
  }

  async function handleArchiveSelected() {
    if (selectedApplicationIds.length === 0) {
      return;
    }

    try {
      await onArchiveApplications(selectedApplicationIds);
      setSelectedApplicationIds([]);
    } catch (error) {
      console.error("Bulk archive failed:", error);
    }
  }

  async function handleRestoreSelected() {
    if (selectedApplicationIds.length === 0) {
      return;
    }

    try {
      await onRestoreApplications(selectedApplicationIds);
      setSelectedApplicationIds([]);
    } catch (error) {
      console.error("Bulk restore failed:", error);
    }
  }

  async function handleArchiveSingle(id) {
    try {
      await onArchiveApplication(id);
      setSelectedApplicationIds((current) =>
        current.filter((item) => item !== id)
      );
    } catch (error) {
      console.error("Archive failed:", error);
    }
  }

  async function handleRestoreSingle(id) {
    try {
      await onRestoreApplication(id);
      setSelectedApplicationIds((current) =>
        current.filter((item) => item !== id)
      );
    } catch (error) {
      console.error("Restore failed:", error);
    }
  }

  async function handleDeleteSelected() {
    if (selectedApplicationIds.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Permanently delete ${selectedApplicationIds.length} application${
        selectedApplicationIds.length === 1 ? "" : "s"
      }?\n\nTheir activity history, document links, and related reminders will also be removed. This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await onDeleteApplications(selectedApplicationIds);
      setSelectedApplicationIds([]);
    } catch (error) {
      console.error("Bulk delete failed:", error);
    }
  }

  async function handleAddApplication(newApplication) {
    try {
      await onAddApplication(newApplication);
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  if (isLoading && applications.length === 0) {
    return <p>Loading applications...</p>;
  }

  return (
    <div>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="page-header">
        <div>
          <div className="page-title-row">
            <h1>Applications</h1>
            {isRefreshing && (
              <span className="refresh-indicator">
                Syncing...
              </span>
            )}
          </div>
          <p>
            Track and manage your job applications.
          </p>
        </div>

        <div className="applications-header-actions">
        <button
          className="primary-button"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Application
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => exportApplicationsCsv(applications)}
        >
          Export CSV
        </button>
        </div>
      </div>

      <div className="application-summary">
        <div>
          <span>Total</span>
          <strong>{totalApplications}</strong>
        </div>

        <div>
          <span>Active</span>
          <strong>{activeCount}</strong>
        </div>
      </div>

      <div className="application-view-tabs">
        <button
          type="button"
          className={
            viewMode === "active"
              ? "application-view-tab active"
              : "application-view-tab"
          }
          onClick={() => {
            setViewMode("active");
            setSelectedApplicationIds([]);
          }}
        >
          Active
          <span>{activeCount}</span>
        </button>

        <button
          type="button"
          className={
            viewMode === "archived"
              ? "application-view-tab active"
              : "application-view-tab"
          }
          onClick={() => {
            setViewMode("archived");
            setSelectedApplicationIds([]);
          }}
        >
          Archived
          <span>{archivedCount}</span>
        </button>
      </div>

      <div className="application-toolbar">
        <div className="application-search">
          <span className="search-icon">
            <SearchGlassIcon size={18} />
          </span>
          <input
            type="search"
            placeholder="Search company, position, or location..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter by status"
        >
          <option value="All">All statuses</option>
          <option value="Active">Active stages</option>
          <option value="Terminal">Terminal</option>
          <option value="Saved">Saved</option>
          <option value="Applied">Applied</option>
          <option value="Assessment">Assessment</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
          <option value="Withdrawn">Withdrawn</option>
        </select>

        <select
          value={workTypeFilter}
          onChange={(event) => setWorkTypeFilter(event.target.value)}
          aria-label="Filter by work type"
        >
          <option value="All">All work types</option>
          <option value="On-site">On-site</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Remote">Remote</option>
        </select>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          aria-label="Sort applications"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="deadline">Deadline</option>
          <option value="company">Company A–Z</option>
          <option value="position">Position A–Z</option>
        </select>

        <div className="application-display-toggle">
          <button
            type="button"
            className={
              displayMode === "cards"
                ? "is-active"
                : ""
            }
            onClick={() =>
              handleDisplayModeChange("cards")
            }
          >
            ▦ Cards
          </button>

          <button
            type="button"
            className={
              displayMode === "compact"
                ? "is-active"
                : ""
            }
            onClick={() =>
              handleDisplayModeChange("compact")
            }
          >
            ☰ Compact
          </button>
        </div>

      </div>

      {selectedApplicationIds.length > 0 && (
        <div className="selection-toolbar">
          <label className="select-all-control">
            <input
              type="checkbox"
              checked={areAllVisibleSelected}
              onChange={handleToggleSelectAll}
            />
            <span>Select all visible</span>
          </label>

          <div className="selection-actions">
            <span>
              {selectedApplicationIds.length} selected
            </span>

            {viewMode === "active" && (
              <button
                type="button"
                className="secondary-button"
                onClick={handleArchiveSelected}
              >
                Archive Selected
              </button>
            )}

            {viewMode === "archived" && (
              <button
                type="button"
                className="secondary-button"
                onClick={handleRestoreSelected}
              >
                Restore Selected
              </button>
            )}

            <button
              type="button"
              className="danger-button"
              onClick={handleDeleteSelected}
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {visibleApplications.length === 0 ? (
        <div className="empty-state">
          {applications.length === 0 ? (
            <>
              <h3>No applications yet</h3>
              <p>
                Add your first application to start tracking your job search.
              </p>
            </>
          ) : (
            <>
              <h3>No matching applications</h3>
              <p>Try changing your search or filters.</p>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("All");
                  setWorkTypeFilter("All");
                }}
              >
                Clear Filters
              </button>
            </>
          )}
        </div>
      ) : displayMode === "compact" ? (
        <ApplicationCompactList
          applications={visibleApplications}
          selectedApplicationIds={selectedApplicationIds}
          onToggleSelection={handleToggleSelection}
        />
      ) : (
        <div className="applications-grid">
          {visibleApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              isSelected={selectedApplicationIds.includes(application.id)}
              onToggleSelection={handleToggleSelection}
              onArchiveApplication={handleArchiveSingle}
              onRestoreApplication={handleRestoreSingle}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <ApplicationForm
            onSubmit={handleAddApplication}
            onCancel={() => setIsModalOpen(false)}
            initialData={addDate ? { appliedDate: addDate } : undefined}
          />
        </Modal>
      )}
    </div>
  );
}

export default Applications;
