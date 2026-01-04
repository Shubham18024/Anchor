window.ConsistencyHeatmap = function ConsistencyHeatmap({ logs }) {
  const days = React.useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      list.push(d.toISOString().split("T")[0]);
    }
    return list;
  }, []);

  const getColor = (date) => {
    const log = logs[date];
    if (!log || !log.tasks || log.tasks.length === 0) return "bg-[#1a1a1a]";

    const total = log.tasks.length;
    const done = log.tasks.filter((t) => t.completed).length;
    const ratio = done / total;

    if (ratio === 0) return "bg-anchor-danger/50";
    if (ratio <= 0.4) return "bg-anchor-warning/50";
    if (ratio < 1) return "bg-anchor-accent/60";
    return "bg-anchor-success";
  };

  return (
    <div className="premium-card p-6 rounded-2xl">
      <h3 className="text-sm mb-4 text-anchor-muted">
        Consistency (Last 12 Months)
      </h3>

      <div className="flex flex-wrap gap-[2px]">
        {days.map((day) => (
          <div
            key={day}
            title={day}
            className={`w-3 h-3 rounded-sm ${getColor(
              day
            )} transition-colors duration-300`}
          />
        ))}
      </div>

      <div className="flex gap-4 mt-4 text-xs text-anchor-muted">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-anchor-success rounded-sm" /> Full
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-anchor-accent/50 rounded-sm" /> Partial
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-anchor-warning/40 rounded-sm" /> Low
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-anchor-danger/40 rounded-sm" /> Missed
        </span>
      </div>
    </div>
  );
};
