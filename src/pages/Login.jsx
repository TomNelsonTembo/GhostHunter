import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../api/pocketbase';
import ghostLogo from '../assets/gh.png';
import './Pages.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false); // New state
  const [resetEmailSent, setResetEmailSent] = useState(false); // New state
  const navigate = useNavigate();

  const storeAuthData = async () => {
    try {
      if (chrome?.storage?.local) {
        // Extract only the necessary data from authStore
        const authData = {
          token: pb.authStore.token,
          id: pb.authStore.record.id, 
          // Note: model contains sensitive data - only store what you need
        };
        
        await chrome.storage.local.set({ "pb_auth_user": authData });
      }
    } catch (err) {
      console.error('Storage error:', err);
      throw err; // Re-throw to handle in calling function
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
   
  
    try {
      // 1. Authenticate
      await pb.collection('users').authWithPassword(email, password);
      
      // 2. Store auth data
      await storeAuthData();
      
      // 3. Navigate on success
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed: ' + (err.message || 'Unknown error'));
      console.error('Login error:', err);
    } finally {
      // Clear password field
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await pb.collection('users').authWithOAuth2({ provider: 'google' });
      await storeAuthData();
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed: ' + err.message);
    }
  };

  // New: Handle password reset request
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await pb.collection('users').requestPasswordReset(email);
      await storeAuthData();
      setResetEmailSent(true);
      setError('');
    } catch (err) {
      setError('Failed to send reset email: ' + err.message);
    }
  };

  return (
    <div className="login-container">
      {/* Branding Section */}
      <div className="branding">
        <a href="" target="" rel="">
          <img src={ghostLogo} className="logo" alt="GhostHunter logo" />
        </a>
        <h1>Ghost Hunter</h1>
        <p className="tagline">
          A browser extension to track ghost job postings
        </p>
      </div>

      {/* Login Options */}
      <div className="auth-options">
        <button 
          onClick={handleGoogleLogin}
          className="google-login-btn"
        >
          <span className="google-icon">G</span>
          Login with Google
        </button>

        <div className="divider">
          <span className="divider-text">OR</span>
        </div>

        {/* Email/Password Form */}
        {error && <p className="error-message">{error}</p>}
        
        {!showForgotPassword ? (
          // Normal Login Form
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="form-input"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="form-input"
            />
            <button 
              type="submit"
              className="email-login-btn"
            >
              Login with Email
            </button>
            <p 
              className="forgot-password-link"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </p>
          </form>
        ) : (
          // Forgot Password Form
          <form onSubmit={handleForgotPassword} className="login-form">
            <h3>Reset Password</h3>
            {resetEmailSent ? (
              <p className="success-message">
                ✔ Reset link sent to your email! Check your inbox.
              </p>
            ) : (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="form-input"
                />
                <button 
                  type="submit"
                  className="email-login-btn"
                >
                  Send Reset Link
                </button>
                <p 
                  className="back-to-login"
                  onClick={() => setShowForgotPassword(false)}
                >
                  ← Back to Login
                </p>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}