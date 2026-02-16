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
import { SkillsWindowContent } from "@/components/desktop/windows/SkillsWindowContent";

const MENUS: Array<{ key: MenuKey; items: MenuAction[] }> = [
  { key: "view", items: MENU_ITEMS.view },
  { key: "help", items: MENU_ITEMS.help }
];

export function DesktopWorkspace({ profile, projects, skills }: DesktopWorkspaceProps) {
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
    return window.matchMedia("(max-width: 767px)").matches;
  });
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [skillsTimelineIndex, setSkillsTimelineIndex] = useState(projects.length);
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

  const [aboutSummaryContent, certificationsContent] = useMemo(() => {
    const sectionHeadingPattern = /^##\s+Certifications and Education\s*$/im;
    const match = profile.content.match(sectionHeadingPattern);

    if (!match || match.index === undefined) {
      return [profile.content.trim(), ""];
    }

    const heading = match[0];
    const summary = profile.content.slice(0, match.index).trim();
    const certifications = profile.content.slice(match.index + heading.length).trim();
    return [summary, certifications];
  }, [profile.content]);

  const yearsExperience = 17;
  const mergedSkills = useMemo(
    () =>
      Object.entries(skills).map(([group, groupSkills]) => ({
        group,
        skills: groupSkills
      })),
    [skills]
  );
  const totalSkills = mergedSkills.reduce((sum, group) => sum + group.skills.length, 0);
  const skillsTimelineMax = projects.length;
  const activeTimelineProject = useMemo(() => {
    if (skillsTimelineIndex >= skillsTimelineMax) return null;
    const projectIndex = skillsTimelineMax - 1 - skillsTimelineIndex;
    return projects[projectIndex] ?? null;
  }, [projects, skillsTimelineIndex, skillsTimelineMax]);
  const filteredMergedSkills = useMemo(() => {
    if (!activeTimelineProject) return mergedSkills;

    const normalizedProjectTechnologies = activeTimelineProject.technologies.map((technology) => technology.trim().toLowerCase());

    const matchesTechnology = (skill: string) => {
      const normalizedSkill = skill.trim().toLowerCase();

      return normalizedProjectTechnologies.some((technology) => {
        if (technology === normalizedSkill) return true;
        if (normalizedSkill.endsWith(` ${technology}`)) return true;
        if (technology.endsWith(` ${normalizedSkill}`)) return true;
        return false;
      });
    };

    return mergedSkills
      .map(({ group, skills: groupSkills }) => ({
        group,
        skills: groupSkills.filter(matchesTechnology)
      }))
      .filter(({ skills: groupSkills }) => groupSkills.length > 0);
  }, [activeTimelineProject, mergedSkills]);
  const visibleSkillGroups = filteredMergedSkills.length;
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";
  const certificationsCount = certificationsContent
    .split("\n")
    .filter((line) => line.trim().startsWith("- "))
    .length;

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
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    const desktopMedia = window.matchMedia("(min-width: 1024px)");
    const mobileMedia = window.matchMedia("(max-width: 767px)");
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
    setSkillsTimelineIndex((current) => Math.min(Math.max(current, 0), projects.length));
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

  const handleSkillsTimelineChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSkillsTimelineIndex(Number(event.target.value));
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
          menus={MENUS}
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
                <p>{yearsExperience}+ years</p>
                <p />
                <p>{totalSkills} skills</p>
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
            <ProfileWindowContent profile={profile} aboutSummaryContent={aboutSummaryContent} />
          </DesktopWindowFrame>

          <DesktopWindowFrame
            id="about-certs"
            title="Education"
            subbar={
              <>
                <p>{certificationsCount} records</p>
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
            <EducationWindowContent certificationsContent={certificationsContent} />
          </DesktopWindowFrame>

          <DesktopWindowFrame
            id="about-project"
            title="Projects"
            subbar={
              <>
                <p>{projects.length} projects</p>
                <p />
                <p>{selectedProject?.period ?? "no period"}</p>
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
            id="about-skills"
            title="Skills"
            subbar={
              <>
                <p>{visibleSkillGroups} groups</p>
                <p className="desktop-skills-active-project">{activeTimelineProject?.client ?? ""}</p>
                <p className="desktop-skills-subbar-cell">
                  <label className="desktop-skills-timeline" htmlFor="skills-timeline-slider">
                    <span className="sr-only">Filter skills by project timeline</span>
                    <input
                      id="skills-timeline-slider"
                      aria-label="Skills timeline filter"
                      className="desktop-skills-timeline-slider"
                      type="range"
                      min={0}
                      max={skillsTimelineMax}
                      value={skillsTimelineIndex}
                      disabled={isMobileLayout}
                      onChange={handleSkillsTimelineChange}
                    />
                  </label>
                </p>
              </>
            }
            width={470}
            isVisible={windowVisibility["about-skills"]}
            isActive={activeWindowId === "about-skills"}
            isDesktopLayout={isDesktopLayout}
            style={getWindowStyle("about-skills", 470)}
            onBringToFront={() => bringToFront("about-skills")}
            onBeginDrag={(event) => beginDrag("about-skills", event)}
            onClose={() => closeWindow("about-skills")}
          >
            <SkillsWindowContent mergedSkills={filteredMergedSkills} isMobileLayout={isMobileLayout} />
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
