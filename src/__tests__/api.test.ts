/**
 * Integration tests for OstrichDB-JS SDK
 * These tests run against a real OstrichDB instance
 */

import { OstrichDBInstance } from '../index';
import { TEST_CONFIG, TestUtils } from './setup';

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
      
      // Creating duplicate should either succeed or fail gracefully
      await expect(
        client.create_project(testProjectName)
      ).resolves.not.toThrow();
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
        { name: 'string_record', type: 'STRING', value: 'test string' },
        { name: 'integer_record', type: 'INTEGER', value: '42' },
        { name: 'boolean_record', type: 'BOOLEAN', value: 'true' },
        { name: 'float_record', type: 'FLOAT', value: '3.14' }
      ];

      // Create records
      for (const record of records) {
        await client.create_record(
          testProjectName,
          testCollectionName,
          testClusterName,
          record.name,
          record.type,
          record.value
        );
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

  describe('Builder Pattern Integration', () => {
    test('should work with builder pattern end-to-end', async () => {
      const project = client.project(testProjectName);
      await project.create();

      const collection = project.collection(testCollectionName);
      await collection.create();

      const cluster = collection.cluster(testClusterName);
      await cluster.create();

      // Add records using builder pattern
      const record = cluster.record('test-record', 'STRING', 'test-value');
      await record.create('test-record', 'STRING', 'test-value');

      // Verify using builder pattern
      const collections = await project.listCollections();
      expect(collections).toContain(testCollectionName);

      const clusters = await collection.listClusters();
      expect(clusters).toContain(testClusterName);

      const records = await cluster.listRecords();
      expect(records).toContain('test-record');

      // Search using builder pattern
      const searchResults = await cluster.searchRecords({
        type: 'STRING'
      });
      expect(searchResults.length).toBeGreaterThan(0);

      // Get record using builder pattern
      const retrievedRecord = await record.get('test-record');
      expect(retrievedRecord).toContain('test-record');
      expect(retrievedRecord).toContain('STRING');
      expect(retrievedRecord).toContain('test-value');
    });
  });

  describe('Error Handling', () => {
    test('should handle non-existent project', async () => {
      await expect(
        client.get_collection('non-existent-project', 'some-collection')
      ).rejects.toThrow();
    });

    test('should handle non-existent collection', async () => {
      await client.create_project(testProjectName);
      
      await expect(
        client.get_collection(testProjectName, 'non-existent-collection')
      ).rejects.toThrow();
    });

    test('should handle non-existent record', async () => {
      await client.create_project(testProjectName);
      await client.create_collection(testProjectName, testCollectionName);
      await client.create_cluster(testProjectName, testCollectionName, testClusterName);
      
      await expect(
        client.get_record(testProjectName, testCollectionName, testClusterName, 'non-existent-record')
      ).rejects.toThrow();
    });
  });

  describe('Special Characters and Encoding', () => {
    test('should handle special characters in names', async () => {
      const specialProject = `${testProjectName}_special-chars.test`;
      const specialCollection = `${testCollectionName}_with spaces`;
      const specialCluster = `${testClusterName}_unicode_测试`;
      
      await client.create_project(specialProject);
      await client.create_collection(specialProject, specialCollection);
      await client.create_cluster(specialProject, specialCollection, specialCluster);

      // Create record with special characters
      await client.create_record(
        specialProject,
        specialCollection,
        specialCluster,
        'special record name',
        'STRING',
        'value with special chars: é, ñ, 中文'
      );

      const records = await client.list_records(specialProject, specialCollection, specialCluster);
      expect(records).toContain('special record name');

      // Cleanup
      await client.delete_project(specialProject);
    });
  });

  describe('Concurrent Operations', () => {
    test('should handle concurrent record creation', async () => {
      await client.create_project(testProjectName);
      await client.create_collection(testProjectName, testCollectionName);
      await client.create_cluster(testProjectName, testCollectionName, testClusterName);

      // Create multiple records concurrently
      const recordPromises = Array.from({ length: 5 }, (_, i) =>
        client.create_record(
          testProjectName,
          testCollectionName,
          testClusterName,
          `concurrent_record_${i}`,
          'INTEGER',
          i.toString()
        )
      );

      await Promise.all(recordPromises);

      // Verify all records were created
      const records = await client.list_records(testProjectName, testCollectionName, testClusterName);
      
      for (let i = 0; i < 5; i++) {
        expect(records).toContain(`concurrent_record_${i}`);
      }
    });
  });
});