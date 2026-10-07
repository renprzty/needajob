function StatusBadge({ status }) {
  const statusClass = (status || "").toLowerCase().replace(/\s+/g, "-");

  return (
    <span className={`status-badge status-${statusClass}`}>
      {status || "Unknown"}
    </span>
  );
}

export default StatusBadge;