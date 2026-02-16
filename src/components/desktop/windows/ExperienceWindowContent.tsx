import { DesktopVerticalScroll } from "@/components/desktop/DesktopVerticalScroll";
import { ExperienceList } from "@/components/desktop/ExperienceList";

type ExperienceWindowContentProps = {
  mergedExperience: Array<{ group: string; entries: string[] }>;
  isMobileLayout: boolean;
};

export function ExperienceWindowContent({ mergedExperience, isMobileLayout }: ExperienceWindowContentProps) {
  if (isMobileLayout) {
    return (
      <div className="desktop-window-content">
        <div className="border-2 border-black bg-[#f7f7f7] p-3">
          <ExperienceList mergedExperience={mergedExperience} />
        </div>
      </div>
    );
  }

  return (
    <div className="desktop-window-content h-[320px] overflow-hidden xl:h-[460px]">
      <DesktopVerticalScroll className="h-full min-h-0 border-2 border-black bg-[#f7f7f7]" contentClassName="p-3">
        <ExperienceList mergedExperience={mergedExperience} />
      </DesktopVerticalScroll>
    </div>
  );
}
