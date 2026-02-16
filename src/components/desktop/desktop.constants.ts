import type { MenuAction, MenuKey, WindowId, WindowState } from "@/components/desktop/desktop.types";

export const CERTIFICATIONS_WINDOW_WIDTH = 470;
export const BOOT_PROGRESS_STEPS = 14;

export const MENU_ITEMS: Record<MenuKey, MenuAction[]> = {
  view: [
    { label: "Profile", windowId: "about-profile" },
    { label: "Education", windowId: "about-certs" },
    { label: "Projects", windowId: "about-project" },
    { label: "Experience", windowId: "about-experience" }
  ],
  help: [{ label: "Contact...", windowId: "about-contact" }, { separator: true }, { label: "About", modal: "about" }]
};

export const INITIAL_WINDOWS: Record<WindowId, WindowState> = {
  "about-profile": { x: 48, y: 24, z: 1 },
  "about-certs": { x: 944, y: 30, z: 2 },
  "about-experience": { x: 960, y: 292, z: 3 },
  "about-project": { x: 64, y: 302, z: 4 },
  "about-contact": { x: 980, y: 120, z: 5 }
};

export const WINDOW_IDS: WindowId[] = ["about-profile", "about-certs", "about-project", "about-experience", "about-contact"];
export const WINDOW_POSITION_STORAGE_KEY = "zonumi.window-positions.v1";
