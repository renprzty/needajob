import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";
import Modal from "../components/Modal";

import {
  createReminder,
  deleteReminder,
  getReminders,
  updateReminder,
} from "../services/calendarService";

import {
  buildCalendarEvents,
  groupEventsByDate,
} from "../utils/calendarUtils";

function toDateKey(date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildMonthDays(currentMonth) {
  const year =
    currentMonth.getFullYear();

  const month =
    currentMonth.getMonth();

  const firstDay =
    new Date(
      year,
      month,
      1
    );

  const lastDay =
    new Date(
      year,
      month + 1,
      0
    );

  const days = [];

  for (
    let i = 0;
    i < firstDay.getDay();
    i++
  ) {
    days.push(null);
  }

  for (
    let day = 1;
    day <= lastDay.getDate();
    day++
  ) {
    days.push(
      new Date(
        year,
        month,
        day
      )
    );
  }

  return days;
}

function CalendarDayPanel({
  date,
  events,
  onClose,
  onAddReminder,
  onEditReminder,
  onDeleteReminder,
}) {
  const dialogRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!isClosing) return;
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 220;
    const timer = window.setTimeout(onClose, delay);
    return () => window.clearTimeout(timer);
  }, [isClosing, onClose]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsClosing(true);
      }
      if (event.key === "Tab") {
        const controls = dialogRef.current?.closest(".modal")?.querySelectorAll(
          'button, a[href], input, select, textarea, [tabindex="0"]'
        );
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <Modal className={`calendar-day-overlay ${isClosing ? "is-closing" : ""}`} onClose={() => setIsClosing(true)}>
    <section className="calendar-day-dialog" role="dialog" aria-modal="true" aria-labelledby="calendar-selected-day-title" tabIndex={-1} ref={dialogRef}>
      <div className="calendar-day-panel-header">
        <div>
          <span className="section-eyebrow">
            Selected day
          </span>

          <h2 id="calendar-selected-day-title">
            {new Date(
              `${date}T00:00:00`
            ).toLocaleDateString(
              "en-US",
              {
                month: "long",
                day: "numeric",
                year: "numeric",
              }
            )}
          </h2>
        </div>


      </div>

      <div className="calendar-day-actions">
        <button
          type="button"
          className="primary-button"
          onClick={onAddReminder}
        >
          + Add Reminder
        </button>

        <Link
          to={`/applications?addDate=${date}`}
          className="secondary-button"
        >
          + Add Application
        </Link>
      </div>

      <div className="calendar-selected-events">
        {events.length === 0 ? (
          <p>
            Nothing scheduled for
            this day.
          </p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="calendar-selected-event"
            >
              <div>
                <span
                  className={`calendar-event-type calendar-event-${event.type}`}
                >
                  {event.type.replace(
                    "_",
                    " "
                  )}
                </span>

                <strong>
                  {event.title}
                </strong>
              </div>

              {event.type === "reminder" && (
                <div className="calendar-reminder-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      onEditReminder(
                        event.reminder
                      )
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="document-delete-button"
                    onClick={() =>
                      onDeleteReminder(
                        event.reminder.id
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              )}

              {event.application && (
                <Link
                  to={`/applications/${event.application.id}`}
                  className="compact-view-link"
                >
                  View
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </section>
    </Modal>
  );
}

function ReminderModal({
  date,
  user,
  applications,
  reminder,
  onClose,
  onCreated,
  onUpdated,
}) {
  const [title, setTitle] = useState(
    reminder?.title || ""
  );

  const [applicationId, setApplicationId] = useState(
    reminder?.applicationId
      ? String(reminder.applicationId)
      : ""
  );

  const [reminderDate, setReminderDate] = useState(
    reminder?.reminderDate || date
  );

  const [time, setTime] = useState(
    reminder?.reminderTime
      ? reminder.reminderTime.slice(0, 5)
      : ""
  );

  const [notes, setNotes] = useState(
    reminder?.notes || ""
  );

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = Boolean(reminder?.id);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Reminder title is required.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      if (isEditing) {
        const updatedReminder = await updateReminder({
          id: reminder.id,
          applicationId: applicationId || null,
          title: title.trim(),
          reminderDate,
          reminderTime: time || null,
          notes: notes.trim() || null,
        });

        onUpdated(updatedReminder);
      } else {
        const createdReminder = await createReminder({
          userId: user.id,
          applicationId: applicationId || null,
          title: title.trim(),
          reminderDate,
          reminderTime: time || null,
          notes: notes.trim() || null,
        });

        onCreated(createdReminder);
      }
    } catch (error) {
      console.error(error);
      setError(
        isEditing
          ? "Failed to update reminder."
          : "Failed to create reminder."
      );
      setIsSaving(false);
    }
  }

  return (
    <div className="document-modal-backdrop calendar-reminder-backdrop">
      <div className="document-modal">
        <div className="document-modal-header">
          <div>
            <span className="section-eyebrow">
              Calendar
            </span>

            <h2>
              {isEditing
                ? "Edit Reminder"
                : "Add Reminder"}
            </h2>

            <p>{reminderDate}</p>
          </div>

          <button
            type="button"
            className="document-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form
          className="document-upload-form"
          onSubmit={handleSubmit}
        >
          <label className="form-field">
            <span>Title</span>

            <input
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Email recruiter"
              required
            />
          </label>

          <label className="form-field">
            <span>Date</span>

            <input
              type="date"
              value={reminderDate}
              onChange={(event) =>
                setReminderDate(event.target.value)
              }
              required
            />
          </label>

          <label className="form-field">
            <span>
              Related application
            </span>

            <select
              value={applicationId}
              onChange={(event) =>
                setApplicationId(event.target.value)
              }
            >
              <option value="">
                None
              </option>

              {applications
                .filter(
                  (application) =>
                    !application.isArchived
                )
                .map(
                  (application) => (
                    <option
                      key={application.id}
                      value={application.id}
                    >
                      {application.company}
                      {" — "}
                      {application.position}
                    </option>
                  )
                )}
            </select>
          </label>

          <label className="form-field">
            <span>
              Time (optional)
            </span>

            <input
              type="time"
              value={time}
              onChange={(event) =>
                setTime(event.target.value)
              }
            />
          </label>

          <label className="form-field">
            <span>
              Notes
            </span>

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              rows="4"
            />
          </label>

          {error && (
            <div className="documents-error">
              {error}
            </div>
          )}

          <div className="document-modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={isSaving}
            >
              {isSaving
                ? isEditing
                  ? "Saving..."
                  : "Adding..."
                : isEditing
                  ? "Save Changes"
                  : "Add Reminder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Calendar({
  applications,
  user,
}) {
  const [currentMonth, setCurrentMonth] =
    useState(
      () => new Date()
    );

  const [selectedDate, setSelectedDate] =
    useState(null);

  const [reminders, setReminders] =
    useState([]);

  const [editingReminder, setEditingReminder] =
    useState(null);

  const [isReminderOpen, setIsReminderOpen] =
    useState(false);

  useEffect(() => {
    async function loadReminders() {
      if (!user?.id) {
        return;
      }

      try {
        const data =
          await getReminders();

        setReminders(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadReminders();
  }, [user?.id]);

  const events = useMemo(
    () =>
      buildCalendarEvents(
        applications,
        reminders
      ),
    [
      applications,
      reminders,
    ]
  );

  const eventsByDate = useMemo(
    () =>
      groupEventsByDate(
        events
      ),
    [events]
  );

  const monthDays = useMemo(
    () =>
      buildMonthDays(
        currentMonth
      ),
    [currentMonth]
  );

  function goToToday() {
    const today =
      new Date();

    setCurrentMonth(
      today
    );

    setSelectedDate(null);
  }

  function previousMonth() {
    setCurrentMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() - 1,
          1
        )
    );
  }

  function nextMonth() {
    setCurrentMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + 1,
          1
        )
    );
  }

  return (
    <div className="calendar-page">
      <header className="calendar-page-header">
        <div>
          <h1>Calendar</h1>

          <p>
            Applications, follow-ups,
            deadlines, and reminders.
          </p>
        </div>

        <div className="calendar-navigation">
          <button
            type="button"
            className="secondary-button"
            onClick={goToToday}
          >
            Today
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={previousMonth}
            aria-label="Previous month"
          >
            ‹
          </button>

          <strong>
            {currentMonth.toLocaleDateString(
              "en-US",
              {
                month: "long",
                year: "numeric",
              }
            )}
          </strong>

          <button
            type="button"
            className="secondary-button"
            onClick={nextMonth}
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </header>

      <section className="calendar-shell aero-panel">
        <div className="calendar-weekdays">
          {[
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
          ].map((day) => (
            <div key={day}>
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-grid">
          {monthDays.map(
            (date, index) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="calendar-day is-empty"
                  />
                );
              }

              const dateKey =
                toDateKey(date);

              const todayKey =
                toDateKey(
                  new Date()
                );

              const isToday =
                dateKey === todayKey;

              const dayEvents =
                eventsByDate[
                  dateKey
                ] || [];

              return (
                <button
                  type="button"
                  key={dateKey}
                  aria-label={`${date.toLocaleDateString("en-US", { dateStyle: "full" })}, ${dayEvents.length} events`}
                  className={`calendar-day ${
                    isToday
                      ? "is-today"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedDate(
                      dateKey
                    )
                  }
                >
                  <span className="calendar-day-number">
                    {date.getDate()}
                  </span>

                  <div className="calendar-day-events">
                    {dayEvents
                      .slice(0, 3)
                      .map(
                        (event) => (
                          <span
                            key={
                              event.id
                            }
                            className={`calendar-event calendar-event-${event.type}`}
                          >
                            {
                              event.title
                            }
                          </span>
                        )
                      )}

                    {dayEvents.length >
                      3 && (
                      <span className="calendar-more">
                        +
                        {dayEvents.length -
                          3}{" "}
                        more
                      </span>
                    )}
                  </div>
                  {dayEvents.length > 0 && (
                    <span className="calendar-mobile-count" aria-hidden="true">
                      {dayEvents.length}
                    </span>
                  )}
                </button>
              );
            }
          )}
        </div>
      </section>

      {selectedDate && !isReminderOpen && (
        <CalendarDayPanel
          date={selectedDate}
          events={
            eventsByDate[
              selectedDate
            ] || []
          }
          onClose={() =>
            setSelectedDate(null)
          }
          onAddReminder={() => {
            setEditingReminder(null);
            setIsReminderOpen(true);
          }}
          onEditReminder={(reminder) => {
            setEditingReminder(
              reminder
            );

            setIsReminderOpen(
              true
            );
          }}
          onDeleteReminder={
            async (reminderId) => {
              await deleteReminder(
                reminderId
              );

              setReminders(
                (current) =>
                  current.filter(
                    (reminder) =>
                      reminder.id !==
                      reminderId
                  )
              );
            }
          }
        />
      )}

      {isReminderOpen &&
        selectedDate && (
          <ReminderModal
            date={selectedDate}
            user={user}
            applications={
              applications
            }
            reminder={
              editingReminder
            }
            onClose={() => {
              setIsReminderOpen(
                false
              );

              setEditingReminder(
                null
              );
            }}
            onCreated={(
              reminder
            ) => {
              setReminders(
                (current) => [
                  ...current,
                  reminder,
                ]
              );

              setIsReminderOpen(
                false
              );

              setEditingReminder(
                null
              );
            }}
            onUpdated={(updated) => {
              setReminders(
                (current) =>
                  current.map(
                    (reminder) =>
                      reminder.id ===
                      updated.id
                        ? updated
                        : reminder
                  )
              );

              setIsReminderOpen(
                false
              );

              setEditingReminder(
                null
              );
            }}
          />
        )}
    </div>
  );
}
