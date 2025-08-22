import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import React from "react";

import LazyOnView from "../../../src/components/shared/LazyOnView";

// Extend IntersectionObserver with fields we use in the fake implementation
type TestIO = IntersectionObserver & {
  cb: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  observed: Element | null;
};

describe("LazyOnView", () => {
  let lastObserver: TestIO | null = null;

  beforeEach(() => {
    // Fake IntersectionObserver that we can trigger manually
    class FakeIO implements IntersectionObserver {
      root: Element | Document | null = null;
      rootMargin: string = "";
      thresholds: readonly number[] = [];
      public cb: IntersectionObserverCallback;
      public options?: IntersectionObserverInit;
      public observed: Element | null = null;
      public unobserve = mock((el: Element) => {
        void el;
      });
      constructor(
        cb: IntersectionObserverCallback,
        options?: IntersectionObserverInit
      ) {
        this.cb = cb;
        this.options = options;
        lastObserver = this as TestIO;
      }
      observe = (el: Element) => {
        this.observed = el;
      };
      disconnect = () => {};
      takeRecords = () => [] as IntersectionObserverEntry[];
    }

    global.IntersectionObserver = FakeIO;
  });

  afterEach(() => {
    cleanup();
  });

  it("renders children when intersecting and unobserves when once=true", () => {
    render(
      <LazyOnView>
        <div>Loaded content</div>
      </LazyOnView>
    );

    // Initially not visible
    expect(screen.queryByText("Loaded content")).toBeNull();

    // Simulate intersection
    act(() => {
      lastObserver!.cb(
        [
          {
            isIntersecting: true,
            target: lastObserver!.observed!,
          } as unknown as IntersectionObserverEntry,
        ],
        lastObserver as IntersectionObserver
      );
    });

    expect(screen.getByText("Loaded content")).toBeTruthy();
    expect(lastObserver!.unobserve).toHaveBeenCalledWith(
      lastObserver!.observed
    );
  });

  it("cleans up observer when once=false via effect cleanup", () => {
    render(
      <LazyOnView once={false}>
        <div>Shown</div>
      </LazyOnView>
    );

    act(() => {
      lastObserver!.cb(
        [
          {
            isIntersecting: true,
            target: lastObserver!.observed!,
          } as unknown as IntersectionObserverEntry,
        ],
        lastObserver as IntersectionObserver
      );
    });

    expect(screen.getByText("Shown")).toBeTruthy();
    // Should unobserve during effect cleanup when visible switches to true
    expect(lastObserver!.unobserve).toHaveBeenCalled();
  });
});
