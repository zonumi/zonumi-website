import { DesktopVerticalScroll } from "@/components/desktop/DesktopVerticalScroll";
import { SkillsList } from "@/components/desktop/SkillsList";

type SkillsWindowContentProps = {
  mergedSkills: Array<{ group: string; skills: string[] }>;
  isMobileLayout: boolean;
};

export function SkillsWindowContent({ mergedSkills, isMobileLayout }: SkillsWindowContentProps) {
  if (isMobileLayout) {
    return (
      <div className="desktop-window-content">
        <div className="border-2 border-black bg-[#f7f7f7] p-3">
          <SkillsList mergedSkills={mergedSkills} />
        </div>
      </div>
    );
  }

  return (
    <div className="desktop-window-content h-[320px] overflow-hidden xl:h-[460px]">
      <DesktopVerticalScroll className="h-full min-h-0 border-2 border-black bg-[#f7f7f7]" contentClassName="p-3">
        <SkillsList mergedSkills={mergedSkills} />
      </DesktopVerticalScroll>
    </div>
  );
}
