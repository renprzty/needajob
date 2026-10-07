export function getTodayDateString() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDaysDifference(
  dateString,
  comparisonDateString
) {
  const date = new Date(
    `${dateString}T00:00:00`
  );

  const comparisonDate = new Date(
    `${comparisonDateString}T00:00:00`
  );

  const millisecondsPerDay =
    1000 * 60 * 60 * 24;

  return Math.round(
    (date - comparisonDate) /
      millisecondsPerDay
  );
}
