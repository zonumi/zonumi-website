import { MacDesktop } from "@/components/MacDesktop";
import { getAllEngagements, getProfile } from "@/lib/markdown-utils";

export const dynamic = "force-static";

export default function HomePage() {
  const profile = getProfile();
  const engagements = getAllEngagements();

  return <MacDesktop profile={profile} engagements={engagements} />;
}
