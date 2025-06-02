const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
    assignEmployees,
    removeEmployee,
    getEmployeeProjects
} = require('../controllers/projectController');

// Project CRUD routes
router.post('/', protect, authorizeRoles('hr', 'admin'), createProject);
router.get('/', protect, getAllProjects);
router.get('/:id', protect, getProjectById);
router.put('/:id', protect, authorizeRoles('hr', 'admin'), updateProject);
router.delete('/:id', protect, authorizeRoles('hr', 'admin'), deleteProject);

// Employee assignment routes
router.post('/:id/assign', protect, authorizeRoles('hr', 'admin'), assignEmployees);
router.delete('/:id/employees/:employeeId', protect, authorizeRoles('hr', 'admin'), removeEmployee);

// Get projects by employee
router.get('/employee/:employeeId', protect, getEmployeeProjects);

module.exports = router; 
