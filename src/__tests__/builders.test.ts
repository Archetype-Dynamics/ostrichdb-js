/**
 * Unit tests for Builder classes
 */

import { 
  ProjectBuilder, 
  CollectionBuilder, 
  ClusterBuilder, 
  RecordBuilder,
  OstrichDBInstance 
} from '../index';

// Mock the OstrichDBInstance
const mockOstrichDBInstance = {
  create_project: jest.fn(),
  delete_project: jest.fn(),
  list_collections: jest.fn(),
  create_collection: jest.fn(),
  get_collection: jest.fn(),
  delete_collection: jest.fn(),
  list_clusters: jest.fn(),
  create_cluster: jest.fn(),
  get_cluster: jest.fn(),
  delete_cluster: jest.fn(),
  list_records: jest.fn(),
  search_records: jest.fn(),
  create_record: jest.fn(),
  get_record: jest.fn(),
  delete_record: jest.fn(),
} as any;

describe('Builder Classes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ProjectBuilder', () => {
    let projectBuilder: ProjectBuilder;
    const projectName = 'test-project';
    const projectId = 'project-123';

    beforeEach(() => {
      projectBuilder = new ProjectBuilder(mockOstrichDBInstance, projectName, projectId);
    });

    test('should create ProjectBuilder instance', () => {
      expect(projectBuilder).toBeInstanceOf(ProjectBuilder);
    });

    test('should return CollectionBuilder when calling collection()', () => {
      const collectionBuilder = projectBuilder.collection('test-collection');
      expect(collectionBuilder).toBeInstanceOf(CollectionBuilder);
    });

    test('should call create_project on instance', async () => {
      mockOstrichDBInstance.create_project.mockResolvedValue(undefined);

      await projectBuilder.create();

      expect(mockOstrichDBInstance.create_project).toHaveBeenCalledWith(projectName);
    });

    test('should call delete_project on instance', async () => {
      mockOstrichDBInstance.delete_project.mockResolvedValue(undefined);

      await projectBuilder.delete();

      expect(mockOstrichDBInstance.delete_project).toHaveBeenCalledWith(projectName);
    });

    test('should call list_collections on instance', async () => {
      const mockCollections = ['collection1', 'collection2'];
      mockOstrichDBInstance.list_collections.mockResolvedValue(mockCollections);

      const collections = await projectBuilder.listCollections();

      expect(mockOstrichDBInstance.list_collections).toHaveBeenCalledWith(projectName);
      expect(collections).toEqual(mockCollections);
    });

    test('should handle errors from instance methods', async () => {
      const error = new Error('Project creation failed');
      mockOstrichDBInstance.create_project.mockRejectedValue(error);

      await expect(projectBuilder.create()).rejects.toThrow('Project creation failed');
    });
  });

  describe('CollectionBuilder', () => {
    let collectionBuilder: CollectionBuilder;
    const projectName = 'test-project';
    const collectionName = 'test-collection';

    beforeEach(() => {
      collectionBuilder = new CollectionBuilder(mockOstrichDBInstance, projectName, collectionName);
    });

    test('should create CollectionBuilder instance', () => {
      expect(collectionBuilder).toBeInstanceOf(CollectionBuilder);
    });

    test('should return ClusterBuilder when calling cluster()', () => {
      const clusterBuilder = collectionBuilder.cluster('test-cluster');
      expect(clusterBuilder).toBeInstanceOf(ClusterBuilder);
    });

    test('should call create_collection on instance', async () => {
      mockOstrichDBInstance.create_collection.mockResolvedValue(undefined);

      await collectionBuilder.create();

      expect(mockOstrichDBInstance.create_collection).toHaveBeenCalledWith(projectName, collectionName);
    });

    test('should call get_collection on instance', async () => {
      const mockData = 'collection data';
      mockOstrichDBInstance.get_collection.mockResolvedValue(mockData);

      const data = await collectionBuilder.get();

      expect(mockOstrichDBInstance.get_collection).toHaveBeenCalledWith(projectName, collectionName);
      expect(data).toBe(mockData);
    });

    test('should call delete_collection on instance', async () => {
      mockOstrichDBInstance.delete_collection.mockResolvedValue(undefined);

      await collectionBuilder.delete();

      expect(mockOstrichDBInstance.delete_collection).toHaveBeenCalledWith(projectName, collectionName);
    });

    test('should call list_clusters on instance', async () => {
      const mockClusters = ['cluster1', 'cluster2'];
      mockOstrichDBInstance.list_clusters.mockResolvedValue(mockClusters);

      const clusters = await collectionBuilder.listClusters();

      expect(mockOstrichDBInstance.list_clusters).toHaveBeenCalledWith(projectName, collectionName);
      expect(clusters).toEqual(mockClusters);
    });
  });

  describe('ClusterBuilder', () => {
    let clusterBuilder: ClusterBuilder;
    const projectName = 'test-project';
    const collectionName = 'test-collection';
    const clusterName = 'test-cluster';

    beforeEach(() => {
      clusterBuilder = new ClusterBuilder(mockOstrichDBInstance, projectName, collectionName, clusterName);
    });

    test('should create ClusterBuilder instance', () => {
      expect(clusterBuilder).toBeInstanceOf(ClusterBuilder);
    });

    test('should return RecordBuilder when calling record()', () => {
      const recordBuilder = clusterBuilder.record('test-record', 'STRING', 'test-value');
      expect(recordBuilder).toBeInstanceOf(RecordBuilder);
    });

    test('should call create_cluster on instance', async () => {
      mockOstrichDBInstance.create_cluster.mockResolvedValue(undefined);

      await clusterBuilder.create();

      expect(mockOstrichDBInstance.create_cluster).toHaveBeenCalledWith(projectName, collectionName, clusterName);
    });

    test('should call get_cluster on instance', async () => {
      const mockData = 'cluster data';
      mockOstrichDBInstance.get_cluster.mockResolvedValue(mockData);

      const data = await clusterBuilder.get();

      expect(mockOstrichDBInstance.get_cluster).toHaveBeenCalledWith(projectName, collectionName, clusterName);
      expect(data).toBe(mockData);
    });

    test('should call delete_cluster on instance', async () => {
      mockOstrichDBInstance.delete_cluster.mockResolvedValue(undefined);

      await clusterBuilder.delete();

      expect(mockOstrichDBInstance.delete_cluster).toHaveBeenCalledWith(projectName, collectionName, clusterName);
    });

    test('should call list_records on instance', async () => {
      const mockRecords = ['record1', 'record2'];
      mockOstrichDBInstance.list_records.mockResolvedValue(mockRecords);

      const records = await clusterBuilder.listRecords();

      expect(mockOstrichDBInstance.list_records).toHaveBeenCalledWith(projectName, collectionName, clusterName);
      expect(records).toEqual(mockRecords);
    });

    test('should call search_records on instance', async () => {
      const mockRecords = ['record1', 'record2'];
      const searchOptions = { type: 'STRING', limit: 10 };
      mockOstrichDBInstance.search_records.mockResolvedValue(mockRecords);

      const records = await clusterBuilder.searchRecords(searchOptions);

      expect(mockOstrichDBInstance.search_records).toHaveBeenCalledWith(
        projectName, 
        collectionName, 
        clusterName, 
        searchOptions
      );
      expect(records).toEqual(mockRecords);
    });

    test('should call search_records with empty options', async () => {
      const mockRecords = ['record1', 'record2'];
      mockOstrichDBInstance.search_records.mockResolvedValue(mockRecords);

      const records = await clusterBuilder.searchRecords();

      expect(mockOstrichDBInstance.search_records).toHaveBeenCalledWith(
        projectName, 
        collectionName, 
        clusterName, 
        {}
      );
      expect(records).toEqual(mockRecords);
    });
  });

  describe('RecordBuilder', () => {
    let recordBuilder: RecordBuilder;
    const projectName = 'test-project';
    const collectionName = 'test-collection';
    const clusterName = 'test-cluster';
    const recordName = 'test-record';
    const recordType = 'STRING';
    const recordValue = 'test-value';

    beforeEach(() => {
      recordBuilder = new RecordBuilder(
        mockOstrichDBInstance, 
        projectName, 
        collectionName, 
        clusterName, 
        recordName, 
        recordType, 
        recordValue
      );
    });

    test('should create RecordBuilder instance', () => {
      expect(recordBuilder).toBeInstanceOf(RecordBuilder);
    });

    test('should call create_record on instance', async () => {
      mockOstrichDBInstance.create_record.mockResolvedValue(undefined);

      await recordBuilder.create('new-record', 'INTEGER', '42');

      expect(mockOstrichDBInstance.create_record).toHaveBeenCalledWith(
        projectName, 
        collectionName, 
        clusterName, 
        'new-record', 
        'INTEGER', 
        '42'
      );
    });

    test('should call get_record on instance with string identifier', async () => {
      const mockRecord = 'test-record :STRING: test-value';
      mockOstrichDBInstance.get_record.mockResolvedValue(mockRecord);

      const record = await recordBuilder.get('test-record');

      expect(mockOstrichDBInstance.get_record).toHaveBeenCalledWith(
        projectName, 
        collectionName, 
        clusterName, 
        'test-record'
      );
      expect(record).toBe(mockRecord);
    });

    test('should call get_record on instance with number identifier', async () => {
      const mockRecord = 'test-record :STRING: test-value';
      mockOstrichDBInstance.get_record.mockResolvedValue(mockRecord);

      const record = await recordBuilder.get(123);

      expect(mockOstrichDBInstance.get_record).toHaveBeenCalledWith(
        projectName, 
        collectionName, 
        clusterName, 
        123
      );
      expect(record).toBe(mockRecord);
    });

    test('should call delete_record on instance', async () => {
      mockOstrichDBInstance.delete_record.mockResolvedValue(undefined);

      await recordBuilder.delete('test-record');

      expect(mockOstrichDBInstance.delete_record).toHaveBeenCalledWith(
        projectName, 
        collectionName, 
        clusterName, 
        'test-record'
      );
    });
  });

  describe('Builder Pattern Integration', () => {
    test('should chain builders correctly', () => {
      const instance = new OstrichDBInstance();
      
      const project = instance.project('test-project');
      expect(project).toBeInstanceOf(ProjectBuilder);

      const collection = project.collection('test-collection');
      expect(collection).toBeInstanceOf(CollectionBuilder);

      const cluster = collection.cluster('test-cluster');
      expect(cluster).toBeInstanceOf(ClusterBuilder);

      const record = cluster.record('test-record', 'STRING', 'test-value');
      expect(record).toBeInstanceOf(RecordBuilder);
    });

    test('should handle special characters in names', () => {
      const projectBuilder = new ProjectBuilder(
        mockOstrichDBInstance, 
        'project with spaces', 
        'project-123'
      );

      const collectionBuilder = projectBuilder.collection('collection-with-dashes');
      const clusterBuilder = collectionBuilder.cluster('cluster_with_underscores');
      const recordBuilder = clusterBuilder.record('record.with.dots', 'STRING', 'value');

      expect(collectionBuilder).toBeInstanceOf(CollectionBuilder);
      expect(clusterBuilder).toBeInstanceOf(ClusterBuilder);
      expect(recordBuilder).toBeInstanceOf(RecordBuilder);
    });

    test('should pass parameters correctly through chain', async () => {
      const projectName = 'chain-test-project';
      const collectionName = 'chain-test-collection';
      const clusterName = 'chain-test-cluster';

      mockOstrichDBInstance.create_project.mockResolvedValue(undefined);
      mockOstrichDBInstance.create_collection.mockResolvedValue(undefined);
      mockOstrichDBInstance.create_cluster.mockResolvedValue(undefined);

      const projectBuilder = new ProjectBuilder(mockOstrichDBInstance, projectName, 'project-id');
      await projectBuilder.create();

      const collectionBuilder = projectBuilder.collection(collectionName);
      await collectionBuilder.create();

      const clusterBuilder = collectionBuilder.cluster(clusterName);
      await clusterBuilder.create();

      expect(mockOstrichDBInstance.create_project).toHaveBeenCalledWith(projectName);
      expect(mockOstrichDBInstance.create_collection).toHaveBeenCalledWith(projectName, collectionName);
      expect(mockOstrichDBInstance.create_cluster).toHaveBeenCalledWith(projectName, collectionName, clusterName);
    });
  });

  describe('Error Propagation', () => {
    test('should propagate errors from ProjectBuilder methods', async () => {
      const error = new Error('API Error');
      mockOstrichDBInstance.create_project.mockRejectedValue(error);

      const projectBuilder = new ProjectBuilder(mockOstrichDBInstance, 'test', 'test-id');
      
      await expect(projectBuilder.create()).rejects.toThrow('API Error');
    });

    test('should propagate errors from CollectionBuilder methods', async () => {
      const error = new Error('Collection Error');
      mockOstrichDBInstance.get_collection.mockRejectedValue(error);

      const collectionBuilder = new CollectionBuilder(mockOstrichDBInstance, 'project', 'collection');
      
      await expect(collectionBuilder.get()).rejects.toThrow('Collection Error');
    });

    test('should propagate errors from ClusterBuilder methods', async () => {
      const error = new Error('Cluster Error');
      mockOstrichDBInstance.search_records.mockRejectedValue(error);

      const clusterBuilder = new ClusterBuilder(mockOstrichDBInstance, 'project', 'collection', 'cluster');
      
      await expect(clusterBuilder.searchRecords()).rejects.toThrow('Cluster Error');
    });

    test('should propagate errors from RecordBuilder methods', async () => {
      const error = new Error('Record Error');
      mockOstrichDBInstance.create_record.mockRejectedValue(error);

      const recordBuilder = new RecordBuilder(
        mockOstrichDBInstance, 
        'project', 
        'collection', 
        'cluster',
        'record',
        'STRING',
        'value'
      );
      
      await expect(recordBuilder.create('test', 'STRING', 'value')).rejects.toThrow('Record Error');
    });
  });
});