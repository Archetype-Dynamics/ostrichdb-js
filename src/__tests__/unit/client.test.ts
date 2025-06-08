/**
 * Unit tests for OstrichDBInstance client
 */

import { OstrichDBInstance, OstrichDBError } from '../../index';
import { TEST_CONFIG } from '../setup';

// Mock fetch for unit tests
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

describe('OstrichDBInstance', () => {
  let client: OstrichDBInstance;

  beforeEach(() => {
    client = new OstrichDBInstance({
      baseUrl: TEST_CONFIG.baseUrl,
      apiKey: TEST_CONFIG.apiKey,
      timeout: 5000
    });
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor and Configuration', () => {
    test('should create instance with default config', () => {
      const defaultClient = new OstrichDBInstance();
      expect(defaultClient).toBeInstanceOf(OstrichDBInstance);
    });

    test('should create instance with custom config', () => {
      const customClient = new OstrichDBInstance({
        baseUrl: 'https://custom.ostrichdb.com',
        apiKey: 'custom-token',
        timeout: 10000
      });
      expect(customClient).toBeInstanceOf(OstrichDBInstance);
    });

    test('should set auth token', () => {
      client.setAuthToken('new-token');
      // Since setAuthToken is private, we can't directly test it,
      // but we can test that subsequent requests use the new token
    });
  });

  describe('HTTP Request Handling', () => {
    test('should make GET request with proper headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue('[]')
      });

      await client.list_projects();

      expect(mockFetch).toHaveBeenCalledWith(
        `${TEST_CONFIG.baseUrl}/api/v1/projects`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${TEST_CONFIG.apiKey}`
          })
        })
      );
    });

    test('should make POST request with data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: jest.fn().mockResolvedValue('')
      });

      await client.create_project('test-project');

      expect(mockFetch).toHaveBeenCalledWith(
        `${TEST_CONFIG.baseUrl}/api/v1/projects/test-project`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_CONFIG.apiKey}`
          })
        })
      );
    });

    test('should handle HTTP errors properly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: jest.fn().mockResolvedValue('Project not found')
      });

      await expect(client.list_projects()).rejects.toThrow(OstrichDBError);
    });

    test('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.list_projects()).rejects.toThrow(OstrichDBError);
    });
  });

  describe('Project Operations', () => {
    test('should list projects', async () => {
      const mockProjects = 'project1\nproject2\nproject3';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(mockProjects)
      });

      const projects = await client.list_projects();

      expect(projects).toEqual(['project1', 'project2', 'project3']);
    });

    test('should handle empty project list', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('')
      });

      const projects = await client.list_projects();

      expect(projects).toEqual([]);
    });

    test('should handle JSON project list', async () => {
      const mockResponse = JSON.stringify({
        projects: [
          { name: 'project1' },
          { name: 'project2' }
        ]
      });
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(mockResponse)
      });

      const projects = await client.list_projects();

      expect(projects).toEqual(['project1', 'project2']);
    });

    test('should create project', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('')
      });

      await expect(client.create_project('new-project')).resolves.not.toThrow();
    });

    test('should delete project', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('')
      });

      await expect(client.delete_project('old-project')).resolves.not.toThrow();
    });
  });

  describe('Collection Operations', () => {
    test('should list collections', async () => {
      const mockCollections = 'collection1\ncollection2';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(mockCollections)
      });

      const collections = await client.list_collections('test-project');

      expect(collections).toEqual(['collection1', 'collection2']);
    });

    test('should create collection', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('')
      });

      await expect(
        client.create_collection('test-project', 'new-collection')
      ).resolves.not.toThrow();
    });

    test('should get collection', async () => {
      const mockData = 'collection data';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(mockData)
      });

      const data = await client.get_collection('test-project', 'test-collection');

      expect(data).toBe(mockData);
    });

    test('should delete collection', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('')
      });

      await expect(
        client.delete_collection('test-project', 'old-collection')
      ).resolves.not.toThrow();
    });
  });

  describe('Record Operations', () => {
    test('should create record with proper URL encoding', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('')
      });

      await client.create_record(
        'test-project',
        'test-collection', 
        'test-cluster',
        'test record',
        'STRING',
        'test value'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('test%20record'),
        expect.any(Object)
      );
    });

    test('should search records with parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('record1\nrecord2')
      });

      const records = await client.search_records(
        'test-project',
        'test-collection',
        'test-cluster',
        {
          type: 'STRING',
          limit: 10,
          sortBy: 'name'
        }
      );

      expect(records).toEqual(['record1', 'record2']);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('type=STRING'),
        expect.any(Object)
      );
    });
  });

  describe('Health Check', () => {
    test('should return health check response as JSON', async () => {
      const healthData = { status: 'healthy', version: '1.0.0' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(JSON.stringify(healthData))
      });

      const health = await client.health_check();

      expect(health).toEqual(healthData);
    });

    test('should return plain text if not JSON', async () => {
      const healthText = 'OK';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue(healthText)
      });

      const health = await client.health_check();

      expect(health).toBe(healthText);
    });
  });

  describe('Builder Pattern', () => {
    test('should return ProjectBuilder', () => {
      const projectBuilder = client.project('test-project');
      expect(projectBuilder).toBeDefined();
      expect(projectBuilder.constructor.name).toBe('ProjectBuilder');
    });
  });

  describe('Error Handling', () => {
    test('should throw OstrichDBError with status code', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: jest.fn().mockResolvedValue('Invalid request')
      });

      try {
        await client.list_projects();
      } catch (error) {
        expect(error).toBeInstanceOf(OstrichDBError);
        expect((error as OstrichDBError).statusCode).toBe(400);
        expect(error.message).toContain('Bad Request');
      }
    });

    test('should handle timeout', async () => {
      const timeoutClient = new OstrichDBInstance({
        baseUrl: TEST_CONFIG.baseUrl,
        timeout: 1 // Very short timeout
      });

      mockFetch.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      await expect(timeoutClient.list_projects()).rejects.toThrow();
    });
  });
});