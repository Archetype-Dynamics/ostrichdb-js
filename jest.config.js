module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**/*',
    '!src/examples/**/*',
    '!src/setup.ts', // Exclude setup utilities from coverage
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'clover'
  ],
  // Temporarily lower thresholds for initial release
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 75,
      statements: 75
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/setup.ts'],
  testTimeout: 30000,
  verbose: true
};