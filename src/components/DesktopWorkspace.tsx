"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { AboutModal } from "@/components/desktop/AboutModal";
import { BootOverlay } from "@/components/desktop/BootOverlay";
import { DesktopCanvas } from "@/components/desktop/DesktopCanvas";
import { DesktopWindowFrame } from "@/components/desktop/DesktopWindowFrame";
import { MenuBar } from "@/components/desktop/MenuBar";
import {
  BOOT_PROGRESS_STEPS,
  CERTIFICATIONS_WINDOW_WIDTH,
  MENU_ITEMS
} from "@/components/desktop/desktop.constants";
import type { BootPhase, DesktopWorkspaceProps, MenuAction, MenuKey } from "@/components/desktop/desktop.types";
import { useWindowManager } from "@/components/desktop/useWindowManager";
import { ContactWindowContent } from "@/components/desktop/windows/ContactWindowContent";
import { EducationWindowContent } from "@/components/desktop/windows/EducationWindowContent";
import { ProfileWindowContent } from "@/components/desktop/windows/ProfileWindowContent";
import { ProjectsWindowContent } from "@/components/desktop/windows/ProjectsWindowContent";
import { ExperienceWindowContent } from "@/components/desktop/windows/ExperienceWindowContent";

const BASE_MENUS: Array<{ key: MenuKey; items: MenuAction[] }> = [
  { key: "view", items: MENU_ITEMS.view },
  { key: "help", items: MENU_ITEMS.help }
];

