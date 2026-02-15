"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Markdown from "react-markdown";
import type { Engagement, Profile } from "@/lib/markdown-utils";

type Panel = "about" | "skills" | "engagements" | "contact";
type MenuKey = "file" | "edit" | "view" | "special";
type WindowId =
  | "about-profile"
  | "about-certs"
  | "about-project"
  | "about-skills"
  | "panel-skills"
  | "panel-engagements"
  | "panel-contact";

type MacDesktopProps = {
  profile: Profile;
  engagements: Engagement[];
};

type MenuAction = {
  label: string;
  panel?: Panel;
  href?: string;
  windowId?: WindowId;
};

type WindowState = {
  x: number;
  y: number;
  z: number;
};

const CONTACT_EMAIL = "nuno.castilho@outlook.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/nuno-castilho";
const GITHUB_URL = "https://github.com/ncastilho";

const MENU_ITEMS: Record<MenuKey, MenuAction[]> = {
  file: [
    { label: "Open About Desktop", panel: "about" },
    { label: "Open Skills Window", panel: "skills" },
    { label: "Open Engagement Window", panel: "engagements" },
    { label: "Open Contact Window", panel: "contact" }
  ],
  edit: [
    { label: "Profile Summary", panel: "about" },
    { label: "Contact Actions", panel: "contact" }
  ],
  view: [
    { label: "System Profile", panel: "about", windowId: "about-profile" },
    { label: "Certifications", panel: "about", windowId: "about-certs" },
    { label: "Project Finder", panel: "about", windowId: "about-project" },
    { label: "Skills Desk Accessory", panel: "about", windowId: "about-skills" }
  ],
  special: [
    { label: "Email Nuno", panel: "contact" },
    { label: "LinkedIn", href: LINKEDIN_URL },
    { label: "GitHub", href: GITHUB_URL }
  ]
};

const INITIAL_WINDOWS: Record<WindowId, WindowState> = {
  "about-profile": { x: 20, y: 24, z: 1 },
  "about-certs": { x: 900, y: 24, z: 2 },
  "about-project": { x: 20, y: 306, z: 3 },
  "about-skills": { x: 900, y: 306, z: 4 },
  "panel-skills": { x: 56, y: 44, z: 5 },
  "panel-engagements": { x: 56, y: 44, z: 6 },
  "panel-contact": { x: 120, y: 72, z: 7 }
};

const PANEL_WINDOW_MAP: Record<Exclude<Panel, "about">, WindowId> = {
  skills: "panel-skills",
  engagements: "panel-engagements",
  contact: "panel-contact"
};
const ABOUT_WINDOWS: WindowId[] = ["about-profile", "about-certs", "about-project", "about-skills"];

function MacVerticalScroll({
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
    <div className={`mac-vscroll ${className ?? ""}`}>
      <div ref={scrollRef} className={`mac-vscroll-content ${contentClassName ?? ""}`}>
        {children}
      </div>
      <div className="mac-vscroll-rail">
        <button type="button" className="mac-vscroll-arrow mac-vscroll-arrow-up" aria-label="Scroll up" onClick={() => scrollByAmount(-96)} />
        <div className="mac-vscroll-track" />
        <button type="button" className="mac-vscroll-arrow mac-vscroll-arrow-down" aria-label="Scroll down" onClick={() => scrollByAmount(96)} />
      </div>
    </div>
  );
}

