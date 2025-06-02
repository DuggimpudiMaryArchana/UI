const Project = require('../models/Project');
const User = require('../models/employeeModel');

// Create a new project
exports.createProject = async (req, res) => {
    try {
        console.log('Received project creation request:', req.body);
        console.log('User from request:', req.user);

        const { name, description, startDate, endDate, requiredSkills, assignedEmployees } = req.body;
        
        // Detailed validation
        const missingFields = [];
        if (!name) missingFields.push('name');
        if (!description) missingFields.push('description');
        if (!startDate) missingFields.push('startDate');
        if (!endDate) missingFields.push('endDate');

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format'
            });
        }

        if (end < start) {
            return res.status(400).json({
                success: false,
                message: 'End date cannot be before start date'
            });
        }

        // Validate assigned employees if provided
        if (assignedEmployees) {
            if (!Array.isArray(assignedEmployees)) {
                return res.status(400).json({
                    success: false,
                    message: 'assignedEmployees must be an array'
                });
            }

            // Validate each employee assignment
            for (const assignment of assignedEmployees) {
                if (!assignment.employeeId || !assignment.role) {
                    return res.status(400).json({
                        success: false,
                        message: 'Each employee assignment must include employeeId and role'
                    });
                }
            }
        }

        // Create project object
        const project = new Project({
            name,
            description,
            startDate,
            endDate,
            requiredSkills: requiredSkills || [],
            assignedEmployees: assignedEmployees || [],
            createdBy: req.user.id
        });

        console.log('Project to be created:', project);

        await project.save();
        
        // Fetch the saved project with populated fields
        const savedProject = await Project.findById(project._id)
            .populate('assignedEmployees.employeeId', 'name email')
            .populate('createdBy', 'name');

        console.log('Project created successfully:', savedProject);

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: savedProject
        });
    } catch (error) {
        console.error('Error in project creation:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating project',
            error: error.message,
            details: error.stack
        });
    }
};

// Get all projects
exports.getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('assignedEmployees.employeeId', 'name email')
            .populate('createdBy', 'name');
        
        res.status(200).json({
            success: true,
            data: projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching projects',
            error: error.message
        });
    }
};

// Get project by ID
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('assignedEmployees.employeeId', 'name email')
            .populate('createdBy', 'name');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching project',
            error: error.message
        });
    }
};

// Update project
exports.updateProject = async (req, res) => {
    try {
        const { name, description, startDate, endDate, status, requiredSkills } = req.body;
        
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                startDate,
                endDate,
                status,
                requiredSkills,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating project',
            error: error.message
        });
    }
};

// Delete project
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting project',
            error: error.message
        });
    }
};

// Assign employees to project
exports.assignEmployees = async (req, res) => {
    try {
        console.log('Received assignment request:', req.body);
        const { employeeAssignments } = req.body;
        
        if (!employeeAssignments || !Array.isArray(employeeAssignments)) {
            return res.status(400).json({
                success: false,
                message: 'employeeAssignments must be a non-empty array'
            });
        }

        // Validate assignment data structure
        for (const assignment of employeeAssignments) {
            if (!assignment.employeeId || !assignment.role) {
                return res.status(400).json({
                    success: false,
                    message: 'Each assignment must include employeeId and role'
                });
            }
        }

        const project = await Project.findById(req.params.id);
        console.log('Found project:', project);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Validate all employees exist before assigning
        for (const assignment of employeeAssignments) {
            const employee = await User.findById(assignment.employeeId);
            console.log('Checking employee:', assignment.employeeId, employee ? 'found' : 'not found');
            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: `Employee with ID ${assignment.employeeId} not found`
                });
            }
        }

        // Update project with new assignments
        project.assignedEmployees = employeeAssignments;
        await project.save();
        
        // Fetch updated project with populated fields
        const updatedProject = await Project.findById(project._id)
            .populate('assignedEmployees.employeeId', 'name email')
            .populate('createdBy', 'name');

        console.log('Project updated successfully:', updatedProject);

        res.status(200).json({
            success: true,
            message: 'Employees assigned successfully',
            data: updatedProject
        });
    } catch (error) {
        console.error('Error in employee assignment:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning employees',
            error: error.message,
            details: error.stack
        });
    }
};

// Remove employee from project
exports.removeEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        project.assignedEmployees = project.assignedEmployees.filter(
            assignment => assignment.employeeId.toString() !== employeeId
        );

        await project.save();

        res.status(200).json({
            success: true,
            message: 'Employee removed from project successfully',
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error removing employee from project',
            error: error.message
        });
    }
};

// Get projects by employee ID
exports.getEmployeeProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            'assignedEmployees.employeeId': req.params.employeeId
        })
        .populate('assignedEmployees.employeeId', 'name email')
        .populate('createdBy', 'name');

        res.status(200).json({
            success: true,
            data: projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employee projects',
            error: error.message
        });
    }
}; 
