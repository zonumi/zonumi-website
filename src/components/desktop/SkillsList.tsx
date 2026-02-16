type SkillsListProps = {
  mergedSkills: Array<{ group: string; skills: string[] }>;
};

export function SkillsList({ mergedSkills }: SkillsListProps) {
  return (
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
}
