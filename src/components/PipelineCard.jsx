import { Link } from "react-router-dom";
import formatDate from "../utils/formatDate";
import { applyStatusTransition } from "../utils/applicationUtils";
import { useDraggable } from "@dnd-kit/core";

const statuses = [
  "Saved",
  "Applied",
  "Assessment",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
];

function PipelineCard({
  application,
  onUpdateApplication,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: String(application.id),
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  async function handleStatusChange(event) {
    const newStatus = event.target.value;

    const updatedApplication =
      applyStatusTransition(
        application,
        newStatus
      );

    try {
      await onUpdateApplication(
        updatedApplication
      );
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`pipeline-card ${
        isDragging ? "pipeline-card-dragging" : ""
      }`}
    >
      <div className="pipeline-card-top">
        <Link
          to={`/applications/${application.id}`}
          className="pipeline-card-title"
        >
          {application.position}
        </Link>

        <button
          type="button"
          className="pipeline-drag-handle"
          aria-label={`Drag ${application.position}`}
          {...listeners}
          {...attributes}
        >
          ⋮⋮
        </button>
      </div>

      <p className="pipeline-card-company">
        {application.company}
      </p>

      {application.followUpDate && (
        <p className="pipeline-card-followup">
          Follow up: {formatDate(application.followUpDate)}
        </p>
      )}

      <select
        value={application.status}
        onChange={handleStatusChange}
        className="pipeline-status-select"
      >
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </article>
  );
}

export default PipelineCard;
