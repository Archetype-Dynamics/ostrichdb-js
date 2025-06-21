/**
 * Simple Next.js Integration Example for the SDK
 * This file can be safely included in the SDK without Next.js dependencies
 */

// Example demonstrating OstrichDB usage patterns for Next.js
export function demonstrateNextIntegration() {
  console.log('=== Next.js Integration Examples ===');
  console.log('Copy these code snippets to your Next.js project:');
  console.log('');
  
  // Basic API Route Pattern
  console.log('1. Basic API Route (pages/api/posts.ts):');
  console.log(`
import OstrichDB from 'ostrichdb-js';

export default async function handler(req, res) {
  const db = new OstrichDB({
    baseUrl: process.env.OSTRICHDB_URL,
    apiKey: req.headers.authorization?.replace('Bearer ', '')
  });

  if (req.method === 'GET') {
    const posts = await db.project('blog').collection('posts').listClusters();
    res.json({ posts });
  }
  
  if (req.method === 'POST') {
    const { title, content } = req.body;
    const postId = \`post-\${Date.now()}\`;
    
    const cluster = db.project('blog').collection('posts').cluster(postId);
    await cluster.create();
    await cluster.record('title', 'STRING', title).create('title', 'STRING', title);
    await cluster.record('content', 'STRING', content).create('content', 'STRING', content);
    
    res.json({ success: true, postId });
  }
}
  `);

  // React Component Pattern
  console.log('2. React Component Usage:');
  console.log(`
import { useState, useEffect } from 'react';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => setPosts(data.posts));
  }, []);

  return (
    <div>
      <h1>Blog Posts</h1>
      {posts.map(post => (
        <div key={post}>{post}</div>
      ))}
    </div>
  );
}
  `);

  console.log('3. Setup Instructions:');
  console.log('   npm install ostrichdb-js');
  console.log('   Add OSTRICHDB_URL to your .env.local');
  console.log('   Copy the code snippets above to your project');
}

// Example of how to structure the integration
export interface NextIntegrationGuide {
  setup: {
    dependencies: string[];
    envVariables: string[];
  };
  examples: {
    apiRoute: string;
    component: string;
    page: string;
  };
}

export const nextIntegrationGuide: NextIntegrationGuide = {
  setup: {
    dependencies: ['ostrichdb-js'],
    envVariables: ['OSTRICHDB_URL']
  },
  examples: {
    apiRoute: 'See next_api_pages_router.ts',
    component: 'See next_react_components.ts', 
    page: 'See next_page_examples.ts'
  }
};

// Basic usage patterns that work in any environment
export class NextOstrichDBHelper {
  private db: any;

  constructor(config: { baseUrl: string; apiKey: string }) {
    // This would import OstrichDB in a real Next.js project
    // const OstrichDB = require('ostrichdb-js');
    // this.db = new OstrichDB(config);
    console.log('OstrichDB helper initialized with config:', config);
  }

  // Simulated methods for demonstration
  async createBlogPost(title: string, content: string, author: string) {
    console.log('Creating blog post:', { title, content, author });
    // In real implementation:
    // const postId = `post-${Date.now()}`;
    // const cluster = this.db.project('blog').collection('posts').cluster(postId);
    // await cluster.create();
    // await cluster.record('title', 'STRING', title).create('title', 'STRING', title);
    // return postId;
    return `post-${Date.now()}`;
  }

  async getBlogPosts() {
    console.log('Fetching blog posts');
    // In real implementation:
    // return await this.db.project('blog').collection('posts').listClusters();
    return ['post-1', 'post-2', 'post-3'];
  }

  async searchPosts(query: string) {
    console.log('Searching posts with query:', query);
    // In real implementation:
    // return await this.db.project('blog').collection('posts').cluster('all').searchRecords({
    //   valueContains: query
    // });
    return [`post containing ${query}`];
  }
}

// Export everything for the SDK
export default function nextIntegrationExample() {
  return {
    demonstrateNextIntegration,
    nextIntegrationGuide,
    NextOstrichDBHelper
  };
}