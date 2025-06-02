import React, { useState } from "react";
import { registerUser } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    experience: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: [],
    confirmPassword: '',
    role: '',
    experience: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]:  value }));
    validateField(name, value);
  };

  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case "name":
        if (!value) newErrors.name = 'Name is required';
        else if (!/^[A-Za-z ]{3,}$/.test(value)) newErrors.name = 'Enter valid name';
        else newErrors.name = '';
        break;
      case "email":
        if (!value) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@infosys\.com$/.test(value)) newErrors.email = 'Must be @infosys.com';
        else newErrors.email = '';
        break;
      case "password":
        const pwdErrors = [];
        if (!value) pwdErrors.push('Field required');
        if (value.length < 8) pwdErrors.push("Password must be at least 8 characters");
        if (!/[A-Z]/.test(value)) pwdErrors.push("Password must contain at least one uppercase letter");
        if (!/[a-z]/.test(value)) pwdErrors.push("Password must contain at least one lowercase letter");
        if (!/\d/.test(value)) pwdErrors.push("Password must contain at least one digit");
        if (!/[@$!%*?&]/.test(value)) pwdErrors.push("Password should contain at least one special character");
        newErrors.password = pwdErrors;
        break;
      case "confirmPassword":
        if (!value) newErrors.confirmPassword = 'Confirm password';
        else if (value !== formData.password) newErrors.confirmPassword = 'Passwords must match';
        else newErrors.confirmPassword = '';
        break;
      case "role":
        if (!value) newErrors.role = 'Select a role';
        else newErrors.role = '';
        break;
      case "experience":
        if (!value) newErrors.experience = 'Experience is required';
        else if (isNaN(value)) newErrors.experience = 'Must be a number';
        else if (value < 0 || value > 50) newErrors.experience = '0-50 years';
        else newErrors.experience = '';
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const isFormValid = () => {
    return (
      formData.name && !errors.name &&
      formData.email && !errors.email &&
      formData.password && !errors.password.length &&
      formData.confirmPassword && !errors.confirmPassword &&
      formData.role && !errors.role &&
      formData.experience && !errors.experience
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsLoading(true);
    try {
      const submissionData = {...formData, experience:Number(formData.experience)}
      const { confirmPassword, ...data } = submissionData;
      console.log(data);
      const response = await registerUser(data);
      
      if (response) {
        setSubmitted(true);
      } else {
        alert("Registration failed");
      }
    } catch (error) {
      // alert(error.response?.data?.message || "Registration error");
      setErrors(prev=>({...prev, general: 'Registration failed: '+(error.response?.data?.message || error.message)}));
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
  return (
    <div
      className="login-page-container"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9f9f9',
        width:'800px'
      }}
    >
      <div
        className="login-card"
        style={{
          border: '1px solid #ccc',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          backgroundColor: '#fff',
          textAlign: 'center',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <div className="login-header">
          <h1 className="login-title" style={{ color: '#0066cc', marginBottom: '10px' }}>
            Registration Successful
          </h1>
          <p className="login-subtitle">
            Your registration has been submitted for approval.
          </p>
        </div>
        <button
          className="login-button"
          onClick={() => navigate('/login')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#0066cc',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Go to Login <span className="button-arrow">→</span>
        </button>
      </div>
    </div>
  );
}


  return (
    // <div style={{backgroundColor:'black'}}>
    <div className="login-page-container">
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Create Account</h1>
            <p className="login-subtitle">
              Join our skill management platform to track and showcase your professional growth.
            </p>
          </div>
          {errors?.general && <div className="error-message">{errors.general}</div>}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name" className="input-label">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon user-icon"></span>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={errors.name ? 'error' : ''}
                />
              </div>
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="input-label">Work Email</label>
              <div className="input-wrapper">
                <span className="input-icon email-icon"></span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="yourname@infosys.com"
                  className={errors.email ? 'error' : ''}
                />
              </div>
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="input-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon password-icon"></span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className={errors.password.length > 0 ? 'error' : ''}
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
              {errors.password.length > 0 && (
                <div className="password-requirements">
                  <div className="requirements-title">Password must contain:</div>
                  <ul className="requirements-list">
                    {errors.password.map((err, i) => (
                      <li key={i} className={formData.password && !errors.password.includes(err) ? 'valid' : ''}>
                        {formData.password && !errors.password.includes(err) ? '✓' : '•'} {err}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="input-label">Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon password-icon"></span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  <span className={`eye-icon ${showConfirmPassword ? 'eye-slash' : ''}`}></span>
                </button>
              </div>
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>

            {/* Experience Field */}
            <div className="form-group">
              <label htmlFor="experience" className="input-label">Experience (Years)</label>
              <div className="input-wrapper">
                <span className="input-icon experience-icon"></span>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Years of professional experience"
                  min="0"
                  max="50"
                  className={errors.experience ? 'error' : ''}
                />
              </div>
              {errors.experience && <div className="error-message">{errors.experience}</div>}
            </div>

            {/* Role Selection */}
            <div className="form-group">
              <label htmlFor="role" className="input-label">Role</label>
              <div className="input-wrapper">
                <span className="input-icon role-icon"></span>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`role-select ${errors.role ? 'error' : ''}`}
                >
                  <option value="">Select your role</option>
                  <option value="employee">Employee</option>
                  <option value="hr">HR</option>
                  <option value="verifier">Verifier</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {errors.role && <div className="error-message">{errors.role}</div>}
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? (
                <span className="button-loader"></span>
              ) : (
                <>
                  Create Account <span className="button-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="register-link">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-link">
              Register
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page-container {
          min-height: 100vh;
          background-attachment: fixed;
          background-size: cover;
          padding-top: 380px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          overflow-y: auto;
          position: relative;
        }

        .login-content {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          padding: 2rem 1rem;
          min-height: auto;
          position: relative;
          z-index: 1;
        }

        .login-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          padding: 2.5rem 2rem;
          width: 100%;
          max-width: 500px;
          margin: 1rem auto;
          transition: transform 0.3s ease;
          position: relative;
        }

        .login-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }

        .login-header {
          text-align: center;
          margin: -0.5rem 0 2rem 0;
          padding: 0;
        }

        .login-title {
          color: #0066cc;
          font-weight: 700;
          font-size: 2rem;
          margin: 0 0 1rem 0;
          line-height: 1.2;
          display: block;
          position: relative;
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
          
        .login-subtitle {
          color: #666;
          margin: 0.5rem 0 0 0;
          font-size: 1rem;
          line-height: 1.5;
          padding: 0 0.5rem;
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

        .user-icon {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232c3e50'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E");
        }

        .email-icon {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232c3e50'%3E%3Cpath d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'/%3E%3C/svg%3E");
        }

        .password-icon {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232c3e50'%3E%3Cpath d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z'/%3E%3C/svg%3E");
        }

        .experience-icon {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232c3e50'%3E%3Cpath d='M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z'/%3E%3C/svg%3E");
        }

        .role-icon {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232c3e50'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E");
        }

        .input-wrapper input,
        .input-wrapper select {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .input-wrapper input:focus,
        .input-wrapper select:focus {
          border-color: #0066cc;
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.2);
        }

        .input-wrapper input.error,
        .input-wrapper select.error {
          border-color: #dc3545;
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
        }

        .eye-icon {
          display: block;
          width: 20px;
          height: 20px;
          background-size: contain;
          opacity: 0.6;
          transition: opacity 0.2s;
        }

        .error-message {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        .password-requirements {
          margin-top: 0.75rem;
          padding: 1rem;
          background-color: #f8f9fa;
          border-radius: 8px;
          font-size: 0.875rem;
        }

        .requirements-title {
          color: #495057;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .requirements-list {
          margin: 0;
          padding-left: 1.25rem;
          list-style: none;
        }

        .requirements-list li {
          margin-bottom: 0.25rem;
          color: #6c757d;
        }

        .requirements-list li.valid {
          color: #28a745;
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

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 102, 204, 0.3);
        }

        .login-button:disabled {
          background: #ccc;
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
        }

        .text-link {
          background: none;
          border: none;
          color: #0066cc;
          cursor: pointer;
          font-weight: 500;
          padding: 0;
        }

        .text-link:hover {
          text-decoration: underline;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 480px) {
          .login-page-container {
            padding-top: 40px;
          }

          .login-content {
            padding: 1rem;
          }

          .login-card {
            margin: 0.5rem;
            padding: 1.5rem;
          }

          .login-header {
            margin: 0 0 1.5rem 0;
          }

          .login-title {
            font-size: 1.75rem;
            margin-bottom: 0.75rem;
          }
        }
      `}</style>
    </div>
    // </div>
  );
};

export default RegisterForm;
