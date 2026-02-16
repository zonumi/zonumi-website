import Image from "next/image";
import type { BootPhase } from "@/components/desktop/desktop.types";

type BootOverlayProps = {
  bootPhase: BootPhase;
  bootProgress: number;
  steps: number;
};

export function BootOverlay({ bootPhase, bootProgress, steps }: BootOverlayProps) {
  if (bootPhase === "ready") return null;

  return (
    <div className={`boot-overlay ${bootPhase === "transitioning" ? "boot-overlay-transitioning" : ""}`} aria-hidden="true">
      <div className="boot-overlay-frame">
        <div className="boot-zonumi-mark">
          <Image
            src="/branding/brand/zonumi-menu-icon.png"
            alt=""
            width={52}
            height={52}
            priority
            className="boot-zonumi-logo"
          />
        </div>
        <p className="boot-zonumi-title">Welcome to Zonumi</p>
        <div className="boot-progress" aria-hidden="true">
          {Array.from({ length: steps }, (_, index) => (
            <span key={`boot-cell-${index}`} className={`boot-progress-cell ${index < bootProgress ? "boot-progress-cell-filled" : ""}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
