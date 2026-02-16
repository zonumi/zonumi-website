import Markdown from "react-markdown";

type EducationWindowContentProps = {
  certificationsContent: string;
};

export function EducationWindowContent({ certificationsContent }: EducationWindowContentProps) {
  return (
    <div className="desktop-window-content">
      {certificationsContent ? (
        <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-li:my-0.5 prose-ul:my-2">
          <Markdown>{certificationsContent}</Markdown>
        </div>
      ) : (
        <p className="text-sm">No certifications section found in profile content.</p>
      )}
    </div>
  );
}
