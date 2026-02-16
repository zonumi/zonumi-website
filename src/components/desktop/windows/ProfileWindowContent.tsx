import Markdown from "react-markdown";
import type { Profile } from "@/lib/markdown-utils";

type ProfileWindowContentProps = {
  profile: Profile;
};

export function ProfileWindowContent({ profile }: ProfileWindowContentProps) {
  return (
    <div className="desktop-window-content space-y-4">
      <div>
        <h2 className="mt-1 text-lg">{profile.name}</h2>
      </div>
      <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-li:my-0.5 prose-ul:my-2">
        <Markdown>{profile.content}</Markdown>
      </div>
    </div>
  );
}
