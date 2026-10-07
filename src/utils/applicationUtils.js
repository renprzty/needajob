import { getTodayDateString } from "./dateUtils";

const appliedStages = [
  "Applied",
  "Assessment",
  "Interview",
  "Offer",
];

export function applyStatusTransition(
  application,
  newStatus
) {
  const updatedApplication = {
    ...application,
    status: newStatus,
  };

  if (
    appliedStages.includes(newStatus) &&
    !application.appliedDate
  ) {
    updatedApplication.appliedDate =
      getTodayDateString();
  }

  return updatedApplication;
}
