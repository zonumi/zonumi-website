import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Project = {
  slug: string;
  client: string;
  role: string;
  period: string;
  logo: string;
  technologies: string[];
  weight: number;
  content: string;
};

export type Profile = {
  name: string;
  company: string;
  content: string;
};

export type Education = {
  content: string;
};

export type ExperienceContent = {
  experience: Record<string, string[]>;
  content: string;
};

const CONTENT_ROOT = path.join(process.cwd(), "content");
const PROJECTS_DIR = path.join(CONTENT_ROOT, "projects");
const PROFILE_FILE = path.join(CONTENT_ROOT, "profile.md");
const EDUCATION_FILE = path.join(CONTENT_ROOT, "education.md");
const EXPERIENCE_FILE = path.join(CONTENT_ROOT, "experience.md");

function readMarkdownFile(filePath: string) {
  const raw = fs.readFileSync(filePath, "utf8");
  return matter(raw);
}

function normalizeExperience(value: unknown): Record<string, string[]> {
  if (!value || typeof value !== "object") return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([group, entries]) => [
      String(group),
      Array.isArray(entries) ? entries.map((entry) => String(entry)) : []
    ])
  );
}

export function getAllProjects(): Project[] {
  const files = fs
    .readdirSync(PROJECTS_DIR)
    .filter((file) => file.endsWith(".md"));

  return files
    .map((fileName) => {
      const filePath = path.join(PROJECTS_DIR, fileName);
      const { data, content } = readMarkdownFile(filePath);

      return {
        slug: fileName.replace(/\.md$/, ""),
        client: String(data.client ?? ""),
        role: String(data.role ?? ""),
        period: String(data.period ?? ""),
        logo: String(data.logo ?? ""),
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
    content
  };
}

export function getExperience(): ExperienceContent {
  const { data, content } = readMarkdownFile(EXPERIENCE_FILE);

  return {
    experience: normalizeExperience(data.experience),
    content
  };
}

export function getEducation(): Education {
  const { content } = readMarkdownFile(EDUCATION_FILE);

  return {
    content
  };
}
