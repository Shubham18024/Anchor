window.GuideModal = function GuideModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm fade-up">
      <div className="premium-card max-w-md w-full p-6 rounded-2xl text-center space-y-4">
        <h2 className="text-2xl font-semibold tracking-wide">
          Welcome to <span className="text-anchor-accent">ANCHOR</span>
        </h2>

        <p className="text-sm text-anchor-muted leading-relaxed">
          ANCHOR is a <strong>local-first discipline system</strong>.
          <br />
          Your data never leaves your computer.
        </p>

        <p className="text-sm text-anchor-muted leading-relaxed">
          This app rewards <strong>honesty</strong>, not perfection.
        </p>

        <div className="border border-anchor-danger/50 bg-anchor-danger/10 rounded-lg p-3 text-xs text-anchor-danger">
          Vault habits are password-protected.
          <br />
          If you forget the password, the data is permanently lost.
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <button
            onClick={() => window.open("guide.html", "_blank")}
            className="w-full py-2 rounded-lg bg-anchor-accent text-black font-medium hover:opacity-90"
          >
            How to use ANCHOR
          </button>

          <button
            onClick={onClose}
            className="text-xs text-anchor-muted hover:text-white"
          >
            Enter ANCHOR
          </button>
        </div>
      </div>
    </div>
  );
};
