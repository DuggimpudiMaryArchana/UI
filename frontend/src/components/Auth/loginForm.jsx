import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/authService';
import ForgotPasswordCard from './ForgotPasswordCard';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await loginUser(formData);

      if (response?.success) {
        const { token, user } = response;
        localStorage.setItem('token', token);
        localStorage.setItem('role', user.role);
        localStorage.setItem('name', user.name);
        localStorage.setItem('userId', user._id);

        const roleRoutes = {
          employee: `/employee/dashboard/${user._id}`,
          verifier: `/verifier/dashboard/${user._id}`,
          hr: `/hr/dashboard/${user._id}`,
          admin : `/admin/dashboard/${user._id}`
        };

        if (roleRoutes[user.role]) {
          navigate(roleRoutes[user.role]);
        } else {
          setError("Role not recognised");
        }

        setFormData({ email: '', password: '' });
      } else {
        setError(response?.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className={`login-content ${showForgotPassword ? 'blurred' : ''}`}>
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">
              Track skills, certifications, and progress. Log in to access your role-specific dashboard.
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="input-label">Email</label>
              <div className="input-wrapper">
                <span className="input-icon email-icon"></span>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="input-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon password-icon"></span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className={`eye-icon ${showPassword ? 'eye-slash' : ''}`}></span>
                </button>
              </div>
            </div>

            <div className="form-footer">
              <button
                type="button"
                className="forgot-password-link"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="button-loader"></span>
              ) : (
                <>
                  Login <span className="button-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="register-link">
            Don't have an account?{' '}
            <button 
              onClick={() => navigate('/register')}
              className="text-link"
            >
              Register
            </button>
          </div>
        </div>
      </div>

      {showForgotPassword && (
        <div className="forgot-password-modal">
          <div className="modal-backdrop" onClick={() => setShowForgotPassword(false)}></div>
          <ForgotPasswordCard 
            email={formData.email} 
            onClose={() => setShowForgotPassword(false)}
          />
        </div>
      )}

      <style jsx>{`
        .login-page-container {
          position: relative;
          min-height: 100vh;
        }
        
        .login-content {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f5f5f5;
          padding: 20px;
          transition: filter 0.3s ease;
        }
        
        .login-content.blurred {
          filter: blur(4px);
          pointer-events: none;
          user-select: none;
        }
        
        .login-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          padding: 40px;
          width: 100%;
          max-width: 500px;
          transition: transform 0.3s ease;
        }
        
        .login-content:not(.blurred) .login-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .login-title {
          color: #0066cc;
          font-weight: 700;
          font-size: 2.25rem;
          margin-bottom: 0.75rem;
          line-height: 1.2;
        }
        
        .login-subtitle {
          color: #666;
          margin: 0;
          font-size: 1.1rem;
          line-height: 1.6;
        }
        
        .login-form {
          margin-top: 1.5rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .input-label {
          display: block;
          margin-bottom: 0.75rem;
          color: #333;
          font-weight: 500;
          font-size: 1rem;
        }
        
        .input-wrapper {
          position: relative;
        }
        
        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          background-size: contain;
          background-repeat: no-repeat;
          opacity: 0.6;
        }
        
        .email-icon {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232c3e50'%3E%3Cpath d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'/%3E%3C/svg%3E");
        }
        
        .password-icon {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232c3e50'%3E%3Cpath d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z'/%3E%3C/svg%3E");
        }
        
        .input-wrapper input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        
        .input-wrapper input:focus {
          border-color: #0066cc;
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.2);
        }
        
        .toggle-password {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }
        
        .toggle-password:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .eye-icon {
          display: inline-block;
          width: 20px;
          height: 20px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%237f8c8d'%3E%3Cpath d='M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z'/%3E%3C/svg%3E");
          background-size: contain;
          background-repeat: no-repeat;
          transition: all 0.2s;
        }
        
        .eye-slash {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%237f8c8d'%3E%3Cpath d='M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z'/%3E%3C/svg%3E");
        }
        
        .form-footer {
          display: flex;
          justify-content: flex-end;
          margin: 1.5rem 0;
        }
        
        .forgot-password-link {
          background: none;
          border: none;
          color: #0066cc;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          padding: 0;
          transition: color 0.2s;
        }
        
        .forgot-password-link:hover {
          color: #004d99;
          text-decoration: underline;
        }
        
        .login-button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #0066cc 0%, #004d99 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.75rem;
        }
        
        .login-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 102, 204, 0.3);
        }
        
        .login-button:disabled {
          background: #99c2ff;
          transform: none;
          box-shadow: none;
          cursor: not-allowed;
        }
        
        .button-arrow {
          font-size: 1.2rem;
          transition: transform 0.2s;
        }
        
        .login-button:hover .button-arrow {
          transform: translateX(3px);
        }
        
        .button-loader {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        
        .register-link {
          text-align: center;
          margin-top: 1.5rem;
          color: #666;
          font-size: 1rem;
        }
        
        .text-link {
          background: none;
          border: none;
          color: #0066cc;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          padding: 0;
          transition: color 0.2s;
        }
        
        .text-link:hover {
          color: #004d99;
          text-decoration: underline;
        }
        
        .error-message {
          color: #d32f2f;
          background-color: #fde8e8;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
          border-left: 4px solid #d32f2f;
        }
        
        .forgot-password-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 480px) {
          .login-card {
            padding: 1.5rem;
          }
          
          .login-title {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
