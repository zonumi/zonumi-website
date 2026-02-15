"use client";

import Image from "next/image";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Markdown from "react-markdown";
import type { Project, Profile } from "@/lib/markdown-utils";

type Panel = "about" | "skills" | "projects" | "contact";
type MenuKey = "file" | "view";
type BootPhase = "booting" | "transitioning" | "ready";
type WindowId =
  | "about-profile"
  | "about-certs"
  | "about-project"
  | "about-skills"
  | "panel-skills"
  | "panel-projects"
  | "panel-contact";

type DesktopWorkspaceProps = {
  profile: Profile;
  projects: Project[];
  skills: Record<string, string[]>;
};

type MenuAction = {
  label: string;
  panel?: Panel;
  href?: string;
  windowId?: WindowId;
  download?: boolean;
};

type WindowState = {
  x: number;
  y: number;
  z: number;
};

const CERTIFICATIONS_WINDOW_WIDTH = 470;
const CERTIFICATIONS_WINDOW_TOP_RATIO = 0.2;
const WINDOW_EDGE_GUTTER = 24;
const BOOT_PROGRESS_STEPS = 14;

const CONTACT_EMAIL = "nuno.castilho@outlook.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/nuno-castilho";
const GITHUB_URL = "https://github.com/ncastilho";
const CV_DOWNLOAD_PATH = "/files/nuno-castilho-cv.pdf";

const MENU_ITEMS: Record<MenuKey, MenuAction[]> = {
  file: [{ label: "Download CV", href: CV_DOWNLOAD_PATH, download: true }],
  view: [
    { label: "Profile", panel: "about", windowId: "about-profile" },
    { label: "Certifications", panel: "about", windowId: "about-certs" },
    { label: "Projects", panel: "about", windowId: "about-project" },
    { label: "Skills", panel: "about", windowId: "about-skills" }
  ]
};

const INITIAL_WINDOWS: Record<WindowId, WindowState> = {
  "about-profile": { x: 56, y: 24, z: 1 },
  "about-certs": { x: 900, y: 24, z: 2 },
  "about-skills": { x: 1000, y: 24, z: 3 },
  "about-project": { x: 116, y: 304, z: 4 },
  "panel-skills": { x: 56, y: 44, z: 5 },
  "panel-projects": { x: 36, y: 44, z: 6 },
  "panel-contact": { x: 120, y: 72, z: 7 }
};
const WINDOW_IDS: WindowId[] = [
  "about-profile",
  "about-certs",
  "about-project",
  "about-skills",
  "panel-skills",
  "panel-projects",
  "panel-contact"
];
const WINDOW_POSITION_STORAGE_KEY = "zonumi.window-positions.v1";

const PANEL_WINDOW_MAP: Record<Exclude<Panel, "about">, WindowId> = {
  skills: "panel-skills",
  projects: "panel-projects",
  contact: "panel-contact"
};
const ABOUT_WINDOWS: WindowId[] = ["about-profile", "about-certs", "about-project", "about-skills"];

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

