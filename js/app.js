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

  // ---- NEW UI STATES ----
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");

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

  // ---- HELPERS (Refactored to remove duplicates) ----
  const handleSave = () => {
    AnchorFileSystem.exportDay(appData, todayStr);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  const handleLoad = (e) => {
    if (e.target.files && e.target.files[0]) {
      AnchorFileSystem.importDay(e.target.files[0], setAppData);
    }
  };

  const addNewTask = () => {
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now(),
      text: newTaskText,
      completed: false,
    };
    // Add to existing tasks
    const updatedTasks = [...(currentLog.tasks || []), newTask];
    updateDailyLog("tasks", updatedTasks);
    
    // Reset UI
    setNewTaskText("");
    setShowAddTaskModal(false);
  };

  // ---- GREETING ----
  const hour = currentTime.getHours();
  const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";

  return (
    <>
      {/* ================= MOBILE TOP BAR (UPDATED) ================= */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-anchor-panel border-b border-anchor-border px-4 py-3 grid grid-cols-3 items-center">
        {/* Left: Menu */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="text-white text-2xl justify-self-start"
        >
          ☰
        </button>

        {/* Center: Title (Perfectly Centered & Bigger) */}
        <h1 className="text-xl font-bold text-anchor-accent tracking-wider justify-self-center">
          ANCHOR
        </h1>

        {/* Right: Add Task (+) Icon */}
        <button
          onClick={() => setShowAddTaskModal(true)}
          className="text-anchor-accent text-3xl font-light justify-self-end"
        >
          +
        </button>
      </header>

      {/* ================= MOBILE ADD TASK MODAL (NEW) ================= */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-anchor-panel w-full max-w-sm p-6 rounded-2xl border border-anchor-border fade-up shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Add Daily Task</h3>
            <input
              autoFocus
              className="premium-input w-full p-3 rounded-lg mb-4 bg-anchor-bg border border-anchor-border text-white focus:border-anchor-accent outline-none"
              placeholder="What needs to be done?"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNewTask()}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-anchor-muted text-sm px-4 py-2 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={addNewTask}
                className="bg-anchor-accent text-black font-bold px-5 py-2 rounded-lg text-sm hover:bg-white transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MOBILE SIDEBAR OVERLAY ================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          <aside className="relative w-64 bg-anchor-panel border-r border-anchor-border p-4 flex flex-col justify-between slide-in-left">
            <div>
              <h1 className="text-2xl font-bold mb-8 text-anchor-accent tracking-wider">
                ANCHOR
              </h1>

              <nav className="space-y-2">
                <button
                  onClick={() => {
                    setView("dashboard");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-3 rounded-lg text-white bg-anchor-surface font-medium"
                >
                  Dashboard
                </button>

                <button
                  onClick={() => {
                    setView("vault");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-3 rounded-lg text-anchor-muted hover:text-white hover:bg-anchor-surface/50 transition"
                >
                  Vault
                </button>
              </nav>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="mt-6 text-sm text-anchor-muted hover:text-white"
            >
              Close Menu
            </button>
          </aside>
        </div>
      )}

      {/* ================= DESKTOP LAYOUT ================= */}
      <div className="flex h-screen bg-anchor-bg text-anchor-text pt-14 md:pt-0">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex w-64 border-r border-anchor-border p-6 bg-anchor-panel flex-col overflow-y-auto">
          <div className="mb-10">
            {/* Desktop Title - Made Bigger & Bolder */}
            <h1 className="text-3xl font-bold mb-8 text-anchor-accent tracking-widest">
              ANCHOR
            </h1>

            <nav className="space-y-2">
              <button
                onClick={() => setView("dashboard")}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  view === "dashboard"
                    ? "bg-anchor-surface text-white font-medium"
                    : "text-anchor-muted hover:text-white hover:bg-anchor-surface/50"
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => setView("vault")}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  view === "vault"
                    ? "bg-anchor-surface text-white font-medium"
                    : "text-anchor-muted hover:text-white hover:bg-anchor-surface/50"
                }`}
              >
                Vault
              </button>
            </nav>
          </div>

          {/* DAILY LOG */}
          <div className="premium-card p-4 rounded-2xl fade-up mt-auto">
            <h3 className="text-xs uppercase tracking-widest text-anchor-muted mb-3">
              Data Management
            </h3>

            <button
              onClick={handleSave}
              className="w-full mb-3 py-2.5 rounded-lg bg-anchor-accent text-black font-bold hover:bg-white transition"
            >
              Save Today
            </button>

            <label className="block w-full text-center py-2.5 rounded-lg border border-anchor-border text-sm text-anchor-muted cursor-pointer hover:border-anchor-accent hover:text-white transition">
              Load Saved Day
              <input
                type="file"
                accept=".swa"
                className="hidden"
                onChange={handleLoad}
              />
            </label>
          </div>
        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1 px-4 md:px-8 py-6 pb-24 overflow-y-auto scrollbar-hide">
          <header className="mb-8 fade-up">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-medium text-anchor-muted">
                Good {greeting},
              </h2>

              {!editingName ? (
                <>
                  <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    {appData.identity}
                  </span>
                  <button
                    onClick={() => {
                      setTempName(appData.identity);
                      setEditingName(true);
                    }}
                    className="text-sm text-anchor-muted hover:text-anchor-accent transition"
                  >
                    ✏️
                  </button>
                </>
              ) : (
                <input
                  autoFocus
                  className="bg-transparent border-b-2 border-anchor-accent outline-none text-2xl md:text-3xl font-bold text-white w-48"
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
                  }}
                />
              )}
            </div>

            <div className="flex items-center gap-4 mt-2">
                <p className="text-anchor-muted font-mono text-sm">
                {selectedDate} · {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>

                <button
                onClick={() => setShowCalendar(true)}
                className="text-lg text-anchor-accent hover:scale-110 transition-transform"
                aria-label="Open calendar"
                >
                🗓️
                </button>
            </div>

            {/* XP Progress */}
            <div className="mt-4 max-w-md glow-accent p-1 rounded-full">
              <div className="flex justify-between text-xs text-anchor-muted mb-1 px-1">
                <span className="font-bold">LVL {appData.gamification.level}</span>
                <span>{appData.gamification.xp} XP</span>
              </div>

              <div className="h-2 rounded-full bg-anchor-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(56,189,248,0.5)]"
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
            <div className="space-y-6 max-w-4xl">
              <LifelongGoal
                value={appData.goals.lifelong}
                onChange={(val) =>
                  setAppData((prev) => ({
                    ...prev,
                    goals: { ...prev.goals, lifelong: val },
                  }))
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 📅 Monthly Goal */}
                <div className="premium-card p-6 rounded-2xl fade-soft">
                    <h3 className="text-sm mb-2 text-anchor-muted font-semibold uppercase tracking-wide">Monthly Focus</h3>
                    <textarea
                    className="premium-input w-full p-3 text-sm rounded-lg h-24 resize-none"
                    placeholder="What matters most this month?"
                    value={appData.goals.monthly}
                    onChange={(e) =>
                        setAppData((prev) => ({
                        ...prev,
                        goals: {
                            ...prev.goals,
                            monthly: e.target.value,
                        },
                        }))
                    }
                    />
                </div>

                {/* 🗓 Weekly Goal */}
                <div className="premium-card p-6 rounded-2xl fade-soft">
                    <h3 className="text-sm mb-2 text-anchor-muted font-semibold uppercase tracking-wide">Weekly Focus</h3>
                    <textarea
                    className="premium-input w-full p-3 text-sm rounded-lg h-24 resize-none"
                    placeholder="What is the focus this week?"
                    value={appData.goals.weekly}
                    onChange={(e) =>
                        setAppData((prev) => ({
                        ...prev,
                        goals: {
                            ...prev.goals,
                            weekly: e.target.value,
                        },
                        }))
                    }
                    />
                </div>
              </div>

              {/* 🌅 Daily Intent */}
              <div className="premium-card p-6 rounded-2xl fade-up border-l-4 border-anchor-accent">
                <h3 className="text-sm mb-2 text-anchor-muted font-bold uppercase">Daily Intent</h3>
                <input
                  className="premium-input w-full p-3 rounded-lg text-lg font-medium"
                  placeholder="If today goes well, what ONE thing must happen?"
                  value={currentLog.intent}
                  onChange={(e) => updateDailyLog("intent", e.target.value)}
                />
              </div>

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
                <h3 className="text-sm mb-3 text-anchor-muted font-bold uppercase">
                  Daily Journal
                </h3>

                <textarea
                  className="premium-input w-full p-4 rounded-xl resize-none text-base leading-relaxed"
                  rows="6"
                  placeholder="Reflect on your day..."
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
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-anchor-accent text-black font-bold text-sm shadow-lg hover:bg-white transition"
          >
            💾 Save Today
          </button>

          {/* LOAD */}
          <label className="flex-1 py-3 rounded-xl border border-anchor-border text-center text-sm text-anchor-muted cursor-pointer hover:border-anchor-accent hover:text-white transition bg-anchor-surface">
            📂 Load Day
            <input
              type="file"
              accept=".swa"
              className="hidden"
              onChange={handleLoad}
            />
          </label>
        </div>
      </div>

      {/* SAVE TOAST */}
      {saveStatus === "saved" && (
        <div className="fixed bottom-20 right-6 z-50 fade-up">
          <div className="bg-anchor-surface px-6 py-3 rounded-xl border border-anchor-success shadow-xl flex items-center gap-2">
            <span className="text-anchor-success text-lg">✓</span>
            <span className="text-white text-sm font-semibold">
              Day saved successfully
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