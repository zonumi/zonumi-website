import { ProjectFinder } from "@/components/desktop/ProjectFinder";
import type { Project } from "@/lib/markdown-utils";

type ProjectsWindowContentProps = {
  projects: Project[];
  selectedProject?: Project;
  selectedSlug: string;
  isMobileLayout: boolean;
  onSelectSlug: (slug: string) => void;
};

export function ProjectsWindowContent({ projects, selectedProject, selectedSlug, isMobileLayout, onSelectSlug }: ProjectsWindowContentProps) {
  return (
    <div className={`desktop-window-content ${isMobileLayout ? "" : "h-[320px] overflow-hidden xl:h-[460px]"}`}>
      <ProjectFinder
        projects={projects}
        selectedProject={selectedProject}
        selectedSlug={selectedSlug}
        onSelectSlug={onSelectSlug}
        constrainedHeight={!isMobileLayout}
        flattened={isMobileLayout}
      />
    </div>
  );
}
