/**
 * Integration tests for OstrichDB-JS SDK
 * These tests run against a real OstrichDB instance
 */

import { OstrichDBInstance } from '../../index';
import { TEST_CONFIG, TestUtils } from '../../setup';

describe('OstrichDB Integration Tests', () => {
  let client: OstrichDBInstance;
  let testProjectName: string;
  let testCollectionName: string;
  let testClusterName: string;

  beforeAll(async () => {
    // Skip integration tests if OstrichDB is not available
    const isAvailable = await TestUtils.isOstrichDBAvailable();
    if (!isAvailable) {
      console.warn('⚠️  Skipping integration tests - OstrichDB not available');
      return;
    }

    client = new OstrichDBInstance({
      baseUrl: TEST_CONFIG.baseUrl,
      apiKey: TEST_CONFIG.apiKey,
      timeout: TEST_CONFIG.timeout
    });
  });

  beforeEach(() => {
    testProjectName = TestUtils.generateProjectName();
    testCollectionName = TestUtils.generateCollectionName();
    testClusterName = TestUtils.generateClusterName();
  });

  afterEach(async () => {
    // Clean up test data
    if (client) {
      try {
        await client.delete_project(testProjectName);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  describe('Health Check', () => {
    test('should return health status', async () => {
      const health = await client.health_check();
      expect(health).toBeDefined();
      
      if (typeof health === 'object') {
        expect(health).toHaveProperty('status');
      }
    });
  });

  describe('Project Lifecycle', () => {
    test('should create, list, and delete project', async () => {
      // Create project
      await client.create_project(testProjectName);

      // Verify project exists in list
      const projects = await client.list_projects();
      expect(projects).toContain(testProjectName);

      // Delete project
      await client.delete_project(testProjectName);

      // Verify project is removed
      const projectsAfterDelete = await client.list_projects();
      expect(projectsAfterDelete).not.toContain(testProjectName);
    });

    test('should handle duplicate project creation', async () => {
      await client.create_project(testProjectName);
      
      // Creating duplicate should fail
      await expect(
        client.create_project(testProjectName) 
      ).rejects.toThrow('HTTP 500: Internal Server Error - Failed to create project');

    });
  });

  describe('Collection Lifecycle', () => {
    beforeEach(async () => {
      await client.create_project(testProjectName);
    });

    test('should create, list, get, and delete collection', async () => {
      // Create collection
      await client.create_collection(testProjectName, testCollectionName);

      // Verify collection exists in list
      const collections = await client.list_collections(testProjectName);
      expect(collections).toContain(testCollectionName);

      // Get collection data
      const collectionData = await client.get_collection(testProjectName, testCollectionName);
      expect(collectionData).toBeDefined();

      // Delete collection
      await client.delete_collection(testProjectName, testCollectionName);

      // Verify collection is removed
      const collectionsAfterDelete = await client.list_collections(testProjectName);
      expect(collectionsAfterDelete).not.toContain(testCollectionName);
    });
  });

  describe('Cluster Lifecycle', () => {
    beforeEach(async () => {
      await client.create_project(testProjectName);
      await client.create_collection(testProjectName, testCollectionName);
    });

    test('should create, list, get, and delete cluster', async () => {
      // Create cluster
      await client.create_cluster(testProjectName, testCollectionName, testClusterName);

      // Verify cluster exists in list
      const clusters = await client.list_clusters(testProjectName, testCollectionName);
      expect(clusters).toContain(testClusterName);

      // Get cluster data
      const clusterData = await client.get_cluster(testProjectName, testCollectionName, testClusterName);
      expect(clusterData).toBeDefined();

      // Delete cluster
      await client.delete_cluster(testProjectName, testCollectionName, testClusterName);

      // Verify cluster is removed
      const clustersAfterDelete = await client.list_clusters(testProjectName, testCollectionName);
      expect(clustersAfterDelete).not.toContain(testClusterName);
    });
  });

  describe('Record Operations', () => {
    beforeEach(async () => {
      await client.create_project(testProjectName);
      await client.create_collection(testProjectName, testCollectionName);
      await client.create_cluster(testProjectName, testCollectionName, testClusterName);
    });

    test('should create and retrieve different record types', async () => {
      const records = [
        { name: "string_record", type: "STRING", value: "test string" },
        { name: 'integer_record', type: 'INTEGER', value: "42" },
        { name: 'boolean_record', type: 'BOOLEAN', value: "true" },
        { name: 'float_record', type: 'FLOAT', value: "3.14" }
      ];

      // Create records
      for (const record of records) {
        try {
          
          await client.create_record(
            testProjectName,
            testCollectionName,
            testClusterName,
            record.name,
            record.type,
            record.value
          );

        } catch (error) { 
          console.error(`Failed to create record ${record.name}:`, error);
          
        }
      }

      // Verify records exist
      const recordList = await client.list_records(testProjectName, testCollectionName, testClusterName);
      
      for (const record of records) {
        expect(recordList).toContain(record.name);
      }

      // Get specific records
      for (const record of records) {
        const retrievedRecord = await client.get_record(
          testProjectName,
          testCollectionName,
          testClusterName,
          record.name
        );
        
        expect(retrievedRecord).toContain(record.name);
        expect(retrievedRecord).toContain(record.type);
        expect(retrievedRecord).toContain(record.value);
      }
    });

    test('should search records with filters', async () => {
      // Create test records
      await client.create_record(testProjectName, testCollectionName, testClusterName, 'email1', 'STRING', 'user1@example.com');
      await client.create_record(testProjectName, testCollectionName, testClusterName, 'email2', 'STRING', 'user2@test.com');
      await client.create_record(testProjectName, testCollectionName, testClusterName, 'age1', 'INTEGER', '25');
      await client.create_record(testProjectName, testCollectionName, testClusterName, 'age2', 'INTEGER', '30');

      // Search by type
      const stringRecords = await client.search_records(
        testProjectName,
        testCollectionName,
        testClusterName,
        { type: 'STRING' }
      );
      
      expect(stringRecords.length).toBeGreaterThanOrEqual(2);

      // Search with value filter
      const exampleEmails = await client.search_records(
        testProjectName,
        testCollectionName,
        testClusterName,
        { 
          type: 'STRING',
          valueContains: 'example.com'
        }
      );
      
      expect(exampleEmails.length).toBeGreaterThanOrEqual(1);

      // Search with pagination
      const limitedResults = await client.search_records(
        testProjectName,
        testCollectionName,
        testClusterName,
        { limit: 2 }
      );
      
      expect(limitedResults.length).toBeLessThanOrEqual(2);
    });

    test('should delete records', async () => {
      const recordName = TestUtils.generateRecordName();
      
      // Create record
      await client.create_record(
        testProjectName,
        testCollectionName,
        testClusterName,
        recordName,
        'STRING',
        'test value'
      );

      // Verify record exists
      const recordsBefore = await client.list_records(testProjectName, testCollectionName, testClusterName);
      expect(recordsBefore).toContain(recordName);

      // Delete record
      await client.delete_record(testProjectName, testCollectionName, testClusterName, recordName);

      // Verify record is removed
      const recordsAfter = await client.list_records(testProjectName, testCollectionName, testClusterName);
      expect(recordsAfter).not.toContain(recordName);
    });
  });

});