/**
 * Next.js Pages Router API Route Example
 * Save this as: pages/api/posts/index.ts in your Next.js project
 * 
 * Install dependencies:
 * npm install ostrichdb-js
 */

// This is a standalone example file for copy-paste into Next.js projects
// It demonstrates the Pages Router API pattern

export default function nextPagesRouterExample() {
  return `
// pages/api/posts/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import OstrichDB from 'ostrichdb-js';

interface CreatePostRequest {
  title: string;
  content: string;
  author: string;
  tags?: string[];
  published?: boolean;
}

interface PostResponse {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  published: boolean;
  tags: string[];
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
        return handleGetPosts(posts, req, res);
      
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

async function handleGetPosts(
  posts: any, 
  req: NextApiRequest, 
  res: NextApiResponse
) {
  try {
    const { published, author, limit = '10', offset = '0' } = req.query;
    
    // List all clusters (each cluster represents a post)
    const postClusters = await posts.listClusters();
    
    const postList: PostResponse[] = [];
    
    for (const clusterName of postClusters) {
      const cluster = posts.cluster(clusterName);
      
      try {
        // Get post metadata using the corrected API
        const titleRecord = await cluster.get('title');
        const authorRecord = await cluster.get('author');
        const publishedRecord = await cluster.get('published');
        const createdAtRecord = await cluster.get('created-at');
        const tagsRecord = await cluster.get('tags');
        
        // Parse record format: "title :STRING: actual title"
        const title = titleRecord.split(' :STRING: ')[1];
        const postAuthor = authorRecord.split(' :STRING: ')[1];
        const isPublished = publishedRecord.split(' :BOOLEAN: ')[1] === 'true';
        const createdAt = createdAtRecord.split(' :DATETIME: ')[1];
        const tags = JSON.parse(tagsRecord.split(' :[]STRING: ')[1] || '[]');
        
        // Apply filters
        if (published !== undefined && isPublished !== (published === 'true')) {
          continue;
        }
        if (author && postAuthor !== author) {
          continue;
        }
        
        postList.push({
          id: clusterName,
          title,
          author: postAuthor,
          createdAt,
          published: isPublished,
          tags
        });
      } catch (error) {
        // Skip malformed posts
        console.warn(\`Skipping malformed post: \${clusterName}\`, error.message);
        continue;
      }
    }
    
    // Apply pagination
    const startIndex = parseInt(offset as string);
    const limitNum = parseInt(limit as string);
    const paginatedPosts = postList.slice(startIndex, startIndex + limitNum);
    
    res.json({ 
      posts: paginatedPosts,
      total: postList.length,
      limit: limitNum,
      offset: startIndex
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
}

async function handleCreatePost(
  posts: any, 
  body: CreatePostRequest, 
  res: NextApiResponse
) {
  try {
    const { title, content, author, tags = [], published = false } = body;
    
    // Validate required fields
    if (!title || !content || !author) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, content, author' 
      });
    }
    
    // Create unique cluster for this post
    const postId = \`post-\${Date.now()}\`;
    const cluster = posts.cluster(postId);
    await cluster.create();
    
    // Add post records using the corrected API
    await cluster.record('title', 'STRING', title).create('title', 'STRING', title);
    await cluster.record('content', 'STRING', content).create('content', 'STRING', content);
    await cluster.record('author', 'STRING', author).create('author', 'STRING', author);
    await cluster.record('tags', '[]STRING', JSON.stringify(tags)).create('tags', '[]STRING', JSON.stringify(tags));
    await cluster.record('published', 'BOOLEAN', published ? 'true' : 'false').create('published', 'BOOLEAN', published ? 'true' : 'false');
    await cluster.record('created-at', 'DATETIME', new Date().toISOString()).create('created-at', 'DATETIME', new Date().toISOString());
    await cluster.record('updated-at', 'DATETIME', new Date().toISOString()).create('updated-at', 'DATETIME', new Date().toISOString());
    
    res.status(201).json({ 
      success: true, 
      postId,
      message: 'Post created successfully' 
    });
    
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
}
`;
}

// This function demonstrates how the API would be used
export function demonstratePagesRouterUsage() {
  console.log('Copy the code above to pages/api/posts/index.ts in your Next.js project');
  console.log('Then install: npm install ostrichdb-js');
  console.log('Add OSTRICHDB_URL to your .env.local file');
}