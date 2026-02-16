"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";
import type { WindowId } from "@/components/desktop/desktop.types";

type DesktopWindowFrameProps = {
  id: WindowId;
  title: string;
  subbar: ReactNode | null;
  subbarClassName?: string;
  width: number | string;
  isVisible: boolean;
  isActive: boolean;
  isDesktopLayout: boolean;
  style?: CSSProperties;
  onBringToFront: () => void;
  onBeginDrag: (event: MouseEvent<HTMLDivElement>) => void;
  onClose: () => void;
  children: ReactNode;
  extraClass?: string;
};

export function DesktopWindowFrame({
  id,
  title,
  subbar,
  subbarClassName = "",
  width,
  isVisible,
  isActive,
  isDesktopLayout,
  style,
  onBringToFront,
  onBeginDrag,
  onClose,
  children,
  extraClass = ""
}: DesktopWindowFrameProps) {
  void width;
  if (!isVisible) return null;

  return (
    <section
      className={`desktop-window ${isActive ? "desktop-window-active" : "desktop-window-inactive"} ${isDesktopLayout ? "absolute" : ""} ${extraClass}`}
      style={style}
      onMouseDown={() => (isDesktopLayout ? onBringToFront() : null)}
      data-window-id={id}
      data-testid={`window-${id}`}
    >
      <div className="desktop-titlebar desktop-drag-handle" onMouseDown={onBeginDrag}>
        <button
          type="button"
          className="desktop-close-box"
          aria-label={`Close ${title}`}
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
        />
        <h2>{title}</h2>
      </div>
      {subbar ? <div className={`desktop-subbar ${subbarClassName}`}>{subbar}</div> : null}
      {children}
    </section>
  );
}
