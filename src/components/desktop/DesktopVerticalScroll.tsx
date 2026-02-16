"use client";

import { type ReactNode, useRef } from "react";

type DesktopVerticalScrollProps = {
  className?: string;
  contentClassName?: string;
  children: ReactNode;
};

export function DesktopVerticalScroll({ className, contentClassName, children }: DesktopVerticalScrollProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollByAmount = (delta: number) => {
    scrollRef.current?.scrollBy({ top: delta, behavior: "smooth" });
  };

  return (
    <div className={`desktop-vscroll ${className ?? ""}`}>
      <div ref={scrollRef} className={`desktop-vscroll-content ${contentClassName ?? ""}`}>
        {children}
      </div>
      <div className="desktop-vscroll-rail">
        <button type="button" className="desktop-vscroll-arrow desktop-vscroll-arrow-up" aria-label="Scroll up" onClick={() => scrollByAmount(-96)} />
        <div className="desktop-vscroll-track" />
        <button type="button" className="desktop-vscroll-arrow desktop-vscroll-arrow-down" aria-label="Scroll down" onClick={() => scrollByAmount(96)} />
      </div>
    </div>
  );
}
