import Markdown from "react-markdown";
import { ContactActions } from "@/components/ContactActions";
import { EngagementTimeline } from "@/components/EngagementTimeline";
import { PrintButton } from "@/components/PrintButton";
import { getAllEngagements, getProfile, getTechnologies } from "@/lib/markdown-utils";

export const dynamic = "force-static";

export default function HomePage() {
  const profile = getProfile();
  const engagements = getAllEngagements();
  const technologies = getTechnologies(engagements);

  return (
    <main className="relative min-h-screen overflow-x-hidden print:bg-white print:text-black">
      <div className="pointer-events-none absolute inset-0 bg-grid [background-size:56px_56px] opacity-20" />
      <div className="pointer-events-none absolute inset-0 bg-scanline opacity-70" />
      <div className="pointer-events-none absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-neon-500/20 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-7 px-5 pb-12 pt-8 md:px-8 print:max-w-none print:px-0">
        <header className="print-letterhead soft-reveal rounded-2xl border border-ink-300/25 bg-ink-900/75 p-6 shadow-card backdrop-blur-md print:rounded-none print:border-b print:border-black print:bg-transparent print:p-0 print:pb-5">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4 text-xs uppercase tracking-[0.2em] text-ink-100 print:text-black">
            <p className="rounded-full border border-ink-300/35 bg-ink-800/70 px-3 py-1 font-mono">zonumi // engineering consultancy</p>
            <p className="font-mono text-neon-400 print:text-black">status: available for senior contracts</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-neon-400 print:text-black">{profile.company}</p>
              <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-ink-25 md:text-5xl print:text-2xl print:text-black">
                Cloud-Native Software Engineering for Teams That Can&apos;t Afford Production Surprises
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-ink-50 print:text-black">
                I&apos;m {profile.name}, a senior engineer partnering with CTOs to build resilient platforms, modernize legacy systems, and accelerate delivery in high-pressure product environments.
              </p>

              <div className="no-print mt-6 flex flex-wrap items-center gap-3">
                <PrintButton />
                <a
                  href="#engagements"
                  className="rounded-md border border-ink-300/45 bg-ink-800/70 px-4 py-2 text-sm text-ink-50 transition hover:border-neon-400 hover:text-neon-300"
                >
                  Inspect Engagements
                </a>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 print:hidden">
                <div className="rounded-lg border border-ink-300/25 bg-ink-800/65 p-3">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-100">Experience</dt>
                  <dd className="mt-1 text-xl font-semibold text-ink-25">17+ yrs</dd>
                </div>
                <div className="rounded-lg border border-ink-300/25 bg-ink-800/65 p-3">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-100">Engagements</dt>
                  <dd className="mt-1 text-xl font-semibold text-ink-25">{engagements.length}</dd>
                </div>
                <div className="rounded-lg border border-ink-300/25 bg-ink-800/65 p-3">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-100">Core Stack</dt>
                  <dd className="mt-1 text-xl font-semibold text-ink-25">{technologies.length} techs</dd>
                </div>
              </dl>
            </div>

            <aside className="terminal-frame rounded-xl border border-neon-400/35 bg-ink-800/80 p-4 shadow-glow print:border-black print:bg-transparent">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <p className="ml-auto font-mono text-[11px] uppercase tracking-[0.2em] text-ink-100">session.prod</p>
              </div>
              <div className="space-y-2.5 font-mono text-xs text-ink-50 print:text-black">
                <p>
                  <span className="text-neon-300">$</span> profile --focus
                </p>
                <p className="pl-3 text-ink-100">Payments, commerce, distributed services</p>
                <p>
                  <span className="text-neon-300">$</span> architecture --style
                </p>
                <p className="pl-3 text-ink-100">Microservices, event-driven design, cloud-native patterns</p>
                <p>
                  <span className="text-neon-300">$</span> deployment --default
                </p>
                <p className="pl-3 text-ink-100">AWS + Kubernetes + CI/CD + observability</p>
                <p>
                  <span className="text-neon-300">$</span> output
                </p>
                <p className="pl-3 text-ink-100">Faster releases. Stable systems. Clear engineering decisions.</p>
              </div>
            </aside>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1fr_330px] print:grid-cols-1">
          <article className="soft-reveal rounded-xl border border-ink-300/25 bg-ink-900/65 p-5 shadow-card print:border-black print:bg-transparent">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.22em] text-neon-400 print:text-black">Profile / Summary</h2>
            <div className="prose prose-invert prose-sm max-w-none prose-p:text-ink-50 prose-strong:text-ink-25 prose-li:text-ink-50 print:prose-black">
              <Markdown>{profile.content}</Markdown>
            </div>
          </article>

          <aside className="soft-reveal rounded-xl border border-ink-300/25 bg-ink-900/65 p-5 shadow-card print:border-black print:bg-transparent">
            <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-neon-400 print:text-black">Core Competencies</h2>
            <div className="space-y-4">
              {Object.entries(profile.skills).map(([group, skills]) => (
                <div key={group}>
                  <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-signal-400 print:text-black">{group}</h3>
                  <ul className="flex flex-wrap gap-2">
                    {skills.slice(0, 6).map((skill) => (
                      <li
                        key={`${group}-${skill}`}
                        className="rounded-md border border-ink-300/35 bg-ink-800/80 px-2.5 py-1 font-mono text-xs text-ink-50 print:border-black print:bg-transparent print:text-black"
                      >
                        {skill}
                      </li>
                    ))}
                    {skills.length > 6 ? (
                      <li className="rounded-md border border-neon-300/35 bg-neon-400/10 px-2.5 py-1 font-mono text-xs text-neon-300 print:border-black print:bg-transparent print:text-black">
                        +{skills.length - 6} more
                      </li>
                    ) : null}
                  </ul>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section id="engagements" className="print-break-before soft-reveal">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-[0.24em] text-neon-400 print:text-black">Delivery Timeline</h2>
            <p className="no-print font-mono text-xs text-ink-100">{engagements.length} contracts indexed</p>
          </div>
          <EngagementTimeline engagements={engagements} technologies={technologies} />
        </section>

        <footer className="flex flex-col gap-3 border-t border-ink-300/20 pt-5 print:hidden md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-100">
            © {new Date().getFullYear()} {profile.company}
          </p>
          <ContactActions email="nuno@zonumi.com" linkedinUrl="https://www.linkedin.com/in/nuno-castilho" />
        </footer>
      </div>
    </main>
  );
}
