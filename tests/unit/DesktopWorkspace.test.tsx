import type { ImgHTMLAttributes } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
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

  it("opens, closes, and reopens the education window from the View menu", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderReadyWorkspace();

    expect(screen.getByTestId("window-about-certs")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Close Education"));
    expect(screen.queryByTestId("window-about-certs")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("menu-trigger-view"));
    await user.click(screen.getByTestId("menu-action-education"));

    expect(screen.getByTestId("window-about-certs")).toBeInTheDocument();
  });

  it("does not render a File menu", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderReadyWorkspace();
    await user.click(screen.getByTestId("menu-trigger-view"));
    expect(screen.queryByTestId("menu-trigger-file")).not.toBeInTheDocument();
  });

  it("filters skills by timeline slider and restores all skills on the rightmost position", () => {
    renderReadyWorkspace();

    const skillsWindow = screen.getByTestId("window-about-skills");
    const slider = within(skillsWindow).getByLabelText("Skills timeline filter");

    expect(within(skillsWindow).getByText("AWS")).toBeInTheDocument();
    expect(within(skillsWindow).getByText("Node.js")).toBeInTheDocument();

    fireEvent.change(slider, { target: { value: "1" } });

    expect(within(skillsWindow).getByText("React")).toBeInTheDocument();
    expect(within(skillsWindow).queryByText("Node.js")).not.toBeInTheDocument();
    expect(within(skillsWindow).queryByText("AWS")).not.toBeInTheDocument();

    fireEvent.change(slider, { target: { value: "2" } });

    expect(within(skillsWindow).getByText("AWS")).toBeInTheDocument();
    expect(within(skillsWindow).getByText("Node.js")).toBeInTheDocument();
  });
});
