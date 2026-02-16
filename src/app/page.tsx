import { DesktopWorkspace } from "@/components/DesktopWorkspace";
import { getAllProjects, getEducation, getExperience, getProfile } from "@/lib/markdown-utils";

export const dynamic = "force-static";

export default function HomePage() {
  const profile = getProfile();
  const education = getEducation();
  const projects = getAllProjects();
  const experience = getExperience();

  return <DesktopWorkspace profile={profile} education={education} projects={projects} experience={experience.experience} />;
}