export function DesktopWorkspace({ profile, education, projects, experience }: DesktopWorkspaceProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [bootPhase, setBootPhase] = useState<BootPhase>("booting");
  const [bootProgress, setBootProgress] = useState(0);
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null);
  const [selectedSlug, setSelectedSlug] = useState(projects[0]?.slug ?? "");
  const [clockText, setClockText] = useState("");
  const [isDesktopLayout, setIsDesktopLayout] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 1024px)").matches;
  });
  const [isMobileLayout, setIsMobileLayout] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 1023px)").matches;
  });
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [experienceTimelineIndex, setExperienceTimelineIndex] = useState(projects.length);
  const wasDesktopLayoutRef = useRef(isDesktopLayout);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const { windowVisibility, activeWindowId, bringToFront, showWindow, closeWindow, beginDrag, getWindowStyle, resetDesktopLayout } = useWindowManager({
    isDesktopLayout,
    canvasRef
  });

  const selectedProject = useMemo(
    () => projects.find((project) => project.slug === selectedSlug) ?? projects[0],
    [projects, selectedSlug]
  );
  const menus = useMemo(
    () =>
      BASE_MENUS.map((menu) => {
        if (menu.key !== "view") return menu;

        return {
          ...menu,
          items: menu.items.map((item) => ({
            ...item,
            disabled: Boolean(item.windowId && windowVisibility[item.windowId])
          }))
        };
      }),
    [windowVisibility]
  );

  const mergedExperience = useMemo(
    () =>
      Object.entries(experience).map(([group, groupEntries]) => ({
        group,
        entries: groupEntries
      })),
    [experience]
  );
  const totalExperience = mergedExperience.reduce((sum, group) => sum + group.entries.length, 0);
  const experienceTimelineMax = projects.length;
  const activeTimelineProject = useMemo(() => {
    if (experienceTimelineIndex >= experienceTimelineMax) return null;
    const projectIndex = experienceTimelineMax - 1 - experienceTimelineIndex;
    return projects[projectIndex] ?? null;
  }, [projects, experienceTimelineIndex, experienceTimelineMax]);
  const filteredMergedExperience = useMemo(() => {
    if (!activeTimelineProject) return mergedExperience;

    const normalizedProjectTechnologies = activeTimelineProject.technologies.map((technology) => technology.trim().toLowerCase());

    const matchesTechnology = (entry: string) => {
      const normalizedEntry = entry.trim().toLowerCase();

      return normalizedProjectTechnologies.some((technology) => {
        if (technology === normalizedEntry) return true;
        if (normalizedEntry.endsWith(` ${technology}`)) return true;
        if (technology.endsWith(` ${normalizedEntry}`)) return true;
        return false;
      });
    };

    return mergedExperience
      .map(({ group, entries: groupEntries }) => ({
        group,
        entries: groupEntries.filter(matchesTechnology)
      }))
      .filter(({ entries: groupEntries }) => groupEntries.length > 0);
  }, [activeTimelineProject, mergedExperience]);
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bootDuration = prefersReducedMotion ? 450 : 2400;
    const transitionDuration = prefersReducedMotion ? 150 : 1050;

    const startTransitionTimer = window.setTimeout(() => {
      setBootPhase("transitioning");
    }, bootDuration);

    const completeBootTimer = window.setTimeout(() => {
      setBootPhase("ready");
    }, bootDuration + transitionDuration);

    return () => {
      window.clearTimeout(startTransitionTimer);
      window.clearTimeout(completeBootTimer);
    };
  }, [hasMounted]);

  useEffect(() => {
    if (!hasMounted) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bootDuration = prefersReducedMotion ? 450 : 2400;
    const stepDuration = Math.max(45, Math.floor(bootDuration / BOOT_PROGRESS_STEPS));
    setBootProgress(0);

    const interval = window.setInterval(() => {
      setBootProgress((current) => {
        if (current >= BOOT_PROGRESS_STEPS) {
          window.clearInterval(interval);
          return BOOT_PROGRESS_STEPS;
        }

        return current + 1;
      });
    }, stepDuration);

    return () => {
      window.clearInterval(interval);
    };
  }, [hasMounted]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClockText(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit"
        })
      );
    };

    updateClock();
    const interval = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const closeMenus = () => setActiveMenu(null);
    window.addEventListener("click", closeMenus);
    return () => window.removeEventListener("click", closeMenus);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setActiveMenu(null);
      setIsAboutModalOpen(false);

      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement && activeElement.closest(".desktop-shell")) {
        activeElement.blur();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    const handleProjectSelectorArrowNavigation = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      if (activeWindowId !== "about-project") return;
      if (projects.length === 0) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLElement &&
        (activeElement.isContentEditable ||
          activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.tagName === "SELECT")
      ) {
        return;
      }

      event.preventDefault();

      const selectedIndex = projects.findIndex((project) => project.slug === selectedSlug);
      const baseIndex = selectedIndex >= 0 ? selectedIndex : 0;
      const nextIndex =
        event.key === "ArrowDown"
          ? Math.min(baseIndex + 1, projects.length - 1)
          : Math.max(baseIndex - 1, 0);

      const nextProject = projects[nextIndex];
      if (!nextProject || nextProject.slug === selectedSlug) return;

      setSelectedSlug(nextProject.slug);
    };

    window.addEventListener("keydown", handleProjectSelectorArrowNavigation);
    return () => window.removeEventListener("keydown", handleProjectSelectorArrowNavigation);
  }, [activeWindowId, projects, selectedSlug]);

  useEffect(() => {
    const desktopMedia = window.matchMedia("(min-width: 1024px)");
    const mobileMedia = window.matchMedia("(max-width: 1023px)");
    const updateLayout = () => {
      setIsDesktopLayout(desktopMedia.matches);
      setIsMobileLayout(mobileMedia.matches);
    };

    updateLayout();
    desktopMedia.addEventListener("change", updateLayout);
    mobileMedia.addEventListener("change", updateLayout);
    return () => {
      desktopMedia.removeEventListener("change", updateLayout);
      mobileMedia.removeEventListener("change", updateLayout);
    };
  }, []);

  useEffect(() => {
    const wasDesktop = wasDesktopLayoutRef.current;
    if (isDesktopLayout && !wasDesktop) {
      resetDesktopLayout();
    }
    wasDesktopLayoutRef.current = isDesktopLayout;
  }, [isDesktopLayout, resetDesktopLayout]);

  useEffect(() => {
    setExperienceTimelineIndex((current) => Math.min(Math.max(current, 0), projects.length));
  }, [projects.length]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    if (isDesktopLayout) {
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
    } else {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    }

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, [isDesktopLayout]);

  const handleToggleMenu = (key: MenuKey) => {
    setActiveMenu((current) => (current === key ? null : key));
  };

  const handleMenuAction = (action: MenuAction) => {
    if (action.disabled) return;

    if (action.windowId) {
      showWindow(action.windowId);
      setActiveMenu(null);
      return;
    }

    if (action.modal === "about") {
      setIsAboutModalOpen(true);
      setActiveMenu(null);
      return;
    }

    if (action.href) {
      window.open(action.href, "_blank", "noreferrer");
      setActiveMenu(null);
    }
  };

  const handleExperienceTimelineChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextIndex = Number(event.target.value);
    setExperienceTimelineIndex(nextIndex);

    if (nextIndex >= experienceTimelineMax) return;

    const projectIndex = experienceTimelineMax - 1 - nextIndex;
    const project = projects[projectIndex];
    if (!project) return;

    setSelectedSlug(project.slug);
  };

  if (!hasMounted) {
    return (
      <main className="desktop-main desktop-main-booting">
        <BootOverlay bootPhase={bootPhase} bootProgress={bootProgress} steps={BOOT_PROGRESS_STEPS} />
      </main>
    );
  }

  return (
    <main className={`desktop-main desktop-main-${bootPhase}`}>
      <div className={`desktop-shell desktop-desktop flex flex-col ${isDesktopLayout ? "h-screen overflow-hidden" : "min-h-screen overflow-visible"}`}>
        <MenuBar
          company={profile.company}
          clockText={clockText}
          menus={menus}
          activeMenu={activeMenu}
          onToggleMenu={handleToggleMenu}
          onAction={handleMenuAction}
        />

        <DesktopCanvas isDesktopLayout={isDesktopLayout} canvasRef={canvasRef}>
          <DesktopWindowFrame
            id="about-profile"
            title="Profile"
            subbar={
              <>
                <p />
                <p />
                <p className="desktop-profile-role">full-stack engineer</p>
              </>
            }
            width={860}
            isVisible={windowVisibility["about-profile"]}
            isActive={activeWindowId === "about-profile"}
            isDesktopLayout={isDesktopLayout}
            style={getWindowStyle("about-profile", 860)}
            onBringToFront={() => bringToFront("about-profile")}
            onBeginDrag={(event) => beginDrag("about-profile", event)}
            onClose={() => closeWindow("about-profile")}
          >
            <ProfileWindowContent profile={profile} />
          </DesktopWindowFrame>

          <DesktopWindowFrame
            id="about-certs"
            title="Education"
            subbar={
              <>
                <p />
                <p />
                <p>certifications</p>
              </>
            }
            width={CERTIFICATIONS_WINDOW_WIDTH}
            isVisible={windowVisibility["about-certs"]}
            isActive={activeWindowId === "about-certs"}
            isDesktopLayout={isDesktopLayout}
            style={getWindowStyle("about-certs", CERTIFICATIONS_WINDOW_WIDTH)}
            onBringToFront={() => bringToFront("about-certs")}
            onBeginDrag={(event) => beginDrag("about-certs", event)}
            onClose={() => closeWindow("about-certs")}
          >
            <EducationWindowContent educationContent={education.content} />
          </DesktopWindowFrame>

          <DesktopWindowFrame
            id="about-project"
            title="Projects"
            subbarClassName="desktop-project-subbar"
            subbar={
              <>
                <p />
                <p />
                <p className="desktop-project-period">{selectedProject?.period ?? "no period"}</p>
              </>
            }
            width={860}
            isVisible={windowVisibility["about-project"]}
            isActive={activeWindowId === "about-project"}
            isDesktopLayout={isDesktopLayout}
            style={getWindowStyle("about-project", 860)}
            onBringToFront={() => bringToFront("about-project")}
            onBeginDrag={(event) => beginDrag("about-project", event)}
            onClose={() => closeWindow("about-project")}
          >
            <ProjectsWindowContent
              projects={projects}
              selectedProject={selectedProject}
              selectedSlug={selectedSlug}
              isMobileLayout={isMobileLayout}
              onSelectSlug={setSelectedSlug}
            />
          </DesktopWindowFrame>

          <DesktopWindowFrame
            id="about-experience"
            title="Experience"
            subbar={
              <>
                <p aria-hidden="true">&nbsp;</p>
                <p className="desktop-experience-active-project">{isMobileLayout ? "" : activeTimelineProject?.client ?? ""}</p>
                <p className={isMobileLayout ? "" : "desktop-experience-subbar-cell"}>
                  {isMobileLayout ? (
                    `${totalExperience} experience items`
                  ) : (
                    <label className="desktop-experience-timeline" htmlFor="experience-timeline-slider">
                      <span className="sr-only">Filter experience by project timeline</span>
                      <input
                        id="experience-timeline-slider"
                        aria-label="Experience timeline filter"
                        className="desktop-experience-timeline-slider"
                        type="range"
                        min={0}
                        max={experienceTimelineMax}
                        value={experienceTimelineIndex}
                        onChange={handleExperienceTimelineChange}
                      />
                    </label>
                  )}
                </p>
              </>
            }
            width={470}
            isVisible={windowVisibility["about-experience"]}
            isActive={activeWindowId === "about-experience"}
            isDesktopLayout={isDesktopLayout}
            style={getWindowStyle("about-experience", 470)}
            onBringToFront={() => bringToFront("about-experience")}
            onBeginDrag={(event) => beginDrag("about-experience", event)}
            onClose={() => closeWindow("about-experience")}
          >
            <ExperienceWindowContent mergedExperience={filteredMergedExperience} isMobileLayout={isMobileLayout} />
          </DesktopWindowFrame>

          <DesktopWindowFrame
            id="about-contact"
            title="Contact"
            subbar={null}
            width={470}
            isVisible={windowVisibility["about-contact"]}
            isActive={activeWindowId === "about-contact"}
            isDesktopLayout={isDesktopLayout}
            style={getWindowStyle("about-contact", 470)}
            onBringToFront={() => bringToFront("about-contact")}
            onBeginDrag={(event) => beginDrag("about-contact", event)}
            onClose={() => closeWindow("about-contact")}
          >
            <ContactWindowContent />
          </DesktopWindowFrame>
        </DesktopCanvas>
      </div>

      <AboutModal isOpen={isAboutModalOpen} appVersion={appVersion} onClose={() => setIsAboutModalOpen(false)} />
      <BootOverlay bootPhase={bootPhase} bootProgress={bootProgress} steps={BOOT_PROGRESS_STEPS} />
    </main>
  );
}
