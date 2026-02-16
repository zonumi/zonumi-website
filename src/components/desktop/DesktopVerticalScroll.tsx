"use client";

import { type ReactNode, type RefObject, useRef } from "react";

type DesktopVerticalScrollProps = {
  className?: string;
  contentClassName?: string;
  children: ReactNode;
  contentRef?: RefObject<HTMLDivElement | null>;
};

export function DesktopVerticalScroll({ className, contentClassName, children, contentRef }: DesktopVerticalScrollProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const setScrollElement = (element: HTMLDivElement | null) => {
    scrollRef.current = element;
    if (contentRef) {
      contentRef.current = element;
    }
  };

  const scrollByAmount = (delta: number) => {
    scrollRef.current?.scrollBy({ top: delta, behavior: "smooth" });
  };

  return (
    <div className={`desktop-vscroll ${className ?? ""}`}>
      <div ref={setScrollElement} className={`desktop-vscroll-content ${contentClassName ?? ""}`}>
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
