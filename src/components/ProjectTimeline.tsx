"use client";

import { useSearchParams } from "next/navigation";
import { Project } from "@/lib/markdown-utils";
import { ProjectCard } from "@/components/ProjectCard";
import { FilterBar } from "@/components/FilterBar";

type ProjectTimelineProps = {
  projects: Project[];
  technologies: string[];
};

export function ProjectTimeline({ projects, technologies }: ProjectTimelineProps) {
  const params = useSearchParams();
  const selectedTech = params.get("tech") ?? "";

  return (
    <section className="space-y-5">
      <FilterBar technologies={technologies} selectedTech={selectedTech} />

      <div className="relative space-y-4 pl-0 md:pl-7">
        <div className="pointer-events-none absolute bottom-0 left-2 top-0 hidden w-px bg-gradient-to-b from-neon-300/60 to-transparent md:block" />
        {projects.map((project) => {
          const hasTech = selectedTech
            ? project.technologies.some((tech) => tech.toLowerCase() === selectedTech.toLowerCase())
            : true;

          return <ProjectCard key={project.slug} project={project} dimmed={!hasTech} />;
        })}
      </div>
    </section>
  );
}
