import "../../../tests/jest-dom.d.ts";
import "@testing-library/jest-dom";

import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, mock, test } from "bun:test";

import { RateLimitInfo } from "@/src/components/hire-me/RateLimitInfo";

// Mock fetch
const mockFetch = mock();
global.fetch = mockFetch as unknown as typeof fetch;

describe("RateLimitInfo", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  test("should not render when plenty of requests are available", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        remaining: 8,
        resetTime: Date.now() + 60000,
        resetInSeconds: 60,
      }),
    });

    render(<RateLimitInfo />);

    // Should not show anything when 8+ requests remain
    await waitFor(() => {
      expect(screen.queryByText(/request/)).toBeNull();
    });
  });

  test("should show warning when requests are low", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        remaining: 2,
        resetTime: Date.now() + 60000,
        resetInSeconds: 60,
      }),
    });

    render(<RateLimitInfo />);

    await waitFor(() => {
      expect(screen.getByText("2 requests remaining")).toBeInTheDocument();
    });
  });

  test("should show singular form for 1 request", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        remaining: 1,
        resetTime: Date.now() + 60000,
        resetInSeconds: 60,
      }),
    });

    render(<RateLimitInfo />);

    await waitFor(() => {
      expect(screen.getByText("1 request remaining")).toBeInTheDocument();
    });
  });

  test("should show exhausted state when no requests remain", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        remaining: 0,
        resetTime: Date.now() + 30000,
        resetInSeconds: 30,
      }),
    });

    render(<RateLimitInfo />);

    await waitFor(() => {
      expect(screen.getByText("Rate limit reached")).toBeInTheDocument();
      expect(screen.getByText("Resets in 30s")).toBeInTheDocument();
      expect(
        screen.getByText("Please wait before sending another message.")
      ).toBeInTheDocument();
    });
  });

  test("should call onRateLimitChange callback", async () => {
    const mockCallback = mock();
    const mockStatus = {
      remaining: 5,
      resetTime: Date.now() + 60000,
      resetInSeconds: 60,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStatus,
    });

    render(<RateLimitInfo onRateLimitChange={mockCallback} />);

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledWith(mockStatus);
    });
  });

  test("should handle fetch errors gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    const consoleError = mock();
    console.error = consoleError;

    render(<RateLimitInfo />);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        "Failed to fetch rate limit status:",
        expect.any(Error)
      );
    });
  });
});
