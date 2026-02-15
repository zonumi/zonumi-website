"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type FilterBarProps = {
  technologies: string[];
  selectedTech?: string;
};

export function FilterBar({ technologies, selectedTech = "" }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState("");

  const updateFilter = (tech: string) => {
    const nextParams = new URLSearchParams(params.toString());
    if (!tech) {
      nextParams.delete("tech");
    } else {
      nextParams.set("tech", tech.toLowerCase());
    }

    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const isActive = (tech: string) => tech.toLowerCase() === selectedTech.toLowerCase();
  const filteredTechnologies = useMemo(() => {
    const filtered = technologies.filter((tech) => tech.toLowerCase().includes(query.trim().toLowerCase()));
    if (showAll || filtered.length <= 18) {
      return filtered;
    }
    return filtered.slice(0, 18);
  }, [technologies, query, showAll]);

  return (
    <div
      className="no-print relative z-10 rounded-xl border border-ink-300/25 bg-ink-900/75 p-3 shadow-card backdrop-blur-sm"
      data-testid="filter-bar"
    >
      <div className="mb-2 flex items-center justify-between gap-4">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-neon-400">Core Competencies</h2>
        <button
          type="button"
          onClick={() => updateFilter("")}
          className="rounded-md border border-transparent px-2 py-1 font-mono text-xs uppercase tracking-[0.16em] text-ink-100 transition hover:border-neon-300/40 hover:text-neon-400"
          data-testid="filter-reset"
        >
          reset
        </button>
      </div>
      <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="search technology..."
          className="w-full rounded-md border border-ink-300/35 bg-ink-800/70 px-3 py-2 font-mono text-xs text-ink-50 placeholder:text-ink-100/70 focus:border-neon-300 focus:outline-none md:max-w-xs"
        />
        <button
          type="button"
          onClick={() => setShowAll((current) => !current)}
          className="self-start rounded-md border border-ink-300/35 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-100 transition hover:border-neon-300 hover:text-neon-300"
        >
          {showAll ? "show top" : "show all"}
        </button>
      </div>
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
        {filteredTechnologies.map((tech) => (
          <button
            key={tech}
            type="button"
            onClick={() => updateFilter(isActive(tech) ? "" : tech)}
            className={`whitespace-nowrap rounded-md border px-3 py-1.5 font-mono text-xs uppercase tracking-[0.08em] transition ${
              isActive(tech)
                ? "border-neon-300 bg-neon-400/20 text-neon-300"
                : "border-ink-300/40 bg-ink-800/70 text-ink-50 hover:border-neon-300 hover:text-neon-300"
            }`}
            aria-pressed={isActive(tech)}
            data-testid={`filter-tech-${tech.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
          >
            {tech}
          </button>
        ))}
      </div>
      {!showAll && technologies.length > 18 ? (
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-100">
          showing {Math.min(filteredTechnologies.length, 18)} of {technologies.length}
        </p>
      ) : null}
    </div>
  );
}
