import Markdown from "react-markdown";

type EducationWindowContentProps = {
  educationContent: string;
};

export function EducationWindowContent({ educationContent }: EducationWindowContentProps) {
  return (
    <div className="desktop-window-content">
      {educationContent ? (
        <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-li:my-0.5 prose-ul:my-2">
          <Markdown>{educationContent}</Markdown>
        </div>
      ) : (
        <p className="text-sm">No education content found.</p>
      )}
    </div>
  );
}
