import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';

const isTokenValid = (token) => {
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp;
        const now = Math.floor(Date.now() / 1000);
        return expiry > now;
    } catch (error) {
        console.error("Invalid token:", error);
        return false;
    }
};

// Protected route component
const ProtectedRoute = ({ children, role }) => {
    const user = getCurrentUser();
    const token = localStorage.getItem('token');

    // Check if token is valid
    if (!isTokenValid(token)) {
        localStorage.clear(); // Clear all auth data
        return <Navigate to="/login" replace />;
    }

    // Check if user exists and has a role
    if (!user || !user.role) {
        localStorage.clear(); // Clear all auth data
        return <Navigate to="/login" replace />;
    }

    // Check if the route requires a specific role
    if (role && user.role !== role) {
        console.warn(`Access denied: User role '${user.role}' does not match required role '${role}'`);
        // Redirect to appropriate dashboard based on user's role
        const roleRoutes = {
            employee: '/employee/dashboard',
            hr: '/hr/dashboard',
            verifier: '/verifier/dashboard',
            admin: '/admin/dashboard'
        };
        return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
    }

    return children;
};

export default ProtectedRoute;
