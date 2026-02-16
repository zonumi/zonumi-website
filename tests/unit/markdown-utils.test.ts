import { getAllProjects, getExperience, getProfile } from "@/lib/markdown-utils";

describe("markdown-utils", () => {
  it("loads projects sorted by descending weight", () => {
    const projects = getAllProjects();

    expect(projects.length).toBeGreaterThan(0);
    expect(projects.every((project) => project.slug.length > 0)).toBe(true);
    expect(projects.every((project) => typeof project.client === "string")).toBe(true);
    expect(projects.every((project) => Array.isArray(project.technologies))).toBe(true);

    for (let index = 1; index < projects.length; index += 1) {
      expect(projects[index - 1].weight).toBeGreaterThanOrEqual(projects[index].weight);
    }
  });

  it("loads profile metadata and markdown content", () => {
    const profile = getProfile();

    expect(profile.name.trim().length).toBeGreaterThan(0);
    expect(profile.company.trim().length).toBeGreaterThan(0);
    expect(profile.content.trim().length).toBeGreaterThan(0);
  });

  it("loads normalized experience groups", () => {
    const experience = getExperience();

    expect(typeof experience.content).toBe("string");
    expect(Object.keys(experience.experience).length).toBeGreaterThan(0);

    Object.values(experience.experience).forEach((group) => {
      expect(Array.isArray(group)).toBe(true);
      expect(group.every((entry) => typeof entry === "string")).toBe(true);
    });
  });
});
