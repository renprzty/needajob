import { Link } from "react-router-dom";

function formatDate(date) {
  if (!date) {
    return "—";
  }

  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

export default function ApplicationCompactList({
  applications,
  selectedApplicationIds,
  onToggleSelection,
}) {
  return (
    <div className="application-compact-table">
      <div className="application-compact-header">
        <div className="compact-select"></div>
        <div>Company</div>
        <div>Position</div>
        <div>Status</div>
        <div>Applied</div>
        <div>Follow-up</div>
        <div></div>
      </div>

      {applications.map((application) => {
        const isSelected =
          selectedApplicationIds.includes(
            application.id
          );

        return (
          <div
            key={application.id}
            className={`application-compact-row ${
              isSelected
                ? "is-selected"
                : ""
            }`}
          >
            <div className="compact-select">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() =>
                  onToggleSelection(
                    application.id
                  )
                }
                aria-label={`Select ${application.company}`}
              />
            </div>

            <div className="compact-company">
              {application.company}
            </div>

            <div className="compact-position">
              {application.position}
            </div>

            <div>
              <span
                className={`status-badge status-${application.status
                  .toLowerCase()
                  .replaceAll(" ", "-")}`}
              >
                {application.status}
              </span>
            </div>

            <div className="compact-applied-date">
              {formatDate(
                application.appliedDate
              )}
            </div>

            <div className="compact-followup-date">
              {formatDate(
                application.followUpDate
              )}
            </div>

            <div>
              <Link
                to={`/applications/${application.id}`}
                className="compact-view-link"
              >
                View
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