export function MacDesktop({ profile, engagements }: MacDesktopProps) {
  const [activePanel, setActivePanel] = useState<Panel>("about");
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null);
  const [selectedSlug, setSelectedSlug] = useState(engagements[0]?.slug ?? "");
  const [clockText, setClockText] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isDesktopLayout, setIsDesktopLayout] = useState(false);
  const [zCounter, setZCounter] = useState(20);
  const [windowPositions, setWindowPositions] = useState(INITIAL_WINDOWS);
  const [windowVisibility, setWindowVisibility] = useState<Record<WindowId, boolean>>({
    "about-profile": true,
    "about-certs": true,
    "about-project": true,
    "about-skills": true,
    "panel-skills": true,
    "panel-engagements": true,
    "panel-contact": true
  });
  const [activeWindowId, setActiveWindowId] = useState<WindowId>("about-skills");
  const dragRef = useRef<{ id: WindowId; offsetX: number; offsetY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const selectedEngagement = useMemo(
    () => engagements.find((engagement) => engagement.slug === selectedSlug) ?? engagements[0],
    [engagements, selectedSlug]
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
  const skillGroups = Object.keys(profile.skills).length;
  const totalSkills = Object.values(profile.skills).reduce((sum, skills) => sum + skills.length, 0);
  const certificationsCount = certificationsContent
    .split("\n")
    .filter((line) => line.trim().startsWith("- "))
    .length;

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
    if (!isDesktopLayout) {
      dragRef.current = null;
      return;
    }

    const onMouseMove = (event: MouseEvent) => {
      const drag = dragRef.current;
      const canvas = canvasRef.current;
      if (!drag || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, event.clientX - rect.left - drag.offsetX);
      const y = Math.max(0, event.clientY - rect.top - drag.offsetY);

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
      ? "System Profile"
      : activePanel === "skills"
        ? "Skills Desk Accessory"
        : activePanel === "engagements"
          ? "Project Finder"
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
      className={`mac-window ${activeWindowId === id ? "mac-window-active" : "mac-window-inactive"} ${isDesktopLayout ? "absolute" : ""} ${extraClass}`}
      style={getWindowStyle(id, width)}
      onMouseDown={() => (isDesktopLayout ? bringToFront(id) : null)}
      data-window-id={id}
    >
      <div className="mac-titlebar mac-drag-handle" onMouseDown={(event) => beginDrag(id, event)}>
        <button
          type="button"
          className="mac-close-box"
          aria-label={`Close ${title}`}
          onClick={(event) => {
            event.stopPropagation();
            closeWindow(id);
          }}
        />
        <h2>{title}</h2>
      </div>
      <div className="mac-subbar">{subbar}</div>
      {content}
    </section>
    ) : null
  );

  const renderProjectFinder = (constrainedHeight = false) => (
    <div className={`grid min-h-0 gap-3 lg:grid-cols-[220px_1fr] ${constrainedHeight ? "h-full" : ""}`}>
      <MacVerticalScroll className={`min-h-0 border-2 border-black bg-[#f7f7f7] ${constrainedHeight ? "h-full" : "max-h-[380px]"}`} contentClassName="p-1">
        {engagements.map((engagement) => (
          <button
            key={engagement.slug}
            type="button"
            onClick={() => setSelectedSlug(engagement.slug)}
            className={`block w-full border border-transparent px-2 py-1 text-left text-xs ${
              selectedEngagement?.slug === engagement.slug ? "bg-black text-white" : "hover:border-black"
            }`}
          >
            <span className="block font-semibold">{engagement.client}</span>
            <span className="block text-[11px]">{engagement.period}</span>
          </button>
        ))}
      </MacVerticalScroll>

      <MacVerticalScroll className={`min-h-0 border-2 border-black bg-[#f7f7f7] ${constrainedHeight ? "h-full" : "max-h-[380px]"}`} contentClassName="space-y-3 p-3">
        {selectedEngagement ? (
          <>
            <div>
              <h3 className="text-base">{selectedEngagement.client}</h3>
              <p className="text-xs">{selectedEngagement.role}</p>
              <p className="text-xs">{selectedEngagement.period}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {selectedEngagement.technologies.map((tech) => (
                <span key={tech} className="border border-black bg-white px-2 py-0.5 text-[11px]">
                  {tech}
                </span>
              ))}
            </div>

            <div className="prose prose-sm max-w-none prose-p:my-2 prose-li:my-0.5">
              <Markdown>{selectedEngagement.content}</Markdown>
            </div>
          </>
        ) : (
          <p className="text-sm">No engagements available.</p>
        )}
      </MacVerticalScroll>
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-3">
      {Object.entries(profile.skills).map(([group, skills]) => (
        <article key={group} className="border-2 border-black bg-[#f1f1f1] p-2">
          <h3 className="mb-2 text-xs uppercase">{group}</h3>
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
          <p>{engagements.length} engagements</p>
          <p>{totalSkills} skills</p>
        </>,
        <div className="mac-window-content space-y-4">
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
        <div className="mac-window-content">
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
        "Project Finder",
        <>
          <p>{engagements.length} items</p>
          <p>{selectedEngagement?.technologies.length ?? 0} tech tags</p>
          <p>{selectedEngagement?.period ?? "No period"}</p>
        </>,
        <div className="mac-window-content h-[320px] overflow-hidden xl:h-[460px]">{renderProjectFinder(true)}</div>,
        860
      )}

      {renderWindowFrame(
        "about-skills",
        "Skills Desk Accessory",
        <>
          <p>{skillGroups} groups</p>
          <p>{totalSkills} listed skills</p>
          <p>Cloud + Delivery</p>
        </>,
        <div className="mac-window-content h-[320px] overflow-hidden p-0 xl:h-[460px]">
          <MacVerticalScroll className="h-full min-h-0" contentClassName="p-3">
            {renderSkills()}
          </MacVerticalScroll>
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
          ) : activePanel === "engagements" ? (
            <>
              <p>{engagements.length} contracts</p>
              <p>{selectedEngagement?.technologies.length ?? 0} tech tags</p>
              <p>{selectedEngagement?.client ?? "No selection"}</p>
            </>
          ) : (
            <>
              <p>3 quick actions</p>
              <p>Email + LinkedIn + GitHub</p>
              <p>Response ready</p>
            </>
          ),
          <div className="mac-window-content">
            {activePanel === "skills" ? renderSkills() : null}
            {activePanel === "engagements" ? renderProjectFinder() : null}
            {activePanel === "contact" ? (
              <div className="space-y-4 text-sm">
                <p>Use menu commands or quick actions below to contact Nuno.</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={handleCopyEmail} className="mac-action">
                    {copiedEmail ? "Email Copied" : "Copy Email"}
                  </button>
                  <a className="mac-action" href={`mailto:${CONTACT_EMAIL}`}>
                    Send Email
                  </a>
                  <a className="mac-action" href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                    Open LinkedIn
                  </a>
                  <a className="mac-action" href={GITHUB_URL} target="_blank" rel="noreferrer">
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

  return (
    <main className="mac-desktop min-h-screen">
      <header className="mac-menu-bar border-b-2 border-black bg-white px-3 py-1 text-[11px] sm:px-5">
        <div className="mx-auto flex max-w-7xl items-center gap-2 sm:gap-3">
          <span className="text-base leading-none"></span>
          {(["file", "edit", "view", "special"] as MenuKey[]).map((menu) => (
            <div key={menu} className="relative" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                onClick={() => setActiveMenu((current) => (current === menu ? null : menu))}
                className={`mac-menu-button px-2 py-0.5 ${activeMenu === menu ? "bg-black text-white" : "hover:bg-black hover:text-white"}`}
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

      <section className={`${isDesktopLayout ? "w-full px-0 py-4 md:py-6" : "mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-5 md:py-6"}`}>
        <div ref={canvasRef} className={`relative ${isDesktopLayout ? "h-[980px]" : "space-y-4"}`}>
          {activePanel === "about" ? aboutWindows : singlePanelWindow}
        </div>
      </section>
    </main>
  );
}
