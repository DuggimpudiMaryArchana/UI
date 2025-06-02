import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

console.log('API Base URL:', API_BASE_URL);

// Test the API connection
const testApiConnection = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('API connection test successful:', response.data);
    return true;
  } catch (error) {
    console.error('API connection test failed:', {
      error: error.message,
      code: error.code,
      baseURL: API_BASE_URL
    });
    return false;
  }
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log detailed request information
    console.log('API Request:', {
      url: `${config.baseURL}${config.url}`,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('Request Error:', {
      message: error.message,
      code: error.code,
      config: error.config
    });
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log detailed error information
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code,
      isAxiosError: error.isAxiosError,
      stack: error.stack
    });
    
    // Handle different types of errors
    if (!error.response) {
      // Network error or server not responding
      const errorMessage = error.code === 'ECONNABORTED' 
        ? 'Request timeout - server took too long to respond'
        : 'Network error: Could not connect to the server. Please check if the server is running.';
      
      return Promise.reject(new Error(errorMessage));
    }
    
    // Handle token expiration or authentication errors
    if (error.response.status === 401) {
      console.log('Session expired or unauthorized access, redirecting to login...');
      // Clear all auth data
      localStorage.clear();
      
      // Show alert to user
      alert('Your session has expired. Please login again.');
      
      // Redirect to login page
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }
    
    return Promise.reject(error.response?.data || error);
  }
);

// Test connection on startup
testApiConnection().then(isConnected => {
  if (!isConnected) {
    console.warn('Warning: Could not establish initial connection to API server');
  }
});

export default api;
