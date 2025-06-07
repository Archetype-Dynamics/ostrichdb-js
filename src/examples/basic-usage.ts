
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
    await db.createCluster('my-app', 'users', 'active-users');
    console.log('✅ Cluster created');

    // Add some records
    await db.createRecord('my-app', 'users', 'active-users', 'user-1-email', 'STRING', 'john@example.com');
    await db.createRecord('my-app', 'users', 'active-users', 'user-1-age', 'INTEGER', '28');
    await db.createRecord('my-app', 'users', 'active-users', 'user-1-verified', 'BOOLEAN', 'true');
    console.log('✅ Records created');

    // List all records
    const records = await db.listRecords('my-app', 'users', 'active-users');
    console.log('📋 Records in cluster:', records);

    // Search for specific records
    const stringRecords = await db.searchRecords('my-app', 'users', 'active-users', {
      type: 'STRING',
      valueContains: 'example.com'
    });
    console.log('🔍 Email records:', stringRecords);

    // Get a specific record
    const email = await db.getRecord('my-app', 'users', 'active-users', 'user-1-email');
    console.log('📧 User email:', email);

  } catch (error) {
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

    // Add product records
    await electronics.createRecord('laptop-name', 'STRING', 'MacBook Pro');
    await electronics.createRecord('laptop-price', 'INTEGER', '2499');
    await electronics.createRecord('laptop-available', 'BOOLEAN', 'true');
    await electronics.createRecord('laptop-tags', '[]STRING', '["apple", "laptop", "premium"]');

    // Search within the cluster
    const expensiveItems = await electronics.searchRecords({
      type: 'INTEGER',
      minValue: '2000',
      sortBy: 'value',
      sortOrder: 'desc'
    });

    console.log('💰 Expensive items:', expensiveItems);

  } catch (error) {
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

// src/examples/express-integration.ts
import express from 'express';
import OstrichDB from '../index';

const app = express();
app.use(express.json());

// Initialize OstrichDB (you'd typically do this once per request with user's token)
function getDBClient(authToken: string) {
  return new OstrichDB({
    baseUrl: process.env.OSTRICHDB_URL || 'http://localhost:8042',
    apiKey: authToken
  });
}

// Create a new user
app.post('/api/users', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const db = getDBClient(token);
    const { email, name, age } = req.body;

    // Ensure project and collection exist
    const userManagement = db.project('user-management');
    const users = userManagement.collection('users');
    const activeUsers = users.cluster('active');

    try {
      await userManagement.create();
      await users.create();
      await activeUsers.create();
    } catch (error) {
      // Resources might already exist, continue
    }

    // Create user records
    const userId = `user-${Date.now()}`;
    await activeUsers.createRecord(`${userId}-email`, 'STRING', email);
    await activeUsers.createRecord(`${userId}-name`, 'STRING', name);
    await activeUsers.createRecord(`${userId}-age`, 'INTEGER', age.toString());
    await activeUsers.createRecord(`${userId}-created`, 'DATETIME', new Date().toISOString());

    res.status(201).json({ 
      success: true, 
      userId,
      message: 'User created successfully' 
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const db = getDBClient(token);
    const users = db.project('user-management').collection('users').cluster('active');

    // Get all email records (represents our users)
    const emailRecords = await users.searchRecords({
      search: 'email',
      sortBy: 'name'
    });

    // Parse user data from records
    const userList = emailRecords.map(record => {
      // Parse record format: "user-123-email :STRING: john@example.com"
      const match = record.match(/^(user-\d+)-email :STRING: (.+)$/);
      if (match) {
        return {
          userId: match[1],
          email: match[2]
        };
      }
      return null;
    }).filter(Boolean);

    res.json({ users: userList });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search users by age range
app.get('/api/users/search', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const { minAge, maxAge, name } = req.query;
    const db = getDBClient(token);
    const users = db.project('user-management').collection('users').cluster('active');

    let results;

    if (minAge || maxAge) {
      // Search by age range
      results = await users.searchRecords({
        search: 'age',
        type: 'INTEGER',
        minValue: minAge as string,
        maxValue: maxAge as string,
        sortBy: 'value'
      });
    } else if (name) {
      // Search by name
      results = await users.searchRecords({
        search: 'name',
        valueContains: name as string
      });
    } else {
      return res.status(400).json({ error: 'Please provide search criteria' });
    }

    res.json({ results });

  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check that also checks OstrichDB connectivity
app.get('/health', async (req, res) => {
  try {
    // Test with a minimal client (no auth needed for health check)
    const db = new OstrichDB({
      baseUrl: process.env.OSTRICHDB_URL || 'http://localhost:8042'
    });

    const dbHealth = await db.healthCheck();
    
    res.json({
      status: 'healthy',
      database: 'connected',
      dbHealth
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Express server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// src/examples/next-integration.ts
// pages/api/posts/index.ts (Next.js API route)
import type { NextApiRequest, NextApiResponse } from 'next';
import OstrichDB from '../../../src/index';

interface CreatePostRequest {
  title: string;
  content: string;
  author: string;
  tags: string[];
  published: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Extract JWT token from Authorization header
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const db = new OstrichDB({
    baseUrl: process.env.OSTRICHDB_URL || 'http://localhost:8042',
    apiKey: token
  });

  const blog = db.project('blog-platform');
  const posts = blog.collection('posts');

  try {
    // Ensure project and collection exist
    await blog.create().catch(() => {}); // Ignore if exists
    await posts.create().catch(() => {}); // Ignore if exists

    switch (req.method) {
      case 'GET':
        return handleGetPosts(posts, res);
      
      case 'POST':
        return handleCreatePost(posts, req.body, res);
      
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetPosts(posts: any, res: NextApiResponse) {
  try {
    // List all clusters (each cluster represents a post)
    const postClusters = await posts.list_clusters();
    
    const postList = [];
    
    for (const clusterName of postClusters) {
      const cluster = posts.cluster(clusterName);
      
      try {
        // Get post metadata
        const title = await cluster.getRecord('title');
        const author = await cluster.getRecord('author');
        const published = await cluster.getRecord('published');
        const createdAt = await cluster.getRecord('created-at');
        
        // Only include published posts for GET requests
        if (published.includes('true')) {
          postList.push({
            id: clusterName,
            title: title.split(': ')[2], // Extract value from "title :STRING: actual title"
            author: author.split(': ')[2],
            createdAt: createdAt.split(': ')[2],
            published: true
          });
        }
      } catch (error) {
        // Skip malformed posts
        continue;
      }
    }
    
    res.json({ posts: postList });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
}

async function handleCreatePost(posts: any, body: CreatePostRequest, res: NextApiResponse) {
  try {
    const { title, content, author, tags, published } = body;
    
    // Validate required fields
    if (!title || !content || !author) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, content, author' 
      });
    }
    
    // Create unique cluster for this post
    const postId = `post-${Date.now()}`;
    const cluster = posts.cluster(postId);
    await cluster.create();
    
    // Add post records
    await cluster.createRecord('title', 'STRING', title);
    await cluster.createRecord('content', 'STRING', content);
    await cluster.createRecord('author', 'STRING', author);
    await cluster.createRecord('tags', '[]STRING', JSON.stringify(tags || []));
    await cluster.createRecord('published', 'BOOLEAN', published ? 'true' : 'false');
    await cluster.createRecord('created-at', 'DATETIME', new Date().toISOString());
    await cluster.createRecord('updated-at', 'DATETIME', new Date().toISOString());
    
    res.status(201).json({ 
      success: true, 
      postId,
      message: 'Post created successfully' 
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
}

// React component example
// components/BlogPosts.tsx
import { useState, useEffect } from 'react';

interface Post {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  published: boolean;
}

export default function BlogPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/posts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: Omit<Post, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      // Refresh posts after creation
      fetchPosts();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Blog Posts</h2>
      {posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <ul>
          {posts.map(post => (
            <li key={post.id}>
              <h3>{post.title}</h3>
              <p>By {post.author} on {new Date(post.createdAt).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}