# ostrichdb-js

[![npm version](https://badge.fury.io/js/ostrichdb-js.svg)](https://badge.fury.io/js/ostrichdb-js)
[![Test Status](https://github.com/Archetype-Dynamics/ostrichdb-js/actions/workflows/test.yml/badge.svg)](https://github.com/Archetype-Dynamics/ostrichdb-js/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/Archetype-Dynamics/ostrichdb-js/branch/main/graph/badge.svg)](https://codecov.io/gh/Archetype-Dynamics/ostrichdb-js)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

The Official JavaScript/TypeScript SDK for OstrichDB - A modern, fast, and scalable database solution.

## 🚀 Quick Start

### Installation

```bash
npm install ostrichdb-js
```

### Basic Usage

```typescript
import OstrichDB from 'ostrichdb-js';

const db = new OstrichDB({
  baseUrl: 'http://localhost:8042',
  apiKey: 'your-jwt-token-here'
});

// Create a project
await db.create_project('my-app');

// Create a collection
await db.create_collection('my-app', 'users');

// Create a cluster
await db.create_cluster('my-app', 'users', 'active-users');

// Add records
await db.create_record('my-app', 'users', 'active-users', 'user-1-email', 'STRING', 'john@example.com');
await db.create_record('my-app', 'users', 'active-users', 'user-1-age', 'INTEGER', '28');

// Search records
const results = await db.search_records('my-app', 'users', 'active-users', {
  type: 'STRING',
  valueContains: 'example.com'
});

console.log('Found records:', results);
```

### Builder Pattern (Recommended)

```typescript
import OstrichDB from 'ostrichdb-js';

const db = new OstrichDB({
  baseUrl: 'http://localhost:8042',
  apiKey: 'your-jwt-token-here'
});

// Fluent, intuitive API
const project = db.project('ecommerce');
await project.create();

const products = project.collection('products');
await products.create();

const electronics = products.cluster('electronics');
await electronics.create();

// Add product data
await electronics.record('laptop-name', 'STRING', 'MacBook Pro').create('laptop-name', 'STRING', 'MacBook Pro');
await electronics.record('laptop-price', 'INTEGER', '2499').create('laptop-price', 'INTEGER', '2499');

// Search within the cluster
const expensiveItems = await electronics.searchRecords({
  type: 'INTEGER',
  minValue: '2000',
  sortBy: 'value',
  sortOrder: 'desc'
});
```

## 📖 Documentation

### Configuration

```typescript
interface OstrichDBConfig {
  baseUrl?: string;      // Default: 'http://localhost:8042'
  apiKey?: string;       // Your JWT token
  timeout?: number;      // Request timeout in ms (default: 30000)
}
```

### Core Concepts

**OstrichDB follows a hierarchical structure:**

```
Project
└── Collection
    └── Cluster
        └── Record
```

- **Project**: Top-level container for your application data
- **Collection**: Groups related data within a project  
- **Cluster**: Organizes records within a collection
- **Record**: Individual data items with name, type, and value

### Supported Data Types

- `STRING` - Text data
- `INTEGER` - Whole numbers
- `FLOAT` - Decimal numbers  
- `BOOLEAN` - true/false values
- `DATETIME` - ISO 8601 timestamps
- `[]STRING` - Array of strings (JSON format)

## 🔧 API Reference

### Client Initialization

```typescript
import OstrichDB from 'ostrichdb-js';

const db = new OstrichDB({
  baseUrl: 'https://your-ostrichdb-instance.com',
  apiKey: 'your-jwt-token',
  timeout: 30000
});

// Update token after initialization
db.setAuthToken('new-jwt-token');
```

### Project Operations

```typescript
// List all projects
const projects = await db.list_projects();

// Create a project  
await db.create_project('project-name');

// Delete a project
await db.delete_project('project-name');
```

### Collection Operations

```typescript
// List collections in a project
const collections = await db.list_collections('project-name');

// Create a collection
await db.create_collection('project-name', 'collection-name');

// Get collection data
const data = await db.get_collection('project-name', 'collection-name');

// Delete a collection
await db.delete_collection('project-name', 'collection-name');
```

### Cluster Operations

```typescript
// List clusters in a collection
const clusters = await db.list_clusters('project-name', 'collection-name');

// Create a cluster
await db.create_cluster('project-name', 'collection-name', 'cluster-name');

// Get cluster data
const data = await db.get_cluster('project-name', 'collection-name', 'cluster-name');

// Delete a cluster
await db.delete_cluster('project-name', 'collection-name', 'cluster-name');
```

### Record Operations

```typescript
// Create a record
await db.create_record(
  'project-name',
  'collection-name', 
  'cluster-name',
  'record-name',
  'STRING',
  'record-value'
);

// Get a record by name or ID
const record = await db.get_record('project-name', 'collection-name', 'cluster-name', 'record-name');

// List all records
const records = await db.list_records('project-name', 'collection-name', 'cluster-name');

// Search records with filters
const results = await db.search_records('project-name', 'collection-name', 'cluster-name', {
  type: 'STRING',
  valueContains: 'search-term',
  limit: 100,
  sortBy: 'name',
  sortOrder: 'asc'
});

// Delete a record
await db.delete_record('project-name', 'collection-name', 'cluster-name', 'record-name');
```

### Search Options

```typescript
interface SearchOptions {
  type?: string;           // Filter by data type
  search?: string;         // Search in record names
  valueContains?: string;  // Search in record values
  limit?: number;          // Maximum results to return
  offset?: number;         // Skip first N results
  sortBy?: 'name' | 'value' | 'type' | 'id';
  sortOrder?: 'asc' | 'desc';
  minValue?: string;       // Minimum value (for numeric types)
  maxValue?: string;       // Maximum value (for numeric types)
}
```

### Health Check

```typescript
// Check server health
const health = await db.health_check();
console.log('Server status:', health);
```

## 🏗️ Builder Pattern API

The builder pattern provides a more intuitive, chainable API:

```typescript
// Traditional approach
await db.create_project('blog');
await db.create_collection('blog', 'posts');
await db.create_cluster('blog', 'posts', 'published');
await db.create_record('blog', 'posts', 'published', 'post-1-title', 'STRING', 'Hello World');

// Builder pattern approach  
const blog = db.project('blog');
await blog.create();

const posts = blog.collection('posts');
await posts.create();

const published = posts.cluster('published');
await published.create();

await published.record('post-1-title', 'STRING', 'Hello World')
  .create('post-1-title', 'STRING', 'Hello World');
```

### Builder Methods

```typescript
// ProjectBuilder
const project = db.project('project-name');
await project.create();
await project.delete();
const collections = await project.listCollections();

// CollectionBuilder  
const collection = project.collection('collection-name');
await collection.create();
await collection.delete();
const data = await collection.get();
const clusters = await collection.listClusters();

// ClusterBuilder
const cluster = collection.cluster('cluster-name');
await cluster.create();
await cluster.delete(); 
const data = await cluster.get();
const records = await cluster.listRecords();
const results = await cluster.searchRecords(options);

// RecordBuilder
const record = cluster.record('record-name', 'STRING', 'value');
await record.create('name', 'type', 'value');
const data = await record.get('identifier');
await record.delete('record-name');
```

## 🔒 Error Handling

The SDK provides detailed error information:

```typescript
import { OstrichDBError } from 'ostrichdb-js';

try {
  await db.get_record('project', 'collection', 'cluster', 'non-existent');
} catch (error) {
  if (error instanceof OstrichDBError) {
    console.log('Status:', error.statusCode);
    console.log('Message:', error.message);
    console.log('Response:', error.response);
  }
}
```

## 🌐 Framework Integration

### Express.js

```typescript
import express from 'express';
import OstrichDB from 'ostrichdb-js';

const app = express();
app.use(express.json());

app.post('/users', async (req, res) => {
  const db = new OstrichDB({
    baseUrl: process.env.OSTRICHDB_URL,
    apiKey: req.headers.authorization?.replace('Bearer ', '')
  });

  try {
    const users = db.project('app').collection('users').cluster('active');
    
    const { email, name, age } = req.body;
    const userId = `user-${Date.now()}`;
    
    await users.record(`${userId}-email`, 'STRING', email)
      .create(`${userId}-email`, 'STRING', email);
    await users.record(`${userId}-name`, 'STRING', name)
      .create(`${userId}-name`, 'STRING', name);
    await users.record(`${userId}-age`, 'INTEGER', age.toString())
      .create(`${userId}-age`, 'INTEGER', age.toString());

    res.json({ success: true, userId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Next.js API Routes

```typescript
// pages/api/posts.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import OstrichDB from 'ostrichdb-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = new OstrichDB({
    baseUrl: process.env.OSTRICHDB_URL,
    apiKey: req.headers.authorization?.replace('Bearer ', '')
  });

  if (req.method === 'POST') {
    const { title, content, author } = req.body;
    const blog = db.project('blog').collection('posts').cluster('published');
    
    const postId = `post-${Date.now()}`;
    await blog.record(`${postId}-title`, 'STRING', title)
      .create(`${postId}-title`, 'STRING', title);
    await blog.record(`${postId}-content`, 'STRING', content)
      .create(`${postId}-content`, 'STRING', content);
    
    res.json({ success: true, postId });
  }
}
```

## 🧪 Development Setup

### Prerequisites

- Node.js 16+ 
- Docker (for local OstrichDB instance)

### Installation

```bash
# Clone the repository
git clone https://github.com/Archetype-Dynamics/ostrichdb-js.git
cd ostrichdb-js

# Install dependencies
npm install

# Start local OstrichDB instance
npm run docker:up

# Run tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests  
npm run test:integration

# Build the project
npm run build

# Run in development mode
npm run dev
```

### Environment Setup

Copy `.env.example` to `.env.test` and configure:

```bash
OSTRICHDB_URL=http://localhost:8042
TEST_JWT_TOKEN=your-test-jwt-token-here
TEST_TIMEOUT=30000
NODE_ENV=test
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📝 Examples

Check out the `/src/examples` directory for more detailed examples:

- [Basic Usage](src/examples/basic-usage.ts) - Simple operations and builder pattern
- [Express Integration](src/examples/express-integration.ts) - REST API with OstrichDB
- [Next.js Integration](src/examples/next-integration.ts) - Full-stack React application

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📋 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [OstrichDB Official Website](https://ostrichdb.com)
- [API Documentation](https://docs.ostrichdb.com) 
- [GitHub Repository](https://github.com/Archetype-Dynamics/ostrichdb-js)
- [NPM Package](https://www.npmjs.com/package/ostrichdb-js)
- [Issue Tracker](https://github.com/Archetype-Dynamics/ostrichdb-js/issues)

## ⚡ Performance Tips

1. **Use Builder Pattern**: More readable and maintainable code
2. **Batch Operations**: Group related operations when possible
3. **Connection Reuse**: Create one client instance and reuse it
4. **Pagination**: Use `limit` and `offset` for large datasets
5. **Indexing**: Use appropriate search filters to improve query performance

## 🆘 Support

- **Documentation**: [docs.ostrichdb.com](https://docs.ostrichdb.com)
- **Community**: [GitHub Discussions](https://github.com/Archetype-Dynamics/ostrichdb-js/discussions)
- **Issues**: [GitHub Issues](https://github.com/Archetype-Dynamics/ostrichdb-js/issues)
- **Email**: support@archetypedynamics.com

---

**Made with ❤️ by [Archetype Dynamics, Inc.](https://archetypedynamics.com)**