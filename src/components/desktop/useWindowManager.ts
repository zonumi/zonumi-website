"use client";

import { type CSSProperties, type MouseEvent as ReactMouseEvent, type RefObject, useCallback, useEffect, useRef, useState } from "react";
import { INITIAL_WINDOWS, WINDOW_IDS, WINDOW_POSITION_STORAGE_KEY } from "@/components/desktop/desktop.constants";
import type { WindowId, WindowState } from "@/components/desktop/desktop.types";

const cloneWindows = (positions: Record<WindowId, WindowState>): Record<WindowId, WindowState> =>
  WINDOW_IDS.reduce(
    (accumulator, id) => {
      accumulator[id] = { ...positions[id] };
      return accumulator;
    },
    {} as Record<WindowId, WindowState>
  );

const parseStoredWindowPositions = (value: string | null): Record<WindowId, WindowState> | null => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<Record<WindowId, Partial<WindowState>>>;
    const merged = cloneWindows(INITIAL_WINDOWS);

    WINDOW_IDS.forEach((id) => {
      const state = parsed[id];
      if (!state) return;

      const x = Number(state.x);
      const y = Number(state.y);
      const z = Number(state.z);
      if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return;

      merged[id] = {
        x,
        y,
        z
      };
    });

    return merged;
  } catch {
    return null;
  }
};

const getStoredWindowPositions = (): Record<WindowId, WindowState> | null => {
  if (typeof window === "undefined") return null;
  return parseStoredWindowPositions(localStorage.getItem(WINDOW_POSITION_STORAGE_KEY));
};

type UseWindowManagerParams = {
  isDesktopLayout: boolean;
  canvasRef: RefObject<HTMLDivElement | null>;
};

