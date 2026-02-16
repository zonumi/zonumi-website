import { DesktopWorkspace } from "@/components/DesktopWorkspace";
import { getAllProjects, getEducation, getProfile, getSkills } from "@/lib/markdown-utils";

export const dynamic = "force-static";

export default function HomePage() {
  const profile = getProfile();
  const education = getEducation();
  const projects = getAllProjects();
  const skills = getSkills();

  return <DesktopWorkspace profile={profile} education={education} projects={projects} skills={skills.skills} />;
}
