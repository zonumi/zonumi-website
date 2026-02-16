import type { ReactNode, RefObject } from "react";

type DesktopCanvasProps = {
  isDesktopLayout: boolean;
  canvasRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
};

export function DesktopCanvas({ isDesktopLayout, canvasRef, children }: DesktopCanvasProps) {
  return (
    <section className={`${isDesktopLayout ? "w-full flex-1 overflow-hidden px-0 py-0" : "mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-5 md:py-6"}`}>
      <div ref={canvasRef} className={`relative ${isDesktopLayout ? "h-full overflow-hidden" : "space-y-4"}`} data-testid="desktop-canvas">
        {children}
      </div>
    </section>
  );
}
