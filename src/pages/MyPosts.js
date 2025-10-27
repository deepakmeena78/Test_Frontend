import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI } from '../services/api';

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const { canWrite } = useAuth();

  useEffect(() => {
    if (canWrite()) {
      fetchPosts();
    }
  }, [canWrite, statusFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getUserPosts({
        status: statusFilter || undefined
      });
      setPosts(response.data.posts);
      setError(null);
    } catch (err) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await postsAPI.delete(postId);
      fetchPosts(); // Refresh posts
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  if (!canWrite()) {
    return (
      <div className="alert alert-error">
        You don't have permission to view this page
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading your posts...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>My Posts</h2>
        <Link to="/create-post" className="btn btn-primary">
          Create New Post
        </Link>
      </div>

      <div className="form-group" style={{ marginBottom: '20px' }}>
        <label htmlFor="statusFilter">Filter by Status</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Posts</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {posts.length === 0 ? (
        <div className="card">
          <p>No posts found. <Link to="/create-post">Create your first post</Link></p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="card post-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h3 className="post-title">
                  <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {post.title}
                  </Link>
                </h3>
                
                <div className="post-meta">
                  Created {new Date(post.created_at).toLocaleDateString()}
                  {post.updated_at !== post.created_at && (
                    <span> • Updated {new Date(post.updated_at).toLocaleDateString()}</span>
                  )}
                  <span style={{ 
                    marginLeft: '10px', 
                    padding: '2px 8px', 
                    borderRadius: '4px',
                    backgroundColor: post.status === 'published' ? '#d4edda' : '#fff3cd',
                    color: post.status === 'published' ? '#155724' : '#856404',
                    fontSize: '12px'
                  }}>
                    {post.status}
                  </span>
                </div>
                
                <div className="post-content">
                  {post.content.length > 200 
                    ? `${post.content.substring(0, 200)}...` 
                    : post.content
                  }
                </div>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="post-tags">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                <Link to={`/edit-post/${post.id}`} className="btn btn-secondary">
                  Edit
                </Link>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeletePost(post.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyPosts;
