import "@testing-library/jest-dom";

// Mock window.navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

// Mock fetch globally
global.fetch = jest.fn();
