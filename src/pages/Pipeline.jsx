import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { useState } from "react";

import PipelineColumn from "../components/PipelineColumn";

const pipelineStatuses = [
  "Saved",
  "Applied",
  "Assessment",
  "Interview",
  "Offer",
];

function Pipeline({
  applications,
  onUpdateApplication,
}) {
  const [activeApplication, setActiveApplication] =
    useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  function handleDragStart(event) {
    const application = applications.find(
      (application) =>
        String(application.id) ===
        String(event.active.id)
    );

    setActiveApplication(application ?? null);
  }

  async function handleDragEnd(event) {
    const { active, over } = event;

    setActiveApplication(null);

    if (!over) {
      return;
    }

    const application = applications.find(
      (application) =>
        String(application.id) ===
        String(active.id)
    );

    if (!application) {
      return;
    }

    const newStatus = over.id;

    if (
      !pipelineStatuses.includes(newStatus) ||
      application.status === newStatus
    ) {
      return;
    }

    try {
      await onUpdateApplication({
        ...application,
        status: newStatus,
      });
    } catch (error) {
      console.error(
        "Failed to move application:",
        error
      );
    }
  }

  function handleDragCancel() {
    setActiveApplication(null);
  }

  return (
    <div className="pipeline-page">
      <div className="page-header">
        <div>
          <h1>Pipeline</h1>
          <p>
            Drag applications between stages.
          </p>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="pipeline-board">
          {pipelineStatuses.map((status) => {
            const statusApplications =
              applications.filter(
                (application) =>
                  !application.isArchived &&
                  application.status === status
              );

            return (
              <PipelineColumn
                key={status}
                status={status}
                applications={
                  statusApplications
                }
                onUpdateApplication={
                  onUpdateApplication
                }
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeApplication ? (
            <div className="pipeline-drag-overlay">
              <strong>
                {activeApplication.position}
              </strong>

              <span>
                {activeApplication.company}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default Pipeline;
