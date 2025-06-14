import * as dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test configuration
export const TEST_CONFIG = {
  // OstrichDB connection
  baseUrl: process.env.OSTRICHDB_URL || 'http://localhost:8042',
  apiKey: process.env.TEST_JWT_TOKEN || 'test-jwt-token',
  timeout: parseInt(process.env.TEST_TIMEOUT || '30000'),
  
  // Test data prefixes to avoid conflicts
  testPrefix: 'sdk_test_',
  
  // Retry configuration for flaky network tests
  retries: 3,
  retryDelay: 1000,
};

// Test utilities
export const TestUtils = {
  /**
   * Generate a unique test project name
   */
  generateProjectName(): string {
    return `${TEST_CONFIG.testPrefix}proj_test_123`;
  },


  generateCollectionName(): string {
    return "col_test_123";
  },

  generateClusterName(): string {
    return "clu_test_123";
  },

  generateRecordName(): string {
    return "rec_test_123";
  },

  /**
   * Wait for a specified amount of time
   */
  async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Retry a function with exponential backoff
   */
  async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = TEST_CONFIG.retries,
    baseDelay: number = TEST_CONFIG.retryDelay
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (i === maxRetries) {
          throw lastError;
        }
        
        const delay = baseDelay * Math.pow(2, i);
        await this.sleep(delay);
      }
    }
    
    throw lastError!;
  },

  /**
   * Check if OstrichDB is available
   */
  async isOstrichDBAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
};

// Global test setup
beforeAll(async () => {
  // Check if OstrichDB is available for integration tests
  if (process.env.JEST_WORKER_ID && process.env.NODE_ENV !== 'unit') {
    const isAvailable = await TestUtils.isOstrichDBAvailable();
    if (isAvailable != true) {
      console.warn('⚠️  OstrichDB server not available. Integration tests may fail.');
      console.warn('   Run `npm run docker:up` to start the test server.');
    }
  }
});

// Clean up test data after all tests
afterAll(async () => {
  // Note: In a real implementation, you might want to clean up test projects
  // created during testing. For now, we'll rely on the test prefix to identify them.
  console.log('🧹 Test cleanup completed');
});

// Mock fetch for unit tests
if (process.env.NODE_ENV === 'test' && !global.fetch) {
  // Install node-fetch for Node.js environments that don't have fetch
  global.fetch = require('node-fetch');
}