const { useState, useEffect } = React;

function App() {
  // ---- DATE & TIME ----
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [currentTime, setCurrentTime] = useState(new Date());

  // ---- UI STATE ----
  const [showCalendar, setShowCalendar] = useState(false);
  const [view, setView] = useState("dashboard");
  const [showPrinciples, setShowPrinciples] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle");

  // idle | saved

  // ---- APP DATA ----
  const [appData, setAppData] = useState({
    version: "3.1",

    identity: "User",

    // NEW GOAL SYSTEM
    goals: {
      lifelong: "", // ⭐ North Star
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

  // ---- 9 PM REMINDER ----
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const checkReminder = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 21 && now.getMinutes() === 0) {
        alert("ANCHOR: Time to finalize your day.");
      }
    }, 60000);

    return () => clearInterval(checkReminder);
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
      <div className="flex h-screen bg-anchor-bg text-anchor-text">
        {/* Sidebar */}
        <aside className="w-64 border-r border-anchor-border p-4 bg-anchor-panel flex flex-col justify-between">
          <div>
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

          {/* ---------------- DAILY LOG ---------------- */}
          <div className="premium-card p-4 rounded-2xl fade-up">
            <h3 className="text-xs uppercase tracking-widest text-anchor-muted mb-3">
              Daily Log
            </h3>

            <button
              onClick={() => {
                AnchorFileSystem.exportDay(appData, todayStr);
                setSaveStatus("saved");

                setTimeout(() => {
                  setSaveStatus("idle");
                }, 2000);
              }}
              className="w-full mb-2 py-2 rounded-lg bg-anchor-accent text-black font-semibold hover:opacity-90"
            >
              Save Today
            </button>

            <label className="block w-full text-center py-2 rounded-lg border border-anchor-border text-sm text-anchor-muted cursor-pointer hover:border-anchor-accent hover:text-white transition">
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

            <p className="text-[11px] text-anchor-muted mt-3 leading-relaxed">
              Save your day before closing the app. Files stay on your computer.
            </p>

            <button
              onClick={() => setShowGuide(true)}
              className="mt-3 w-full text-xs text-anchor-muted hover:text-anchor-accent"
            >
              How saving works
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <header className="mb-8 fade-up">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-semibold">Good {greeting},</h2>

              {!editingName ? (
                <>
                  <span className="text-3xl font-semibold text-white">
                    {appData.identity}
                  </span>
                  <button
                    onClick={() => {
                      setTempName(appData.identity);
                      setEditingName(true);
                    }}
                    className="text-xs text-anchor-muted hover:text-anchor-accent"
                  >
                    ✏️
                  </button>
                </>
              ) : (
                <input
                  autoFocus
                  className="bg-transparent border-b border-anchor-accent outline-none text-3xl font-semibold text-white w-48"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={() => {
                    setAppData((prev) => ({
                      ...prev,
                      identity: tempName.trim() || "User",
                    }));
                    setEditingName(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setAppData((prev) => ({
                        ...prev,
                        identity: tempName.trim() || "User",
                      }));
                      setEditingName(false);
                    }
                    if (e.key === "Escape") {
                      setEditingName(false);
                    }
                  }}
                />
              )}
            </div>

            <p className="text-anchor-muted font-mono text-sm mt-1 flex items-center gap-3">
              <span>
                {selectedDate} · {currentTime.toLocaleTimeString()}
              </span>
              <button
                onClick={() => setShowCalendar(true)}
                className="text-xs text-anchor-accent hover:underline"
              >
                Open Calendar 🗓️
              </button>
            </p>

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
              {/* ⭐ Lifelong Goal (North Star) */}
              <LifelongGoal
                value={appData.goals.lifelong}
                onChange={(val) =>
                  setAppData((prev) => ({
                    ...prev,
                    goals: {
                      ...prev.goals,
                      lifelong: val,
                    },
                  }))
                }
              />

              {/* 📅 Monthly Goal */}
              <div className="premium-card p-6 rounded-2xl fade-soft">
                <h3 className="text-sm mb-2 text-anchor-muted">Monthly Goal</h3>

                <p className="text-xs text-anchor-muted mb-3">
                  This resets automatically at month end.
                </p>

                <textarea
                  className="premium-input w-full p-3 text-sm rounded"
                  rows={2}
                  placeholder="What matters most this month?"
                  value={appData.goals.monthly.value}
                  onChange={(e) =>
                    setAppData((prev) => ({
                      ...prev,
                      goals: {
                        ...prev.goals,
                        monthly: {
                          ...prev.goals.monthly,
                          value: e.target.value,
                        },
                      },
                    }))
                  }
                />
              </div>

              {/* 🗓 Weekly Goal */}
              <div className="premium-card p-6 rounded-2xl fade-soft">
                <h3 className="text-sm mb-2 text-anchor-muted">Weekly Goal</h3>

                <p className="text-xs text-anchor-muted mb-3">
                  This resets every week.
                </p>

                <input
                  className="premium-input w-full p-3 text-sm rounded"
                  placeholder="What is the focus this week?"
                  value={appData.goals.weekly.value}
                  onChange={(e) =>
                    setAppData((prev) => ({
                      ...prev,
                      goals: {
                        ...prev.goals,
                        weekly: {
                          ...prev.goals.weekly,
                          value: e.target.value,
                        },
                      },
                    }))
                  }
                />
              </div>

              {/* Daily Intent */}
              <div className="premium-card p-6 rounded-2xl fade-up">
                <h3 className="text-sm mb-2 text-anchor-muted">Daily Intent</h3>

                <input
                  className="premium-input w-full p-3 rounded text-lg"
                  placeholder="If today goes well, what ONE thing must happen?"
                  value={currentLog.intent}
                  onChange={(e) => updateDailyLog("intent", e.target.value)}
                />

                <p className="text-xs text-anchor-muted mt-2">
                  Keep this short. One clear outcome.
                </p>
              </div>

              {/* Daily Tasks (linked to Weekly Goal) */}
              <div className="premium-card p-6 rounded-2xl fade-up">
                <h3 className="text-sm mb-4 text-anchor-muted">
                  Daily Tasks (This Week)
                </h3>
                <ConsistencyHeatmap logs={appData.logs} />

                <TaskList
                  tasks={currentLog.tasks}
                  onUpdate={(tasks) => {
                    // count completed tasks BEFORE update
                    const prevCompleted = currentLog.tasks.filter(
                      (t) => t.completed
                    ).length;
                    const newCompleted = tasks.filter(
                      (t) => t.completed
                    ).length;

                    // update tasks normally
                    updateDailyLog("tasks", tasks);

                    // award XP only when completion increases
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
              </div>

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
                  placeholder="How did you spend your day? What did you learn?"
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
      {/* Save Feedback Toast */}
      {saveStatus === "saved" && (
        <div className="fixed bottom-6 right-6 z-50 fade-up">
          <div className="premium-card px-4 py-3 rounded-xl flex items-center gap-2 border border-anchor-success">
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
