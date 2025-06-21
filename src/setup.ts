/* Author: Marshall A Burns
 * GitHub: @SchoolyB
 *
 * Copyright 2025-Present Archetype Dynamics, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as dotenv from 'dotenv';

// Load environment variables from .env.test
dotenv.config({ path: '.env.test' });

export interface TestConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
}

export const TEST_CONFIG: TestConfig = {
  baseUrl: process.env.OSTRICHDB_URL || 'http://localhost:8042',
  apiKey: process.env.TEST_JWT_TOKEN || 'test-token',
  timeout: parseInt(process.env.TEST_TIMEOUT || '30000', 10)
};

export class TestUtils {
  static async isOstrichDBAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  static async waitForOstrichDB(timeoutMs = 30000): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      if (await this.isOstrichDBAvailable()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return false;
  }

  static generateTestId(): string {
    return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Add the missing generator methods
  static generateProjectName(): string {
    return `test-project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateCollectionName(): string {
    return `test-collection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateClusterName(): string {
    return `test-cluster-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateRecordName(): string {
    return `test-record-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static async cleanupTestData(client: any, projectName: string): Promise<void> {
    try {
      await client.delete_project(projectName);
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

// Jest setup
beforeAll(async () => {
  // Check if OstrichDB is available for integration tests
  if (process.env.NODE_ENV === 'test') {
    const isAvailable = await TestUtils.isOstrichDBAvailable();
    if (isAvailable != true) {
      console.warn('⚠️  OstrichDB server not available. Integration tests may fail.');
      console.warn('   Run `npm run docker:up` to start the test server.');
    }
  }
});

afterAll(async () => {
  // Clean up any test data
  console.log('🧹 Test cleanup completed');
});

// Polyfill fetch for older Node.js versions (if needed)
// Note: Node.js 18+ has built-in fetch, so this is only for older versions
if (typeof globalThis.fetch === 'undefined') {
  try {
    // Try to import node-fetch if available
    const { default: fetch } = require('node-fetch');
    globalThis.fetch = fetch as any;
  } catch (error) {
    // node-fetch not available, but that's OK for Node.js 18+
    // The tests will use the built-in fetch
  }
}