function DesktopVerticalScroll({
  className,
  contentClassName,
  children
}: {
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
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

export function DesktopWorkspace({ profile, projects, skills }: DesktopWorkspaceProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [bootPhase, setBootPhase] = useState<BootPhase>("booting");
  const [bootProgress, setBootProgress] = useState(0);
  const [activePanel, setActivePanel] = useState<Panel>("about");
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null);
  const [selectedSlug, setSelectedSlug] = useState(projects[0]?.slug ?? "");
  const [clockText, setClockText] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isDesktopLayout, setIsDesktopLayout] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 1024px)").matches;
  });
  const [windowPositions, setWindowPositions] = useState(() => getStoredWindowPositions() ?? cloneWindows(INITIAL_WINDOWS));
  const [zCounter, setZCounter] = useState(() => {
    const storedPositions = getStoredWindowPositions();
    if (!storedPositions) return 20;
    return Math.max(...WINDOW_IDS.map((id) => storedPositions[id].z), 20);
  });
  const [windowVisibility, setWindowVisibility] = useState<Record<WindowId, boolean>>({
    "about-profile": true,
    "about-certs": false,
    "about-project": true,
    "about-skills": true,
    "panel-skills": true,
    "panel-projects": true,
    "panel-contact": true
  });
  const [activeWindowId, setActiveWindowId] = useState<WindowId>("about-project");
  const dragRef = useRef<{ id: WindowId; offsetX: number; offsetY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

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
  const skillGroups = mergedSkills.length;
  const totalSkills = mergedSkills.reduce((sum, group) => sum + group.skills.length, 0);
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
          minute: "2-digit"
        })
      );
    };

    updateClock();
    const interval = window.setInterval(updateClock, 1000 * 30);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const closeMenus = () => setActiveMenu(null);
    window.addEventListener("click", closeMenus);
    return () => window.removeEventListener("click", closeMenus);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const updateLayout = () => setIsDesktopLayout(media.matches);
    updateLayout();
    media.addEventListener("change", updateLayout);
    return () => media.removeEventListener("change", updateLayout);
  }, []);

  useEffect(() => {
    localStorage.setItem(WINDOW_POSITION_STORAGE_KEY, JSON.stringify(windowPositions));
  }, [windowPositions]);

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
  }, [isDesktopLayout]);

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
  }, [isDesktopLayout]);

  useEffect(() => {
    if (!isDesktopLayout) return;

    const rafId = window.requestAnimationFrame(clampWindowPositionsToCanvas);
    return () => window.cancelAnimationFrame(rafId);
  }, [isDesktopLayout, activePanel, windowVisibility, clampWindowPositionsToCanvas]);

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
  }, [isDesktopLayout, clampWindowPositionsToCanvas]);

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
    if (isDesktopLayout && id === "about-certs") {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const centeredX = Math.round((rect.width - CERTIFICATIONS_WINDOW_WIDTH) / 2);
        const anchoredY = Math.round(rect.height * CERTIFICATIONS_WINDOW_TOP_RATIO);

        setWindowPositions((current) => ({
          ...current,
          [id]: {
            ...current[id],
            x: Math.max(WINDOW_EDGE_GUTTER, centeredX),
            y: Math.max(WINDOW_EDGE_GUTTER, anchoredY)
          }
        }));
      }
    }

    setWindowVisibility((current) => ({ ...current, [id]: true }));
    bringToFront(id);
  };

  const closeWindow = (id: WindowId) => {
    setWindowVisibility((current) => ({ ...current, [id]: false }));
    setActiveWindowId((current) => (current === id ? "about-profile" : current));
  };

  const beginDrag = (id: WindowId, event: React.MouseEvent<HTMLDivElement>) => {
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

  const openPanel = (panel: Panel) => {
    setActivePanel(panel);
    setActiveMenu(null);

    if (panel === "about") {
      setWindowVisibility((current) => {
        const next = { ...current };
        ABOUT_WINDOWS.forEach((id) => {
          next[id] = true;
        });
        return next;
      });
      bringToFront("about-profile");
      return;
    }

    const panelWindow = PANEL_WINDOW_MAP[panel];
    showWindow(panelWindow);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 1500);
    } catch {
      window.location.href = `mailto:${CONTACT_EMAIL}`;
    }
  };

  const panelTitle =
    activePanel === "about"
      ? "Profile"
      : activePanel === "skills"
        ? "Skills"
        : activePanel === "projects"
          ? "Projects"
          : "Contact Console";

  const getWindowStyle = (id: WindowId, width: number | string) => {
    if (!isDesktopLayout) return undefined;

    const state = windowPositions[id];
    return {
      left: state.x,
      top: state.y,
      width,
      zIndex: state.z
    };
  };

  const renderWindowFrame = (
    id: WindowId,
    title: string,
    subbar: ReactNode,
    content: ReactNode,
    width: number | string,
    extraClass = ""
  ) => (
    windowVisibility[id] ? (
    <section
      className={`desktop-window ${activeWindowId === id ? "desktop-window-active" : "desktop-window-inactive"} ${isDesktopLayout ? "absolute" : ""} ${extraClass}`}
      style={getWindowStyle(id, width)}
      onMouseDown={() => (isDesktopLayout ? bringToFront(id) : null)}
      data-window-id={id}
    >
      <div className="desktop-titlebar desktop-drag-handle" onMouseDown={(event) => beginDrag(id, event)}>
        <button
          type="button"
          className="desktop-close-box"
          aria-label={`Close ${title}`}
          onClick={(event) => {
            event.stopPropagation();
            closeWindow(id);
          }}
        />
        <h2>{title}</h2>
      </div>
      <div className="desktop-subbar">{subbar}</div>
      {content}
    </section>
    ) : null
  );

  const renderProjectFinder = (constrainedHeight = false) => (
    <div className={`grid min-h-0 gap-3 lg:grid-cols-[220px_1fr] ${constrainedHeight ? "h-full" : ""}`}>
      <DesktopVerticalScroll className={`min-h-0 border-2 border-black bg-[#f7f7f7] ${constrainedHeight ? "h-full" : "max-h-[380px]"}`} contentClassName="p-1">
        {projects.map((project) => (
          <button
            key={project.slug}
            type="button"
            onClick={() => setSelectedSlug(project.slug)}
            className={`block w-full border border-transparent px-2 py-1 text-left text-xs ${
              selectedProject?.slug === project.slug ? "bg-black text-white" : "hover:border-black"
            }`}
          >
            <span className="block font-semibold">{project.client}</span>
            <span className="block text-[11px]">{project.period}</span>
          </button>
        ))}
      </DesktopVerticalScroll>

      <DesktopVerticalScroll className={`min-h-0 border-2 border-black bg-[#f7f7f7] ${constrainedHeight ? "h-full" : "max-h-[380px]"}`} contentClassName="space-y-3 p-3">
        {selectedProject ? (
          <>
            <div>
              <h3 className="text-base">{selectedProject.client}</h3>
              <p className="text-xs">{selectedProject.role}</p>
              <p className="text-xs">{selectedProject.period}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {selectedProject.technologies.map((tech) => (
                <span key={tech} className="border border-black bg-white px-2 py-0.5 text-[11px]">
                  {tech}
                </span>
              ))}
            </div>

            <div className="prose prose-sm max-w-none prose-p:my-2 prose-li:my-0.5">
              <Markdown>{selectedProject.content}</Markdown>
            </div>
          </>
        ) : (
          <p className="text-sm">No projects available.</p>
        )}
      </DesktopVerticalScroll>
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-4">
      {mergedSkills.map(({ group, skills }) => (
        <article key={group} className="space-y-2">
          <h3 className="text-xs uppercase">{group}</h3>
          <ul className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <li key={`${group}-${skill}`} className="border border-black bg-white px-2 py-1 text-xs">
                {skill}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );

  const aboutWindows = (
    <>
      {renderWindowFrame(
        "about-profile",
        "Profile",
        <>
          <p>{yearsExperience}+ years</p>
          <p>{projects.length} projects</p>
          <p>{totalSkills} skills</p>
        </>,
        <div className="desktop-window-content space-y-4">
          <div>
            <h2 className="mt-1 text-lg">{profile.name}</h2>
          </div>
          <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-li:my-0.5 prose-ul:my-2">
            <Markdown>{aboutSummaryContent}</Markdown>
          </div>
        </div>,
        860
      )}

      {renderWindowFrame(
        "about-certs",
        "Certifications & Education",
        <>
          <p>{certificationsCount} records</p>
          <p>2006-2018</p>
          <p>accreditations</p>
        </>,
        <div className="desktop-window-content">
          {certificationsContent ? (
            <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-li:my-0.5 prose-ul:my-2">
              <Markdown>{certificationsContent}</Markdown>
            </div>
          ) : (
            <p className="text-sm">No certifications section found in profile content.</p>
          )}
        </div>,
        470
      )}

      {renderWindowFrame(
        "about-project",
        "Projects",
        <>
          <p>{projects.length} projects</p>
          <p>{selectedProject?.technologies.length ?? 0} skills</p>
          <p>{selectedProject?.period ?? "no period"}</p>
        </>,
        <div className="desktop-window-content h-[320px] overflow-hidden xl:h-[460px]">{renderProjectFinder(true)}</div>,
        860
      )}

      {renderWindowFrame(
        "about-skills",
        "Skills",
        <>
          <p>{skillGroups} groups</p>
          <p>{totalSkills} skills</p>
          <p>cloud + delivery</p>
        </>,
        <div className="desktop-window-content h-[320px] overflow-hidden xl:h-[460px]">
          <DesktopVerticalScroll className="h-full min-h-0 border-2 border-black bg-[#f7f7f7]" contentClassName="p-3">
            {renderSkills()}
          </DesktopVerticalScroll>
        </div>,
        470
      )}
    </>
  );

  const singlePanelWindow =
    activePanel === "about"
      ? null
      : renderWindowFrame(
          PANEL_WINDOW_MAP[activePanel],
          panelTitle,
          activePanel === "skills" ? (
            <>
              <p>{skillGroups} groups</p>
              <p>{totalSkills} skills</p>
              <p>capability index</p>
            </>
          ) : activePanel === "projects" ? (
            <>
              <p>{projects.length} projects</p>
              <p>{selectedProject?.technologies.length ?? 0} skills</p>
              <p>{selectedProject?.client ?? "no selection"}</p>
            </>
          ) : (
            <>
              <p>3 quick actions</p>
              <p>email + linkedin + github</p>
              <p>response ready</p>
            </>
          ),
          <div className="desktop-window-content">
            {activePanel === "skills" ? renderSkills() : null}
            {activePanel === "projects" ? renderProjectFinder() : null}
            {activePanel === "contact" ? (
              <div className="space-y-4 text-sm">
                <p>Use menu commands or quick actions below to contact Nuno.</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={handleCopyEmail} className="desktop-action">
                    {copiedEmail ? "Email Copied" : "Copy Email"}
                  </button>
                  <a className="desktop-action" href={`mailto:${CONTACT_EMAIL}`}>
                    Send Email
                  </a>
                  <a className="desktop-action" href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                    Open LinkedIn
                  </a>
                  <a className="desktop-action" href={GITHUB_URL} target="_blank" rel="noreferrer">
                    Open GitHub
                  </a>
                </div>
                <p className="text-xs">
                  Direct contact: <strong>{CONTACT_EMAIL}</strong>
                </p>
              </div>
            ) : null}
          </div>,
          isDesktopLayout ? 980 : "100%"
        );

  const bootOverlay = bootPhase !== "ready" ? (
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
          {Array.from({ length: BOOT_PROGRESS_STEPS }, (_, index) => (
            <span key={`boot-cell-${index}`} className={`boot-progress-cell ${index < bootProgress ? "boot-progress-cell-filled" : ""}`} />
          ))}
        </div>
      </div>
    </div>
  ) : null;

  if (!hasMounted) {
    return (
      <main className="desktop-main desktop-main-booting">
        {bootOverlay}
      </main>
    );
  }

  return (
    <main className={`desktop-main desktop-main-${bootPhase}`}>
      <div className="desktop-shell desktop-desktop flex h-screen flex-col overflow-hidden">
        <header className="desktop-menu-bar border-b-2 border-black bg-white px-3 py-1 text-[11px] sm:px-5">
          <div className="mx-auto flex max-w-7xl items-center gap-2 sm:gap-3">
            <Image
              src="/branding/brand/zonumi-menu-icon.png"
              alt="Zonumi"
              width={18}
              height={18}
              priority
              className="block h-[18px] w-[18px] shrink-0 translate-y-px object-cover object-center [image-rendering:pixelated]"
            />
            {(["file", "view"] as MenuKey[]).map((menu) => (
              <div key={menu} className="relative" onClick={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setActiveMenu((current) => (current === menu ? null : menu))}
                  className={`px-2 py-0.5 ${activeMenu === menu ? "bg-black text-white" : "hover:bg-black hover:text-white"}`}
                >
                  {menu[0].toUpperCase() + menu.slice(1)}
                </button>
                {activeMenu === menu ? (
                  <div className="absolute left-0 top-[calc(100%+2px)] z-30 w-52 border-2 border-black bg-white p-1 shadow-[3px_3px_0_#000]">
                    {MENU_ITEMS[menu].map((action) => (
                      <button
                        key={action.label}
                        type="button"
                        onClick={() => {
                          if (action.windowId) {
                            setActivePanel("about");
                            showWindow(action.windowId);
                            setActiveMenu(null);
                            return;
                          }

                          if (action.panel) {
                            openPanel(action.panel);
                            return;
                          }

                          if (action.href && action.download) {
                            const link = document.createElement("a");
                            link.href = action.href;
                            link.download = "Nuno Castilho CV.pdf";
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            setActiveMenu(null);
                            return;
                          }

                          if (action.href) {
                            window.open(action.href, "_blank", "noreferrer");
                            setActiveMenu(null);
                          }
                        }}
                        className="block w-full px-2 py-1 text-left text-[11px] hover:bg-black hover:text-white"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            <p className="ml-auto hidden text-[11px] sm:block">
              {profile.company} <span className="px-1">|</span> {clockText}
            </p>
          </div>
        </header>

        <section className={`${isDesktopLayout ? "w-full flex-1 overflow-hidden px-0 py-0" : "mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-5 md:py-6"}`}>
          <div ref={canvasRef} className={`relative ${isDesktopLayout ? "h-full overflow-hidden" : "space-y-4"}`}>
            {activePanel === "about" ? aboutWindows : singlePanelWindow}
          </div>
        </section>
      </div>
      {bootOverlay}
    </main>
  );
}
