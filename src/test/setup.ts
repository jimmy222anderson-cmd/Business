import "@testing-library/jest-dom";

const originalWarn = console.warn;
const originalError = console.error;

const shouldSuppressTestNoise = (message: unknown): boolean => {
  const text = String(message ?? "");
  return (
    text.includes("React Router Future Flag Warning") ||
    text.includes("Not implemented: navigation (except hash changes)")
  );
};

console.warn = (...args: unknown[]) => {
  if (shouldSuppressTestNoise(args[0])) return;
  originalWarn(...(args as Parameters<typeof console.warn>));
};

console.error = (...args: unknown[]) => {
  if (shouldSuppressTestNoise(args[0])) return;
  originalError(...(args as Parameters<typeof console.error>));
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

// Polyfill ResizeObserver for jsdom (used by Radix UI components)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
