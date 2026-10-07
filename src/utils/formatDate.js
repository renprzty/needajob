function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  const date = String(dateString).includes("T")
    ? new Date(dateString)
    : new Date(`${dateString}T00:00:00`);

  if (isNaN(date.getTime())) {
    return String(dateString);
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default formatDate;