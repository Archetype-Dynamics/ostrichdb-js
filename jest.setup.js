// jest.setup.js
const { TextEncoder, TextDecoder } = require('util');

// Polyfill for Node.js environment
Object.assign(global, { TextDecoder, TextEncoder });

// Mock fetch for unit tests if not available
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Set test timeout
jest.setTimeout(30000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});