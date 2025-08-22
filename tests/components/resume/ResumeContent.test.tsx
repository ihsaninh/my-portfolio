import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "bun:test";

import ResumeContent from "../../../src/components/resume/ResumeContent";

afterEach(() => cleanup());

describe("ResumeContent", () => {
  it("renders title, description, and children", () => {
    render(
      <ResumeContent title="Section Title" description="Section description">
        <div data-testid="child">Child content</div>
      </ResumeContent>
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Section Title" })
    ).toBeTruthy();
    expect(screen.getByText("Section description")).toBeTruthy();
    expect(screen.getByTestId("child")).toBeTruthy();
  });
});
