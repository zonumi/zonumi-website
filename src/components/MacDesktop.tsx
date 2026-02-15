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
    { label: "LinkedIn", href: "https://www.linkedin.com/in/nuno-castilho" }
  ],
  help: [{ label: "How To Use", panel: "about" }]
};

const DESKTOP_ICONS: Array<{ id: Panel; label: string; glyph: string }> = [
  { id: "about", label: "About", glyph: "▤" },
  { id: "skills", label: "Skills", glyph: "⌘" },
  { id: "engagements", label: "Engagements", glyph: "▣" },
  { id: "contact", label: "Contact", glyph: "✉" }
];

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
      await navigator.clipboard.writeText("nuno@zonumi.com");
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 1500);
    } catch {
      window.location.href = "mailto:nuno@zonumi.com";
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

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-3 py-4 sm:px-5 md:grid-cols-[104px_1fr] md:py-6">
        <aside className="desktop-icons flex gap-3 md:flex-col md:gap-4">
          {DESKTOP_ICONS.map((icon) => (
            <button
              key={icon.id}
              type="button"
              onClick={() => openPanel(icon.id)}
              className={`desktop-icon group ${activePanel === icon.id ? "selected" : ""}`}
            >
              <span className="desktop-icon-glyph">{icon.glyph}</span>
              <span className="desktop-icon-label">{icon.label}</span>
            </button>
          ))}
        </aside>

        <div className="space-y-4">
          <section className="mac-window">
            <div className="mac-titlebar">
              <span className="mac-dot" />
              <h1>{panelTitle}</h1>
              <span className="mac-dot" />
            </div>
            <div className="mac-window-content">
              {activePanel === "about" ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide">{profile.company}</p>
                    <h2 className="mt-1 text-lg">{profile.name}</h2>
                  </div>
                  <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-li:my-0.5 prose-ul:my-2">
                    <Markdown>{profile.content}</Markdown>
                  </div>
                </div>
              ) : null}

              {activePanel === "skills" ? (
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
              ) : null}

              {activePanel === "engagements" ? (
                <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
                  <nav className="mac-scroll max-h-[380px] overflow-y-auto border-2 border-black bg-[#f7f7f7] p-1">
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

                  <article className="space-y-3 border-2 border-black bg-[#f7f7f7] p-3">
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
              ) : null}

              {activePanel === "contact" ? (
                <div className="space-y-4 text-sm">
                  <p>Use menu commands or quick actions below to contact Zonumi.</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={handleCopyEmail} className="mac-action">
                      {copiedEmail ? "Email Copied" : "Copy Email"}
                    </button>
                    <a className="mac-action" href="mailto:nuno@zonumi.com">
                      Send Email
                    </a>
                    <a className="mac-action" href="https://www.linkedin.com/in/nuno-castilho" target="_blank" rel="noreferrer">
                      Open LinkedIn
                    </a>
                  </div>
                  <p className="text-xs">
                    Direct contact: <strong>nuno@zonumi.com</strong>
                  </p>
                </div>
              ) : null}
            </div>
          </section>

          <section className="mac-window hidden md:block">
            <div className="mac-titlebar">
              <span className="mac-dot" />
              <h2>Desktop Notes</h2>
              <span className="mac-dot" />
            </div>
            <div className="mac-window-content text-xs leading-relaxed">
              <p>
                This interface recreates a classic monochrome Macintosh desktop: top menu bar, icon launchers, stacked windows, high-contrast controls, and
                single-click command navigation.
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
