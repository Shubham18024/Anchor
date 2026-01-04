window.Vault = function Vault({ encryptedBlob, onSave }) {
  const [password, setPassword] = React.useState("");
  const [unlocked, setUnlocked] = React.useState(false);
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState("");
  const [activeHabitId, setActiveHabitId] = React.useState(null);

  const todayStr = new Date().toISOString().split("T")[0];
  const MS_IN_DAY = 86400000;

  // ------------------ CRYPTO ------------------
  const encrypt = async (text, pwd) => {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(pwd),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    const derived = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: enc.encode("anchor-vault"),
        iterations: 100000,
        hash: "SHA-256",
      },
      key,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      derived,
      enc.encode(text)
    );
    return btoa(
      JSON.stringify({
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encrypted)),
      })
    );
  };

  const decrypt = async (blob, pwd) => {
    const parsed = JSON.parse(atob(blob));
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(pwd),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    const derived = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: enc.encode("anchor-vault"),
        iterations: 100000,
        hash: "SHA-256",
      },
      key,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(parsed.iv) },
      derived,
      new Uint8Array(parsed.data)
    );
    return new TextDecoder().decode(decrypted);
  };

  // ------------------ UNLOCK ------------------
  const unlock = async () => {
    try {
      if (!encryptedBlob) {
        const initial = {
          passwordSetAt: todayStr,
          habits: [],
        };
        const blob = await encrypt(JSON.stringify(initial), password);
        onSave(blob);
        setData(initial);
        setUnlocked(true);
      } else {
        const json = await decrypt(encryptedBlob, password);
        setData(JSON.parse(json));
        setUnlocked(true);
      }
      setError("");
    } catch {
      setError("Wrong password. There is no recovery.");
    }
  };

  const saveVault = async (newData) => {
    const blob = await encrypt(JSON.stringify(newData), password);
    onSave(blob);
    setData(newData);
  };

  // ------------------ LOCK SCREEN ------------------
  if (!unlocked) {
    return (
      <div className="max-w-md mx-auto premium-card p-6 rounded-2xl fade-up">
        <h3 className="text-xl font-semibold mb-2 text-center">
          Private Vault
        </h3>

        {/* WARNING NOTE */}
        <div className="border border-anchor-danger/60 bg-anchor-danger/10 p-3 rounded mb-4 text-xs text-anchor-danger leading-relaxed">
          <strong>Warning:</strong><br />
          This vault is encrypted and stored only inside your <code>.swa</code> file.
          <br />
          • There is <strong>no password recovery</strong>.<br />
          • Forgetting the password means permanent data loss.<br />
          • Password can be changed only after <strong>7 days</strong>.<br />
          • Always save your day properly.
        </div>

        <input
          type="password"
          className="premium-input w-full p-3 rounded mb-3 text-center"
          placeholder="Enter Vault Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-anchor-danger text-xs mb-2 text-center">
            {error}
          </p>
        )}

        <button
          onClick={unlock}
          disabled={!password}
          className="w-full bg-white text-black py-2 rounded font-medium hover:opacity-90 disabled:opacity-40"
        >
          Unlock Vault
        </button>
      </div>
    );
  }

  const activeHabit = data.habits.find((h) => h.id === activeHabitId);

  const daysSincePasswordSet =
    (Date.now() - new Date(data.passwordSetAt).getTime()) / MS_IN_DAY;

  const canChangePassword = daysSincePasswordSet >= 7;

  // ------------------ ACTIONS ------------------
  const markClean = () => {
    if (!activeHabit || activeHabit.history[todayStr]) return;

    const updatedHabits = data.habits.map((h) =>
      h.id === activeHabit.id
        ? {
            ...h,
            streak: h.streak + 1,
            lastActionDate: todayStr,
            history: { ...h.history, [todayStr]: true },
          }
        : h
    );

    saveVault({ ...data, habits: updatedHabits });
  };

  const markRelapse = () => {
    if (!activeHabit) return;

    const updatedHabits = data.habits.map((h) =>
      h.id === activeHabit.id
        ? {
            ...h,
            streak: 0,
            lastActionDate: todayStr,
            history: { ...h.history, [todayStr]: false },
          }
        : h
    );

    saveVault({ ...data, habits: updatedHabits });
  };

  // ------------------ CALENDAR ------------------
  const renderCalendar = (habit) => {
    const days = Object.keys(habit.history).sort();
    if (days.length === 0)
      return (
        <p className="text-xs text-anchor-muted mt-3">
          No records yet.
        </p>
      );

    return (
      <div className="grid grid-cols-7 gap-2 mt-4">
        {days.map((d) => (
          <div
            key={d}
            title={d}
            className={`aspect-square rounded-md transition-all duration-300 ${
              habit.history[d]
                ? "bg-anchor-success"
                : "bg-anchor-danger"
            }`}
          />
        ))}
      </div>
    );
  };

  // ------------------ UI ------------------
  return (
    <div className="max-w-xl mx-auto space-y-6 fade-up">
      {/* MOTIVATION */}
      <div className="premium-card p-6 rounded-2xl text-center">
        <p className="text-sm italic text-anchor-muted">
          “Discipline is choosing what you want most over what you want now.”
        </p>
      </div>

      {/* PASSWORD CHANGE */}
      <div className="premium-card p-4 rounded-xl text-xs text-anchor-muted">
        Password change:
        {canChangePassword ? (
          <span className="text-anchor-success"> allowed</span>
        ) : (
          <span className="text-anchor-warning">
            {" "}
            locked for {Math.ceil(7 - daysSincePasswordSet)} days
          </span>
        )}
      </div>

      {/* HABIT LIST */}
      <div className="premium-card p-6 rounded-2xl">
        <h3 className="text-sm mb-4 text-anchor-muted">Tracked Habits</h3>

        <div className="space-y-2">
          {data.habits.map((h) => (
            <button
              key={h.id}
              onClick={() => setActiveHabitId(h.id)}
              className={`w-full text-left p-3 rounded border transition ${
                activeHabitId === h.id
                  ? "border-anchor-accent bg-anchor-accent/10"
                  : "border-anchor-border hover:border-anchor-accent/50"
              }`}
            >
              <div className="flex justify-between">
                <span className="text-white">{h.name}</span>
                <span className="text-anchor-muted text-xs">
                  {h.streak} days
                </span>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            const name = prompt("Enter habit name:");
            if (!name) return;
            saveVault({
              ...data,
              habits: [
                ...data.habits,
                {
                  id: Date.now().toString(),
                  name,
                  streak: 0,
                  lastActionDate: null,
                  history: {},
                },
              ],
            });
          }}
          className="mt-4 w-full py-2 rounded border border-anchor-accent text-anchor-accent hover:bg-anchor-accent/10"
        >
          + Add Habit
        </button>
      </div>

      {/* ACTIVE HABIT */}
      {activeHabit && (
        <div className="premium-card p-6 rounded-2xl text-center">
          <h3 className="text-lg font-semibold">{activeHabit.name}</h3>
          <p className="text-5xl font-bold mt-2">{activeHabit.streak}</p>
          <p className="text-xs text-anchor-muted mb-4">day streak</p>

          <div className="grid grid-cols-2 gap-4 mb-2">
            <button
              onClick={markClean}
              disabled={activeHabit.history[todayStr]}
              className="p-4 rounded-xl border border-anchor-success text-anchor-success hover:bg-anchor-success/10 disabled:opacity-40"
            >
              Clean Day
            </button>

            <button
              onClick={markRelapse}
              className="p-4 rounded-xl border border-anchor-danger text-anchor-danger hover:bg-anchor-danger/10"
            >
              Relapse
            </button>
          </div>

          {activeHabit.history[todayStr] && (
            <p className="text-xs text-anchor-muted">
              Today already recorded.
            </p>
          )}

          {renderCalendar(activeHabit)}
        </div>
      )}
    </div>
  );
};
