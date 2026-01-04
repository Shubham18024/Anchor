window.ScreenTimeTracker = function ScreenTimeTracker({ data, onChange }) {
  const chartRef = React.useRef(null);
  const chartInstance = React.useRef(null);

  // DEFAULT CATEGORIES (only initial)
  const defaultCategories = {
    Productivity: ["Coding", "Reading", "Study"],
    Communication: ["WhatsApp", "Telegram"],
    Entertainment: ["YouTube", "Netflix", "Instagram"],
    Neutral: ["Browser", "System"],
  };

  // USER-EDITABLE CATEGORIES
  const [userCategories, setUserCategories] =
    React.useState(defaultCategories);
  const [newCategory, setNewCategory] = React.useState("");
  const [newApp, setNewApp] = React.useState({});

  // EMOJIS FOR APPS
  const emojiMap = {
    Coding: "💻",
    Reading: "📚",
    Study: "✍️",
    WhatsApp: "💬",
    Telegram: "📨",
    YouTube: "📺",
    Netflix: "🎬",
    Instagram: "📸",
    Browser: "🌐",
    System: "⚙️",
  };

  // HANDLE INPUT (hours + minutes)
  const handleInput = (app, field, value) => {
    const current = data[app] || 0;
    let h = Math.floor(current / 60);
    let m = current % 60;

    if (field === "h") h = parseInt(value || 0);
    if (field === "m") m = parseInt(value || 0);

    onChange({
      ...data,
      [app]: h * 60 + m,
    });
  };

  // TOTAL TIME
  const totalMinutes = Object.values(data).reduce((a, b) => a + b, 0);

  // CHART EFFECT
  React.useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const sums = {};
    Object.keys(userCategories).forEach((c) => (sums[c] = 0));

    Object.entries(userCategories).forEach(([cat, apps]) => {
      apps.forEach((app) => {
        sums[cat] += data[app] || 0;
      });
    });

    chartInstance.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: Object.keys(sums),
        datasets: [
          {
            data: Object.values(sums),
            backgroundColor: [
              "#34d399",
              "#38bdf8",
              "#fb7185",
              "#a3a3a3",
              "#c084fc",
              "#fbbf24",
            ],
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // 🔥 mobile fix
        plugins: { legend: { display: false } },
        animation: { duration: 800, easing: "easeOutQuart" },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: "#a3a3a3" },
            grid: { color: "#262626" },
          },
          x: {
            ticks: { color: "#a3a3a3" },
            grid: { display: false },
          },
        },
      },
    });
  }, [data, userCategories]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-soft">
      {/* ================= INPUT SIDE ================= */}
      <div className="premium-card p-4 md:p-6 rounded-2xl">
        <h3 className="text-sm mb-4 text-anchor-muted flex items-center gap-2">
          ⏱️ Screen Time (Be Honest)
        </h3>

        <div className="space-y-6">
          {Object.entries(userCategories).map(([cat, apps]) => (
            <div key={cat}>
              <h4 className="text-xs uppercase text-anchor-accent mb-3">
                {cat}
              </h4>

              {apps.map((app) => {
                const val = data[app] || 0;

                return (
                  <div
                    key={app}
                    className="
                      flex flex-col sm:flex-row
                      sm:items-center sm:justify-between
                      gap-3
                      mb-3
                      p-3
                      rounded-xl
                      bg-white/5
                      hover:bg-white/10
                      transition
                    "
                  >
                    <span className="text-sm text-white flex items-center gap-2">
                      <span>{emojiMap[app] || "📱"}</span>
                      {app}
                    </span>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <input
                        type="number"
                        className="premium-input flex-1 sm:w-16 p-2 text-sm text-right"
                        placeholder="0h"
                        value={Math.floor(val / 60) || ""}
                        onChange={(e) =>
                          handleInput(app, "h", e.target.value)
                        }
                      />
                      <input
                        type="number"
                        className="premium-input flex-1 sm:w-16 p-2 text-sm text-right"
                        placeholder="0m"
                        value={val % 60 || ""}
                        onChange={(e) =>
                          handleInput(app, "m", e.target.value)
                        }
                      />
                    </div>
                  </div>
                );
              })}

              {/* ADD APP */}
              <div className="flex gap-2 mt-2 mb-4">
                <input
                  className="premium-input flex-1 p-2 text-sm"
                  placeholder={`Add app to ${cat}`}
                  value={newApp[cat] || ""}
                  onChange={(e) =>
                    setNewApp((prev) => ({
                      ...prev,
                      [cat]: e.target.value,
                    }))
                  }
                />
                <button
                  className="px-3 rounded bg-anchor-accent text-black text-sm"
                  onClick={() => {
                    if (!newApp[cat]) return;

                    setUserCategories((prev) => ({
                      ...prev,
                      [cat]: [...prev[cat], newApp[cat]],
                    }));

                    setNewApp((prev) => ({ ...prev, [cat]: "" }));
                  }}
                >
                  +
                </button>
              </div>
            </div>
          ))}

          {/* ADD CATEGORY */}
          <div className="mt-6 border-t border-anchor-border pt-4">
            <h4 className="text-xs uppercase text-anchor-muted mb-2">
              Add Category
            </h4>
            <div className="flex gap-2">
              <input
                className="premium-input flex-1 p-2 text-sm"
                placeholder="Category name (e.g. Fitness)"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button
                className="px-3 rounded bg-anchor-accent text-black text-sm"
                onClick={() => {
                  if (!newCategory) return;

                  setUserCategories((prev) => ({
                    ...prev,
                    [newCategory]: [],
                  }));

                  setNewCategory("");
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* REACTION */}
        <div className="mt-4 text-xs text-anchor-muted text-center">
          {totalMinutes > 180
            ? "😬 Heavy usage today. Awareness is the first step."
            : totalMinutes > 90
            ? "🙂 Decent control. Try reducing tomorrow."
            : "🔥 Excellent discipline today."}
        </div>
      </div>

      {/* ================= CHART SIDE ================= */}
      <div className="premium-card p-4 md:p-6 rounded-2xl fade-soft">
        <h3 className="text-sm mb-4 text-anchor-muted flex items-center gap-2">
          📊 Usage Distribution
        </h3>

        {/* fixed height for mobile */}
        <div className="relative h-64 md:h-80">
          <canvas ref={chartRef} />
        </div>
      </div>
    </div>
  );
};
