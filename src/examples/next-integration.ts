/**
 * Next.js Page Examples
 * These show how to use the components in actual pages
 */

// This is a standalone example file for copy-paste into Next.js projects

export default function nextPageExamples() {
  return `
// pages/blog.tsx (Pages Router)
import { useState } from 'react';
import BlogPosts from '../components/BlogPosts';
import CreatePostForm from '../components/CreatePostForm';

export default function BlogPage() {
  const [showUnpublished, setShowUnpublished] = useState(false);
  const [authorFilter, setAuthorFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setShowCreateForm(false);
    setRefreshKey(prev => prev + 1); // Force refresh of BlogPosts
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Company Blog</h1>
          <p className="text-gray-600 mt-2">Latest updates and insights from our team</p>
        </header>

        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showUnpublished}
              onChange={(e) => setShowUnpublished(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Show drafts</span>
          </label>
          
          <input
            type="text"
            placeholder="Filter by author..."
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          />
          
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {showCreateForm ? 'Cancel' : 'New Post'}
          </button>
        </div>

        {showCreateForm && (
          <div className="mb-8">
            <CreatePostForm onPostCreated={handlePostCreated} />
          </div>
        )}

        <BlogPosts 
          key={refreshKey}
          showUnpublished={showUnpublished}
          authorFilter={authorFilter}
        />
      </div>
    </div>
  );
}
`;
}

export function appRouterPageExample() {
  return `
// app/blog/page.tsx (App Router)
'use client';

import { useState } from 'react';
import BlogPosts from '../../components/BlogPosts';
import CreatePostForm from '../../components/CreatePostForm';

export default function BlogPage() {
  const [showUnpublished, setShowUnpublished] = useState(false);
  const [authorFilter, setAuthorFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setShowCreateForm(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Company Blog</h1>
          <p className="text-gray-600 mt-2">Latest updates and insights from our team</p>
        </header>

        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showUnpublished}
              onChange={(e) => setShowUnpublished(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Show drafts</span>
          </label>
          
          <input
            type="text"
            placeholder="Filter by author..."
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          />
          
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {showCreateForm ? 'Cancel' : 'New Post'}
          </button>
        </div>

        {showCreateForm && (
          <div className="mb-8">
            <CreatePostForm onPostCreated={handlePostCreated} />
          </div>
        )}

        <BlogPosts 
          key={refreshKey}
          showUnpublished={showUnpublished}
          authorFilter={authorFilter}
        />
      </div>
    </div>
  );
}
`;
}

export function adminPageExample() {
  return `
// pages/admin/posts.tsx or app/admin/posts/page.tsx
'use client';

import { useState, useEffect } from 'react';
import BlogPosts from '../../components/BlogPosts';
import CreatePostForm from '../../components/CreatePostForm';

export default function AdminPostsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (token) {
      // You might want to validate the token here
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access the admin panel.</p>
          <button
            onClick={() => {
              // Redirect to login page or show login modal
              window.location.href = '/login';
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel - Posts</h1>
          <p className="text-gray-600 mt-2">Manage all blog posts</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <CreatePostForm onPostCreated={() => window.location.reload()} />
          </div>
          
          <div className="lg:col-span-2">
            <BlogPosts 
              showUnpublished={true} // Show all posts in admin
            />
          </div>
        </div>
      </div>
    </div>
  );
}
`;
}