import api from './api';

// Get all employees with their approved skills
export const getEmployeesWithApprovedSkills = async () => {
  try {
    console.log('Fetching employees with approved skills...');
    const response = await api.get('/employees/employees-skills');
    console.log('Raw API Response:', response);

    // Validate response structure
    if (!response || !response.data) {
      console.error('Invalid response structure:', response);
      return {
        success: false,
        data: [],
        message: 'Invalid response from server'
      };
    }

    // Ensure we have an array of employees
    const employees = Array.isArray(response.data) ? response.data : [];
    
    if (!Array.isArray(response.data)) {
      console.warn('Response data is not an array, received:', typeof response.data);
    }

    console.log('Processed employees data:', employees);

    return { 
      success: true, 
      data: employees 
    };
  } catch (error) {
    console.error('Error fetching employees with approved skills:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data
    });

    // Check for specific error types
    if (error.response?.status === 401) {
      return {
        success: false,
        data: [],
        message: 'Your session has expired. Please login again.'
      };
    }

    if (error.response?.status === 403) {
      return {
        success: false,
        data: [],
        message: 'You do not have permission to view employee data.'
      };
    }

    return {
      success: false,
      data: [],
      message: error.response?.data?.message || error.message || 'Failed to fetch employees'
    };
  }
};

// Get detailed skills for a specific employee
export const getEmployeeDetails = async (employeeId) => {
  try {
    const response = await api.get(`/employees/${employeeId}/approved-skills`);
    return response.data;
  } catch (error) {
    console.error('Error fetching employee details:', error);
    throw error.response?.data || error.message;
  }
}; 
