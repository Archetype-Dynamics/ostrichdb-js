// src/examples/basic-usage.ts
import OstrichDB from '../index';

async function basicExample() {
  // Initialize the client
  const db = new OstrichDB({
    baseUrl: 'http://localhost:8042',
    apiKey: 'your-jwt-token-here'
  });

  try {
    // Create a project
    await db.create_project('my-app');
    console.log('✅ Project created');

    // Create a collection
    await db.create_collection('my-app', 'users');
    console.log('✅ Collection created');

    // Create a cluster
    await db.create_cluster('my-app', 'users', 'active-users');
    console.log('✅ Cluster created');

    // Add some records
    await db.create_record('my-app', 'users', 'active-users', 'user-1-email', 'STRING', 'john@example.com');
    await db.create_record('my-app', 'users', 'active-users', 'user-1-age', 'INTEGER', '28');
    await db.create_record('my-app', 'users', 'active-users', 'user-1-verified', 'BOOLEAN', 'true');
    console.log('✅ Records created');

    // List all records
    const records = await db.list_records('my-app', 'users', 'active-users');
    console.log('📋 Records in cluster:', records);

    // Search for specific records
    const stringRecords = await db.search_records('my-app', 'users', 'active-users', {
      type: 'STRING',
      valueContains: 'example.com'
    });
    console.log('🔍 Email records:', stringRecords);

    // Get a specific record
    const email = await db.get_record('my-app', 'users', 'active-users', 'user-1-email');
    console.log('📧 User email:', email);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

async function builderPatternExample() {
  const db = new OstrichDB({
    baseUrl: 'http://localhost:8042',
    apiKey: 'your-jwt-token-here'
  });

  try {
    // Using builder pattern for more intuitive API
    const project = db.project('ecommerce');
    await project.create();

    const products = project.collection('products');
    await products.create();

    const electronics = products.cluster('electronics');
    await electronics.create();

    // Add product records using builder pattern
    await electronics.record('laptop-name', 'STRING', 'MacBook Pro').create('laptop-name', 'STRING', 'MacBook Pro');
    await electronics.record('laptop-price', 'INTEGER', '2499').create('laptop-price', 'INTEGER', '2499');
    await electronics.record('laptop-available', 'BOOLEAN', 'true').create('laptop-available', 'BOOLEAN', 'true');
    await electronics.record('laptop-tags', '[]STRING', '["apple", "laptop", "premium"]').create('laptop-tags', '[]STRING', '["apple", "laptop", "premium"]');

    // Search within the cluster
    const expensiveItems = await electronics.searchRecords({
      type: 'INTEGER',
      minValue: '2000',
      sortBy: 'value',
      sortOrder: 'desc'
    });

    console.log('💰 Expensive items:', expensiveItems);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

// Run examples
if (require.main === module) {
  basicExample()
    .then(() => builderPatternExample())
    .then(() => console.log('✨ Examples completed!'))
    .catch(console.error);
}

export { basicExample, builderPatternExample };