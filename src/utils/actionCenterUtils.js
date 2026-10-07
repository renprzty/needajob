const TERMINAL_STATUSES = [
  "Rejected",
  "Withdrawn",
];

function getDateOnly(date) {
  if (!date) return null;

  const parsed = new Date(
    `${date}T00:00:00`
  );

  parsed.setHours(0, 0, 0, 0);

  return parsed;
}

function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return today;
}

function getDifferenceInDays(
  laterDate,
  earlierDate
) {
  return Math.round(
    (laterDate - earlierDate) /
      (1000 * 60 * 60 * 24)
  );
}

export function isActionableApplication(
  application
) {
  return (
    !application.isArchived &&
    !TERMINAL_STATUSES.includes(
      application.status
    )
  );
}

export function getOverdueFollowUps(
  applications
) {
  const today = getToday();

  return applications
    .filter((application) => {
      if (
        !isActionableApplication(
          application
        )
      ) {
        return false;
      }

      if (!application.followUpDate) {
        return false;
      }

      const followUpDate =
        getDateOnly(
          application.followUpDate
        );

      return followUpDate < today;
    })
    .sort(
      (a, b) =>
        getDateOnly(a.followUpDate) -
        getDateOnly(b.followUpDate)
    );
}

export function getTodayFollowUps(
  applications
) {
  const today = getToday();

  return applications.filter(
    (application) => {
      if (
        !isActionableApplication(
          application
        )
      ) {
        return false;
      }

      if (!application.followUpDate) {
        return false;
      }

      const followUpDate =
        getDateOnly(
          application.followUpDate
        );

      return (
        followUpDate.getTime() ===
        today.getTime()
      );
    }
  );
}

export function getUpcomingFollowUps(
  applications,
  daysAhead = 7
) {
  const today = getToday();

  return applications
    .filter((application) => {
      if (
        !isActionableApplication(
          application
        )
      ) {
        return false;
      }

      if (!application.followUpDate) {
        return false;
      }

      const followUpDate =
        getDateOnly(
          application.followUpDate
        );

      const difference =
        getDifferenceInDays(
          followUpDate,
          today
        );

      return (
        difference > 0 &&
        difference <= daysAhead
      );
    })
    .sort(
      (a, b) =>
        getDateOnly(a.followUpDate) -
        getDateOnly(b.followUpDate)
    );
}

export function getUpcomingDeadlines(
  applications,
  daysAhead = 7
) {
  const today = getToday();

  return applications
    .filter((application) => {
      if (
        !isActionableApplication(
          application
        )
      ) {
        return false;
      }

      if (!application.deadline) {
        return false;
      }

      const deadline =
        getDateOnly(
          application.deadline
        );

      const difference =
        getDifferenceInDays(
          deadline,
          today
        );

      return (
        difference >= 0 &&
        difference <= daysAhead
      );
    })
    .sort(
      (a, b) =>
        getDateOnly(a.deadline) -
        getDateOnly(b.deadline)
    );
}

export function getStaleApplications(
  applications,
  staleAfterDays = 10
) {
  const now = new Date();

  return applications
    .filter((application) => {
      if (
        !isActionableApplication(
          application
        )
      ) {
        return false;
      }

      if (
        application.status === "Saved"
      ) {
        return false;
      }

      const activityDate =
        application.lastActivityAt
          ? new Date(
              application.lastActivityAt
            )
          : application.createdAt
            ? new Date(
                application.createdAt
              )
            : null;

      if (!activityDate) {
        return false;
      }

      const daysInactive =
        getDifferenceInDays(
          now,
          activityDate
        );

      return (
        daysInactive >= staleAfterDays
      );
    })
    .sort((a, b) => {
      const aDate = new Date(
        a.lastActivityAt ??
          a.createdAt
      );

      const bDate = new Date(
        b.lastActivityAt ??
          b.createdAt
      );

      return aDate - bDate;
    });
}

export function getActionCenterData(
  applications
) {
  const overdueFollowUps =
    getOverdueFollowUps(
      applications
    );

  const todayFollowUps =
    getTodayFollowUps(
      applications
    );

  const upcomingFollowUps =
    getUpcomingFollowUps(
      applications
    );

  const upcomingDeadlines =
    getUpcomingDeadlines(
      applications
    );

  const staleApplications =
    getStaleApplications(
      applications
    );

  return {
    overdueFollowUps,
    todayFollowUps,
    upcomingFollowUps,
    upcomingDeadlines,
    staleApplications,

    attentionCount:
      overdueFollowUps.length +
      todayFollowUps.length +
      upcomingDeadlines.length +
      staleApplications.length,
  };
}
