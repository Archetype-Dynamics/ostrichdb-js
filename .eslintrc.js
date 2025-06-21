// .eslintrc.js - Simplified ESLint configuration
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  extends: [
    'eslint:recommended'
  ],
  env: {
    node: true,
    es6: true,
    jest: true
  },
  rules: {
    // Basic rules that don't require TypeScript plugin configs
    'no-unused-vars': 'off', // Turned off in favor of @typescript-eslint version
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-undef': 'off' // TypeScript handles this
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off'
      }
    }
  ],
  ignorePatterns: [
    'dist/**/*',
    'node_modules/**/*',
    'coverage/**/*',
    '*.js',
    '*.mjs'
  ]
};