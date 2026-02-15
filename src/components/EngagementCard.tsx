import Image from "next/image";
import Markdown from "react-markdown";
import { Engagement } from "@/lib/markdown-utils";

type EngagementCardProps = {
  engagement: Engagement;
  dimmed: boolean;
};

export function EngagementCard({ engagement, dimmed }: EngagementCardProps) {
  return (
    <article
      className={`print-card group relative rounded-xl border border-ink-300/25 bg-ink-900/72 p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:border-neon-300/45 hover:shadow-glow ${
        dimmed ? "opacity-30" : "opacity-100"
      }`}
      data-testid={`engagement-card-${engagement.slug}`}
      data-dimmed={dimmed ? "true" : "false"}
    >
      <div className="absolute -left-[31px] top-8 hidden h-3 w-3 rounded-full border border-neon-300/70 bg-ink-800 md:block" />

      <header className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          {engagement.logo ? (
            <div className="flex h-10 w-28 items-center justify-center rounded-md border border-ink-300/30 bg-ink-800/80 p-1 print:border-black print:bg-transparent">
              <Image
                src={engagement.logo}
                alt={`${engagement.client} logo`}
                width={104}
                height={30}
                className="h-7 w-auto object-contain"
              />
            </div>
          ) : null}

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-neon-400">{engagement.client}</p>
            <h3 className="text-xl font-semibold text-ink-25">{engagement.role}</h3>
          </div>
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-100">{engagement.period}</p>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        {engagement.technologies.map((tech) => (
          <span
            key={`${engagement.slug}-${tech}`}
            className="rounded-md border border-ink-300/35 bg-ink-800/80 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-50"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="prose prose-invert prose-sm max-w-none prose-p:text-ink-50 prose-li:text-ink-50 prose-strong:text-ink-25">
        <Markdown>{engagement.content}</Markdown>
      </div>
    </article>
  );
}
