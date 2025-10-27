import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout, isAuthenticated, canWrite } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1>Blog System</h1>
          </Link>
          
          <ul className="nav-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            
            {isAuthenticated() ? (
              <>
                {canWrite() && (
                  <>
                    <li>
                      <Link to="/create-post">Create Post</Link>
                    </li>
                    <li>
                      <Link to="/my-posts">My Posts</Link>
                    </li>
                  </>
                )}
                <li>
                  <span>Welcome, {user.username}</span>
                </li>
                <li>
                  <button className="btn btn-secondary" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
