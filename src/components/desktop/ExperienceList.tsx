type ExperienceListProps = {
  mergedExperience: Array<{ group: string; entries: string[] }>;
};

export function ExperienceList({ mergedExperience }: ExperienceListProps) {
  return (
    <div className="space-y-4">
      {mergedExperience.map(({ group, entries }) => (
        <article key={group} className="space-y-2">
          <h3 className="text-xs uppercase">{group}</h3>
          <ul className="flex flex-wrap gap-2">
            {entries.map((entry) => (
              <li key={`${group}-${entry}`} className="border border-black bg-white px-2 py-1 text-xs">
                {entry}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
