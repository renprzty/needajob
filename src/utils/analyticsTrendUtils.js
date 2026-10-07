export function toDateKey(date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getApplicationsByWeek(
  applications,
  weeks = 8
) {
  const today = new Date();

  const buckets = [];

  for (
    let offset = weeks - 1;
    offset >= 0;
    offset--
  ) {
    const start = new Date(today);

    start.setHours(
      0,
      0,
      0,
      0
    );

    start.setDate(
      start.getDate() -
        start.getDay() -
        offset * 7
    );

    const end = new Date(start);

    end.setDate(
      end.getDate() + 6
    );

    buckets.push({
      start,
      end,
      label:
        start.toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
          }
        ),
      applications: 0,
    });
  }

  for (const application of applications) {
    if (!application.appliedDate) {
      continue;
    }

    const appliedDate = new Date(
      `${application.appliedDate}T00:00:00`
    );

    const bucket =
      buckets.find(
        (item) =>
          appliedDate >= item.start &&
          appliedDate <= item.end
      );

    if (bucket) {
      bucket.applications += 1;
    }
  }

  return buckets.map(
    ({
      label,
      applications,
    }) => ({
      label,
      applications,
    })
  );
}

export function getStatusDistribution(
  applications
) {
  const statusMap = new Map();

  for (const application of applications) {
    statusMap.set(
      application.status,
      (statusMap.get(
        application.status
      ) || 0) + 1
    );
  }

  return Array.from(
    statusMap.entries()
  ).map(([status, count]) => ({
    status,
    count,
  }));
}
