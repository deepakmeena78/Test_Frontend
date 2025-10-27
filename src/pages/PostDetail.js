import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postsAPI, commentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postsAPI.getById(id);
      setPost(response.data);
    } catch (err) {
      setError('Failed to fetch post');
      console.error('Error fetching post:', err);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentsAPI.getByPost(id);
      setComments(response.data.comments);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      await commentsAPI.create(id, { content: newComment });
      setNewComment('');
      fetchComments(); // Refresh comments
    } catch (err) {
      console.error('Error creating comment:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentsAPI.delete(commentId);
      fetchComments(); // Refresh comments
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading post...</div>;
  }

  if (error || !post) {
    return (
      <div className="alert alert-error">
        {error || 'Post not found'}
      </div>
    );
  }

  return (
    <div>
      <div className="card post-card">
        <h1 className="post-title">{post.title}</h1>
        
        <div className="post-meta">
          By {post.author_name} • {new Date(post.created_at).toLocaleDateString()}
          {post.updated_at !== post.created_at && (
            <span> • Updated {new Date(post.updated_at).toLocaleDateString()}</span>
          )}
        </div>
        
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        )}
        
        <div className="post-content" style={{ whiteSpace: 'pre-wrap' }}>
          {post.content}
        </div>
      </div>

      <div className="card">
        <h3>Comments ({comments.length})</h3>
        
        {isAuthenticated() ? (
          <form onSubmit={handleCommentSubmit} style={{ marginBottom: '20px' }}>
            <div className="form-group">
              <textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows="3"
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={commentLoading}
            >
              {commentLoading ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <p>
            <Link to="/login">Login</Link> to post comments
          </p>
        )}

        {comments.length === 0 ? (
          <p>No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment">
              <div className="comment-author">{comment.author_name}</div>
              <div className="comment-content">{comment.content}</div>
              <div className="comment-date">
                {new Date(comment.created_at).toLocaleDateString()}
                {(user && (user.id === comment.author_id || user.role === 'admin')) && (
                  <button
                    className="btn btn-danger"
                    style={{ marginLeft: '10px', padding: '2px 8px', fontSize: '12px' }}
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PostDetail;
