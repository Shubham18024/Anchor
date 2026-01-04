window.SaveReminder = function SaveReminder() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const checkTimeAndRemind = () => {
      const now = new Date();

      const hour = now.getHours();
      const minute = now.getMinutes();

      // After 9:00 PM
      if (hour >= 21) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    // Initial check
    checkTimeAndRemind();

    // Repeat every 10 minutes
    const interval = setInterval(checkTimeAndRemind, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 fade-up">
      <div className="premium-card p-4 rounded-xl max-w-xs border border-anchor-warning/50 bg-anchor-warning/10">
        <h4 className="text-sm font-semibold text-anchor-warning mb-1">
          ⏰ Don’t forget to save
        </h4>

        <p className="text-xs text-anchor-muted leading-relaxed">
          Save today’s <code>.swa</code> file now.
          <br />
          Tomorrow, load it first, then save a new file for the day.
        </p>

        <div className="mt-2 text-right">
          <button
            onClick={() => setVisible(false)}
            className="text-xs text-anchor-muted hover:text-white"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
