"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print rounded-md border border-neon-300/50 bg-neon-400/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-neon-300 transition hover:-translate-y-0.5 hover:bg-neon-400/20"
    >
      Download Business Profile
    </button>
  );
}
