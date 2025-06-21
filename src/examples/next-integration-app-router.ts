/**
 * Next.js App Router API Route Example
 * Save this as: app/api/posts/route.ts in your Next.js project
 * 
 * Install dependencies:
 * npm install ostrichdb-js
 */

// This is a standalone example file for copy-paste into Next.js projects
// It demonstrates the App Router API pattern

export default function nextAppRouterExample() {
  return `
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OstrichDB from 'ostrichdb-js';

interface CreatePostRequest {
  title: string;
  content: string;
  author: string;
  tags?: string[];
  published?: boolean;
}

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const published = searchParams.get('published');
  const author = searchParams.get('author');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');

  const db = new OstrichDB({
    baseUrl: process.env.OSTRICHDB_URL || 'http://localhost:8042',
    apiKey: token
  });

  try {
    const blog = db.project('blog-platform');
    const posts = blog.collection('posts');
    
    // Ensure resources exist
    await blog.create().catch(() => {});
    await posts.create().catch(() => {});
    
    const postClusters = await posts.listClusters();
    const postList = [];
    
    for (const clusterName of postClusters) {
      const cluster = posts.cluster(clusterName);
      
      try {
        const titleRecord = await cluster.get('title');
        const authorRecord = await cluster.get('author');
        const publishedRecord = await cluster.get('published');
        const createdAtRecord = await cluster.get('created-at');
        const tagsRecord = await cluster.get('tags');
        
        const title = titleRecord.split(' :STRING: ')[1];
        const postAuthor = authorRecord.split(' :STRING: ')[1];
        const isPublished = publishedRecord.split(' :BOOLEAN: ')[1] === 'true';
        const createdAt = createdAtRecord.split(' :DATETIME: ')[1];
        const tags = JSON.parse(tagsRecord.split(' :[]STRING: ')[1] || '[]');
        
        // Apply filters
        if (published !== null && isPublished !== (published === 'true')) {
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
        continue; // Skip malformed posts
      }
    }
    
    // Apply pagination
    const paginatedPosts = postList.slice(offset, offset + limit);
    
    return NextResponse.json({ 
      posts: paginatedPosts,
      total: postList.length,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body: CreatePostRequest = await request.json();
    const { title, content, author, tags = [], published = false } = body;
    
    // Validate required fields
    if (!title || !content || !author) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, author' },
        { status: 400 }
      );
    }
    
    const db = new OstrichDB({
      baseUrl: process.env.OSTRICHDB_URL || 'http://localhost:8042',
      apiKey: token
    });
    
    const blog = db.project('blog-platform');
    const posts = blog.collection('posts');
    
    // Ensure resources exist
    await blog.create().catch(() => {});
    await posts.create().catch(() => {});
    
    // Create unique cluster for this post
    const postId = \`post-\${Date.now()}\`;
    const cluster = posts.cluster(postId);
    await cluster.create();
    
    // Add post records
    await cluster.record('title', 'STRING', title).create('title', 'STRING', title);
    await cluster.record('content', 'STRING', content).create('content', 'STRING', content);
    await cluster.record('author', 'STRING', author).create('author', 'STRING', author);
    await cluster.record('tags', '[]STRING', JSON.stringify(tags)).create('tags', '[]STRING', JSON.stringify(tags));
    await cluster.record('published', 'BOOLEAN', published.toString()).create('published', 'BOOLEAN', published.toString());
    await cluster.record('created-at', 'DATETIME', new Date().toISOString()).create('created-at', 'DATETIME', new Date().toISOString());
    
    return NextResponse.json({ 
      success: true, 
      postId,
      message: 'Post created successfully' 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('id');
  
  if (!postId) {
    return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
  }

  try {
    const db = new OstrichDB({
      baseUrl: process.env.OSTRICHDB_URL || 'http://localhost:8042',
      apiKey: token
    });
    
    const posts = db.project('blog-platform').collection('posts');
    await posts.cluster(postId).delete();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Post deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
`;
}

// This function demonstrates how the API would be used
export function demonstrateAppRouterUsage() {
  console.log('Copy the code above to app/api/posts/route.ts in your Next.js project');
  console.log('Then install: npm install ostrichdb-js');
  console.log('Add OSTRICHDB_URL to your .env.local file');
}