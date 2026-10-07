import formatDate from "../utils/formatDate";

function formatActivityDate(dateString) {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const activityTitles = {
  created: "Application created",
  status_changed: "Status changed",
  follow_up_changed: "Follow-up changed",
  deadline_changed: "Deadline changed",
  notes_updated: "Notes updated",
  archived: "Application archived",
  restored: "Application restored",
  document_attached: "Document attached",
  document_unlinked: "Document unlinked",
};

function getActivityTitle(activity) {
  return activityTitles[activity.activityType] || "Application updated";
}

function ActivityTimeline({ activities, isLoading }) {
  if (isLoading) {
    return <p className="activity-loading">Loading activity...</p>;
  }

  if (activities.length === 0) {
    return <div className="activity-empty">No activity recorded yet.</div>;
  }

  return (
    <div className="activity-timeline">
      {activities.map((activity) => (
        <div key={activity.id} className="activity-item">
          <div className="activity-marker">
            <div className="activity-dot" />
          </div>

          <div className="activity-content">
            <div className="activity-header">
              <strong>{getActivityTitle(activity)}</strong>

              <time>{formatActivityDate(activity.createdAt)}</time>
            </div>

            {activity.activityType === "status_changed" && (
              <div className="activity-transition">
                <span>{activity.oldValue}</span>

                <span className="activity-arrow">→</span>

                <span>{activity.newValue}</span>
              </div>
            )}

            {activity.activityType === "document_attached" && (
              <p>
                Attached <strong>{activity.newValue}</strong>
              </p>
            )}

            {activity.activityType === "document_unlinked" && (
              <p>
                Unlinked <strong>{activity.oldValue}</strong>
              </p>
            )}

            {activity.description &&
              activity.activityType !== "status_changed" &&
              activity.activityType !== "document_attached" &&
              activity.activityType !== "document_unlinked" && (
                <p>{activity.description}</p>
              )}

            {activity.activityType === "follow_up_changed" &&
              activity.newValue && (
                <p>New date: {formatDate(activity.newValue)}</p>
              )}

            {activity.activityType === "deadline_changed" &&
              activity.newValue && (
                <p>New deadline: {formatDate(activity.newValue)}</p>
              )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActivityTimeline;
