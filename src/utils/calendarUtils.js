export function buildCalendarEvents(
  applications,
  reminders
) {
  const events = [];

  for (const application of applications) {
    if (application.isArchived) {
      continue;
    }

    if (application.appliedDate) {
      events.push({
        id:
          `applied-${application.id}`,
        type: "applied",
        date:
          application.appliedDate,
        title:
          `${application.company} · Applied`,
        application,
      });
    }

    if (application.followUpDate) {
      events.push({
        id:
          `follow-up-${application.id}`,
        type: "follow_up",
        date:
          application.followUpDate,
        title:
          `${application.company} · Follow-up`,
        application,
      });
    }

    if (application.deadline) {
      events.push({
        id:
          `deadline-${application.id}`,
        type: "deadline",
        date:
          application.deadline,
        title:
          `${application.company} · Deadline`,
        application,
      });
    }
  }

  for (const reminder of reminders) {
    events.push({
      id:
        `reminder-${reminder.id}`,
      type: "reminder",
      date:
        reminder.reminderDate,
      title:
        reminder.title,
      reminder,
    });
  }

  return events;
}

export function groupEventsByDate(
  events
) {
  return events.reduce(
    (groups, event) => {
      if (!groups[event.date]) {
        groups[event.date] = [];
      }

      groups[event.date].push(
        event
      );

      return groups;
    },
    {}
  );
}
