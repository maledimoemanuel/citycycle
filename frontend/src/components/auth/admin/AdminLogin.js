import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const { success, isAdmin } = await login(email, password, true);
      
      if (success && isAdmin) {
        navigate('/admin/dashboard');
      } else if (success) {
        setError('Only admin users can access this portal');
      } else {
        setError('Invalid admin credentials');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-brand">
          <svg className="admin-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,3L2,12H5V20H19V12H22L12,3M12,7.7C14.1,7.7 15.8,9.4 15.8,11.5C15.8,13.6 14.1,15.3 12,15.3C9.9,15.3 8.2,13.6 8.2,11.5C8.2,9.4 9.9,7.7 12,7.7M17,18H7V16.6C7,14.6 10,13.5 12,13.5C14,13.5 17,14.6 17,16.6V18Z" />
          </svg>
          <span>Admin Portal</span>
        </div>
        
        <h2>Sign in to your account</h2>
        
        {error && (
          <div className="admin-error-message">
            <svg className="error-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
            </svg>
            {error}
          </div>
        )}

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            className="admin-login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="spinner" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                </svg>
                Signing in...
              </>
            ) : 'Sign in'}
          </button>
        </form>

        <div className="admin-footer">
          <p>Having trouble? Contact <a href="mailto:support@example.com">support</a></p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;