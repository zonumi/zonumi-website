"use client";

import { useSearchParams } from "next/navigation";
import { Engagement } from "@/lib/markdown-utils";
import { EngagementCard } from "@/components/EngagementCard";
import { FilterBar } from "@/components/FilterBar";

type EngagementTimelineProps = {
  engagements: Engagement[];
  technologies: string[];
};

export function EngagementTimeline({ engagements, technologies }: EngagementTimelineProps) {
  const params = useSearchParams();
  const selectedTech = params.get("tech") ?? "";

  return (
    <section className="space-y-5">
      <FilterBar technologies={technologies} selectedTech={selectedTech} />

      <div className="relative space-y-4 pl-0 md:pl-7">
        <div className="pointer-events-none absolute bottom-0 left-2 top-0 hidden w-px bg-gradient-to-b from-neon-300/60 to-transparent md:block" />
        {engagements.map((engagement) => {
          const hasTech = selectedTech
            ? engagement.technologies.some((tech) => tech.toLowerCase() === selectedTech.toLowerCase())
            : true;

          return <EngagementCard key={engagement.slug} engagement={engagement} dimmed={!hasTech} />;
        })}
      </div>
    </section>
  );
}
