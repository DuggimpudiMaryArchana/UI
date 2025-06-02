import api from './api';

//BASE URL FROM .env FILE
const API_BASE_URL=process.env.REACT_APP_API_BASE_URL;
console.log("API BASE URL: ",API_BASE_URL);

// Get auth header for API requests
export const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (token) {
        return { Authorization: `Bearer ${token}` };
    }
    return {};
};

//Login user
export const loginUser = async(credentials) => {
    //credentials= {email,password}
    try{
        const response = await api.post('/auth/login',credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
        }
        return response.data;
    }
    catch(error){
        console.error('Login error:', error);
        throw error.response?.data || { message: "Network error" };
    }
};

//Register User
export const registerUser = async(userData) => {
    //userData = {name,email,password,role}
    try{
        const response = await api.post('/employees',userData);
        return response.data;
    }
    catch(error){
        console.error("Registration error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

//Get current logged-in user from localStorage
export const getCurrentUser = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token) return null;
    
    try {
        // First try to get from stored user data
        if (user) {
            return JSON.parse(user);
        }
        
        // Fallback to token decode
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload; //contains user info like role, id etc...
    }
    catch(err){
        console.error("Error getting current user:", err);
        return null;
    }
};

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

export const resetPassword=async(email,newPassword)=>{
    try{
        const response=await api.put('/auth/reset-password',{email,newPassword});
        return response.data;
    }catch(error){
        throw error.response?.data || error;
    }
}

//logout user
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};
