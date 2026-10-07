export function getReachedApplicationIds(
  applications,
  activities,
  status
) {
  const ids = new Set();

  for (const activity of activities) {
    if (
      activity.activityType ===
        "status_changed" &&
      activity.newValue === status
    ) {
      ids.add(activity.applicationId);
    }
  }

  for (const application of applications) {
    if (application.status === status) {
      ids.add(application.id);
    }
  }

  return ids;
}

export function getConversionRate(
  numerator,
  denominator
) {
  if (denominator === 0) {
    return 0;
  }

  return Math.round(
    (numerator / denominator) * 100
  );
}

export function getAverageDaysToInterview(
  applications,
  activities
) {
  const durations = [];

  for (const application of applications) {
    if (!application.appliedDate) {
      continue;
    }

    const interviewActivity =
      activities.find(
        (activity) =>
          activity.applicationId ===
            application.id &&
          activity.activityType ===
            "status_changed" &&
          activity.newValue ===
            "Interview"
      );

    if (!interviewActivity) {
      continue;
    }

    const appliedDate = new Date(
      `${application.appliedDate}T00:00:00`
    );

    const interviewDate = new Date(
      interviewActivity.createdAt
    );

    const millisecondsPerDay =
      1000 * 60 * 60 * 24;

    const days =
      (interviewDate - appliedDate) /
      millisecondsPerDay;

    if (days >= 0) {
      durations.push(days);
    }
  }

  if (durations.length === 0) {
    return null;
  }

  const average =
    durations.reduce(
      (sum, value) => sum + value,
      0
    ) / durations.length;

  return Math.round(average * 10) / 10;
}
