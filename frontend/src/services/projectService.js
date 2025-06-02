import api from './api';

export const createProject = async (projectData) => {
    try {
        console.log('Creating project with data:', JSON.stringify(projectData, null, 2));
        
        // Validate required fields
        if (!projectData.name) {
            return {
                success: false,
                message: 'Project name is required'
            };
        }

        if (!projectData.startDate || !projectData.endDate) {
            return {
                success: false,
                message: 'Project start and end dates are required'
            };
        }

        if (!projectData.assignedEmployees || !projectData.assignedEmployees.length) {
            return {
                success: false,
                message: 'At least one employee must be assigned to the project'
            };
        }

        // Format dates if they are Date objects
        const formattedData = {
            name: projectData.name.trim(),
            description: projectData.description || '',
            startDate: projectData.startDate instanceof Date ? projectData.startDate.toISOString() : projectData.startDate,
            endDate: projectData.endDate instanceof Date ? projectData.endDate.toISOString() : projectData.endDate,
            priority: projectData.priority || 'Medium',
            teamSize: parseInt(projectData.teamSize) || 1,
            status: 'Active',
            // Format required skills as objects with skillName field
            requiredSkills: projectData.requiredSkills?.map(skill => ({
                skillName: typeof skill === 'string' ? skill : skill.skillName,
                proficiencyLevel: 'Intermediate' // Default proficiency level required for the project
            })) || [],
            // Format assigned employees
            assignedEmployees: projectData.assignedEmployees.map(emp => ({
                employeeId: emp.employeeId,
                role: emp.role || 'Team Member'
            }))
        };

        console.log('Sending formatted project data to API:', JSON.stringify(formattedData, null, 2));
        console.log('API endpoint:', '/projects');

        // Make the API call
        const response = await api.post('/projects', formattedData);
        console.log('Create project API response:', JSON.stringify(response, null, 2));

        // Validate response
        if (!response) {
            console.error('No response received from server');
            return { 
                success: false, 
                message: 'No response received from server'
            };
        }

        if (!response.data) {
            console.error('Invalid response structure:', response);
            return { 
                success: false, 
                message: 'Invalid response from server'
            };
        }

        // Return standardized response
        return { 
            success: true, 
            data: response.data,
            message: 'Project created successfully'
        };
    } catch (error) {
        console.error('Error creating project:', {
            error: error,
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        // Return detailed error message
        const errorMessage = error.response?.data?.message 
            || error.response?.data?.error 
            || error.message 
            || 'Failed to create project';

        return { 
            success: false, 
            message: errorMessage,
            error: error.response?.data || error.message
        };
    }
};

export const getProjectAssignments = async () => {
    try {
        console.log('Making request to /projects endpoint...');
        const response = await api.get('/projects');
        console.log('Raw response from /projects:', response);

        // Validate response structure
        if (!response || !response.data) {
            console.error('Invalid response structure:', response);
            return { 
                success: false, 
                data: [],
                message: 'Invalid response from server'
            };
        }

        // Ensure we have an array of projects
        let projects = Array.isArray(response.data) ? response.data : 
                      Array.isArray(response.data.data) ? response.data.data : [];

        if (!Array.isArray(projects)) {
            console.warn('Response data is not an array, received:', typeof projects);
            return {
                success: false,
                data: [],
                message: 'Invalid data format received from server'
            };
        }

        // Transform the projects data to ensure all required fields are present
        projects = projects.map(project => ({
            _id: project._id,
            name: project.name || 'Unnamed Project',
            description: project.description || '',
            startDate: project.startDate,
            endDate: project.endDate,
            priority: project.priority || 'Medium',
            status: project.status || 'Active',
            teamSize: project.teamSize || 1,
            requiredSkills: Array.isArray(project.requiredSkills) 
                ? project.requiredSkills.map(skill => ({
                    skillName: typeof skill === 'string' ? skill : skill.skillName,
                    proficiencyLevel: skill.proficiencyLevel || 'Intermediate'
                }))
                : [],
            assignedEmployees: Array.isArray(project.assignedEmployees)
                ? project.assignedEmployees.map(emp => ({
                    employeeId: emp.employeeId?._id || emp.employeeId,
                    name: emp.employeeId?.name || emp.name || 'Unknown Employee',
                    role: emp.role || 'Team Member'
                }))
                : []
        }));

        console.log('Processed projects data:', projects);
        return { success: true, data: projects };
    } catch (error) {
        console.error('Error fetching project assignments:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        return { 
            success: false, 
            data: [],
            message: error.response?.data?.message || 'Failed to fetch project assignments'
        };
    }
};

export const getAllProjects = async () => {
    try {
        console.log('Fetching all projects...');
        const response = await api.get('/projects');
        console.log('Projects API response:', response);

        // Validate response structure
        if (!response || !response.data) {
            console.error('Invalid response structure:', response);
            return [];
        }

        // Ensure we have an array of projects
        const projects = Array.isArray(response.data) ? response.data : 
                        Array.isArray(response.data.data) ? response.data.data : [];

        if (!Array.isArray(projects)) {
            console.warn('Response data is not an array, received:', typeof projects);
            return [];
        }

        console.log('Processed projects data:', projects);
        return projects;
    } catch (error) {
        console.error('Error fetching projects:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response,
            status: error.response?.status,
            data: error.response?.data
        });
        return []; // Return empty array instead of throwing
    }
};

export const getProjectById = async (projectId) => {
    try {
        const response = await api.get(`/projects/${projectId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching project:', error);
        throw error.response?.data || error;
    }
};

export const updateProject = async (projectId, projectData) => {
    try {
        const response = await api.put(`/projects/${projectId}`, projectData);
        return response.data;
    } catch (error) {
        console.error('Error updating project:', error);
        throw error.response?.data || error;
    }
};

export const deleteProject = async (projectId) => {
    try {
        const response = await api.delete(`/projects/${projectId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting project:', error);
        throw error.response?.data || error;
    }
};

export const assignEmployees = async (projectId, employeeAssignments) => {
    try {
        console.log('Assigning employees to project:', projectId, employeeAssignments);
        const response = await api.post(`/projects/${projectId}/assign`, { employeeAssignments });
        console.log('Assign employees response:', response);

        if (!response || !response.data) {
            throw new Error('Invalid response from server');
        }

        return {
            success: true,
            data: response.data,
            message: 'Employees assigned successfully'
        };
    } catch (error) {
        console.error('Error assigning employees:', error);
        throw {
            success: false,
            message: error.response?.data?.message || 'Failed to assign employees',
            error: error.response?.data || error.message
        };
    }
};

export const removeEmployee = async (projectId, employeeId) => {
    try {
        const response = await api.delete(`/projects/${projectId}/employees/${employeeId}`);
        return response.data;
    } catch (error) {
        console.error('Error removing employee:', error);
        throw error.response?.data || error;
    }
};

export const getEmployeeProjects = async (employeeId) => {
    try {
        console.log('Fetching projects for employee:', employeeId);
        const response = await api.get(`/projects/employee/${employeeId}`);
        console.log('Employee projects API response:', response);

        // Validate response structure
        if (!response || !response.data) {
            console.error('Invalid response structure:', response);
            return {
                success: false,
                data: [],
                message: 'Invalid response from server'
            };
        }

        // Handle different response formats
        let projects = [];
        if (Array.isArray(response.data)) {
            projects = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
            projects = response.data.data;
        } else if (response.data.projects && Array.isArray(response.data.projects)) {
            projects = response.data.projects;
        }

        // Validate and transform each project
        const transformedProjects = projects.map(project => ({
            id: project._id,
            name: project.name || 'Unnamed Project',
            description: project.description || '',
            startDate: project.startDate,
            endDate: project.endDate,
            priority: project.priority || 'Medium',
            requiredSkills: Array.isArray(project.requiredSkills) ? project.requiredSkills : [],
            teamSize: project.teamSize || 1,
            currentTeamCount: Array.isArray(project.assignedEmployees) ? project.assignedEmployees.length : 0,
            status: getProjectStatus(project.startDate, project.endDate)
        }));

        console.log('Transformed projects:', transformedProjects);

        return {
            success: true,
            data: transformedProjects
        };
    } catch (error) {
        console.error('Error fetching employee projects:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response,
            status: error.response?.status,
            data: error.response?.data
        });
        return {
            success: false,
            data: [],
            message: error.response?.data?.message || 'Failed to fetch employee projects'
        };
    }
};

// Helper function to determine project status
const getProjectStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return { label: 'Upcoming', color: 'info' };
    if (now > end) return { label: 'Completed', color: 'success' };
    return { label: 'In Progress', color: 'warning' };
};
