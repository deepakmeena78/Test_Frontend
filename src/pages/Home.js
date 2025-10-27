import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../services/api';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchPosts = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await postsAPI.getAll({
        page,
        limit: 10,
        search
      });
      setPosts(response.data.posts);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage, searchTerm);
  }, [currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts(1, searchTerm);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchPosts(page, searchTerm);
  };

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  return (
    <div>
      <h2>Latest Blog Posts</h2>
      
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {posts.length === 0 ? (
        <div className="card">
          <p>No posts found. {searchTerm && 'Try adjusting your search terms.'}</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <div key={post.id} className="card post-card">
              <h3 className="post-title">
                <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {post.title}
                </Link>
              </h3>
              
              <div className="post-meta">
                By {post.author_name} • {new Date(post.created_at).toLocaleDateString()}
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
              
              <Link to={`/post/${post.id}`} className="btn btn-primary">
                Read More
              </Link>
            </div>
          ))}

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev}
              >
                Previous
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={page === currentPage ? 'active' : ''}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
