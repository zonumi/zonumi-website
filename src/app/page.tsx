import { DesktopWorkspace } from "@/components/DesktopWorkspace";
import { getAllProjects, getProfile, getSkills } from "@/lib/markdown-utils";

export const dynamic = "force-static";

export default function HomePage() {
  const profile = getProfile();
  const projects = getAllProjects();
  const skills = getSkills();

  return <DesktopWorkspace profile={profile} projects={projects} skills={skills.skills} />;
}
