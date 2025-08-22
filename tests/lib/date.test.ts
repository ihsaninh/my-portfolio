import { describe, expect, it } from "bun:test";

import { formatDateUTC } from "../../src/lib/date";

describe("formatDateUTC", () => {
  it("formats valid date strings in UTC", () => {
    expect(formatDateUTC("2023-01-15", "en-US")).toBe("Jan 15, 2023");
  });

  it("returns empty string for invalid dates", () => {
    expect(formatDateUTC("not-a-date")).toBe("");
    expect(formatDateUTC(new Date("invalid"))).toBe("");
  });

  it("returns empty string when Intl throws (invalid locale)", () => {
    // Force Intl.DateTimeFormat to throw with an invalid locale tag
    expect(formatDateUTC("2023-05-01", "invalid-locale-tag")).toBe("");
  });

  it("is stable across time zones (always UTC)", () => {
    expect(formatDateUTC("2020-01-01T23:00:00Z", "en-US")).toBe("Jan 01, 2020");
  });

  it("accepts numeric timestamps", () => {
    const ts = Date.UTC(2020, 0, 2, 12, 34, 56); // 2020-01-02 in UTC
    expect(formatDateUTC(ts, "en-US")).toBe("Jan 02, 2020");
  });

  it("accepts Date objects", () => {
    const d = new Date(Date.UTC(1999, 11, 31, 23, 59, 59));
    expect(formatDateUTC(d, "en-US")).toBe("Dec 31, 1999");
  });

  it("normalizes offset times to UTC day", () => {
    // Jan 1st 23:30 at -05:00 is Jan 2nd in UTC
    const s = "2020-01-01T23:30:00-05:00";
    expect(formatDateUTC(s, "en-US")).toBe("Jan 02, 2020");
  });
});
