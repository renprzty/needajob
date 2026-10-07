import { Link } from "react-router-dom";

function getUpcomingEvents(
  events,
  limit = 5
) {
  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  return events
    .filter((event) => {
      const eventDate =
        new Date(
          `${event.date}T00:00:00`
        );

      return eventDate >= today;
    })
    .sort(
      (a, b) =>
        a.date.localeCompare(
          b.date
        )
    )
    .slice(
      0,
      limit
    );
}

export default function UpcomingCalendar({
  events,
}) {
  const upcoming =
    getUpcomingEvents(events);

  return (
    <section className="upcoming-calendar aero-panel">
      <div className="upcoming-calendar-header">
        <div>
          <span className="section-eyebrow">
            Calendar
          </span>

          <h2>Upcoming</h2>
        </div>

        <Link
          to="/calendar"
          className="compact-view-link"
        >
          Open Calendar
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <p className="upcoming-calendar-empty">
          Nothing upcoming.
        </p>
      ) : (
        <div className="upcoming-calendar-list">
          {upcoming.map(
            (event) => (
              <div
                key={event.id}
                className="upcoming-calendar-item"
              >
                <div className="upcoming-calendar-date">
                  {new Date(
                    `${event.date}T00:00:00`
                  ).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </div>

                <div>
                  <strong>
                    {event.title}
                  </strong>

                  <span>
                    {event.type.replace(
                      "_",
                      " "
                    )}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}
