import type { ImgHTMLAttributes } from "react";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DesktopWorkspace } from "@/components/DesktopWorkspace";
import type { Profile, Project } from "@/lib/markdown-utils";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ priority: _priority, ...props }: { priority?: boolean } & ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? ""} />;
  }
}));

const profile: Profile = {
  name: "Nuno Castilho",
  company: "Zonumi",
  content: "Profile summary\n\n## Certifications and Education\n\n- Cert A\n- Cert B"
};

const projects: Project[] = [
  {
    slug: "proj-one",
    client: "Client One",
    role: "Role One",
    period: "2020",
    logo: "",
    technologies: ["React", "TypeScript"],
    weight: 2,
    content: "Project one details"
  },
  {
    slug: "proj-two",
    client: "Client Two",
    role: "Role Two",
    period: "2022",
    logo: "",
    technologies: ["Node.js"],
    weight: 1,
    content: "Project two details"
  }
];

const skills = {
  Engineering: ["React", "Node.js"],
  Cloud: ["AWS"]
};

describe("DesktopWorkspace", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: jest.fn()
      }
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  const renderReadyWorkspace = () => {
    render(<DesktopWorkspace profile={profile} projects={projects} skills={skills} />);
    act(() => {
      jest.advanceTimersByTime(4000);
    });
  };

  it("switches selected project in the projects window", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderReadyWorkspace();

    const projectWindow = screen.getByTestId("window-about-project");
    expect(within(projectWindow).getByRole("heading", { name: "Client One" })).toBeInTheDocument();

    await user.click(screen.getByTestId("project-selector-proj-two"));

    expect(within(projectWindow).getByRole("heading", { name: "Client Two" })).toBeInTheDocument();
    expect(within(projectWindow).getByText("Role Two")).toBeInTheDocument();
  });

  it("opens, closes, and reopens the certifications window from the View menu", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderReadyWorkspace();

    expect(screen.queryByTestId("window-about-certs")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("menu-trigger-view"));
    await user.click(screen.getByTestId("menu-action-certifications"));

    expect(screen.getByTestId("window-about-certs")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Close Certifications & Education"));
    expect(screen.queryByTestId("window-about-certs")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("menu-trigger-view"));
    await user.click(screen.getByTestId("menu-action-certifications"));

    expect(screen.getByTestId("window-about-certs")).toBeInTheDocument();
  });

  it("triggers a CV download from the File menu action", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const anchorClickSpy = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    try {
      renderReadyWorkspace();

      await user.click(screen.getByTestId("menu-trigger-file"));
      await user.click(screen.getByTestId("menu-action-download-cv"));

      expect(anchorClickSpy).toHaveBeenCalledTimes(1);
    } finally {
      anchorClickSpy.mockRestore();
    }
  });
});
