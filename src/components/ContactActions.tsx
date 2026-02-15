"use client";

import { useState } from "react";

type ContactActionsProps = {
  email: string;
  linkedinUrl: string;
};

export function ContactActions({ email, linkedinUrl }: ContactActionsProps) {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <div className="no-print flex flex-wrap items-center gap-3 text-sm text-ink-100">
      <button
        type="button"
        onClick={copyEmail}
        className="rounded-md border border-ink-300/40 bg-ink-800/65 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.12em] transition hover:-translate-y-0.5 hover:border-neon-300 hover:text-neon-300"
      >
        {copied ? "email copied" : "copy email"}
      </button>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noreferrer"
        className="rounded-md border border-ink-300/40 bg-ink-800/65 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.12em] transition hover:-translate-y-0.5 hover:border-neon-300 hover:text-neon-300"
      >
        linkedin
      </a>
    </div>
  );
}
