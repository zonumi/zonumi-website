"use client";

import Markdown from "react-markdown";
import { DesktopVerticalScroll } from "@/components/desktop/DesktopVerticalScroll";
import type { Project } from "@/lib/markdown-utils";

type ProjectFinderProps = {
  projects: Project[];
  selectedSlug: string;
  selectedProject?: Project;
  onSelectSlug: (slug: string) => void;
  constrainedHeight?: boolean;
  flattened?: boolean;
};

export function ProjectFinder({
  projects,
  selectedSlug,
  selectedProject,
  onSelectSlug,
  constrainedHeight = false,
  flattened = false
}: ProjectFinderProps) {
  void selectedSlug;
  if (flattened) {
    return (
      <div className="space-y-3">
        {projects.map((project) => (
          <article key={project.slug} className="space-y-3 border-2 border-black bg-[#f7f7f7] p-3">
            <div>
              <h3 className="text-base">{project.client}</h3>
              <p className="text-xs">{project.role}</p>
              <p className="text-xs">{project.period}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {project.technologies.map((tech) => (
                <span key={`${project.slug}-${tech}`} className="border border-black bg-white px-2 py-0.5 text-[11px]">
                  {tech}
                </span>
              ))}
            </div>

            <div className="prose prose-sm max-w-none prose-p:my-2 prose-li:my-0.5">
              <Markdown>{project.content}</Markdown>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid min-h-0 gap-3 lg:grid-cols-[220px_1fr] ${constrainedHeight ? "h-full" : ""}`}>
      <DesktopVerticalScroll className={`min-h-0 border-2 border-black bg-[#f7f7f7] ${constrainedHeight ? "h-full" : "max-h-[380px]"}`} contentClassName="p-1">
        {projects.map((project) => (
          <button
            key={project.slug}
            type="button"
            onClick={() => onSelectSlug(project.slug)}
            className={`block w-full border border-transparent px-2 py-1 text-left text-xs ${
              selectedProject?.slug === project.slug ? "bg-black text-white" : "hover:border-black"
            }`}
            data-testid={`project-selector-${project.slug}`}
          >
            <span className="block font-semibold">{project.client}</span>
            <span className="block text-[11px]">{project.period}</span>
          </button>
        ))}
      </DesktopVerticalScroll>

      <DesktopVerticalScroll className={`min-h-0 border-2 border-black bg-[#f7f7f7] ${constrainedHeight ? "h-full" : "max-h-[380px]"}`} contentClassName="space-y-3 p-3">
        {selectedProject ? (
          <>
            <div>
              <h3 className="text-base">{selectedProject.client}</h3>
              <p className="text-xs">{selectedProject.role}</p>
              <p className="text-xs">{selectedProject.period}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {selectedProject.technologies.map((tech) => (
                <span key={tech} className="border border-black bg-white px-2 py-0.5 text-[11px]">
                  {tech}
                </span>
              ))}
            </div>

            <div className="prose prose-sm max-w-none prose-p:my-2 prose-li:my-0.5">
              <Markdown>{selectedProject.content}</Markdown>
            </div>
          </>
        ) : (
          <p className="text-sm">No projects available.</p>
        )}
      </DesktopVerticalScroll>
    </div>
  );
}
