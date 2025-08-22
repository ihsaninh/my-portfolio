import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "bun:test";

import Timeline from "../../../src/components/resume/Timeline";
import type { ResumeData } from "../../../src/types/resume";

afterEach(() => cleanup());

const items: ResumeData[] = [
  {
    title: "Frontend Developer",
    company: "Example Corp",
    startDate: "Jan 2020",
    endDate: "Dec 2021",
    descriptions: ["Built UI components", "Collaborated with designers"],
  },
  {
    title: "Engineer",
    company: "Another Inc",
    startDate: "2022",
    endDate: "",
  },
];

describe("Timeline", () => {
  it("renders list with items and details", () => {
    render(<Timeline items={items} className="mt-6" />);

    // Wrapper with aria-label
    expect(screen.getByLabelText("Experience timeline")).toBeTruthy();

    // Titles
    expect(screen.getByText("Frontend Developer")).toBeTruthy();
    expect(screen.getByText("Engineer")).toBeTruthy();

    // Companies
    expect(screen.getByText("Example Corp")).toBeTruthy();
    expect(screen.getByText("Another Inc")).toBeTruthy();

    // Dates
    expect(screen.getByText(/Jan 2020\s-\sDec 2021/)).toBeTruthy();
    // No end date case should still render start date
    expect(screen.getByText("2022")).toBeTruthy();

    // Descriptions list appears only for first item
    expect(screen.getByText("Built UI components")).toBeTruthy();
    expect(screen.getByText("Collaborated with designers")).toBeTruthy();
  });
});
