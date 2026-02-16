type AboutModalProps = {
  isOpen: boolean;
  appVersion: string;
  onClose: () => void;
};

export function AboutModal({ isOpen, appVersion, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-gradient-to-br from-white/75 via-slate-100/80 to-zinc-200/75"
      role="dialog"
      aria-modal="true"
      aria-label="About"
      data-testid="about-modal"
    >
      <section className="w-[min(520px,92vw)] border-2 border-black bg-[#ececec] shadow-[6px_6px_0_#000]">
        <div className="desktop-titlebar">
          <button type="button" className="desktop-close-box" aria-label="Close About" onClick={onClose} />
          <h2>About</h2>
        </div>
        <div className="desktop-window-content space-y-2">
          <p className="text-sm">version {appVersion}</p>
          <p className="text-sm">Built with Codex GPT 5.3.</p>
        </div>
      </section>
    </div>
  );
}
