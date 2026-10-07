import { Link } from "react-router-dom";

function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  return new Date(
    `${dateString}T00:00:00`
  ).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function ActionItem({
  application,
  type,
  onSnooze,
  onCompleteFollowUp,
}) {
  let label = "";
  let description = "";

  switch (type) {
    case "overdue":
      label = "Overdue";

      description =
        `Follow-up was due ${formatDate(
          application.followUpDate
        )}`;

      break;

    case "today":
      label = "Today";
      description =
        "Follow up today";
      break;

    case "follow-up":
      label = "Upcoming";

      description =
        `Follow up ${formatDate(
          application.followUpDate
        )}`;

      break;

    case "deadline":
      label = "Deadline";

      description =
        `Deadline ${formatDate(
          application.deadline
        )}`;

      break;

    case "stale":
      label = "Stale";

      description =
        "No recent activity";
      break;

    default:
      break;
  }

  return (
    <div className="action-center-item">
      <div className="action-center-item-main">
        <span
          className={
            `action-priority action-${type}`
          }
        >
          {label}
        </span>

        <div>
          <h4>
            {application.position}
          </h4>

          <p>
            {application.company}
          </p>

          <span className="action-description">
            {description}
          </span>
        </div>
      </div>

      <div className="action-center-actions">
        <Link
          to={`/applications/${application.id}`}
          className="secondary-button"
        >
          View
        </Link>

        {(type === "overdue" ||
          type === "today") && (
          <>
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                onSnooze(application)
              }
            >
              Tomorrow
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                onCompleteFollowUp(
                  application
                )
              }
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ActionGroup({
  title,
  applications,
  type,
  onSnooze,
  onCompleteFollowUp,
}) {
  if (!applications.length) {
    return null;
  }

  return (
    <section className="action-group">
      <div className="action-group-header">
        <h3>{title}</h3>

        <span>
          {applications.length}
        </span>
      </div>

      <div className="action-group-list">
        {applications.map(
          (application) => (
            <ActionItem
              key={`${type}-${application.id}`}
              application={
                application
              }
              type={type}
              onSnooze={
                onSnooze
              }
              onCompleteFollowUp={
                onCompleteFollowUp
              }
            />
          )
        )}
      </div>
    </section>
  );
}

export default function ActionCenter({
  actionData,
  onSnooze,
  onCompleteFollowUp,
}) {
  const {
    overdueFollowUps,
    todayFollowUps,
    upcomingFollowUps,
    upcomingDeadlines,
    staleApplications,
  } = actionData;

  const hasActions =
    overdueFollowUps.length > 0 ||
    todayFollowUps.length > 0 ||
    upcomingFollowUps.length > 0 ||
    upcomingDeadlines.length > 0 ||
    staleApplications.length > 0;

  return (
    <section className="action-center aero-panel">
      <div className="action-center-header">
        <div>
          <span className="section-eyebrow">
            Action Center
          </span>

          <h2>Needs Attention</h2>

          <p>
            Your most important
            job-search actions in one place.
          </p>
        </div>
      </div>

      {!hasActions ? (
        <div className="action-center-empty">
          <div className="action-complete-orb">
            ✓
          </div>

          <h3>You're all caught up</h3>

          <p>
            No follow-ups or deadlines
            need your attention right now.
          </p>
        </div>
      ) : (
        <>
          <ActionGroup
            title="Overdue"
            applications={
              overdueFollowUps
            }
            type="overdue"
            onSnooze={onSnooze}
            onCompleteFollowUp={
              onCompleteFollowUp
            }
          />

          <ActionGroup
            title="Today"
            applications={
              todayFollowUps
            }
            type="today"
            onSnooze={onSnooze}
            onCompleteFollowUp={
              onCompleteFollowUp
            }
          />

          <ActionGroup
            title="Upcoming Follow-ups"
            applications={
              upcomingFollowUps
            }
            type="follow-up"
            onSnooze={onSnooze}
            onCompleteFollowUp={
              onCompleteFollowUp
            }
          />

          <ActionGroup
            title="Upcoming Deadlines"
            applications={
              upcomingDeadlines
            }
            type="deadline"
            onSnooze={onSnooze}
            onCompleteFollowUp={
              onCompleteFollowUp
            }
          />

          <ActionGroup
            title="Stale Applications"
            applications={
              staleApplications
            }
            type="stale"
            onSnooze={onSnooze}
            onCompleteFollowUp={
              onCompleteFollowUp
            }
          />
        </>
      )}
    </section>
  );
}
