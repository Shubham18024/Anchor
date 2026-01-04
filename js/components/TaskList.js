window.TaskList = function TaskList({ tasks, onUpdate }) {
  const [newTask, setNewTask] = React.useState("");

  const addTask = (e) => {
    if (e.key === "Enter" && newTask.trim()) {
      onUpdate([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask("");
    }
  };

  return (
    <div className="premium-card p-6 rounded-2xl">
      <h3 className="text-sm mb-4 text-anchor-muted">Daily Tasks</h3>

      {tasks.map((task) => (
        <div key={task.id} className="flex gap-2 mb-2">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() =>
              onUpdate(
                tasks.map((t) =>
                  t.id === task.id ? { ...t, completed: !t.completed } : t
                )
              )
            }
          />
          <span
            className={`transition-all duration-200 ${
              task.completed ? "line-through text-anchor-muted opacity-60" : ""
            }`}
          >
            {task.text}
          </span>
        </div>
      ))}

      <input
        className="premium-input w-full p-2 mt-3"
        placeholder="Add task and press Enter"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        onKeyDown={addTask}
      />
    </div>
  );
};
