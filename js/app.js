const { useState, useEffect } = React;

function App() {
  // ---- DATE & TIME ----
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [currentTime, setCurrentTime] = useState(new Date());

  // ---- UI STATE ----
  const [showCalendar, setShowCalendar] = useState(false);
  const [view, setView] = useState("dashboard");
  const [showGuide, setShowGuide] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle");

  // 🔥 MOBILE UI STATE (NEW — UI ONLY)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ---- APP DATA ----
  const [appData, setAppData] = useState({
    version: "3.1",
    identity: "User",
    goals: {
      lifelong: "",
      big: "",
      monthly: "",
      weekly: "",
    },
    gamification: {
      xp: 0,
      level: 1,
    },
    logs: {},
    vaultBlob: null,
  });

  // ---- CLOCK ----
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ---- ENSURE TODAY LOG ----
  useEffect(() => {
    if (!appData.logs[todayStr]) {
      setAppData((prev) => ({
        ...prev,
        logs: {
          ...prev.logs,
          [todayStr]: {
            intent: "",
            tasks: [],
            screenTime: {},
            notes: "",
          },
        },
      }));
    }
  }, [appData.logs, todayStr]);

  const currentLog = appData.logs[selectedDate] || {
    intent: "",
    tasks: [],
    screenTime: {},
    notes: "",
  };

  const updateDailyLog = (key, value) => {
    setAppData((prev) => ({
      ...prev,
      logs: {
        ...prev.logs,
        [todayStr]: {
          ...prev.logs[todayStr],
          [key]: value,
        },
      },
    }));
  };

  // ---- GREETING ----
  const hour = currentTime.getHours();
  const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";

  return (
    <>
      {/* ================= MOBILE TOP BAR ================= */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-anchor-panel border-b border-anchor-border px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="text-white text-xl"
        >
          ☰
        </button>

        <h1 className="text-lg font-semibold text-anchor-accent">ANCHOR</h1>

        <button
          onClick={() => setShowCalendar(true)}
          className="text-sm text-anchor-accent"
        >
          🗓️
        </button>
      </header>

      {/* ================= MOBILE SIDEBAR OVERLAY ================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileMenuOpen(false)}
          />

          <aside className="relative w-64 bg-anchor-panel border-r border-anchor-border p-4 flex flex-col justify-between">
            <div>
              <h1 className="text-xl font-bold mb-6 text-anchor-accent">
                ANCHOR
              </h1>

              <nav className="space-y-2">
                <button
                  onClick={() => {
                    setView("dashboard");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2 rounded text-white bg-anchor-surface"
                >
                  Dashboard
                </button>

                <button
                  onClick={() => {
                    setView("vault");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2 rounded text-anchor-muted hover:text-white"
                >
                  Vault
                </button>
              </nav>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="mt-6 text-xs text-anchor-muted"
            >
              Close
            </button>
          </aside>
        </div>
      )}

      {/* ================= DESKTOP LAYOUT ================= */}
      <div className="flex h-screen bg-anchor-bg text-anchor-text pt-14 md:pt-0">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex w-64 border-r border-anchor-border p-4 bg-anchor-panel flex-col overflow-y-auto">
          <div className="mb-10">
            <h1 className="text-xl font-bold mb-8 text-anchor-accent">
              ANCHOR
            </h1>

            <nav className="space-y-2">
              <button
                onClick={() => setView("dashboard")}
                className={`w-full text-left p-2 rounded ${
                  view === "dashboard"
                    ? "bg-anchor-surface text-white"
                    : "text-anchor-muted hover:text-white"
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => setView("vault")}
                className={`w-full text-left p-2 rounded ${
                  view === "vault"
                    ? "bg-anchor-surface text-white"
                    : "text-anchor-muted hover:text-white"
                }`}
              >
                Vault
              </button>
            </nav>
          </div>

          {/* DAILY LOG */}
          <div className="premium-card p-4 rounded-2xl fade-up">
            <h3 className="text-xs uppercase tracking-widest text-anchor-muted mb-3">
              Daily Log
            </h3>

            <button
              onClick={() => {
                AnchorFileSystem.exportDay(appData, todayStr);
                setSaveStatus("saved");
                setTimeout(() => setSaveStatus("idle"), 2000);
              }}
              className="w-full mb-2 py-2 rounded-lg bg-anchor-accent text-black font-semibold"
            >
              Save Today
            </button>

            <label className="block w-full text-center py-2 rounded-lg border border-anchor-border text-sm text-anchor-muted cursor-pointer">
              Load Saved Day
              <input
                type="file"
                accept=".swa"
                className="hidden"
                onChange={(e) =>
                  AnchorFileSystem.importDay(e.target.files[0], setAppData)
                }
              />
            </label>
          </div>
        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1 px-4 md:px-8 py-6 pb-24 overflow-y-auto">
          <header className="mb-6 fade-up">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-semibold">
                Good {greeting},
              </h2>

              {!editingName ? (
                <>
                  <span className="text-2xl md:text-3xl font-semibold text-white">
                    {appData.identity}
                  </span>
                  <button
                    onClick={() => {
                      setTempName(appData.identity);
                      setEditingName(true);
                    }}
                    className="text-xs text-anchor-muted"
                  >
                    ✏️
                  </button>
                </>
              ) : (
                <input
                  autoFocus
                  className="bg-transparent border-b border-anchor-accent outline-none text-2xl md:text-3xl font-semibold text-white w-40"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={() => {
                    setAppData((prev) => ({
                      ...prev,
                      identity: tempName.trim() || "User",
                    }));
                    setEditingName(false);
                  }}
                />
              )}
            </div>

            <p className="text-anchor-muted font-mono text-sm mt-1">
              {selectedDate} · {currentTime.toLocaleTimeString()}
            </p>
            <button
              onClick={() => setShowCalendar(true)}
              className="mt-2 text-xs text-anchor-accent hover:underline"
            >
              Open Calendar 🗓️
            </button>

            {/* XP Progress */}
            <div className="mt-3 max-w-sm glow-accent">
              <div className="flex justify-between text-xs text-anchor-muted mb-1">
                <span>Level {appData.gamification.level}</span>
                <span>{appData.gamification.xp} XP</span>
              </div>

              <div className="h-2 rounded-full bg-anchor-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${appData.gamification.xp % 100}%`,
                    background: "linear-gradient(90deg, #38bdf8, #34d399)",
                  }}
                />
              </div>
            </div>
          </header>

          <SaveReminder />

          {view === "dashboard" && (
            <div className="space-y-6">
              <LifelongGoal
                value={appData.goals.lifelong}
                onChange={(val) =>
                  setAppData((prev) => ({
                    ...prev,
                    goals: { ...prev.goals, lifelong: val },
                  }))
                }
              />

              <ConsistencyHeatmap logs={appData.logs} />

              <TaskList
                tasks={currentLog.tasks}
                onUpdate={(tasks) => {
                  // ✅ count completed tasks BEFORE update
                  const prevCompleted = currentLog.tasks.filter(
                    (t) => t.completed
                  ).length;

                  const newCompleted = tasks.filter((t) => t.completed).length;

                  // update tasks normally
                  updateDailyLog("tasks", tasks);

                  // ✅ award XP only when completion increases
                  if (newCompleted > prevCompleted) {
                    const gainedXP = (newCompleted - prevCompleted) * 5;

                    setAppData((prev) => {
                      const newXP = prev.gamification.xp + gainedXP;
                      const newLevel = Math.floor(newXP / 100) + 1;

                      return {
                        ...prev,
                        gamification: {
                          xp: newXP,
                          level: newLevel,
                        },
                      };
                    });
                  }
                }}
              />

              <ScreenTimeTracker
                data={currentLog.screenTime}
                onChange={(st) => updateDailyLog("screenTime", st)}
              />

              <div className="premium-card p-6 rounded-2xl fade-up">
                <h3 className="text-sm mb-3 text-anchor-muted">
                  Daily Journal
                </h3>

                <textarea
                  className="premium-input w-full p-3 rounded resize-none"
                  rows="4"
                  placeholder="How did you spend your day?"
                  value={currentLog.notes}
                  onChange={(e) => updateDailyLog("notes", e.target.value)}
                />
              </div>
            </div>
          )}

          {view === "vault" && (
            <Vault
              encryptedBlob={appData.vaultBlob}
              onSave={(blob) =>
                setAppData((prev) => ({ ...prev, vaultBlob: blob }))
              }
            />
          )}
        </main>
      </div>

      {/* ================= MOBILE SAVE BAR ================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-anchor-panel border-t border-anchor-border px-4 py-3">
        <div className="flex gap-3">
          {/* SAVE */}
          <button
            onClick={() => {
              AnchorFileSystem.exportDay(appData, todayStr);
              setSaveStatus("saved");
              setTimeout(() => setSaveStatus("idle"), 2000);
            }}
            className="flex-1 py-3 rounded-xl bg-anchor-accent text-black font-semibold text-sm"
          >
            💾 Save Today
          </button>

          {/* LOAD */}
          <label className="flex-1 py-3 rounded-xl border border-anchor-border text-center text-sm text-anchor-muted cursor-pointer hover:border-anchor-accent hover:text-white transition">
            📂 Load Day
            <input
              type="file"
              accept=".swa"
              className="hidden"
              onChange={(e) =>
                AnchorFileSystem.importDay(e.target.files[0], setAppData)
              }
            />
          </label>
        </div>
      </div>

      {/* SAVE TOAST */}
      {saveStatus === "saved" && (
        <div className="fixed bottom-6 right-6 z-50 fade-up">
          <div className="premium-card px-4 py-3 rounded-xl border border-anchor-success">
            <span className="text-anchor-success text-sm font-semibold">
              ✓ Day saved successfully
            </span>
          </div>
        </div>
      )}

      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
      {showCalendar && (
        <CalendarPicker
          logs={appData.logs}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </>
  );
}
