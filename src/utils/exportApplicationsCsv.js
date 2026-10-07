function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);

  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n")
  ) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export function exportApplicationsCsv(applications) {
  const headers = [
    "Company",
    "Position",
    "Status",
    "Location",
    "Work Type",
    "Applied Date",
    "Deadline",
    "Follow-up Date",
    "Salary Min",
    "Salary Max",
    "Currency",
    "Job URL",
    "Archived",
    "Notes",
  ];

  const rows = applications.map((application) => [
    application.company,
    application.position,
    application.status,
    application.location,
    application.workType,
    application.appliedDate,
    application.deadline,
    application.followUpDate,
    application.salaryMin,
    application.salaryMax,
    application.salaryCurrency,
    application.jobUrl,
    application.isArchived ? "Yes" : "No",
    application.notes,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const today = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `needajob-applications-${today}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
