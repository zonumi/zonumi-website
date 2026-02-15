"use client";

import { useEffect, useMemo, useState } from "react";
import Markdown from "react-markdown";
import type { Engagement, Profile } from "@/lib/markdown-utils";

type Panel = "about" | "skills" | "engagements" | "contact";
type MenuKey = "file" | "view" | "go" | "help";

type MacDesktopProps = {
  profile: Profile;
  engagements: Engagement[];
};

type MenuAction = {
  label: string;
  panel?: Panel;
  href?: string;
};

const CONTACT_EMAIL = "nuno.castilho@outlook.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/nuno-castilho";
const GITHUB_URL = "https://github.com/ncastilho";

const MENU_ITEMS: Record<MenuKey, MenuAction[]> = {
  file: [
    { label: "Open About", panel: "about" },
    { label: "Open Skills", panel: "skills" },
    { label: "Open Engagements", panel: "engagements" },
    { label: "Open Contact", panel: "contact" }
  ],
  view: [
    { label: "Profile Summary", panel: "about" },
    { label: "Core Skills", panel: "skills" },
    { label: "Client Timeline", panel: "engagements" }
  ],
  go: [
    { label: "Email Zonumi", panel: "contact" },
    { label: "LinkedIn", href: LINKEDIN_URL },
    { label: "GitHub", href: GITHUB_URL }
  ],
  help: [{ label: "How To Use", panel: "about" }]
};

export function MacDesktop({ profile, engagements }: MacDesktopProps) {
  const [activePanel, setActivePanel] = useState<Panel>("about");
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null);
  const [selectedSlug, setSelectedSlug] = useState(engagements[0]?.slug ?? "");
  const [clockText, setClockText] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);

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

  const openPanel = (panel: Panel) => {
    setActivePanel(panel);
    setActiveMenu(null);
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

  const renderProjectFinder = (constrainedHeight = false) => (
    <div className={`grid gap-3 lg:grid-cols-[220px_1fr] ${constrainedHeight ? "h-full" : ""}`}>
      <nav
        className={`mac-scroll border-2 border-black bg-[#f7f7f7] p-1 ${
          constrainedHeight ? "h-full overflow-y-scroll" : "max-h-[380px] overflow-y-auto"
        }`}
      >
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
      </nav>

      <article className={`space-y-3 border-2 border-black bg-[#f7f7f7] p-3 ${constrainedHeight ? "h-full overflow-y-scroll" : ""}`}>
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
      </article>
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

  return (
    <main className="mac-desktop min-h-screen">
      <header className="mac-menu-bar border-b-2 border-black bg-white px-3 py-1 text-[11px] sm:px-5">
        <div className="mx-auto flex max-w-7xl items-center gap-2 sm:gap-3">
          <span className="text-base leading-none"></span>
          {(["file", "view", "go", "help"] as MenuKey[]).map((menu) => (
            <div key={menu} className="relative" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                onClick={() => setActiveMenu((current) => (current === menu ? null : menu))}
                className={`px-2 py-0.5 uppercase ${activeMenu === menu ? "bg-black text-white" : "hover:bg-black hover:text-white"}`}
              >
                {menu}
              </button>
              {activeMenu === menu ? (
                <div className="absolute left-0 top-[calc(100%+2px)] z-30 w-52 border-2 border-black bg-white p-1 shadow-[3px_3px_0_#000]">
                  {MENU_ITEMS[menu].map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => {
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

      <section className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-5 md:py-6">
        <div className="space-y-4">
          {activePanel === "about" ? (
            <>
              <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr] xl:grid-rows-[auto_auto]">
                <section className="mac-window xl:col-start-1 xl:row-start-1">
                  <div className="mac-titlebar">
                    <span className="mac-dot" />
                    <h1>System Profile</h1>
                    <span className="mac-dot" />
                  </div>
                  <div className="mac-window-content space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide">{profile.company}</p>
                      <h2 className="mt-1 text-lg">{profile.name}</h2>
                    </div>
                    <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-li:my-0.5 prose-ul:my-2">
                      <Markdown>{aboutSummaryContent}</Markdown>
                    </div>
                  </div>
                </section>

                <section className="mac-window xl:col-start-2 xl:row-start-1">
                  <div className="mac-titlebar">
                    <span className="mac-dot" />
                    <h2>Certifications & Education</h2>
                    <span className="mac-dot" />
                  </div>
                  <div className="mac-window-content">
                    {certificationsContent ? (
                      <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-li:my-0.5 prose-ul:my-2">
                        <Markdown>{certificationsContent}</Markdown>
                      </div>
                    ) : (
                      <p className="text-sm">No certifications section found in profile content.</p>
                    )}
                  </div>
                </section>

                <section className="mac-window xl:col-start-1 xl:row-start-2">
                  <div className="mac-titlebar">
                    <span className="mac-dot" />
                    <h2>Project Finder</h2>
                    <span className="mac-dot" />
                  </div>
                  <div className="mac-window-content h-[320px] xl:h-[460px]">{renderProjectFinder(true)}</div>
                </section>

                <section className="mac-window xl:col-start-2 xl:row-start-2">
                  <div className="mac-titlebar">
                    <span className="mac-dot" />
                    <h2>Skills Desk Accessory</h2>
                    <span className="mac-dot" />
                  </div>
                  <div className="mac-scroll mac-window-content h-[320px] overflow-y-scroll xl:h-[460px]">{renderSkills()}</div>
                </section>
              </div>
            </>
          ) : (
            <section className="mac-window">
              <div className="mac-titlebar">
                <span className="mac-dot" />
                <h1>{panelTitle}</h1>
                <span className="mac-dot" />
              </div>
              <div className="mac-window-content">
                {activePanel === "skills" ? renderSkills() : null}

                {activePanel === "engagements" ? renderProjectFinder() : null}

                {activePanel === "contact" ? (
                  <div className="space-y-4 text-sm">
                    <p>Use menu commands or quick actions below to contact Zonumi.</p>
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
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