export function useWindowManager({ isDesktopLayout, canvasRef }: UseWindowManagerParams) {
  const [windowPositions, setWindowPositions] = useState(() => getStoredWindowPositions() ?? cloneWindows(INITIAL_WINDOWS));
  const [zCounter, setZCounter] = useState(() => {
    const storedPositions = getStoredWindowPositions();
    if (!storedPositions) return 20;
    return Math.max(...WINDOW_IDS.map((id) => storedPositions[id].z), 20);
  });
  const [windowVisibility, setWindowVisibility] = useState<Record<WindowId, boolean>>({
    "about-profile": true,
    "about-certs": true,
    "about-project": true,
    "about-experience": true,
    "about-contact": false
  });
  const [activeWindowId, setActiveWindowId] = useState<WindowId>("about-project");
  const dragRef = useRef<{ id: WindowId; offsetX: number; offsetY: number } | null>(null);

  const centerWindowInCanvas = useCallback(
    (id: WindowId) => {
      if (!isDesktopLayout) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const windowElement = canvas.querySelector<HTMLElement>(`[data-window-id="${id}"]`);
      if (!windowElement) return;

      const maxX = Math.max(0, rect.width - windowElement.offsetWidth);
      const maxY = Math.max(0, rect.height - windowElement.offsetHeight);
      const x = Math.round(maxX / 2);
      const y = Math.round(maxY / 2);

      setWindowPositions((current) => ({
        ...current,
        [id]: {
          ...current[id],
          x,
          y
        }
      }));
    },
    [isDesktopLayout, canvasRef]
  );

  useEffect(() => {
    localStorage.setItem(WINDOW_POSITION_STORAGE_KEY, JSON.stringify(windowPositions));
  }, [windowPositions]);

  useEffect(() => {
    if (!isDesktopLayout) {
      dragRef.current = null;
      return;
    }

    const onMouseMove = (event: MouseEvent) => {
      const drag = dragRef.current;
      const canvas = canvasRef.current;
      if (!drag || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      const windowElement = canvas.querySelector<HTMLElement>(`[data-window-id="${drag.id}"]`);
      const windowWidth = windowElement?.offsetWidth ?? 0;
      const windowHeight = windowElement?.offsetHeight ?? 0;
      const maxX = Math.max(0, rect.width - windowWidth);
      const maxY = Math.max(0, rect.height - windowHeight);
      const x = Math.min(maxX, Math.max(0, event.clientX - rect.left - drag.offsetX));
      const y = Math.min(maxY, Math.max(0, event.clientY - rect.top - drag.offsetY));

      setWindowPositions((current) => ({
        ...current,
        [drag.id]: {
          ...current[drag.id],
          x,
          y
        }
      }));
    };

    const onMouseUp = () => {
      dragRef.current = null;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDesktopLayout, canvasRef]);

  const clampWindowPositionsToCanvas = useCallback(() => {
    if (!isDesktopLayout) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    setWindowPositions((current) => {
      let changed = false;
      const next = { ...current };

      WINDOW_IDS.forEach((id) => {
        const windowElement = canvas.querySelector<HTMLElement>(`[data-window-id="${id}"]`);
        if (!windowElement) return;

        const maxX = Math.max(0, rect.width - windowElement.offsetWidth);
        const maxY = Math.max(0, rect.height - windowElement.offsetHeight);
        const x = Math.min(maxX, Math.max(0, current[id].x));
        const y = Math.min(maxY, Math.max(0, current[id].y));

        if (x === current[id].x && y === current[id].y) return;

        changed = true;
        next[id] = {
          ...current[id],
          x,
          y
        };
      });

      return changed ? next : current;
    });
  }, [isDesktopLayout, canvasRef]);

  const resetDesktopLayout = useCallback(() => {
    setWindowPositions(cloneWindows(INITIAL_WINDOWS));
    setZCounter(Math.max(...WINDOW_IDS.map((id) => INITIAL_WINDOWS[id].z), 20));
    setActiveWindowId("about-project");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(clampWindowPositionsToCanvas);
    });
  }, [clampWindowPositionsToCanvas]);

  useEffect(() => {
    if (!isDesktopLayout) return;

    const rafId = window.requestAnimationFrame(clampWindowPositionsToCanvas);
    return () => window.cancelAnimationFrame(rafId);
  }, [isDesktopLayout, windowVisibility, clampWindowPositionsToCanvas]);

  useEffect(() => {
    if (!isDesktopLayout) return;

    const handleResize = () => {
      window.requestAnimationFrame(clampWindowPositionsToCanvas);
    };

    const canvas = canvasRef.current;
    const observer =
      canvas && typeof ResizeObserver !== "undefined" ? new ResizeObserver(handleResize) : null;

    if (canvas && observer) {
      observer.observe(canvas);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [isDesktopLayout, clampWindowPositionsToCanvas, canvasRef]);

  const bringToFront = (id: WindowId) => {
    setActiveWindowId(id);
    setZCounter((prev) => {
      const next = prev + 1;
      setWindowPositions((current) => ({
        ...current,
        [id]: {
          ...current[id],
          z: next
        }
      }));
      return next;
    });
  };

  const showWindow = (id: WindowId) => {
    const shouldCenterContactOnFirstOpen =
      id === "about-contact" &&
      isDesktopLayout &&
      !windowVisibility[id] &&
      windowPositions[id].x === INITIAL_WINDOWS[id].x &&
      windowPositions[id].y === INITIAL_WINDOWS[id].y;

    setWindowVisibility((current) => ({ ...current, [id]: true }));
    bringToFront(id);

    // Contact window should open centered when there is no persisted placement yet.
    if (shouldCenterContactOnFirstOpen) {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          centerWindowInCanvas(id);
        });
      });
    }
  };

  const closeWindow = (id: WindowId) => {
    setWindowVisibility((current) => ({ ...current, [id]: false }));
    setActiveWindowId((current) => (current === id ? "about-profile" : current));
  };

  const beginDrag = (id: WindowId, event: ReactMouseEvent<HTMLDivElement>) => {
    if (!isDesktopLayout) return;

    event.preventDefault();
    event.stopPropagation();
    bringToFront(id);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const current = windowPositions[id];

    dragRef.current = {
      id,
      offsetX: event.clientX - rect.left - current.x,
      offsetY: event.clientY - rect.top - current.y
    };
  };

  const getWindowStyle = (id: WindowId, width: number | string): CSSProperties | undefined => {
    if (!isDesktopLayout) return undefined;

    const state = windowPositions[id];
    return {
      left: state.x,
      top: state.y,
      width,
      zIndex: state.z
    };
  };

  return {
    windowPositions,
    windowVisibility,
    activeWindowId,
    bringToFront,
    showWindow,
    closeWindow,
    beginDrag,
    getWindowStyle,
    resetDesktopLayout
  };
}
