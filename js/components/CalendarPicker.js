window.CalendarPicker = function CalendarPicker({
  logs,
  selectedDate,
  onSelect,
  onClose,
}) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthStr = String(month + 1).padStart(2, "0");

  const existingDays = new Set(
    Object.keys(logs).filter(
      (d) => d.startsWith(`${year}-${monthStr}`)
    )
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="premium-card p-6 rounded-2xl w-80 fade-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm uppercase tracking-widest text-anchor-muted">
            Pick a Day
          </h3>
          <button
            onClick={onClose}
            className="text-anchor-muted hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${monthStr}-${String(day).padStart(
              2,
              "0"
            )}`;

            const exists = existingDays.has(dateStr);
            const isSelected = dateStr === selectedDate;

            return (
              <button
                key={dateStr}
                disabled={!exists}
                onClick={() => {
                  onSelect(dateStr);
                  onClose();
                }}
                className={`
                  aspect-square rounded-lg flex items-center justify-center
                  transition-all duration-200
                  ${
                    exists
                      ? "bg-anchor-surface hover:bg-anchor-accent/30"
                      : "bg-[#0a0a0a] opacity-30 cursor-not-allowed"
                  }
                  ${
                    isSelected
                      ? "ring-2 ring-anchor-accent text-white"
                      : "text-anchor-muted"
                  }
                `}
              >
                {day}
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-anchor-muted mt-4 text-center">
          Only days with saved logs are clickable.🔍
        </p>
      </div>
    </div>
  );
};
