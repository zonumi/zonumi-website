import type { Education, Project, Profile } from "@/lib/markdown-utils";

export type MenuKey = "view" | "help";
export type BootPhase = "booting" | "transitioning" | "ready";
export type WindowId = "about-profile" | "about-certs" | "about-project" | "about-experience" | "about-contact";

export type DesktopWorkspaceProps = {
  profile: Profile;
  education: Education;
  projects: Project[];
  experience: Record<string, string[]>;
};

export type MenuAction = {
  label?: string;
  href?: string;
  windowId?: WindowId;
  separator?: boolean;
  modal?: "about";
  disabled?: boolean;
};

export type WindowState = {
  x: number;
  y: number;
  z: number;
};
