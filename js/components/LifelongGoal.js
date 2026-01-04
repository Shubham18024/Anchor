window.LifelongGoal = function LifelongGoal({ value, onChange }) {
  return (
    <div className="premium-card p-6 rounded-2xl fade-soft">
      <h3 className="text-sm mb-2 text-anchor-muted flex items-center gap-2">
        ⭐ North Star (Lifelong Goal)
      </h3>

      <p className="text-xs text-anchor-muted mb-3">
        Your long-term direction. This does not reset automatically.
      </p>

      <textarea
        className="premium-input w-full p-3 text-sm rounded"
        rows={3}
        placeholder="Why are you doing all this?"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
