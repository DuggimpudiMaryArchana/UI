import api from './api';
import { getCurrentUser, isAuthenticated } from './authService';

// Get employee's approved skills
export const getEmployeeSkills = async (employeeId) => {
    if (!isAuthenticated()) {
        throw new Error('User not authenticated');
    }

    try {
        console.log('Fetching skills for employee:', employeeId);
        const response = await api.get(`/employees/${employeeId}/skills`);
        return response.data.approvedSkills || [];
    } catch (error) {
        console.error('Error fetching employee skills:', error.response || error);
        if (error.response?.status === 401) {
            throw new Error('Authentication failed. Please log in again.');
        }
        throw error.response?.data?.message || error.message || 'Failed to fetch skills';
    }
};

// Get regular employees (excluding HR, verifiers, admins)
export const getAllRegularEmployees = async () => {
    if (!isAuthenticated()) {
        throw new Error('User not authenticated');
    }

    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'hr') {
        throw new Error('Unauthorized: Only HR can access employee list');
    }

    try {
        console.log('Fetching regular employees as HR');
        const response = await api.get('/employees/regular');
        
        if (!response.data) {
            throw new Error('Invalid response from server');
        }

        // Verify we only got employee roles
        const employees = Array.isArray(response.data) 
            ? response.data.filter(emp => emp.role === 'employee')
            : [];

        if (Array.isArray(response.data) && employees.length !== response.data.length) {
            console.warn(`Filtered out ${response.data.length - employees.length} non-employee records on client side`);
        }
        
        return employees;
    } catch (error) {
        console.error('Error fetching regular employees:', error);
        
        if (!error) {
            throw new Error('An unknown error occurred');
        }

        if (error.response?.status === 401) {
            throw new Error('Your session has expired. Please log in again.');
        }

        if (error.response?.status === 403) {
            throw new Error('You do not have permission to view the employee list.');
        }

        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }

        if (error.message) {
            throw new Error(error.message);
        }

        throw new Error('Failed to fetch employees. Please try again.');
    }
};

// Get all employees (admin only)
export const getAllEmployees = async () => {
    if (!isAuthenticated()) {
        throw new Error('User not authenticated');
    }

    try {
        const response = await api.get('/employees/admin/all-users');
        return response.data;
    } catch (error) {
        console.error('Error fetching employees:', error);
        throw error.response?.data?.message || error.message;
    }
};

// Update employee
export const updateEmployee = async (employeeId, data) => {
    if (!isAuthenticated()) {
        throw new Error('User not authenticated');
    }

    try {
        const response = await api.put(`/employees/${employeeId}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating employee:', error);
        throw error.response?.data?.message || error.message;
    }
};

// Get employee by ID
export const getEmployeeById = async (id) => {
    if (!isAuthenticated()) {
        throw new Error('User not authenticated');
    }

    try {
        const response = await api.get(`/employees/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching employee:', error);
        throw error.response?.data?.message || error.message;
    }
}; 
