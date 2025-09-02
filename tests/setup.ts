import "@testing-library/jest-dom";

import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { mock } from "bun:test";
import React from "react";

GlobalRegistrator.register();

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.IntersectionObserver = class IntersectionObserver
  implements IntersectionObserver
{
  root = null;
  rootMargin = "";
  thresholds: readonly number[] = [];

  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {
    void callback;
    void options;
  }
  observe(target: Element): void {
    void target;
  }
  unobserve(target: Element): void {
    void target;
  }
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
};

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

Object.defineProperty(global, "requestAnimationFrame", {
  value: (cb: FrameRequestCallback) => {
    setTimeout(cb, 0);
    return 1;
  },
  writable: true,
});

Object.defineProperty(global, "cancelAnimationFrame", {
  value: (id: number) => {
    clearTimeout(id);
  },
  writable: true,
});

Object.defineProperty(window, "scrollTo", {
  value: () => {},
  writable: true,
});

if (typeof Element !== "undefined") {
  Element.prototype.scrollIntoView = () => {};
}

// Global mock for next/image to prevent boolean prop warnings (fill, priority)
mock.module("next/image", () => ({
  default: (
    props: React.ComponentPropsWithoutRef<"img"> & {
      fill?: boolean;
      priority?: boolean;
    }
  ) => {
    const {
      src,
      alt,
      width,
      height,
      className,
      fill,
      priority,
      style,
      ...rest
    } = props;
    const imgStyle = { ...(style || {}) } as React.CSSProperties;
    void fill;
    const elProps: React.ImgHTMLAttributes<HTMLImageElement> & {
      "data-priority"?: string;
    } = {
      ...rest,
      src,
      alt,
      className,
      style: imgStyle,
      "data-priority": String(!!priority),
    };
    if (typeof width === "number") elProps.width = width;
    if (typeof height === "number") elProps.height = height;
    return React.createElement("img", elProps);
  },
}));
