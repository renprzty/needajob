import { Link } from "react-router-dom";

import StatusBadge from "./StatusBadge";
import formatDate from "../utils/formatDate";

function ApplicationCard({
    application,
    isSelected,
    onToggleSelection,
    onArchiveApplication,
    onRestoreApplication,
}) {
    return (
        <article
            className={
                `application-card ${
                    isSelected
                        ? "application-card-selected"
                        : ""
                }`
            }
        >
            <label
                className="application-select"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() =>
                        onToggleSelection(
                            application.id
                        )
                    }
                    aria-label={
                        `Select ${application.position} at ${application.company}`
                    }
                />

                <span />
            </label>

            <div className="application-card-header">
                <div>
                    <h3>{application.position}</h3>
                    <p className="company-name">{application.company}</p>
                </div>

                <StatusBadge status={application.status} />
            </div>

            <div className="application-info">
                <p>
                    {application.location} · {application.workType}
                </p>

                {application.appliedDate && (
                    <p>Applied: {formatDate(application.appliedDate)}</p>
                )}

                {application.deadline && (
                    <p>Deadline: {formatDate(application.deadline)}</p>
                )}
            </div>

            {application.notes && (
                <p className="application-notes">
                    {application.notes}
                </p>
            )}

            <div className="application-actions">
                <Link
                    to={`/applications/${application.id}`}
                    className="details-button"
                >
                    View Details
                </Link>

                {onArchiveApplication && onRestoreApplication && (
                    !application.isArchived ? (
                        <button
                            type="button"
                            className="card-action-button"
                            onClick={() =>
                                onArchiveApplication(
                                    application.id
                                )
                            }
                        >
                            Archive
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="card-action-button"
                            onClick={() =>
                                onRestoreApplication(
                                    application.id
                                )
                            }
                        >
                            Restore
                        </button>
                    )
                )}
            </div>
        </article>
    );
}

export default ApplicationCard;