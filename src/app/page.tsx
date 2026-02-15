import { DesktopWorkspace } from "@/components/DesktopWorkspace";
import { getAllProjects, getProfile } from "@/lib/markdown-utils";

export const dynamic = "force-static";

export default function HomePage() {
  const profile = getProfile();
  const projects = getAllProjects();

  return <DesktopWorkspace profile={profile} projects={projects} />;
}
