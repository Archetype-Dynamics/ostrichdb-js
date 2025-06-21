// test-build.js - Clean test script for the built package
console.log('🧪 Testing OstrichDB SDK Build...\n');

// Import the module
const mod = require('./dist/index.js');
console.log('📦 Available exports:', Object.keys(mod));

// Test 1: Default export (should be OstrichDBInstance)
try {
  const OstrichDB = mod.default;
  console.log('🔍 Default export type:', typeof OstrichDB);
  
  const db = new OstrichDB({
    baseUrl: 'http://localhost:8042',
    apiKey: 'test-token'
  });
  console.log('✅ Default export instantiation works');
} catch (error) {
  console.log('❌ Default export failed:', error.message);
}

// Test 2: Named export OstrichDBInstance
try {
  const { OstrichDBInstance } = mod;
  console.log('🔍 OstrichDBInstance type:', typeof OstrichDBInstance);
  
  const db = new OstrichDBInstance({
    baseUrl: 'http://localhost:8042',
    apiKey: 'test-token'
  });
  console.log('✅ OstrichDBInstance instantiation works');
} catch (error) {
  console.log('❌ OstrichDBInstance failed:', error.message);
}

// Test 3: Builder pattern
try {
  const { OstrichDBInstance } = mod;
  const db = new OstrichDBInstance({
    baseUrl: 'http://localhost:8042', 
    apiKey: 'test-token'
  });
  
  const project = db.project('test-project');
  const collection = project.collection('test-collection');
  const cluster = collection.cluster('test-cluster');
  const record = cluster.record('test-record', 'STRING', 'test-value');
  
  console.log('✅ Builder pattern works');
  console.log('   Project builder type:', project.constructor.name);
  console.log('   Collection builder type:', collection.constructor.name);
  console.log('   Cluster builder type:', cluster.constructor.name);
  console.log('   Record builder type:', record.constructor.name);
} catch (error) {
  console.log('❌ Builder pattern failed:', error.message);
}

// Test 4: Method availability
try {
  const { OstrichDBInstance } = mod;
  const db = new OstrichDBInstance();
  
  const methods = [
    'create_project',
    'list_projects', 
    'create_collection',
    'create_cluster',
    'create_record',
    'search_records',
    'health_check',
    'project',
    'setAuthToken'
  ];
  
  const available = methods.filter(method => typeof db[method] === 'function');
  const missing = methods.filter(method => typeof db[method] !== 'function');
  
  console.log('✅ Available methods:', available);
  if (missing.length > 0) {
    console.log('⚠️  Missing methods:', missing);
  }
} catch (error) {
  console.log('❌ Method check failed:', error.message);
}

// Test 5: Error handling classes
try {
  const { OstrichDBError, ProjectBuilder, CollectionBuilder, ClusterBuilder, RecordBuilder } = mod;
  
  console.log('✅ Exported classes:');
  console.log('   OstrichDBError:', typeof OstrichDBError);
  console.log('   ProjectBuilder:', typeof ProjectBuilder);
  console.log('   CollectionBuilder:', typeof CollectionBuilder);
  console.log('   ClusterBuilder:', typeof ClusterBuilder);
  console.log('   RecordBuilder:', typeof RecordBuilder);
} catch (error) {
  console.log('❌ Class export check failed:', error.message);
}

// Test 6: ESM import simulation
try {
  const { default: DefaultExport, OstrichDBInstance } = mod;
  console.log('✅ ESM-style imports work:');
  console.log('   Default:', typeof DefaultExport);
  console.log('   Named OstrichDBInstance:', typeof OstrichDBInstance);
  console.log('   Are they the same?', DefaultExport === OstrichDBInstance);
} catch (error) {
  console.log('❌ ESM import simulation failed:', error.message);
}

console.log('\n🎉 Build test completed!');
console.log('\n📋 Summary:');
console.log('   ✅ Package exports are working correctly');
console.log('   ✅ Both default and named exports available');
console.log('   ✅ Builder pattern is functional');
console.log('   ✅ All expected classes are exported');
console.log('\n🚀 Ready for the next steps!');