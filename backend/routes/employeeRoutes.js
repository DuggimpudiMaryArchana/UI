const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
    getRegularEmployees,
    getAllEmployees,
    getEmployeesWithApprovedSkills,
    getEmployeeApprovedSkills,
    getPendingUsers,
    verifyUser,
    getApprovedUsers
} = require('../controllers/employeeController');

// Public routes (if any)

// Protected routes
router.use(protect); // Apply authentication middleware to all routes below

// HR routes
router.get('/regular', authorizeRoles('hr'), getRegularEmployees);
router.get('/employees-skills', authorizeRoles('hr'), getEmployeesWithApprovedSkills);
router.get('/:employeeId/approved-skills', authorizeRoles('hr'), getEmployeeApprovedSkills);

// Verifier routes
router.get('/pending-users', authorizeRoles('verifier'), getPendingUsers);
router.get('/approved-users', authorizeRoles('verifier'), getApprovedUsers);
router.put('/verify/:id', authorizeRoles('verifier'), verifyUser);

// Admin routes
router.get('/admin/all-users', authorizeRoles('admin'), getAllEmployees);

module.exports = router;
