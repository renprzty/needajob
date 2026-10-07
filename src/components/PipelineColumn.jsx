import { useDroppable } from "@dnd-kit/core";

import PipelineCard from "./PipelineCard";

function PipelineColumn({
  status,
  applications,
  onUpdateApplication,
}) {
  const { setNodeRef, isOver } =
    useDroppable({
      id: status,
    });

  return (
    <section
      ref={setNodeRef}
      className={
        `pipeline-column ${
          isOver
            ? "pipeline-column-over"
            : ""
        }`
      }
    >
      <div className="pipeline-column-header">
        <h2>{status}</h2>

        <span className="pipeline-count">
          {applications.length}
        </span>
      </div>

      <div className="pipeline-column-content">
        {applications.length === 0 ? (
          <p className="pipeline-empty">
            Drop applications here
          </p>
        ) : (
          applications.map((application) => (
            <PipelineCard
              key={application.id}
              application={application}
              onUpdateApplication={
                onUpdateApplication
              }
            />
          ))
        )}
      </div>
    </section>
  );
}

export default PipelineColumn;
