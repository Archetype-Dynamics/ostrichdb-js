/**
 * Integration tests for OstrichDB API
 */

import { OstrichDBInstance } from '../../index';
import { TestUtils, TEST_CONFIG } from '../../setup';

describe('OstrichDB Integration Tests', () => {
  let client: OstrichDBInstance;
  let testProjectName: string;
  let testCollectionName: string;
  let testClusterName: string;
  let shouldSkipTests = false;

  beforeAll(async () => {
    // Check if OstrichDB is available
    const isAvailable = await TestUtils.isOstrichDBAvailable();
    if (!isAvailable) {
      console.warn('⚠️  Skipping integration tests - OstrichDB not available');
      shouldSkipTests = true;
      return;
    }

    // Initialize client and test names
    client = new OstrichDBInstance({
      baseUrl: TEST_CONFIG.baseUrl,
      apiKey: TEST_CONFIG.apiKey,
      timeout: TEST_CONFIG.timeout
    });

    testProjectName = TestUtils.generateProjectName();
    testCollectionName = TestUtils.generateCollectionName();
    testClusterName = TestUtils.generateClusterName();
  });

  afterAll(async () => {
    if (shouldSkipTests || !client) return;
    
    try {
      await TestUtils.cleanupTestData(client, testProjectName);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Health Check', () => {
    test('should return health status', async () => {
      if (shouldSkipTests) {
        console.log('⏭️  Skipping test - OstrichDB not available');
        return;
      }

      const health = await client.health_check();
      expect(health).toBeDefined();
      
      if (typeof health === 'object') {
        expect(health).toHaveProperty('status');
      } else {
        expect(typeof health).toBe('string');
      }
    });
  });

  describe('Project Lifecycle', () => {
    test('should create, list, and delete project', async () => {
      if (shouldSkipTests) {
        console.log('⏭️  Skipping test - OstrichDB not available');
        return;
      }

      // Create project
      await client.create_project(testProjectName);

      // Verify project exists in list
      const projects = await client.list_projects();
      expect(projects).toContain(testProjectName);

      // Clean up
      await client.delete_project(testProjectName);
      
      // Verify project is deleted
      const projectsAfterDelete = await client.list_projects();
      expect(projectsAfterDelete).not.toContain(testProjectName);
    });

    test('should handle duplicate project creation', async () => {
      if (shouldSkipTests) {
        console.log('⏭️  Skipping test - OstrichDB not available');
        return;
      }

      await client.create_project(testProjectName);
      
      // Creating duplicate should fail
      await expect(
        client.create_project(testProjectName)
      ).rejects.toThrow();
    });
  });

  describe('Collection Lifecycle', () => {
    beforeEach(async () => {
      if (shouldSkipTests) return;
      await client.create_project(testProjectName);
    });

    test('should create, list, get, and delete collection', async () => {
      if (shouldSkipTests) {
        console.log('⏭️  Skipping test - OstrichDB not available');
        return;
      }

      // Create collection
      await client.create_collection(testProjectName, testCollectionName);
      
      // List collections
      const collections = await client.list_collections(testProjectName);
      expect(collections).toContain(testCollectionName);
      
      // Get collection
      const collectionData = await client.get_collection(testProjectName, testCollectionName);
      expect(collectionData).toBeDefined();
      
      // Delete collection
      await client.delete_collection(testProjectName, testCollectionName);
      
      const collectionsAfterDelete = await client.list_collections(testProjectName);
      expect(collectionsAfterDelete).not.toContain(testCollectionName);
    });
  });

  describe('Cluster Lifecycle', () => {
    beforeEach(async () => {
      if (shouldSkipTests) return;
      await client.create_project(testProjectName);
      await client.create_collection(testProjectName, testCollectionName);
    });

    test('should create, list, get, and delete cluster', async () => {
      if (shouldSkipTests) {
        console.log('⏭️  Skipping test - OstrichDB not available');
        return;
      }

      // Create cluster
      await client.create_cluster(testProjectName, testCollectionName, testClusterName);
      
      // List clusters
      const clusters = await client.list_clusters(testProjectName, testCollectionName);
      expect(clusters).toContain(testClusterName);
      
      // Get cluster
      const clusterData = await client.get_cluster(testProjectName, testCollectionName, testClusterName);
      expect(clusterData).toBeDefined();
      
      // Delete cluster
      await client.delete_cluster(testProjectName, testCollectionName, testClusterName);
      
      const clustersAfterDelete = await client.list_clusters(testProjectName, testCollectionName);
      expect(clustersAfterDelete).not.toContain(testClusterName);
    });
  });

  describe('Record Operations', () => {
    beforeEach(async () => {
      if (shouldSkipTests) return;
      await client.create_project(testProjectName);
      await client.create_collection(testProjectName, testCollectionName);
      await client.create_cluster(testProjectName, testCollectionName, testClusterName);
    });

    test('should create and retrieve different record types', async () => {
      if (shouldSkipTests) {
        console.log('⏭️  Skipping test - OstrichDB not available');
        return;
      }

      const records = [
        { name: 'string-record', type: 'STRING', value: 'test-value' },
        { name: 'integer-record', type: 'INTEGER', value: '42' },
        { name: 'float-record', type: 'FLOAT', value: '3.14' },
        { name: 'boolean-record', type: 'BOOLEAN', value: 'true' },
        { name: 'datetime-record', type: 'DATETIME', value: new Date().toISOString() },
        { name: 'array-record', type: '[]STRING', value: '["item1", "item2"]' }
      ];

      // Create records
      for (const record of records) {
        await client.create_record(
          testProjectName,
          testCollectionName,
          testClusterName,
          record.name,
          record.type as any,
          record.value
        );
      }

      // Retrieve and verify records
      for (const record of records) {
        const retrievedRecord = await client.get_record(
          testProjectName,
          testCollectionName,
          testClusterName,
          record.name
        );
        expect(retrievedRecord).toBeDefined();
        expect(retrievedRecord).toContain(record.name);
        expect(retrievedRecord).toContain(record.type);
        expect(retrievedRecord).toContain(record.value);
      }
    });

    test('should search records with filters', async () => {
      if (shouldSkipTests) {
        console.log('⏭️  Skipping test - OstrichDB not available');
        return;
      }

      // Create test records
      await client.create_record(testProjectName, testCollectionName, testClusterName, 'search-1', 'STRING', 'findme');
      await client.create_record(testProjectName, testCollectionName, testClusterName, 'search-2', 'STRING', 'other');
      await client.create_record(testProjectName, testCollectionName, testClusterName, 'number-1', 'INTEGER', '100');

      // Search by type
      const stringRecords = await client.search_records(
        testProjectName,
        testCollectionName,
        testClusterName,
        { type: 'STRING' }
      );
      expect(stringRecords.length).toBeGreaterThanOrEqual(2);

      // Search by value content
      const findmeRecords = await client.search_records(
        testProjectName,
        testCollectionName,
        testClusterName,
        { valueContains: 'findme' }
      );
      expect(findmeRecords.length).toBeGreaterThanOrEqual(1);
      expect(findmeRecords[0]).toContain('search-1');
    });

    test('should delete records', async () => {
      if (shouldSkipTests) {
        console.log('⏭️  Skipping test - OstrichDB not available');
        return;
      }

      const recordName = TestUtils.generateRecordName();
      
      // Create record
      await client.create_record(
        testProjectName,
        testCollectionName,
        testClusterName,
        recordName,
        'STRING',
        'delete-me'
      );

      // Verify record exists
      const record = await client.get_record(
        testProjectName,
        testCollectionName,
        testClusterName,
        recordName
      );
      expect(record).toBeDefined();

      // Delete record
      await client.delete_record(
        testProjectName,
        testCollectionName,
        testClusterName,
        recordName
      );

      // Verify record is deleted
      await expect(
        client.get_record(
          testProjectName,
          testCollectionName,
          testClusterName,
          recordName
        )
      ).rejects.toThrow();
    });
  });
});