The Official JavaScript/TypeScript SDK for OstrichDB - A modern, fast, and scalable database solution.
🚀 Quick Start
Installation
bash# Using npm
npm install ostrichdb-js

# Using yarn
yarn add ostrichdb-js

# Using pnpm
pnpm add ostrichdb-js
Basic Usage
typescriptimport OstrichDB from 'ostrichdb-js';

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
Builder Pattern (Recommended)
typescriptimport OstrichDB from 'ostrichdb-js';

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

// Add product data using builder pattern
await electronics.record('laptop-name', 'STRING', 'MacBook Pro')
  .create('laptop-name', 'STRING', 'MacBook Pro');
await electronics.record('laptop-price', 'INTEGER', '2499')
  .create('laptop-price', 'INTEGER', '2499');

// Search within the cluster
const expensiveItems = await electronics.searchRecords({
  type: 'INTEGER',
  minValue: '2000',
  sortBy: 'value',
  sortOrder: 'desc'
});
📖 Documentation
Configuration
typescriptinterface OstrichDBConfig {
  baseUrl?: string;      // Default: 'http://localhost:8042'
  apiKey?: string;       // Your JWT token
  timeout?: number;      // Request timeout in ms (default: 30000)
}
Core Concepts
OstrichDB follows a hierarchical structure:
Project
└── Collection
    └── Cluster
        └── Record

Project: Top-level container for your application data
Collection: Groups related data within a project
Cluster: Organizes records within a collection
Record: Individual data items with name, type, and value

Supported Data Types

STRING - Text data
INTEGER - Whole numbers
FLOAT - Decimal numbers
BOOLEAN - true/false values
DATETIME - ISO 8601 timestamps
[]STRING - Array of strings (JSON format)

🔧 API Reference
Client Initialization
typescriptimport OstrichDB from 'ostrichdb-js';

const db = new OstrichDB({
  baseUrl: 'https://your-ostrichdb-instance.com',
  apiKey: 'your-jwt-token',
  timeout: 30000
});

// Update token after initialization
db.setAuthToken('new-jwt-token');
Project Operations
typescript// List all projects
const projects = await db.list_projects();

// Create a project  
await db.create_project('project-name');

// Delete a project
await db.delete_project('project-name');
Collection Operations
typescript// List collections in a project
const collections = await db.list_collections('project-name');

// Create a collection
await db.create_collection('project-name', 'collection-name');

// Get collection data
const data = await db.get_collection('project-name', 'collection-name');

// Delete a collection
await db.delete_collection('project-name', 'collection-name');
Cluster Operations
typescript// List clusters in a collection
const clusters = await db.list_clusters('project-name', 'collection-name');

// Create a cluster
await db.create_cluster('project-name', 'collection-name', 'cluster-name');

// Get cluster data
const data = await db.get_cluster('project-name', 'collection-name', 'cluster-name');

// Delete a cluster
await db.delete_cluster('project-name', 'collection-name', 'cluster-name');
Record Operations
typescript// Create a record
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
Search Options
typescriptinterface SearchOptions {
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
Health Check
typescript// Check server health
const health = await db.health_check();
console.log('Server status:', health);
🏗️ Builder Pattern API
The builder pattern provides a more intuitive, chainable API:
typescript// Traditional approach
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
Builder Methods
typescript// ProjectBuilder
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
🔒 Error Handling
The SDK provides detailed error information:
typescriptimport { OstrichDBError } from 'ostrichdb-js';

try {
  await db.get_record('project', 'collection', 'cluster', 'non-existent');
} catch (error) {
  if (error instanceof OstrichDBError) {
    console.log('Status:', error.statusCode);
    console.log('Message:', error.message);
    console.log('Response:', error.response);
  }
}
🌐 Framework Integration
Express.js
typescriptimport express from 'express';
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
Next.js API Routes
typescript// pages/api/posts.ts
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
🧪 Development Setup
Prerequisites

Node.js 16+
Docker (for local OstrichDB instance)

Installation
bash# Clone the repository
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
Environment Setup
Copy .env.example to .env.test and configure:
bashOSTRICHDB_URL=http://localhost:8042
TEST_JWT_TOKEN=your-test-jwt-token-here
TEST_TIMEOUT=30000
NODE_ENV=test
Testing
bash# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Type checking
npm run type-check
📝 Examples
Check out the /src/examples directory for more detailed examples:

Basic Usage - Simple operations and builder pattern
Express Integration - REST API with OstrichDB
Next.js Integration - Full-stack React application

Running Examples
bash# Basic usage example
npm run examples:basic

# Express.js server example
npm run examples:express
🚀 Publishing & Release
For Contributors

Make your changes and ensure all tests pass
Update version in package.json
Create a pull request to main branch
After merge, create a GitHub release
CI will automatically publish to npm

Manual Publishing
bash# Build and test
npm run build
npm test

# Publish to npm
npm publish
🤝 Contributing
We welcome contributions! Please see our Contributing Guide for details.
Development Workflow

Fork the repository
Create a feature branch: git checkout -b feature/amazing-feature
Make your changes
Add tests for new functionality
Ensure all tests pass: npm test
Commit your changes: git commit -m 'Add amazing feature'
Push to the branch: git push origin feature/amazing-feature
Open a Pull Request

🐛 Troubleshooting
Common Issues
Connection Refused
bashError: connect ECONNREFUSED 127.0.0.1:8042

Ensure OstrichDB server is running: npm run docker:up
Check the server URL in your configuration

Authentication Error
bashError: Unauthorized (401)

Verify your JWT token is valid and not expired
Ensure the token has the necessary permissions

Import/Module Errors
bashModule not found: ostrichdb-js

Ensure the package is installed: npm install ostrichdb-js
For TypeScript, check your tsconfig.json configuration

Getting Help

Documentation: docs.ostrichdb.com
Community: GitHub Discussions
Issues: GitHub Issues
Email: support@archetypedynamics.com

📋 Changelog
See CHANGELOG.md for a detailed history of changes.
📄 License
This project is licensed under the Apache License 2.0 - see the LICENSE file for details.
🔗 Links

OstrichDB Official Website
API Documentation
GitHub Repository
NPM Package
Issue Tracker

⚡ Performance Tips

Use Builder Pattern: More readable and maintainable code
Batch Operations: Group related operations when possible
Connection Reuse: Create one client instance and reuse it
Pagination: Use limit and offset for large datasets
Indexing: Use appropriate search filters to improve query performance

🛡️ Security

Always use HTTPS in production environments
Store JWT tokens securely (environment variables, secure storage)
Implement proper error handling to avoid information leakage
Regularly update dependencies to patch security vulnerabilities


Made with ❤️ by Archetype Dynamics, Inc.