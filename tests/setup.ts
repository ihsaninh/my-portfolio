import { GlobalRegistrator } from '@happy-dom/global-registrator';

// Register Happy-DOM globally
GlobalRegistrator.register();

// Global test setup for Bun test
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [];
  
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
} as any;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock requestAnimationFrame globally to prevent conflicts
Object.defineProperty(global, 'requestAnimationFrame', {
  value: (cb: FrameRequestCallback) => {
    setTimeout(cb, 0);
    return 1;
  },
  writable: true,
});

Object.defineProperty(global, 'cancelAnimationFrame', {
  value: (id: number) => {
    clearTimeout(id);
  },
  writable: true,
});

// Mock scrollTo globally
Object.defineProperty(window, 'scrollTo', {
  value: () => {},
  writable: true,
});

// Mock Element.prototype.scrollIntoView
if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = () => {};
}