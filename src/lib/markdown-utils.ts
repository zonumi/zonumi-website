import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Engagement = {
  slug: string;
  client: string;
  role: string;
  period: string;
  technologies: string[];
  weight: number;
  content: string;
};

export type Profile = {
  name: string;
  company: string;
  skills: Record<string, string[]>;
  content: string;
};

const CONTENT_ROOT = path.join(process.cwd(), "content");
const ENGAGEMENTS_DIR = path.join(CONTENT_ROOT, "engagements");
const PROFILE_FILE = path.join(CONTENT_ROOT, "profile.md");

function readMarkdownFile(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf8");
  return matter(raw);
}

export function getAllEngagements(): Engagement[] {
  const files = fs
    .readdirSync(ENGAGEMENTS_DIR)
    .filter((file) => file.endsWith(".md"));

  return files
    .map((fileName) => {
      const filePath = path.join(ENGAGEMENTS_DIR, fileName);
      const { data, content } = readMarkdownFile(filePath);

      return {
        slug: fileName.replace(/\.md$/, ""),
        client: String(data.client ?? ""),
        role: String(data.role ?? ""),
        period: String(data.period ?? ""),
        technologies: Array.isArray(data.technologies)
          ? data.technologies.map((tech) => String(tech))
          : [],
        weight: Number(data.weight ?? 0),
        content
      };
    })
    .sort((a, b) => b.weight - a.weight);
}

export function getProfile(): Profile {
  const { data, content } = readMarkdownFile(PROFILE_FILE);

  return {
    name: String(data.name ?? ""),
    company: String(data.company ?? ""),
    skills: (data.skills as Record<string, string[]>) ?? {},
    content
  };
}

export function getTechnologies(engagements: Engagement[]): string[] {
  const uniqueTech = new Set<string>();

  engagements.forEach((engagement) => {
    engagement.technologies.forEach((tech) => uniqueTech.add(tech));
  });

  return Array.from(uniqueTech).sort((a, b) => a.localeCompare(b));
}
