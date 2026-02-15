"use client";

import Image from "next/image";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Markdown from "react-markdown";
import type { Project, Profile } from "@/lib/markdown-utils";

type Panel = "about" | "skills" | "projects" | "contact";
type MenuKey = "file" | "view";
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

const CONTACT_EMAIL = "nuno.castilho@outlook.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/nuno-castilho";
const GITHUB_URL = "https://github.com/ncastilho";
const CV_DOWNLOAD_PATH = "/files/nuno-castilho-cv.pdf";

const MENU_ITEMS: Record<MenuKey, MenuAction[]> = {
  file: [{ label: "Download CV", href: CV_DOWNLOAD_PATH, download: true }],
  view: [
    { label: "User Profile", panel: "about", windowId: "about-profile" },
    { label: "Certifications", panel: "about", windowId: "about-certs" },
    { label: "Projects", panel: "about", windowId: "about-project" },
    { label: "Skills Desk", panel: "about", windowId: "about-skills" }
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

const TECHNOLOGY_CATEGORY_OVERRIDES: Record<string, string> = {
  Angular: "Frameworks",
  Bootstrap: "Frameworks",
  Hibernate: "Frameworks",
  "Java EE": "Frameworks",
  JPA: "Frameworks",
  jQuery: "Frameworks",
  JSF: "Frameworks",
  Redux: "Frameworks",
  Spring: "Frameworks",
  "Spring Cloud Gateway": "Frameworks",
  "Spring MVC": "Frameworks",
  "Spring Security": "Frameworks",
  "Spring Webflow": "Frameworks",
  WebFlux: "Frameworks",
  EKS: "Infrastructure",
  Fargate: "Infrastructure",
  S3: "Infrastructure",
  Elasticsearch: "Databases",
  Flyway: "Databases",
  RDS: "Databases",
  SQS: "Messaging",
  Mule: "APIs & Integration",
  ClearCase: "CI/CD",
  Octopus: "CI/CD",
  "OpenTelemetry": "Practices",
  "X-Ray": "Practices",
  Cucumber: "Practices",
  Apigee: "APIs & Integration",
  "IBM AS/400": "APIs & Integration",
  JSR286: "APIs & Integration",
  Salesforce: "APIs & Integration",
  WSRP: "APIs & Integration",
  JWT: "Security & Identity",
  OAuth2: "Security & Identity",
  SAML2: "Security & Identity",
  JBoss: "Platforms & Middleware",
  Jetty: "Platforms & Middleware",
  OSGi: "Platforms & Middleware",
  Tomcat: "Platforms & Middleware",
  WebCenter: "Platforms & Middleware",
  "WebSphere Commerce": "Platforms & Middleware",
  Eclipse: "Developer Tooling",
  Jira: "Developer Tooling",
  JMeter: "Developer Tooling",
  ASP: "Web & Markup",
  CSS: "Web & Markup",
  HTML: "Web & Markup",
  VBScript: "Web & Markup",
  "Active Directory": "Operating Systems & Networking",
  DHCP: "Operating Systems & Networking",
  DNS: "Operating Systems & Networking",
  "Exchange 2000": "Operating Systems & Networking",
  IIS5: "Operating Systems & Networking",
  "ISA 2000/2004": "Operating Systems & Networking",
  POP3: "Operating Systems & Networking",
  SMTP: "Operating Systems & Networking",
  VPN: "Operating Systems & Networking",
  Windows: "Operating Systems & Networking",
  "Windows 2000": "Operating Systems & Networking",
  "Windows NT": "Operating Systems & Networking",
  "Windows NT4": "Operating Systems & Networking",
  WINS: "Operating Systems & Networking",
  "Desktop Installation": "Operations & Support",
  "Desktop Rollout": "Operations & Support",
  "Network Administration": "Operations & Support",
  "Shell Scripting": "Operations & Support",
  "Small Office Networks": "Operations & Support",
  "Technical Support": "Operations & Support",
  "Visual Basic": "Languages"
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

export function DesktopWorkspace({ profile, projects }: DesktopWorkspaceProps) {
  const [hasMounted, setHasMounted] = useState(false);
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
  const mergedSkills = useMemo(() => {
    const grouped = new Map<string, Set<string>>();

    Object.entries(profile.skills).forEach(([group, skills]) => {
      grouped.set(group, new Set(skills));
    });

    const knownSkills = new Set(Array.from(grouped.values()).flatMap((skills) => Array.from(skills)));

    projects.forEach((project) => {
      project.technologies.forEach((technology) => {
        if (knownSkills.has(technology)) {
          return;
        }

        const targetGroup = TECHNOLOGY_CATEGORY_OVERRIDES[technology] ?? "Additional Technologies";
        if (!grouped.has(targetGroup)) {
          grouped.set(targetGroup, new Set());
        }

        grouped.get(targetGroup)?.add(technology);
        knownSkills.add(technology);
      });
    });

    return Array.from(grouped.entries()).map(([group, skills]) => ({
      group,
      skills: Array.from(skills).sort((a, b) => a.localeCompare(b))
    }));
  }, [projects, profile.skills]);
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
      ? "User Profile"
      : activePanel === "skills"
        ? "Skills Desk"
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
        "System Profile",
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
          <p>Professional track</p>
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
        "Project Explorer",
        <>
          <p>{projects.length} projects</p>
          <p>{selectedProject?.technologies.length ?? 0} skills</p>
          <p>{selectedProject?.period ?? "No period"}</p>
        </>,
        <div className="desktop-window-content h-[320px] overflow-hidden xl:h-[460px]">{renderProjectFinder(true)}</div>,
        860
      )}

      {renderWindowFrame(
        "about-skills",
        "Skills Desk",
        <>
          <p>{skillGroups} groups</p>
          <p>{totalSkills} listed skills</p>
          <p>Cloud + Delivery</p>
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
              <p>{totalSkills} listed skills</p>
              <p>Capability index</p>
            </>
          ) : activePanel === "projects" ? (
            <>
              <p>{projects.length} projects</p>
              <p>{selectedProject?.technologies.length ?? 0} skills</p>
              <p>{selectedProject?.client ?? "No selection"}</p>
            </>
          ) : (
            <>
              <p>3 quick actions</p>
              <p>Email + LinkedIn + GitHub</p>
              <p>Response ready</p>
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

  if (!hasMounted) {
    return <main className="desktop-desktop flex h-screen flex-col overflow-hidden" />;
  }

  return (
    <main className="desktop-desktop flex h-screen flex-col overflow-hidden">
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
    </main>
  );
}
